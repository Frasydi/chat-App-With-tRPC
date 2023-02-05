import Style from './sidebar.module.css'
import { MdMoreHoriz } from 'react-icons/md'
import { BiSearch } from 'react-icons/bi'
import { useEffect, useState } from 'react'
import { trpc } from '../../utils/trpc'
import Swal from 'sweetalert2'
import { useNavigate } from 'react-router-dom'

export default function SideBar({
  setSelectedChat,
  selectedChat,
  username,
  sideActive,
  setSideActive
}: {
  setSelectedChat: any
  selectedChat: any
  username : string
  isMobile : boolean
  sideActive : boolean
  setSideActive : any
}) {
  const [option, setOption] = useState(false)
  const [search, setSearch] = useState("")
  const users = trpc.searchUser.useQuery(search)
  const logout = trpc.logout.useMutation()
  const nav = useNavigate()
  
  useEffect(() => {
    //@ts-ignore
    
    return () => {
        setSearch("")
        setOption(false)
    }
  }, [])

useEffect(() => {
    users.refetch()
}, [search])
  useEffect(() => {
    if (users.isLoading) {
      return
    }
    if (users.isError) {
      Swal.fire('Tampaknya ada masalah', '', 'error')
      return
    }
    console.log(users.data)
    
  }, [users.data])
  
  return (
    <>
      <>
    <div className={`${Style.sidebar} ${sideActive ? Style.sideActive : ""}`} >
    <div className={Style.container}>
      <div className={Style.header}>
        <div className={Style.head}>{username}</div>
        <div className={Style.option}>
          <div
            className={Style.optIcon}
            tabIndex={1}
            onClick={() => {
              setOption((prev) => !prev)
            }}
          >
            <MdMoreHoriz />
          </div>
          <div  onBlur={() => {
            setOption(false)
          }} tabIndex={2} className={`${Style.optDropDown} ${option ? `${Style.active} flip` : ''}`}>
            <div className={Style.optContainer}>
              <div className={Style.optDropDownItem} onClick={() => {
                Swal.fire({
                    title : "Harap Menunggu",
                    allowEscapeKey : false,
                    allowOutsideClick : false,
                    showConfirmButton : false,
                    didOpen : async() => {
                        Swal.showLoading()
                        logout.mutateAsync().then(() => {
                            nav("/login")
                            Swal.close()
                        })
                    }
                })
                
              }}>Logout</div>
              <div className={Style.optDropDownItem}>Hapus Akun</div>
            </div>
          </div>
        </div>
        <div className={Style.search}>
          <input type="text" id="search"  onChange={(ev) => {
              setSearch(ev.target.value)

          }}  />
          <i className={Style.searchIcon}>
            <BiSearch />
          </i>
        </div>
      </div>
      <div className={Style.body}>
        {users.data?.status ? (
           
          //@ts-ignore
          users.data?.msg.map((el) => (
            <div className={`${Style.user} ${selectedChat == el.uuid ? Style.selectUser : ""}`} onClick={() => {
                setSelectedChat(el.uuid)
                setSideActive(false)
            }}>
              <div className={Style.userIcon}></div>
              <div className={Style.username}> {el.username} 
             
              </div>
            </div>
          ))
        ) : (
          <div className={Style.bodLoading}>
            <h1></h1>
          </div>
        )}
      </div>
    </div>
  </div>
    </>
    </>
  )
}

