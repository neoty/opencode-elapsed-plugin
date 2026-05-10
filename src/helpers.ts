import type { Message, SessionStatus } from "@opencode-ai/sdk/v2"

export type SessionMessageTiming = Pick<Message, "role" | "time">

export type SessionTimestamps = {
  lastInputAt?: number
  lastResponseAt?: number
}

export type SessionSnapshot = {
  status: SessionStatus["type"]
  cmd: string
  agent: string
}

export const formatElapsed = (ms: number) => {
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

export const labelForTimestamp = (timestamp: number | undefined, now: number) => {
  if (timestamp === undefined) return "-"
  return formatElapsed(now - timestamp)
}

export const collectSessionTimestamps = (messages: readonly SessionMessageTiming[]): SessionTimestamps => {
  const timestamps: SessionTimestamps = {}

  for (const message of messages) {
    if (message.role === "user") {
      if (timestamps.lastInputAt === undefined || message.time.created > timestamps.lastInputAt) {
        timestamps.lastInputAt = message.time.created
      }
      continue
    }

    if (message.role === "assistant" && "completed" in message.time) {
      const completed = message.time.completed
      if (typeof completed === "number") {
        if (timestamps.lastResponseAt === undefined || completed > timestamps.lastResponseAt) {
          timestamps.lastResponseAt = completed
        }
      }
    }
  }

  return timestamps
}

export const resolveStatusType = (status: SessionStatus | undefined): SessionStatus["type"] => {
  return status?.type ?? "idle"
}

export const buildSessionSnapshot = (
  messages: readonly SessionMessageTiming[],
  status: SessionStatus | undefined,
  now: number,
): SessionSnapshot => {
  const timestamps = collectSessionTimestamps(messages)

  return {
    status: resolveStatusType(status),
    cmd: labelForTimestamp(timestamps.lastInputAt, now),
    agent: labelForTimestamp(timestamps.lastResponseAt, now),
  }
}
