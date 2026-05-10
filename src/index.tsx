/** @jsxImportSource @opentui/solid */

import type { SessionStatus } from "@opencode-ai/sdk/v2"
import type { TuiPlugin, TuiPluginApi, TuiPluginModule, TuiSlotPlugin } from "@opencode-ai/plugin/tui"
import { createMemo, createSignal, onCleanup } from "solid-js"
import { buildSessionSnapshot } from "./helpers.js"

export const PLUGIN_ID = "opencode-elapsed-plugin"

type TimerKind = "cmd" | "agent"
type StatusType = SessionStatus["type"]

const statusColor = (api: TuiPluginApi, status: StatusType) => {
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
