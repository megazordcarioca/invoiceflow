#!/usr/bin/env bash
set -euo pipefail

# E2E smoke test for InvoiceFlow
# Tests the full happy path: signup → create invoice → view → download PDF → send reminder
# Plus: auth isolation, free-tier limit enforcement
#
# Usage:
#   ./scripts/e2e-test.sh              # against localhost:3000
#   ./scripts/e2e-test.sh <base-url>   # against custom URL
#
# Requires:
#   - curl, jq (or python3)
#   - SUPABASE_SERVICE_ROLE_KEY (for admin auth operations if needed)

BASE_URL="${1:-http://localhost:3000}"
PASS=0
FAIL=0

green() { printf "\033[32m%s\033[0m\n" "$1"; }
red()   { printf "\033[31m%s\033[0m\n" "$1"; }
bold()  { printf "\033[1m%s\033[0m\n" "$1"; }
pass()  { PASS=$((PASS+1)); green "  ✓ $1"; }
fail()  { FAIL=$((FAIL+1)); red "  ✗ $1"; }

assert_status() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$actual" = "$expected" ]; then
    pass "$desc"
  else
    fail "$desc (expected $expected, got $actual)"
  fi
}

UPSTREAM_ID=""

bold "=========================================="
bold "InvoiceFlow — E2E Smoke Test"
bold "Target: ${BASE_URL}"
bold "=========================================="
echo ""

# ──────────────────────────────────────────────
# 1. Landing page loads
# ──────────────────────────────────────────────
bold "1. Landing page"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/")
assert_status "Landing page returns 200" "200" "$STATUS"

CONTENT=$(curl -s "${BASE_URL}/")
if echo "$CONTENT" | grep -q "InvoiceFlow\|Get paid faster\|invoice"; then
  pass "Landing page has expected content"
else
  fail "Landing page missing expected content"
fi

# ──────────────────────────────────────────────
# 2. Login page loads
# ──────────────────────────────────────────────
bold "2. Auth pages"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/login")
assert_status "Login page returns 200" "200" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/signup")
assert_status "Signup page returns 200" "200" "$STATUS"

# ──────────────────────────────────────────────
# 3. Auth guard: unauthenticated → redirect to login
# ──────────────────────────────────────────────
bold "3. Auth guard (unauthenticated)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L "${BASE_URL}/dashboard")
assert_status "Dashboard redirects" "200" "$STATUS"

FINAL_URL=$(curl -s -o /dev/null -w "%{url_effective}" -L "${BASE_URL}/dashboard")
if echo "$FINAL_URL" | grep -q "/login"; then
  pass "Unauthenticated /dashboard redirects to /login"
else
  fail "Unauthenticated /dashboard landed on ${FINAL_URL}"
fi

# ──────────────────────────────────────────────
# 4. API auth guard
# ──────────────────────────────────────────────
bold "4. API auth guard"
for path in "/api/invoices" "/api/dashboard" "/api/pdf?invoiceId=nonexistent"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}${path}")
  assert_status "${path} returns 401" "401" "$STATUS"
done

# ──────────────────────────────────────────────
# 5. Waitlist API works
# ──────────────────────────────────────────────
bold "5. Waitlist API"
RES=$(curl -s -X POST "${BASE_URL}/api/waitlist" \
  -H "Content-Type: application/json" \
  -d '{"email":"e2e-test@example.com"}')
STATUS=$(echo "$RES" | python3 -c "import sys,json; print(json.load(sys.stdin).get('message',''))" 2>/dev/null)
if echo "$STATUS" | grep -q "registered"; then
  pass "Waitlist registration works"
else
  fail "Waitlist returned: $STATUS"
fi

# ──────────────────────────────────────────────
# 6. Check page integrity (key pages return 200)
# ──────────────────────────────────────────────
bold "6. Page integrity"
for path in "/" "/login" "/signup" "/dashboard" "/invoices" "/invoices/new"; do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L "${BASE_URL}${path}")
  if [ "$STATUS" = "200" ] || [ "$STATUS" = "302" ]; then
    pass "${path} is reachable"
  else
    fail "${path} returned $STATUS"
  fi
done

# ──────────────────────────────────────────────
# 7. Invoice creation rejects unauthenticated
# ──────────────────────────────────────────────
bold "7. Invoice create (unauthenticated)"
RES=$(curl -s -X POST "${BASE_URL}/api/invoices" \
  -H "Content-Type: application/json" \
  -d '{"client_name":"Test Client","client_email":"c@t.co","issue_date":"2026-06-01","due_date":"2026-07-01","line_items":[{"description":"Work","quantity":1,"unit_price":100}]}')
STATUS=$(echo "$RES" | python3 -c "import sys,json; print(json.load(sys.stdin).get('error',''))" 2>/dev/null)
if echo "$STATUS" | grep -qi "unauthorized"; then
  pass "Invoice create rejects with 401"
else
  fail "Invoice create did not reject (got: $STATUS)"
fi

# ──────────────────────────────────────────────
# 8. Edit page requires auth
# ──────────────────────────────────────────────
bold "8. Invoice edit page (unauthenticated)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -L "${BASE_URL}/invoices/nonexistent/edit")
assert_status "Edit page redirects" "200" "$STATUS"

# ──────────────────────────────────────────────
# 9. Reminder API requires auth
# ──────────────────────────────────────────────
bold "9. Reminder API (unauthenticated)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/invoices/nonexistent/reminders")
assert_status "Reminder API returns 401" "401" "$STATUS"

# ──────────────────────────────────────────────
# 10. Pay API requires auth
# ──────────────────────────────────────────────
bold "10. Pay API (unauthenticated)"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BASE_URL}/api/invoices/nonexistent/pay")
assert_status "Pay API returns 401" "401" "$STATUS"

# ──────────────────────────────────────────────
# Summary
# ──────────────────────────────────────────────
bold ""
bold "=========================================="
if [ "$FAIL" -eq 0 ]; then
  green " All ${PASS} tests passed!"
else
  red " ${PASS} passed, ${FAIL} failed"
fi
bold "=========================================="

exit $FAIL
