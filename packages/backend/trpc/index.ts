import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import { validation } from '../utils/jwt';
import * as trpcExpress from '@trpc/server/adapters/express';


export const createContext = async({
    req,
    res,
  }: trpcExpress.CreateExpressContextOptions) => {

    const setToken = (token:string) => {
      res.cookie('token', token, {
        maxAge : 60 * 60 * 60 * 60
      });
    }   
    const deleteToken = () => {
      res.cookie('token', "", {
        maxAge : 0
      })
    }
    console.log("cookie "+ req.cookies["token"])
    if(req.cookies["token"] == null) {
      return {
        user : {
          status : false,
          msg : "Token is empty"
        },
        setToken,
        deleteToken
      }
    }
    if(req.cookies["token"].length == 0) {
      return {
        user : {
          status : false,
          msg : "Token is empty"
        },
        setToken,
        deleteToken
      }
    }
    try {
  
      const user = await validation(req.cookies["token"])
      return {
        user,
        setToken,
        deleteToken
      }
    }catch(err) {
      console.log(err)
      return {
        user : {
          status : false,
          msg :"ada masalah",
        },
        setToken,
        deleteToken
      }
    }
  
   
  };
  type Context = inferAsyncReturnType<typeof createContext>;
  export const t = initTRPC.context<Context>().create();

  