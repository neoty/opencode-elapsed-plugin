import type { SessionStatus } from "@opencode-ai/sdk/v2"
import { describe, expect, it } from "vitest"
import {
  buildSessionSnapshot,
  collectSessionTimestamps,
  formatElapsed,
  type SessionMessageTiming,
} from "../src/helpers.js"

describe("formatElapsed", () => {
  it("formats seconds, minutes, hours, and days", () => {
    expect(formatElapsed(12_400)).toBe("12s")
    expect(formatElapsed(125_000)).toBe("2m 5s")
    expect(formatElapsed(7_500_000)).toBe("2h 5m")
    expect(formatElapsed(97_200_000)).toBe("1d 3h")
  })
})

describe("collectSessionTimestamps", () => {
  it("returns the latest user input and completed assistant response times", () => {
    const messages: SessionMessageTiming[] = [
      { role: "user", time: { created: 1_000 } },
      { role: "assistant", time: { created: 1_500 } },
      { role: "assistant", time: { created: 2_000, completed: 2_700 } },
      { role: "user", time: { created: 3_000 } },
      { role: "assistant", time: { created: 3_500, completed: 4_400 } },
    ]

    expect(collectSessionTimestamps(messages)).toEqual({
      lastInputAt: 3_000,
      lastResponseAt: 4_400,
    })
  })
})

describe("buildSessionSnapshot", () => {
  it("uses idle by default and falls back to dashes when data is missing", () => {
    expect(buildSessionSnapshot([], undefined, 10_000)).toEqual({
      status: "idle",
      cmd: "-",
      agent: "-",
    })
  })

  it("builds elapsed labels from the latest timestamps", () => {
    const messages: SessionMessageTiming[] = [
      { role: "user", time: { created: 10_000 } },
      { role: "assistant", time: { created: 11_000, completed: 14_000 } },
    ]
    const status = { type: "busy" } satisfies SessionStatus

    expect(buildSessionSnapshot(messages, status, 19_000)).toEqual({
      status: "busy",
      cmd: "9s",
      agent: "5s",
    })
  })
})
