# Release handoff

This package is locally built and verified, but the final GitHub push and npm publish still require account-specific credentials and targets.

## Current local status

- Git repository initialized on `main`
- No commits created yet
- Package validation already passed:
  - `npm test`
  - `npm run typecheck`
  - `npm run build`
  - `npm pack --dry-run`

## GitHub push prerequisites

Before pushing, provide or configure:

- target GitHub repository URL
- GitHub authentication on this machine

Recommended commands once the remote is known:

```bash
git remote add origin <github-repo-url>
git add .
git commit -m "feat: publish opencode elapsed plugin"
git push -u origin main
```

## npm publish prerequisites

Before publishing, confirm all of the following:

- the package name `opencode-elapsed-plugin` is available on npm
- `npm whoami` succeeds on this machine
- the account is allowed to publish public packages
- any required npm 2FA/token flow is ready
- the final tarball contents still look correct after a fresh `npm pack`

Recommended commands:

```bash
npm whoami
npm pack
npm publish
```

## Post-publish smoke check

After publish, verify installation with an OpenCode plugin config such as:

```json
{
  "plugin": [
    "opencode-elapsed-plugin"
  ]
}
```

Then confirm:

- the plugin loads without crashing
- the `session_prompt_right` timer appears in session view
- `cmd` updates after user messages
- `agent` updates after completed assistant messages
