#!/bin/bash
# ActiveCrew API Tests
# Run: bash delivery/tests/api_test.sh
# Requires: servers running on port 3001

BASE="http://localhost:3001/api"
PASS=0
FAIL=0

assert_eq() {
  local desc="$1" expected="$2" actual="$3"
  if [ "$expected" = "$actual" ]; then
    echo "  ✅ $desc"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $desc (expected: $expected, got: $actual)"
    FAIL=$((FAIL + 1))
  fi
}

assert_gt() {
  local desc="$1" threshold="$2" actual="$3"
  if [ "$actual" -gt "$threshold" ] 2>/dev/null; then
    echo "  ✅ $desc ($actual > $threshold)"
    PASS=$((PASS + 1))
  else
    echo "  ❌ $desc (expected > $threshold, got: $actual)"
    FAIL=$((FAIL + 1))
  fi
}

echo "═══════════════════════════════════════"
echo "  ActiveCrew API Test Suite"
echo "═══════════════════════════════════════"
echo ""

# Test 1: GET /api/sessions returns seeded sessions
echo "▸ Test 1: Sessions endpoint"
SESSION_COUNT=$(curl -sf "$BASE/sessions" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
assert_gt "GET /api/sessions returns sessions" 0 "$SESSION_COUNT"

# Test 2: Sessions have required fields
echo "▸ Test 2: Session structure"
HAS_SPOTS=$(curl -sf "$BASE/sessions" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'spotsRemaining' in d[0] and 'spotsTotal' in d[0] else 'no')" 2>/dev/null)
assert_eq "Sessions have spotsRemaining + spotsTotal" "yes" "$HAS_SPOTS"

HAS_PARTICIPANTS=$(curl -sf "$BASE/sessions" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if 'participantProfiles' in d[0] else 'no')" 2>/dev/null)
assert_eq "Sessions have participantProfiles" "yes" "$HAS_PARTICIPANTS"

# Test 3: 50 users seeded
echo "▸ Test 3: Users/Personas"
USER_COUNT=$(curl -sf "$BASE/admin/stats" | python3 -c "import sys,json; print(json.load(sys.stdin).get('totalUsers',0))" 2>/dev/null)
assert_eq "50 personas seeded" "50" "$USER_COUNT"

# Test 4: Demo user exists
echo "▸ Test 4: Demo user"
DEMO_NAME=$(curl -sf "$BASE/users/demo-user" | python3 -c "import sys,json; print(json.load(sys.stdin).get('firstName',''))" 2>/dev/null)
assert_eq "Demo user exists" "You" "$DEMO_NAME"

# Test 5: Sport levels endpoint
echo "▸ Test 5: Sport levels"
SPORT_COUNT=$(curl -sf "$BASE/sport-levels" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
assert_eq "18 sport levels defined" "18" "$SPORT_COUNT"

# Test 6: Join flow — join reduces available spots
echo "▸ Test 6: Join flow"
FIRST_SESSION_ID=$(curl -sf "$BASE/sessions" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])" 2>/dev/null)
SPOTS_BEFORE=$(curl -sf "$BASE/sessions/$FIRST_SESSION_ID" | python3 -c "import sys,json; print(json.load(sys.stdin)['spotsRemaining'])" 2>/dev/null)

curl -sf -X POST "$BASE/sessions/$FIRST_SESSION_ID/join" \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user"}' > /dev/null 2>&1

SPOTS_AFTER=$(curl -sf "$BASE/sessions/$FIRST_SESSION_ID" | python3 -c "import sys,json; print(json.load(sys.stdin)['spotsRemaining'])" 2>/dev/null)
SPOTS_DIFF=$((SPOTS_BEFORE - SPOTS_AFTER))
assert_eq "Joining session decrements spots by 1" "1" "$SPOTS_DIFF"

# Test 7: Leave flow — leave restores spots
echo "▸ Test 7: Leave flow"
curl -sf -X POST "$BASE/sessions/$FIRST_SESSION_ID/leave" \
  -H "Content-Type: application/json" \
  -d '{"userId":"demo-user"}' > /dev/null 2>&1

SPOTS_RESTORED=$(curl -sf "$BASE/sessions/$FIRST_SESSION_ID" | python3 -c "import sys,json; print(json.load(sys.stdin)['spotsRemaining'])" 2>/dev/null)
assert_eq "Leaving session restores spots" "$SPOTS_BEFORE" "$SPOTS_RESTORED"

# Test 8: Filter by sport
echo "▸ Test 8: Sport filter"
TENNIS_COUNT=$(curl -sf "$BASE/sessions?sport=Tennis" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d))" 2>/dev/null)
assert_gt "Filter by Tennis returns results" 0 "$TENNIS_COUNT"

ALL_TENNIS=$(curl -sf "$BASE/sessions?sport=Tennis" | python3 -c "import sys,json; d=json.load(sys.stdin); print('yes' if all(s['sport']=='Tennis' for s in d) else 'no')" 2>/dev/null)
assert_eq "All filtered results are Tennis" "yes" "$ALL_TENNIS"

# Test 9: Seed mode
echo "▸ Test 9: Seed mode (cold-start)"
SEED_RESULT=$(curl -sf -X POST "$BASE/sessions/seed" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('success','false'))" 2>/dev/null)
assert_eq "Seed mode returns success" "True" "$SEED_RESULT"

# Test 10: Profile update persists
echo "▸ Test 10: Profile edit"
curl -sf -X PUT "$BASE/users/demo-user" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"TestUser","neighborhood":"Chelsea"}' > /dev/null 2>&1

UPDATED_NAME=$(curl -sf "$BASE/users/demo-user" | python3 -c "import sys,json; print(json.load(sys.stdin).get('firstName',''))" 2>/dev/null)
assert_eq "Profile name updated" "TestUser" "$UPDATED_NAME"

# Restore
curl -sf -X PUT "$BASE/users/demo-user" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"You"}' > /dev/null 2>&1

echo ""
echo "═══════════════════════════════════════"
echo "  Results: $PASS passed, $FAIL failed"
echo "═══════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi
