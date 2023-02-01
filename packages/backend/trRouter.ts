import {t} from "./trpc"
import { z } from 'zod';
import { createUsername, getAllUser, getUserfromuid, hapusAkun, login } from "./controller/user";
import { createChat, deletePesan, getChat } from "./controller/chat";

const tRouter =  t.router({
    getUser: t.procedure.input(z.string()).query(async(req) => {
      
      return await getUserfromuid(req.input)
    }), 
    login : t.procedure.input(z.object({username: z.string(), password : z.string()})).mutation(async (req) => {
      const result = await login(req.input)
      if(result.status) {
        req.ctx.setToken(result.msg)
      }

      return result
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
    }),
    deleteChat : t.procedure.input(z.number()).mutation(async (req) => {
      if(!req.ctx.user.status) {
        return req.ctx.user
      }
      //@ts-ignore
      return await deletePesan(req.input, req.ctx.user.msg.uuid )
    }),
    logout : t.procedure.mutation(async (req) => {
      req.ctx.deleteToken()
    }),
    deleteAccount : t.procedure.mutation(async (req) => {
      if(!req.ctx.user.status) {
        return req.ctx.user
      }
      req.ctx.deleteToken()
      //@ts-ignore
      return await hapusAkun(req.ctx.user.msg.uuid)
    })
  });

  export default tRouter