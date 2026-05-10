/** @jsxImportSource @opentui/solid */

import type { Message, SessionStatus } from "@opencode-ai/sdk/v2"
import type { TuiPlugin, TuiPluginApi, TuiPluginModule, TuiSlotPlugin } from "@opencode-ai/plugin/tui"
import { createMemo, createSignal, onCleanup } from "solid-js"

const PLUGIN_ID = "opencode-elapsed-plugin"

type SessionMessageTiming = Pick<Message, "role" | "time">
type TimerKind = "cmd" | "agent"
type SessionSnapshot = {
  status: SessionStatus["type"]
  cmd: string
  agent: string
}

const formatElapsed = (ms: number) => {
  const seconds = Math.max(0, Math.floor(ms / 1000))
  if (seconds < 60) return `${seconds}s`

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) return `${minutes}m ${remainingSeconds}s`

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours < 24) return `${hours}h ${remainingMinutes}m`

  const days = Math.floor(hours / 24)
  const remainingHours = hours % 24
  return `${days}d ${remainingHours}h`
}

const labelForTimestamp = (timestamp: number | undefined, now: number) => {
  if (timestamp === undefined) return "-"
  return formatElapsed(now - timestamp)
}

const buildSessionSnapshot = (
  messages: readonly SessionMessageTiming[],
  status: SessionStatus | undefined,
  now: number,
): SessionSnapshot => {
  let lastInputAt: number | undefined
  let lastResponseAt: number | undefined

  for (const message of messages) {
    if (message.role === "user") {
      if (lastInputAt === undefined || message.time.created > lastInputAt) {
        lastInputAt = message.time.created
      }
      continue
    }

    if (message.role === "assistant" && "completed" in message.time) {
      const completed = message.time.completed
      if (typeof completed === "number") {
        if (lastResponseAt === undefined || completed > lastResponseAt) {
          lastResponseAt = completed
        }
      }
    }
  }

  return {
    status: status?.type ?? "idle",
    cmd: labelForTimestamp(lastInputAt, now),
    agent: labelForTimestamp(lastResponseAt, now),
  }
}

const statusColor = (api: TuiPluginApi, status: SessionStatus["type"]) => {
  if (status === "busy") return api.theme.current.warning
  if (status === "retry") return api.theme.current.error
  return api.theme.current.success
}

const timerColor = (api: TuiPluginApi, kind: TimerKind) => {
  if (kind === "cmd") return api.theme.current.success
  return api.theme.current.warning
}

const SessionPromptElapsed = (props: { api: TuiPluginApi; sessionID: string }) => {
  const [now, setNow] = createSignal(Date.now())
  const interval = setInterval(() => {
    setNow(Date.now())
  }, 1000)

  onCleanup(() => {
    clearInterval(interval)
  })

  const snapshot = createMemo(() => {
    return buildSessionSnapshot(
      props.api.state.session.messages(props.sessionID),
      props.api.state.session.status(props.sessionID),
      now(),
    )
  })

  return (
    <box flexDirection="row" gap={1} flexShrink={0}>
      <text fg={statusColor(props.api, snapshot().status)}>{snapshot().status}</text>
      <box flexDirection="row" gap={0}>
        <text fg={props.api.theme.current.textMuted}>cmd </text>
        <text fg={timerColor(props.api, "cmd")}>{snapshot().cmd}</text>
      </box>
      <box flexDirection="row" gap={0}>
        <text fg={props.api.theme.current.textMuted}>agent </text>
        <text fg={timerColor(props.api, "agent")}>{snapshot().agent}</text>
      </box>
    </box>
  )
}

const tui: TuiPlugin = async (api) => {
  const plugin: TuiSlotPlugin = {
    slots: {
      session_prompt_right: (_context, props) => {
        return <SessionPromptElapsed api={api} sessionID={props.session_id} />
      },
    },
  }

  api.slots.register(plugin)
}

const plugin: TuiPluginModule = {
  id: PLUGIN_ID,
  tui,
}

export default plugin
