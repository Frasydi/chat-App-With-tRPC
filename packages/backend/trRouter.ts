import {t} from "./trpc"
import { z } from 'zod';
import { createUsername, getAllUser, getUserfromuid, hapusAkun, login, searchUser } from "./controller/user";
import { createChat, deletePesan, getChat, kirimGambar } from "./controller/chat";
import autoIncrement from "./utils/duplicateFileNames"
const tRouter =  t.router({
    getUser: t.procedure.input(z.string()).query(async(req) => {
      
      return await getUserfromuid(req.input)
    }), 
    getUserFromToken : t.procedure.query(async (req) => {
      if(!req.ctx.user.status) {
        return req.ctx.user
      }
      //@ts-ignore

      return await getUserfromuid(req.ctx.user.msg.uuid)
    }),
    searchUser : t.procedure.input(z.string()).query(async (req) => {
      if(!req.ctx.user.status) {
        return req.ctx.user
      }
      //@ts-ignore
      return await searchUser(req.ctx.user.msg.uuid, req.input)
    })
    ,
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
    getAllUser : t.procedure.query(async(req) => {
      if(!req.ctx.user.status) {
        return req.ctx.user
      }
      //@ts-ignore
      return await getAllUser(req.ctx.user.msg.uuid)
    }),
    getAllChat : t.procedure.input(z.object({uuid2 : z.string()})).query(async(req) => {
      if(!req.ctx.user.status) {
        return req.ctx.user
      }
      //@ts-ignore
      return await getChat({uuid : req.ctx.user.msg.uuid,...req.input})
    }),
    sendChat : t.procedure.input(z.object({uuid2 : z.string(), text : z.string()})).mutation(async (req) => {
      if(!req.ctx.user.status) {
        return req.ctx.user
      }
      //@ts-ignore
      return await createChat({uuid : req.ctx.user.msg.uuid,...req.input})
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
    }),
    sendImage : t.procedure.input(z.object({to : z.string(), image : z.string(), imageName : z.string(), text : z.string()})).mutation(async (req) => {
      if(!req.ctx.user.status) {
        return req.ctx.user
      }
      const base64ImageWithoutPrefix = req.input.image.split(';base64,').pop();
      //@ts-ignore
      const imageBuffer = new Buffer.from(base64ImageWithoutPrefix, 'base64');
      
      //@ts-ignore
      return await kirimGambar(req.input.imageName, imageBuffer, req.ctx.user.msg.uuid, req.input.to, req.input.text)
      
    })
  });

  export default tRouter