#!/usr/bin/env bash
# Run STEM 207's browser tests with one command and print only the results.
#
#   tests/run.sh               quick check: Dance Party regression + Today + rewards (local only)
#   tests/run.sh all           every lab and site test, plus cloud checks if Postgres is set up
#   tests/run.sh local         every test, local mode only (no Postgres needed)
#   tests/run.sh <test.py>...  just these files (cloud parts run if Postgres is set up)
#
# It starts the mock servers it needs (local on 8767, cloud on 8787) and stops the ones it started.
# Failures print in full; passing tests print one line each.
set -u
# PYTHON overrides the interpreter (for example on Windows, where python3 may be a store stub).
export PYTHONIOENCODING=utf-8   # test output includes symbols like →
# Without PYTHON, use the first interpreter that can import Playwright (python3, python, or py -3; on
# Windows, python3 is often a store stub and Playwright may live under a specific install).
if [ -z "${PYTHON:-}" ]; then
  for cand in python3 python "py -3" "$LOCALAPPDATA/Programs/Python/Python312-arm64/python.exe" "$LOCALAPPDATA/Programs/Python/Python312/python.exe"; do
    if $cand -c "import playwright" >/dev/null 2>&1; then PYTHON=$cand; break; fi
  done
fi
PYTHON=${PYTHON:-python3}
cd "$(dirname "$0")/.."
LOCAL=http://localhost:8767/
CLOUD=http://localhost:8787/
PG_CTL=/usr/lib/postgresql/16/bin/pg_ctl
started=()

up() { curl -s -o /dev/null --max-time 2 "$1"; }
start_local() {
  up "$LOCAL" && return
  LOCAL_MODE=1 PORT=8767 node tests/backend/mock-supabase.js >/tmp/stem207-local.log 2>&1 & started+=($!)
  for _ in $(seq 20); do up "$LOCAL" && return; sleep 0.25; done
  echo "Couldn't start the local server (see /tmp/stem207-local.log)"; exit 1
}
start_cloud() {
  # Cloud checks need the test Postgres from tests/backend/README.md. Without it, they're skipped.
  if [ -x "$PG_CTL" ] && id pgt >/dev/null 2>&1; then
    su pgt -c "$PG_CTL -D /home/pgt/pgdata -o '-p 5433 -k /tmp' -l /tmp/pg.log start" >/dev/null 2>&1
    pg_started=1
  else
    return 1
  fi
  for _ in $(seq 20); do psql -X -q -h /tmp -p 5433 -U postgres -d s207 -c "select 1" >/dev/null 2>&1 && break; sleep 0.25; done
  # Keep the test database's schema current (all updates are safe to rerun).
  for f in supabase/update-*.sql; do psql -X -q -h /tmp -p 5433 -U postgres -d s207 -f "$f" >/dev/null 2>&1; done
  up "$CLOUD" || { PORT=8787 node tests/backend/mock-supabase.js >/tmp/stem207-cloud.log 2>&1 & started+=($!); }
  for _ in $(seq 20); do up "$CLOUD" && return 0; sleep 0.25; done
  return 1
}
cleanup() {
  for p in "${started[@]:-}"; do [ -n "$p" ] && kill "$p" 2>/dev/null; done
  [ "${pg_started:-0}" = 1 ] && su pgt -c "$PG_CTL -D /home/pgt/pgdata -o '-p 5433 -k /tmp' stop" >/dev/null 2>&1
}
trap cleanup EXIT

LABS=(tests/labs/test_*.py)
SITE=(tests/site/test_*.py)
TOOLS=(tests/tools/test_*.js)   # Node tests: no browser or Python needed
CLOUD_TESTS=" test_evidence.py test_batch9.py test_batch10.py test_moxie.py test_plans.py "
mode=${1:-quick}
case "$mode" in
  quick) files=(tests/labs/test_dance_party.py tests/site/test_today_pilot.py tests/site/test_batch10.py); cloud=0 ;;
  all)   files=("${TOOLS[@]}" "${LABS[@]}" "${SITE[@]}"); cloud=1 ;;
  local) files=("${TOOLS[@]}" "${LABS[@]}" "${SITE[@]}"); cloud=0 ;;
  *)     files=("$@"); cloud=1 ;;
esac

start_local
if [ "$cloud" = 1 ]; then start_cloud || { echo "(Postgres not set up: cloud checks skipped)"; cloud=0; }; fi

pass=0; fail=0
for f in "${files[@]}"; do
  name=$(basename "$f")
  args=()
  if [[ "$CLOUD_TESTS" == *" $name "* ]]; then args=("$LOCAL"); [ "$cloud" = 1 ] && args+=("$CLOUD") || args+=(skip); fi
  if [[ "$f" == *.js ]]; then out=$(node "$f" 2>&1); else out=$($PYTHON "$f" "${args[@]}" 2>&1); fi
  summary=$(printf '%s\n' "$out" | grep -E '^[0-9]+/[0-9]+ passed' | tail -1)
  if [ -n "$summary" ] && ! printf '%s\n' "$out" | grep -q '^FAIL'; then
    printf '  ok   %-28s %s\n' "$name" "$summary"; pass=$((pass + 1))
  else
    printf '  FAIL %-28s %s\n' "$name" "${summary:-crashed}"; fail=$((fail + 1))
    printf '%s\n' "$out" | grep -E '^FAIL|Error|Traceback' | head -15 | sed 's/^/       /'
  fi
done
echo "$pass passed, $fail failed"
[ "$fail" = 0 ]
