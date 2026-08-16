import http from "k6/http";
import { check, fail, sleep } from "k6";
import exec from "k6/execution";
import { Counter, Rate, Trend } from "k6/metrics";

const MEASUREMENT_DURATION_SECONDS = 60;

const loadLevels = {
  load_10_vus: {
    label: "10 VUs",
    requests: new Counter("inventory_requests_10_vus"),
    failures: new Rate("inventory_http_failures_10_vus"),
    latency: new Trend("inventory_latency_10_vus", true),
  },
  load_50_vus: {
    label: "50 VUs",
    requests: new Counter("inventory_requests_50_vus"),
    failures: new Rate("inventory_http_failures_50_vus"),
    latency: new Trend("inventory_latency_50_vus", true),
  },
  load_100_vus: {
    label: "100 VUs",
    requests: new Counter("inventory_requests_100_vus"),
    failures: new Rate("inventory_http_failures_100_vus"),
    latency: new Trend("inventory_latency_100_vus", true),
  },
};

export const options = {
  scenarios: {
    warm_up: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [{ duration: "20s", target: 10 }],
      gracefulStop: "5s",
    },
    load_10_vus: {
      executor: "constant-vus",
      vus: 10,
      duration: "1m",
      startTime: "25s",
      gracefulStop: "5s",
    },
    load_50_vus: {
      executor: "constant-vus",
      vus: 50,
      duration: "1m",
      startTime: "1m30s",
      gracefulStop: "5s",
    },
    load_100_vus: {
      executor: "constant-vus",
      vus: 100,
      duration: "1m",
      startTime: "2m35s",
      gracefulStop: "5s",
    },
  },
  thresholds: {
    inventory_http_failures_10_vus: ["rate<0.01"],
    inventory_latency_10_vus: ["p(95)<500", "p(99)<1000"],
    inventory_http_failures_50_vus: ["rate<0.01"],
    inventory_latency_50_vus: ["p(95)<500", "p(99)<1000"],
    inventory_http_failures_100_vus: ["rate<0.01"],
    inventory_latency_100_vus: ["p(95)<500", "p(99)<1000"],
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
  const loadLevel = loadLevels[exec.scenario.name];
  const response = http.get(
    `${apiBaseUrl}/shops/${encodeURIComponent(shopId)}/items?page=1&limit=50`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      tags: {
        endpoint: "inventory_first_page",
        load_level: loadLevel?.label ?? "warm-up",
      },
    },
  );

  if (loadLevel) {
    loadLevel.requests.add(1);
    loadLevel.failures.add(response.status !== 200);
    loadLevel.latency.add(response.timings.duration);
  }

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
  const lines = [
    "",
    "Inventory first-page baseline",
    "-----------------------------",
  ];

  for (const [scenarioName, loadLevel] of Object.entries(loadLevels)) {
    const metricSuffix = scenarioName.replace("load_", "");
    const requests =
      data.metrics[`inventory_requests_${metricSuffix}`]?.values ?? {};
    const latency =
      data.metrics[`inventory_latency_${metricSuffix}`]?.values ?? {};
    const failures =
      data.metrics[`inventory_http_failures_${metricSuffix}`]?.values ?? {};
    const requestCount = requests.count ?? 0;

    lines.push(
      "",
      loadLevel.label,
      `Request count:     ${requestCount}`,
      `Requests/sec:      ${formatNumber(requestCount / MEASUREMENT_DURATION_SECONDS)}`,
      `Average latency:   ${formatNumber(latency.avg)} ms`,
      `P95 latency:       ${formatNumber(latency["p(95)"])} ms`,
      `P99 latency:       ${formatNumber(latency["p(99)"])} ms`,
      `Max latency:       ${formatNumber(latency.max)} ms`,
      `HTTP failure rate: ${formatNumber((failures.rate ?? 0) * 100)}%`,
    );
  }

  lines.push("");

  return { stdout: lines.join("\n") };
}
