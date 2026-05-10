import { describe, expect, it } from "vitest"
import plugin, { PLUGIN_ID } from "../src/index.js"

describe("plugin export", () => {
  it("exposes a default TUI plugin module", () => {
    expect(plugin.id).toBe(PLUGIN_ID)
    expect(plugin.tui).toBeTypeOf("function")
  })
})
