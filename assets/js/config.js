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
 *
 * donate: the "Support STEM 207" card that grown-ups see (guest Home, educator Dashboard, footer).
 *   venmo: your Venmo Business username, without the @. Leave it empty to show a "coming soon" placeholder.
 *   qr:    the QR image from the Venmo app (Me, then the QR icon, then save it), placed at this path.
 * Donations go to STEM 207, LLC. They aren't tax-deductible, so the card never says they are.
 */
window.STEM207_CONFIG = {
  supabaseUrl: "https://gzmmenzdonuwxupnkboj.supabase.co",
  supabaseKey: "sb_publishable_91YKNxlcZmoP7q0uGkjkPA_hDDIcBbu",  // publishable key: safe to share
  donate: { venmo: "", qr: "assets/img/donate-venmo.png" }
};
