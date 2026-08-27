import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "./LoginPage";

const loginMock = vi.hoisted(() => vi.fn());

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({ login: loginMock }),
}));

function renderLogin() {
  return render(
    <MemoryRouter initialEntries={["/login"]}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<p>Dashboard destination</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  it("shows validation errors instead of submitting an empty form", async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Valid email is required")).toBeVisible();
    expect(
      screen.getByText("Password must be at least 8 characters"),
    ).toBeVisible();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("submits valid credentials and navigates a shop user", async () => {
    const user = userEvent.setup();
    loginMock.mockResolvedValue({ isSuperAdmin: false });
    renderLogin();

    await user.type(screen.getByRole("textbox"), "owner@example.com");
    const passwordInput = document.querySelector<HTMLInputElement>(
      'input[type="password"]',
    );
    expect(passwordInput).not.toBeNull();
    await user.type(passwordInput!, "correct-password");
    await user.click(screen.getByRole("button", { name: "Sign In" }));

    expect(await screen.findByText("Dashboard destination")).toBeVisible();
    expect(loginMock).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "correct-password",
    });
  });
});
