import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { NavigateFunction } from 'react-router-dom'
import Swal from 'sweetalert2'
import { trpc } from '../utils/trpc'
import Style from './style.module.css'

export default function Navigasi({ username, loc, nav }: { username: string, loc : string, nav:NavigateFunction }) {
  const logout = trpc.logout.useMutation()
  useEffect(() => {
    return () => {}
  }, [])
  async function logOut() {
    Swal.fire({
      title : "Tunggu Sebentar",
      text : "Sedang logout",
      icon : "info",
      showCancelButton : false,
      showCloseButton : false,
      showConfirmButton : false,
      allowEscapeKey : false,
      allowOutsideClick : false,
      didOpen : async() => {
        Swal.showLoading()
        await logout.mutateAsync()
        Swal.close()
        nav("/login")
      }
    })
    try {

    }catch(err) {
      Swal.fire("Tampaknya ada masalah", "", "error")
    }
  }
  return (
    <nav className={Style.nav}>
      <div className={Style.navBox}>
        <div className={Style.navHeader} onClick={() => {
          nav("/")
        }}>Chat App</div>
        
        <div className={Style.user}>
          <div className={Style.username}>
            {username}
            
            </div>
          <div style={{color : "red", alignSelf:"center", marginLeft:"2rem", cursor:"pointer"}} onClick={() => {
            logOut()
          }}>Log Out</div>
          
        </div>
      </div>
    </nav>
  )
}
