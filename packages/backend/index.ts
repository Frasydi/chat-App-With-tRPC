import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import tRouter from "./trRouter"
import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from "./trpc";
import http from "http"
import {Server} from "socket.io"
import cookieParser from "cookie-parser";
dotenv.config()







export const appRouter = tRouter

// export type definition of API
export type AppRouter = typeof appRouter;



const app = express();
const port = 8000;
const server = http.createServer(app)

const io = new Server(server, {
  cors : {
    origin : "http://localhost:5173"
  },
  path : "/api/socket"
})


io.on('connection', (socket) => {
  
  socket.on('send-message', () => {
    console.log("Ada yang mengirim pesan")
    io.emit('message')
  })
  socket.on('mengetik', (uuid) => {
    console.log(uuid)
    io.emit('sedang-mengetik', uuid)
  })
  socket.on("tidak-mengetik", (uuid) => {
    io.emit("tidak-mengetik", uuid)
  })

});




app.use(cors())
app.use(cookieParser())
app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);




server.listen(port, () => {
  console.log(`backend listening at http://localhost:${port}`);
});

