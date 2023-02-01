import { useEffect, useContext } from 'react'
import { useCookies } from 'react-cookie'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { UserCTX } from '../../layout'
import { trpc } from '../../utils/trpc'
import Style from './style.module.css'
export default function Home() {
  const user = useContext(UserCTX)
  const users = trpc.getAllUser.useQuery(user.uuid)
  const nav = useNavigate()
const deleteAkun = trpc.deleteAccount.useMutation() 
  async function HapusAkun() {
    const res = await Swal.fire({
        title : "Apakah anda ingin menghapus akun ini?",
        icon : "question",
        showCancelButton : true
    })
    if(
        res.isConfirmed 
    ) {
        await deleteAkun.mutateAsync()
        nav('/login')
    }
    
 
 }
  if (users.isLoading) {
    return <div>Loading...</div>
  }
  if (users.isError) {
    nav('/login')
    return <></>
  }
  if (!users.data?.status && typeof users.data?.msg == 'string') {
    return <div>{users.data?.msg}</div>
  }
  const data = users.data?.msg as Array<any>
  return (
    <div>
      <a style={{color : "red", cursor:"pointer"}} onClick={() => {
        HapusAkun()
      }}  >Hapus Akun</a>
      <div className={Style.users}>
        {data.map((el) => (
          <div className={Style.user}>
            <div
              className={Style.boxUser}
              onClick={() => {
                nav('/user/' + el.uuid)
              }}
            >
              {el.username}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
