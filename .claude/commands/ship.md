---
description: Test, build, commit, and push main (pushing deploys the live site)
argument-hint: [optional commit summary]
---
Ship the current work on `main`. Pushing deploys https://mattjones1.github.io/stem_207/ in about a minute.

1. `git status` and `git diff --stat`: confirm we're on `main` and list what will ship. Never commit `scratch.txt`, secrets, or anything under `dist/`. If we're on another branch, stop and ask.
2. `node tests/tools/test_content.js` and `node tests/tools/test_wording.js` (fast checks first).
3. `tests/run.sh local` (the full local suite, about 10–15 minutes; run it in the background). If anything fails, fix it and rerun just the failing files. Don't ship red.
4. `python3 tools/build_single_file.py` (refreshes the offline copy).
5. Commit with a message that says what changed and why (use "$ARGUMENTS" as the summary line if given), then `git push`.
6. Report in a few lines: the commit hash, what shipped, the test totals, and anything the user must do (for example, SQL to run in Supabase, pasted in full).
