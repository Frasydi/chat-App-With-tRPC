import { trpc } from '../../utils/trpc'
import { useState, useEffect } from 'react'
import Style from './style.module.css'
//@ts-ignore
import FloatingLabel from 'react-bootstrap/FloatingLabel'
//@ts-ignore
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'
import Swal from "sweetalert2"
import { useNavigate } from 'react-router-dom'
import { useCookies } from 'react-cookie'
export default function Login() {
  const register = trpc.createUser.useMutation()
  const login = trpc.login.useMutation()
  const [isRegister, setRegister] = useState(false)
  const [cookie, setcookies, deletecookies] = useCookies()
  const nav = useNavigate()
  useEffect(() => {
    return () => {
      setRegister(false)
    }
  }, [])
  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
      
    //@ts-ignore
    const [username, password] =  ev.target.elements
    
    console.log(username.value, password.value)
    
    if(!isRegister) {
      login.mutateAsync(
        {
          username : username.value,
          password : password.value
        }
      ).then(res => {
        if(!res.status) {
          Swal.fire("Terjadi kesalahan", res.msg, "error")
          return
        }
        Swal.fire(
          {
            title : "Berhasil",
            html : "Berhasil Masuk ke Akun",
            icon : "success",
            timer : 2000,
            showCancelButton : false,
            showConfirmButton : false,
            allowEscapeKey : false,
            allowOutsideClick : false,
          
            didOpen : () => {
              Swal.showLoading()
            }
          }
          ).then(() => {
          setcookies("token", res.msg, {maxAge : 6000, path :"/"})
          
          nav("/")
        })
      })
      return
    }
    register.mutateAsync(
        {
            username : username.value,
            password : password.value
        }
    ).then(res => {
      if(!res.status) {
        Swal.fire("Ada masalah", res.msg, "error")
        return
      }
      Swal.fire("Berhasil", res.msg, "success")
      setRegister(false)
    })
  }

  return (
    <div className={Style.login}>
      <div className={Style.blur}></div>
      <div className={Style.box}>
        <div className={Style.header}>{isRegister ? 'Register' : 'Login'}</div>
        <form onSubmit={handleSubmit}>
          <FloatingLabel controlId="username" label="Username">
            <Form.Control autoComplete='username' type="text" placeholder="Username" required/>
          </FloatingLabel>
          <FloatingLabel controlId="floatingPassword" label="Password">
            <Form.Control autoComplete='current-password' type="password" placeholder="Password" required />
          </FloatingLabel>
          <div className={Style.btnGroup}>
            <Button type='submit' variant="primary"  >{isRegister ? 'Register' : 'Login'}</Button>
          </div>
          <a className={Style.reminderRegister} onClick={() => {
            setRegister(prev => !prev)
          }}>{isRegister ? "Sudah mempunyai akun?" : "Belum mempunyai akun?"}</a>
        </form>
      </div>
    </div>
  )
}
