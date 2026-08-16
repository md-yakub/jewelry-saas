# Inventory baseline load test

This test authenticates once through `POST /auth/login`, takes the default
membership's `shopId` from the wrapped authentication response, and exercises:

```text
GET /shops/:shopId/items?page=1&limit=50
```

The staged profile ramps through 10, 50, and 100 virtual users, with a one-second
pause per user iteration. It reports request count/rate, average, P95, P99 and
maximum latency, and HTTP failure rate.

Required environment variables:

- `API_BASE_URL`
- `LOGIN_EMAIL`
- `LOGIN_PASSWORD`

From the repository root, run:

```powershell
$env:API_BASE_URL="http://localhost:3000"
$env:LOGIN_EMAIL="performance-owner@example.local"
$env:LOGIN_PASSWORD="PerformanceOnly!2026"
npm --prefix backend run loadtest:inventory
```

The password shown is the performance seed default. Use the value supplied in
`PERFORMANCE_SEED_PASSWORD` if the dataset was seeded with an override.
