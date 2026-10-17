/*
 * STEM 207 — back-end settings.
 *
 * Leave both values empty to run in LOCAL mode: everything is saved in this
 * browser only (good for trying the app on one computer).
 *
 * To turn on the shared back end, create a free Supabase project, run
 * supabase/schema.sql in its SQL Editor, then paste the project's URL and its
 * publishable key below (Supabase → Project Settings → API Keys). Older projects
 * call it the "anon public" key; either works. This key is meant to be public:
 * the database's row-level security rules decide what each person can see.
 * Never paste a secret or "service_role" key here.
 */
window.STEM207_CONFIG = {
  supabaseUrl: "",   // like "https://abcdefghijkl.supabase.co"
  supabaseKey: ""    // like "sb_publishable_..." (or the legacy "anon public" key)
};
