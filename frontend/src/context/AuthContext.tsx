import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import http, { setAccessToken, unwrap } from '../api/http';
import type { AuthUser, RoleCode, ShopMembership } from '../types/auth';

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterShopPayload = {
  shopName: string;
  shopEmail?: string;
  shopPhone?: string;
  shopAddress?: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone?: string;
  password: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  memberships: ShopMembership[];
  selectedShopId: string | null;
  selectedRole: RoleCode | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  registerShop: (payload: RegisterShopPayload) => Promise<void>;
  logout: () => Promise<void>;
  setSelectedShopId: (shopId: string) => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setLocalAccessToken] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<ShopMembership[]>([]);
  const [selectedShopId, setSelectedShopIdState] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleCode | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('authUser');
    const storedMemberships = localStorage.getItem('memberships');
    const storedShopId = localStorage.getItem('selectedShopId');
    const storedRole = localStorage.getItem('selectedRole') as RoleCode | null;

    if (storedToken) {
      setLocalAccessToken(storedToken);
      setAccessToken(storedToken);
    }

    if (storedUser) {
      setUser(JSON.parse(storedUser) as AuthUser);
    }

    if (storedMemberships) {
      setMemberships(JSON.parse(storedMemberships) as ShopMembership[]);
    }

    if (storedShopId) {
      setSelectedShopIdState(storedShopId);
    }

    if (storedRole) {
      setSelectedRole(storedRole);
    }
  }, []);

  const applyAuthState = useCallback(
    (params: {
      user: AuthUser;
      memberships: ShopMembership[];
      accessToken: string;
      refreshToken: string;
    }) => {
      const defaultMembership = params.memberships[0];
      const shopId = defaultMembership?.shopId ?? null;
      const role = defaultMembership?.role ?? null;

      setUser(params.user);
      setMemberships(params.memberships);
      setLocalAccessToken(params.accessToken);
      setSelectedShopIdState(shopId);
      setSelectedRole(role);
      setAccessToken(params.accessToken);

      localStorage.setItem('authUser', JSON.stringify(params.user));
      localStorage.setItem('memberships', JSON.stringify(params.memberships));
      localStorage.setItem('accessToken', params.accessToken);
      localStorage.setItem('refreshToken', params.refreshToken);
      if (shopId) {
        localStorage.setItem('selectedShopId', shopId);
      }
      if (role) {
        localStorage.setItem('selectedRole', role);
      }
    },
    [],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await http.post('/auth/login', payload);
      const data = unwrap<{
        user: AuthUser;
        memberships: ShopMembership[];
        accessToken: string;
        refreshToken: string;
      }>(response);

      applyAuthState(data);
    },
    [applyAuthState],
  );

  const registerShop = useCallback(
    async (payload: RegisterShopPayload) => {
      const response = await http.post('/auth/register-shop', payload);
      const data = unwrap<{
        user: AuthUser;
        accessToken: string;
        refreshToken: string;
      }>(response);

      const meResponse = await http.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${data.accessToken}`,
        },
      });
      const me = unwrap<AuthUser & { memberships: ShopMembership[] }>(meResponse);

      applyAuthState({
        user: data.user,
        memberships: me.memberships,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
    },
    [applyAuthState],
  );

  const logout = useCallback(async () => {
    try {
      await http.post('/auth/logout');
    } finally {
      setUser(null);
      setMemberships([]);
      setLocalAccessToken(null);
      setSelectedShopIdState(null);
      setSelectedRole(null);
      setAccessToken(null);

      localStorage.removeItem('authUser');
      localStorage.removeItem('memberships');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('selectedShopId');
      localStorage.removeItem('selectedRole');
    }
  }, []);

  const setSelectedShopId = useCallback(
    (shopId: string) => {
      setSelectedShopIdState(shopId);
      localStorage.setItem('selectedShopId', shopId);
      const membership = memberships.find((item) => item.shopId === shopId);
      if (membership) {
        setSelectedRole(membership.role);
        localStorage.setItem('selectedRole', membership.role);
      }
    },
    [memberships],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      memberships,
      selectedShopId,
      selectedRole,
      isAuthenticated: Boolean(user && accessToken),
      login,
      registerShop,
      logout,
      setSelectedShopId,
    }),
    [
      accessToken,
      login,
      logout,
      memberships,
      registerShop,
      selectedRole,
      selectedShopId,
      setSelectedShopId,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
