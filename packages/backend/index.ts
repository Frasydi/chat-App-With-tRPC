import express from "express";
import cors from "cors"
import dotenv from "dotenv"
import tRouter from "./trRouter"
import * as trpcExpress from '@trpc/server/adapters/express';
import { createContext } from "./trpc";
import http from "http"
import {Server} from "socket.io"
import cookieParser from "cookie-parser";
import * as path from "path"

dotenv.config()








export const appRouter = tRouter

// export type definition of API
export type AppRouter = typeof appRouter;



const app = express();
const port = 8000;
const server = http.createServer(app)


const io = new Server(server, {
  cors : {
    origin : "*"
  },
  path : "/api/socket"
})


io.on('connection', (socket) => {
  socket.on("join", (uuid) => {
    socket.join(uuid)
  })
  socket.on('message', (uuid, uuid2) => {
    console.log(socket.rooms)
    console.log(uuid, uuid2)
    socket.to(uuid).emit('message', uuid2)
  })
  socket.on('mengetik', (uuid, uuid2) => {
    console.log(socket.rooms)
    console.log("Sedang mengetik", uuid, uuid2)
    socket.to(uuid).emit('mengetik', uuid2)
  })
  socket.on("tidak-mengetik", (uuid, uuid2) => {
    socket.to(uuid).emit("tidak-mengetik", uuid2)
  })

  socket.on("call", (from, to) => {
    socket.to(to).emit("call", from)
  })
  socket.on("call-stop", (to, from) => {
    io.to(from).to(to).emit("call-stop")
  })

  socket.on("calling", (to, from) => {
    socket.to(to).emit("calling", from )
  })
  
});

process.on('uncaughtException', (error, origin) => {
  //@ts-ignore
  if (error?.code === 'ECONNRESET') return;
  console.error('UNCAUGHT EXCEPTION');
  console.error(error);
  console.error(origin);
  process.exit(1);
});




app.use(cors())
app.use(cookieParser())

app.use("/api/gambar",express.static(path.join(__dirname, 'image')));
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

