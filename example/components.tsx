import React, { useEffect } from "react"
import PropTypes from "prop-types"
import ReconnectingWebSocket from "reconnecting-websocket"
import { PingWS } from "@cs125/pingpongws"

export const Lead: React.FC = ({ children }) => {
  return <div style={{ fontSize: "1.2rem" }}>{children}</div>
}
Lead.propTypes = {
  children: PropTypes.node.isRequired,
}

export const PingPonger: React.FC = () => {
  useEffect(() => {
    let intervalTimer: NodeJS.Timer | undefined
    const ws = PingWS(new ReconnectingWebSocket("ws://localhost:8888"), { verbose: true, interval: 1000, timeout: 100 })
    ws.addEventListener("open", () => {
      intervalTimer = setInterval(() => {
        ws.send(JSON.stringify({ hello: "there" }))
      }, 1000)
    })
    ws.addEventListener("close", () => {
      if (intervalTimer) {
        clearInterval(intervalTimer)
      }
    })
    return (): void => {
      ws.close()
    }
  }, [])

  return null
}
