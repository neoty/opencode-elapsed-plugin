# opencode-elapsed-plugin

`opencode-elapsed-plugin` is a small OpenCode TUI-only plugin that mounts in the `session_prompt_right` slot and shows three prompt-side indicators:

- current session status (`idle`, `busy`, or `retry`)
- `cmd` elapsed time since the latest user message
- `agent` elapsed time since the latest completed assistant message

The v1 implementation keeps the logic intentionally simple: every second it recomputes the latest timestamps from `api.state.session.messages(sessionID)` instead of maintaining a mutable cache.

## Use in OpenCode

### Global config

Add the package name to your global OpenCode plugin config:

```json
{
  "plugin": [
    "opencode-elapsed-plugin"
  ]
}
```

Then restart OpenCode.

### Per-project config

If you want to enable it only for one project, add the same package name to that project's OpenCode config:

```json
{
  "plugin": [
    "opencode-elapsed-plugin"
  ]
}
```

Then restart OpenCode inside that project.

### Install from the OpenCode settings UI

If you are using the settings screen:

1. Open OpenCode settings
2. Go to the plugin install/add section
3. Paste `opencode-elapsed-plugin`
4. Save or install
5. Restart OpenCode

## What you should see

- `idle`, `busy`, or `retry` status in the prompt area
- `cmd` timer for the latest user message
- `agent` timer for the latest completed assistant response

## Reinstall or refresh

If OpenCode keeps using an older cached version, remove the cached package and restart OpenCode:

```bash
rm -rf ~/.cache/opencode/packages/opencode-elapsed-plugin@latest
```

If needed, remove all cached versions:

```bash
rm -rf ~/.cache/opencode/packages/opencode-elapsed-plugin@*
```

Then start OpenCode again.

## Local plugin path

If you want to load the plugin from a local folder instead of npm, point OpenCode at the folder path:

```json
{
  "plugin": [
    "file:/absolute/path/to/opencode-elapsed-plugin"
  ]
}
```

## Package contract

The package is intentionally **TUI-only**. It exposes only `exports["./tui"]`, and that entry points to raw `tui.tsx` source so OpenCode can compile it directly instead of loading prebuilt JS through `@opentui/solid/jsx-runtime`.

That TUI entry default-exports an OpenCode plugin module with this shape:

```ts
{
  id: "opencode-elapsed-plugin",
  tui: async (api) => {
    // register session_prompt_right slot renderer
  },
}
```

There is no server plugin in v1.
