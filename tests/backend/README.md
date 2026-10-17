# Back-end tests

These tests run STEM 207's cloud mode against a stand-in for Supabase, so the database rules and the app's sync can be checked without a Supabase account.

- `supabase_stubs.sql` creates the few Supabase pieces `supabase/schema.sql` depends on (the `anon` and `authenticated` roles, `auth.users`, and `auth.uid()`).
- `mock-supabase.js` serves the app and answers the Supabase Auth, REST, and RPC calls the app makes. Every query runs on real Postgres as `anon` or `authenticated`, with the caller's user id set, so the real row-level security rules allow or refuse each request.

## Run it

You need Postgres 15+ (with `psql`) and Node 18+.

```bash
createdb s207
psql -d s207 -f tests/backend/supabase_stubs.sql -f supabase/schema.sql
PGURL=postgresql://localhost/s207 node tests/backend/mock-supabase.js
```

Open http://localhost:8787. The mock rewrites `assets/js/config.js` on the fly so the app talks to it. Set `TOKEN_TTL=61` to make educator sign-ins refresh their token on almost every request.

## What was checked

- Educators can only read or change their own classes, students, and events. Another educator gets an empty list or a 403.
- The public key alone can't read any table directly. Students reach their data only through the sign-in functions.
- `class_roster` returns names only, never picture codes.
- Wrong pictures are refused; after 8 wrong tries in 10 minutes, sign-in pauses for that student.
- Student events are written only to the signed-in student's own log; a fake or expired token is refused.
- A teacher on a second computer sees a student's work from a third device; changing a student's pictures stops the old code from working.
- Work done offline is queued and saved when the connection returns.
- A class code already taken by another teacher is replaced automatically.
