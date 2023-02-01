import { useRouteError } from "react-router-dom";

export default function ErrorPage() {
   const error = useRouteError()
   return(
    <div>

        <h1>Tampaknya Terdapat Error</h1>
        <p>Sebuah Error telah terjadi</p>
        <p>
            <i> {
                
                //@ts-ignore
            error.statusText || error.message} </i>
        </p>
    </div>

   ) 
}