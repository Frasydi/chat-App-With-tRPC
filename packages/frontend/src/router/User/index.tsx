import Button from "react-bootstrap/esm/Button"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { trpc } from "../../utils/trpc"

export default function User() {
    const param = useParams()
    const nav = useNavigate()
    const user = trpc.getUser.useQuery(param?.uuid as string)
    if(!user.data) {
        return <h1>Loading</h1>
    }
    return(
    <div>
        <h1>
            {
                //@ts-ignore
                user.data.msg.username}
        </h1>
        <Button variant="primary" onClick={() => {
                //@ts-ignore
            nav("/chat/"+user.data.msg.uuid)
        }} >Chat</Button>
    </div>


    )

}