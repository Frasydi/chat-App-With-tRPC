import {t} from "./trpc"
import { z } from 'zod';
import { createUsername, getAllUser, getUserfromuid, login } from "./controller/user";
import { createChat, getChat } from "./controller/chat";

const tRouter =  t.router({
    getUser: t.procedure.input(z.string()).query(async(req) => {
      
      return await getUserfromuid(req.input)
    }), 
    login : t.procedure.input(z.object({username: z.string(), password : z.string()})).mutation(async (req) => {
      return await login(req.input)
    }),
    createUser: t.procedure
      .input(z.object({ username: z.string(), password: z.string()}))
      .mutation(async (req) => {
        // use your ORM of choice
        return await createUsername(
          req.input
        )
      }),
    auth : t.procedure.mutation(async (req) => {
      return req.ctx.user
    }),
    getAllUser : t.procedure.input(z.string()).query(async(req) => {
      if(!req.ctx.user.status) {
        return req.ctx.user
      }
      return await getAllUser(req.input)
    }),
    getAllChat : t.procedure.input(z.object({uuid : z.string(), uuid2 : z.string()})).query(async(req) => {
      if(!req.ctx.user.status) {
        return req.ctx.user
      }
      return await getChat(req.input)
    }),
    sendChat : t.procedure.input(z.object({uuid : z.string(), uuid2 : z.string(), from : z.string(), text : z.string()})).mutation(async (req) => {
      if(!req.ctx.user.status) {
        return req.ctx.user
      }
      return await createChat(req.input)
    })
  });

  export default tRouter