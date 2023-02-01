import { useEffect } from 'react'
import { useCookies } from 'react-cookie'
import { NavigateFunction } from 'react-router-dom'
import Style from './style.module.css'

export default function Navigasi({ username, loc, nav }: { username: string, loc : string, nav:NavigateFunction }) {
  const [cookie, setCookie, deleteCookie] = useCookies()

  useEffect(() => {
    return () => {}
  }, [])
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
            deleteCookie("token")
            nav("/login")
          }}>Log Out</div>
        </div>
      </div>
    </nav>
  )
}
