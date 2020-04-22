import Koa from "koa"
import Router from "koa-router"
import websocket from "koa-easy-ws"

import WebSocket from "ws"

import { PongWS, filterPingPongMessages } from "@cs125/pingpongws"

const app = new Koa()
const router = new Router<{}, { ws: () => Promise<WebSocket> }>()

router.get("/", async (ctx) => {
  if (!ctx.ws) {
    return ctx.throw(404)
  }

  const ws = PongWS(await ctx.ws(), { verbose: true, interval: 1000, timeout: 100 })

  ws.addEventListener(
    "message",
    filterPingPongMessages(({ data }) => {
      console.log(data)
    })
  )
  const intervalTimer = setInterval(() => {
    ws.send(JSON.stringify({ you: "there?" }))
  }, 1000)
  ws.addEventListener("close", () => {
    clearInterval(intervalTimer)
  })
})

app.use(websocket()).use(router.routes()).use(router.allowedMethods()).listen(8888)

process.on("uncaughtException", (err) => {
  console.error(err)
})
