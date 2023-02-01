import { useEffect, useContext } from "react"
import { useCookies } from "react-cookie"
import { useNavigate } from "react-router-dom"
import { UserCTX } from "../../layout"
import { trpc } from "../../utils/trpc"
import Style from "./style.module.css"
export default function Home() {
    const user = useContext(UserCTX)
    const users = trpc.getAllUser.useQuery(user.uuid)
    const nav = useNavigate()
    useEffect(() => {
        return () => {

        }
    }, [])
    if(
       users.isLoading
    ) {
        return (
            <div>
                Loading...
            </div>
        )
    }
    if(users.isError) {
        return(
            <div>
                Error
            </div>
        )
    }
    if(!users.data?.status && typeof users.data?.msg == "string" ) {
        return(
            <div>
                {
                    users.data?.msg
                }
            </div>
        )
    }
    const data = users.data?.msg as Array<any>
    return(
    <div>
    <div className={Style.users}>
        {
            data.map(el => (
                <div className={Style.user}>
                    <div className={Style.boxUser} onClick={() => {
                        nav("/user/" + el.uuid)
                    }} >{el.username}</div>
                </div>  

            ))
        }    
        
    </div>  
    </div>)
}