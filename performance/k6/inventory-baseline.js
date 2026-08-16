import http from "k6/http";
import { check, fail, sleep } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";

const inventoryRequests = new Counter("inventory_requests");
const inventoryHttpFailures = new Rate("inventory_http_failures");
const inventoryLatency = new Trend("inventory_latency", true);

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 10 },
    { duration: "30s", target: 50 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "1m", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    inventory_http_failures: ["rate<0.01"],
    inventory_latency: ["p(95)<500", "p(99)<1000"],
    checks: ["rate>0.99"],
  },
  summaryTrendStats: ["avg", "p(95)", "p(99)", "max"],
  summaryTimeUnit: "ms",
};

function requiredEnvironmentVariable(name) {
  const value = __ENV[name]?.trim();
  if (!value) {
    fail(`Missing required environment variable: ${name}`);
  }
  return value;
}

function parseJson(response, description) {
  try {
    return response.json();
  } catch (_error) {
    fail(`${description} returned invalid JSON (HTTP ${response.status}).`);
  }
}

export function setup() {
  const apiBaseUrl = requiredEnvironmentVariable("API_BASE_URL").replace(
    /\/+$/,
    "",
  );
  const email = requiredEnvironmentVariable("LOGIN_EMAIL");
  const password = requiredEnvironmentVariable("LOGIN_PASSWORD");

  const loginResponse = http.post(
    `${apiBaseUrl}/auth/login`,
    JSON.stringify({ email, password }),
    {
      headers: { "Content-Type": "application/json" },
      tags: { endpoint: "auth_login_setup" },
    },
  );

  if (loginResponse.status !== 200) {
    fail(
      `Login failed (HTTP ${loginResponse.status}): ${loginResponse.body}`,
    );
  }

  const response = parseJson(loginResponse, "Login");
  const accessToken = response?.data?.accessToken;
  const shopId = response?.data?.membership?.shopId;

  if (!accessToken) {
    fail("Login response did not contain data.accessToken.");
  }
  if (!shopId) {
    fail("Login response did not contain a shop membership ID.");
  }

  return { apiBaseUrl, accessToken, shopId };
}

export default function ({ apiBaseUrl, accessToken, shopId }) {
  const response = http.get(
    `${apiBaseUrl}/shops/${encodeURIComponent(shopId)}/items?page=1&limit=50`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      tags: { endpoint: "inventory_first_page" },
    },
  );

  inventoryRequests.add(1);
  inventoryHttpFailures.add(response.status !== 200);
  inventoryLatency.add(response.timings.duration);

  let body;
  try {
    body = response.json();
  } catch (_error) {
    body = null;
  }

  check(response, {
    "inventory status is 200": (result) => result.status === 200,
    "inventory response contains items": () =>
      Array.isArray(body?.data?.items),
    "inventory response is first page": () =>
      body?.data?.pagination?.page === 1,
  });

  sleep(1);
}

function formatNumber(value, decimals = 2) {
  return Number.isFinite(value) ? value.toFixed(decimals) : "n/a";
}

export function handleSummary(data) {
  const requests = data.metrics.inventory_requests?.values ?? {};
  const latency = data.metrics.inventory_latency?.values ?? {};
  const failures = data.metrics.inventory_http_failures?.values ?? {};

  const lines = [
    "",
    "Inventory first-page baseline",
    "-----------------------------",
    `Request count:     ${requests.count ?? 0}`,
    `Requests/sec:      ${formatNumber(requests.rate)}`,
    `Average latency:   ${formatNumber(latency.avg)} ms`,
    `P95 latency:       ${formatNumber(latency["p(95)"])} ms`,
    `P99 latency:       ${formatNumber(latency["p(99)"])} ms`,
    `Max latency:       ${formatNumber(latency.max)} ms`,
    `HTTP failure rate: ${formatNumber((failures.rate ?? 0) * 100)}%`,
    "",
  ];

  return { stdout: lines.join("\n") };
}
