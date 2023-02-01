import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { createContext, useEffect, useState } from "react";
import { trpc } from "../utils/trpc";
import Navigasi from "./navigasi";

export const UserCTX = createContext<{username : string, uuid : string}>({username : "", uuid : ""})

export default function Layout() {
    const loc = useLocation()
    const auth = trpc.auth.useMutation()
    const nav = useNavigate()
    const [user, setUser] = useState({username : "", uuid : "0"})
    useEffect(() => {
        console.log("Lah")
        cekCookie()
        return () => {
            setUser({username : "", uuid : "0"})          
        }
    }, [0, loc.pathname])

    function cekCookie() {
        auth.mutateAsync().then(res => {
           
            if(!res.status) {
                nav("/login")
                return
            }
            if(loc.pathname == "/login" ) {
                nav("/")
                return
            }
            console.log(res.msg)
            setUser(res.msg as any)
        }).catch(err => {
            console.log(err)
        })
    }

    return(
       <>
       {
        loc.pathname != "/login" ? 
        <Navigasi username={user.username} nav={nav} loc={loc.pathname} /> : 
        <></>

       }
        <UserCTX.Provider value={user} >
        <Outlet/>
        </UserCTX.Provider>
       </>
       
    )
}