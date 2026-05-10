# opencode-elapsed-plugin

`opencode-elapsed-plugin` is a small OpenCode TUI-only plugin that mounts in the `session_prompt_right` slot and shows three prompt-side indicators:

- current session status (`idle`, `busy`, or `retry`)
- `cmd` elapsed time since the latest user message
- `agent` elapsed time since the latest completed assistant message

The v1 implementation keeps the logic intentionally simple: every second it recomputes the latest timestamps from `api.state.session.messages(sessionID)` instead of maintaining a mutable cache.

## Install for local development

```bash
npm install
npm test
npm run build
```

## Use as a local plugin package

Build the package, then point OpenCode at the local folder or a packed tarball.

### Local folder spec

```json
{
  "plugin": [
    "file:/absolute/path/to/opencode-elapsed-plugin"
  ]
}
```

### Tarball workflow

```bash
npm pack
```

That produces a file such as `opencode-elapsed-plugin-1.0.0.tgz`, which can be used anywhere OpenCode accepts an npm package spec.

## Publish manually

This repo intentionally does not include CI publishing automation yet.

1. Run `npm test`
2. Run `npm run build`
3. Run `npm pack` and inspect the tarball contents
4. Log in with `npm login` if needed
5. Publish with `npm publish`

After publishing, the OpenCode plugin config can reference the package by name:

```json
{
  "plugin": [
    "opencode-elapsed-plugin"
  ]
}
```

## Package contract

The package exposes the TUI entry through `exports["./tui"]` and that entry default-exports an OpenCode plugin module with this shape:

```ts
{
  id: "opencode-elapsed-plugin",
  tui: async (api) => {
    // register session_prompt_right slot renderer
  },
}
```

There is no server plugin in v1.

## Scripts

- `npm test` – run helper and plugin smoke tests
- `npm run typecheck` – run TypeScript without emitting files
- `npm run build` – emit the publishable `dist/` package
- `npm pack` – create the publishable tarball
