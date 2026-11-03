# Secret handling

Rules for everyone who changes this repository (INT-11).

- The frontend holds no secrets. Everything in a `VITE_` variable is built into the public JavaScript bundle, so never put a key, password or token in one.
- `VITE_API_BASE_URL` is set in Vercel for production and in an ignored `.env` file locally. It must end in `/api/v1`.
- CI runs a gitleaks scan of the full history on every pull request. A new secret fails the build. `.gitleaksignore` stays empty unless the owner approves an entry.
- If a secret is committed: stop and tell the owner, do not rewrite history or force-push, and let the owner decide on any rotation.
