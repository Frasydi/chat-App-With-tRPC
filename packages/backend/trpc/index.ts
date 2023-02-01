import { inferAsyncReturnType, initTRPC } from '@trpc/server';
import { validation } from '../utils/jwt';
import * as trpcExpress from '@trpc/server/adapters/express';


export const createContext = async({
    req,
    res,
  }: trpcExpress.CreateExpressContextOptions) => {
    console.log("cookie "+ req.cookies["token"])
    if(req.cookies["token"] == null) {
      return {
        user : {
          status : false,
          msg : "Token is empty"
        }
      }
    }
    if(req.cookies["token"].length == 0) {
      return {
        user : {
          status : false,
          msg : "Token is empty"
        }
      }
    }
    try {
  
      const user = await validation(req.cookies["token"])
      return {
        user 
      }
    }catch(err) {
      console.log(err)
      return {
        user : {
          status : false,
          msg :"ada masalah",
        }
      }
    }
  
   
  };
  type Context = inferAsyncReturnType<typeof createContext>;
  export const t = initTRPC.context<Context>().create();

  