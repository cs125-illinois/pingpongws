import { Record, Static, Literal, Union, Partial, Number, Boolean } from "runtypes"
import ReconnectingWebsocket from "reconnecting-websocket"
import WebSocket from "ws"

const PingMessage = Record({
  type: Literal("ping"),
  nonce: Number,
})
type PingMessage = Static<typeof PingMessage>

const PongMessage = Record({
  type: Literal("pong"),
  nonce: Number,
})
type PongMessage = Static<typeof PongMessage>

export const PingPongMessages = Union(PingMessage, PongMessage)
export type PingPongMessages = PingMessage | PongMessage

export const PingPongOptions = Partial({
  interval: Number,
  timeout: Number,
  verbose: Boolean,
})
export type PingPongOptions = Static<typeof PingPongOptions>
export const pingPongDefaultOptions = {
  interval: 8000,
  timeout: 1000,
  verbose: false,
}

export function PongWS(ws: WebSocket, o: PingPongOptions = {}): WebSocket {
  const { interval, timeout, verbose } = { ...pingPongDefaultOptions, ...o }

  let pongTimer: NodeJS.Timer | undefined
  let nonce: number | undefined
  let pongTimeout: NodeJS.Timeout | undefined

  function startPongTimer(): void {
    pongTimer = setInterval(() => {
      if (pongTimeout) {
        clearTimeout(pongTimeout)
      }
      nonce = Math.floor(Math.random() * 1024 * 1024)
      if (verbose) {
        console.log(`-> pong ${nonce}`)
      }
      ws.send(JSON.stringify(PongMessage.check({ type: "pong", nonce })))
      pongTimeout = setTimeout(() => {
        ws.close()
      }, timeout)
    }, interval)
  }

  if (ws.readyState === ws.OPEN) {
    startPongTimer()
  } else {
    ws.addEventListener("open", startPongTimer)
  }
  ws.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data)
    if (PongMessage.guard(message) && message.nonce === nonce && pongTimeout) {
      if (verbose) {
        console.log(`<- pong ${nonce}`)
      }
      clearTimeout(pongTimeout)
    } else if (PingMessage.guard(message)) {
      ws.send(data)
    }
  })
  ws.addEventListener("close", () => {
    if (pongTimer) {
      clearInterval(pongTimer)
    }
    if (pongTimeout) {
      clearTimeout(pongTimeout)
    }
  })

  return ws
}

export function PingWS(ws: ReconnectingWebsocket, o: PingPongOptions = {}): ReconnectingWebsocket {
  const { interval, timeout, verbose } = { ...pingPongDefaultOptions, ...o }

  let pingTimer: NodeJS.Timer | undefined
  let nonce: number | undefined
  let pingTimeout: NodeJS.Timeout | undefined

  function startPingTimer(): void {
    pingTimer = setInterval(() => {
      if (pingTimeout) {
        clearTimeout(pingTimeout)
      }
      nonce = Math.floor(Math.random() * 1024 * 1024)
      if (verbose) {
        console.log(`-> ping ${nonce}`)
      }
      ws.send(JSON.stringify(PingMessage.check({ type: "ping", nonce })))
      pingTimeout = setTimeout(() => {
        ws.close()
      }, timeout)
    }, interval)
  }

  if (ws.readyState === ws.OPEN) {
    startPingTimer()
  } else {
    ws.addEventListener("open", startPingTimer)
  }
  ws.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data)
    if (PingMessage.guard(message) && message.nonce === nonce && pingTimeout) {
      if (verbose) {
        console.log(`<- ping ${nonce}`)
      }
      clearTimeout(pingTimeout)
    } else if (PongMessage.guard(message)) {
      ws.send(data)
    }
  })
  ws.addEventListener("close", () => {
    if (pingTimer) {
      clearInterval(pingTimer)
    }
    if (pingTimeout) {
      clearTimeout(pingTimeout)
    }
  })

  return ws
}

type messageHandler = (event: { data: unknown }) => void

export function filterPingPongMessages(listener: messageHandler): messageHandler {
  return (event): unknown => {
    try {
      const message = JSON.parse(event.data as string)
      if (PingPongMessages.guard(message)) {
        return
      }
    } catch (err) {}
    return listener(event)
  }
}
