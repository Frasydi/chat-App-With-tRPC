import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { createContext, useEffect, useState } from "react";
import { trpc } from "../utils/trpc";

export const UserCTX = createContext<{username : string, uuid : string}>({username : "", uuid : ""})

export default function Layout() {
    const loc = useLocation()
    const auth = trpc.auth.useMutation()
    const nav = useNavigate()
    useEffect(() => {
        console.log("Lah")
        cekCookie()
        return () => {
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
        }).catch(err => {
            console.log(err)
        })
    }

    return(
       <>
        <Outlet/>
       </>
       
    )
}