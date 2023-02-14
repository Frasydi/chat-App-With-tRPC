import { useEffect, useRef, useState } from 'react'
import { trpc } from '../../utils/trpc'
import { BiSend, BiArrowBack } from 'react-icons/bi'
import { BsCardImage } from 'react-icons/bs'
import SideBar from './SideBar'
import Style from './style.module.css'
import io from 'socket.io-client'
import { RiArrowDropDownLine } from 'react-icons/ri'
import { IoMdClose } from 'react-icons/io'
import { FiPhoneCall } from 'react-icons/fi'
import Swal from 'sweetalert2'
import Call from './Call'
import { getLinkPreview, getPreviewFromContent } from "link-preview-js";
import Linkify from "linkify-react";
export const socket = io({
  path: '/api/socket',
})
export default function Home() {
  const [selectedChat, setSelectedChat] = useState('')
  const [sedangMengetik, setSedangMengetik] = useState(false)
  const [pesan, setPesan] = useState('')
  const [prevChat, setPrevChat] = useState(0)
  const chat = trpc.getAllChat.useQuery(selectedChat)
  const user = trpc.getUserFromToken.useQuery()
  const user2 = trpc.getUser.useQuery(selectedChat)
  const kirimPesan = trpc.sendChat.useMutation()
  const hapusPesan = trpc.deleteChat.useMutation()
  const [isMobile, setIsMobile] = useState(false)
  const [sideActive, setSideActive] = useState(true)
  const [image, setImage] = useState<File>()
  const kirimGambar = trpc.sendImage.useMutation()
  const [displayMessage, setDisplayMessage] = useState(null)
  const [isCall, setCall] = useState(false)
  const [isCalling, setCalling] = useState(false)
  async function sendImage() {
    console.log(image)
    const reader = new FileReader()
    //@ts-ignore
    reader.readAsDataURL(image)

    reader.onload = async (e) => {
      //@ts-ignore
      const result = await kirimGambar.mutateAsync({
        to: selectedChat,
        //@ts-ignore
        image: e.target.result,
        //@ts-ignore
        imageName: image?.name,
        text: pesan,
      })
      if (!result.status) {
        return
      }
      chat.refetch()
      //@ts-ignore
      socket.emit('message', selectedChat, user.data?.msg?.uuid)
    }
    //@ts-ignore
    setImage()
  }
  useEffect(() => {
    getLink()
  }, [pesan])
  
  async function getLink() {
    try {

      const data:any = await getLinkPreview(pesan, {
        
      })
      console.log(data)
      if(data.images.length == 0) return
    }catch(err) {
      console.log(err)
    }
  }
  useEffect(() => {
    if(image == null) return
    if (image && !user2.data?.status && !chat.data?.status) {
      //@ts-ignore
      setImage()
      return
    }
  }, [image])

  useEffect(() => {
    console.log(selectedChat)
    setSedangMengetik(false)
    setPrevChat(0)
    setDisplayMessage(null)
    //@ts-ignore
    setImage()
    chat.refetch()
    user2.refetch()
  }, [selectedChat])
  useEffect(() => {
    setIsMobile(innerWidth > 768 ? false : true)
  }, [])
  useEffect(() => {
    if (!user.data?.status) {
      return
    }
    console.log(user.data)
    //@ts-ignore
    socket.emit('join', user.data?.msg?.uuid)
  }, [user.data])

  useEffect(() => {
    socket.on('connect', () => {})
    socket.on('message', (uuid) => {
      console.log(uuid)
      if (uuid != selectedChat) {
        return
      }
      chat.refetch()
    })
    socket.on('mengetik', (uuid) => {
      console.log('Ada yang mengetik', uuid)
      if (uuid != selectedChat) {
        return
      }
      setSedangMengetik(true)
    })
    socket.on('tidak-mengetik', (uuid) => {
      if (uuid != selectedChat) {
        return
      }
      setSedangMengetik(false)
    })
    socket.on('call', (uuid) => {
      console.log(isCall)
      if(isCall) {
        socket.emit('deny-call', uuid)
      }
      setSedangMengetik(false)
      setPrevChat(0)
      setSelectedChat(uuid)
      setCalling(false)
      setSideActive(false)
      setCall(true)
    })
    
    return () => {
      socket.off('connect')
      socket.off('message')
      socket.off('mengetik')
      socket.off('tidak-mengetik')
      socket.off('call')
    }
  }, [0, selectedChat, isCall])

  useEffect(() => {
    if (!chat.data?.status) {
      return
    }
    //@ts-ignore
    if (chat.data?.msg.length > prevChat) {
      //@ts-ignore
      document.getElementById('chatId').lastChild?.scrollIntoView()
    }
    //@ts-ignore
    setPrevChat(chat.data?.msg.length)
    return () => {
      setSedangMengetik(false)
      setPrevChat(0)
      setSideActive(false)
    }
  }, [0, chat.data])
  async function sendPesan() {
    const isiPesan = pesan
    setPesan('')
    try {
      const result = await kirimPesan.mutateAsync({ uuid2: selectedChat, text: isiPesan })
      chat.refetch()
      //@ts-ignore
      socket.emit('message', selectedChat, user.data?.msg?.uuid)
    } catch (err) {
      console.log(err)
    }
  }

  if (user.isLoading) {
    return (
      <div className={Style.loading}>
        <h1>Loading</h1>
      </div>
    )
  }
  if (user.isError) {
    return (
      <div className={Style.loading}>
        <h1>Error</h1>
      </div>
    )
  }

  if (!user.data?.status) {
    return (
      <div className={Style.loading}>
        <h1>{user.data?.msg as string}</h1>
      </div>
    )
  }

  const Chatbox = ({ item, ind }: { item: any; ind: number }) => {
    const [drop, setDrop] = useState(false)
    const [linkPreview, setLinkPreview] = useState<any>(null)
    useEffect(() => {
      getLink()
    }, [])
    async function getLink() {
      try {
        const data:any = await getLinkPreview(item.text, {
          
        })
        console.log(data)
        if(data.images.length == 0) return
        setLinkPreview({url : data.url,gambar : data.images[0]})
      }catch(err) {
        console.log(err)
      }
    }
    return (
      <div
        className={`${Style.chatBox} ${
          //@ts-ignore
          user.data?.msg.uuid == item.from ? Style.fromMe : ''
        }`}
      >
        {item.image != null ? (
          <img
            src={`/api/gambar/${item.image}`}
            onClick={() => {
              console.log('oke')
              setDisplayMessage(item.image)
            }}
          />
        ) : (
          <></>
        )}
        {
          linkPreview != null ? (
            <img
            src={linkPreview.gambar}
            onClick={() => {
              window.open(linkPreview.url)
            }}
          />
          ) : <></>
        }
        
        <Linkify  as="p" options={{className : Style.textChat}} >
          {item.text}
        </Linkify>
        {/* <p
          style={{
            display: item.text.trim().length == 0 ? 'none' : 'block',
            lineBreak: 'normal',
            width: '100%',
            height: 'max-content',
            wordWrap: 'break-word',
          }}
          
        >

        </p> */}

        <p className={Style.date}>{new Date(item.date).toLocaleString()}</p>
        <div className={Style.dropPesan}>
          <p
            onClick={() => {
              setDrop(!drop)
            }}
          >
            <RiArrowDropDownLine fontSize={'x-large'} />
          </p>
        </div>
        <div className={`${Style.dropItems} ${drop ? Style.dropActive : ''}`}>
          <div
            className={Style.dropItem}
            onClick={() => {
              Swal.fire({
                title: 'Apakah anda ingin menghapus pesan ini ?',
                icon: 'question',
                showDenyButton: true,
              }).then(async (res) => {
                if (!res.isConfirmed) {
                  return
                }
                try {
                  await hapusPesan.mutateAsync(item.id)
                  chat.refetch()
                  //@ts-ignore
                  socket.emit('message', selectedChat, user.data?.msg?.uuid)
                } catch (err) {}
                setDrop(false)
              })
            }}
          >
            Hapus
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={Style.container}>
      <SideBar
        sideActive={sideActive}
        setSideActive={setSideActive}
        isMobile={isMobile}
        username={
          //@ts-ignore

          user.data?.msg.username
        }
        setSelectedChat={setSelectedChat}
        selectedChat={selectedChat}
      />
      <main className={Style.main}>
        {isMobile ? (
          <div
            className={Style.backSide}
            onClick={() => {
              setSideActive(true)
            }}
          >
            <BiArrowBack color="white" fontSize={'x-large'} />
          </div>
        ) : (
          <></>
        )}
        <div className={Style.header}>
          {
            //@ts-ignore
            user2.data?.status && (!user2.isLoading || !user2.isError) ? (
              <>
                <div className={Style.username}>
                  {
                    //@ts-ignore
                    user2.data?.msg.username
                  }
                  <br />
                  <p className={Style.userStatus}>{sedangMengetik ? 'Sedang Mengetik' : ''}</p>
                </div>
                <div
                  className={Style.callIcon}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    //@ts-ignore
                    setCall(true)
                    setCalling(true)
                    //@ts-ignore
                    socket.emit('call', user.data.msg.uuid, selectedChat)
                  }}
                >
                  <FiPhoneCall color="whitesmoke" />
                </div>
              </>
            ) : (
              <></>
            )
          }
        </div>
        <div className={Style.chat} id="chatId">
          {
            //@ts-ignore

            chat.data?.status && (!chat.isLoading || !chat.isError) ? (
              //@ts-ignore
              chat.data?.msg.map((item: any, index: number) => {
                //@ts-ignore
                return <Chatbox item={item} index={index} />
              })
            ) : (
              <></>
            )
          }
        </div>
        {user2.data?.status && (!user2.isError || !user2.isLoading) ? (
          <div className={Style.textInput}>
            <div className={Style.imageInput}>
              <label htmlFor="gambar" style={{ cursor: 'pointer' }}>
                <BsCardImage fontSize={'x-large'} color="white" />
              </label>
              <input
                accept="image/png, image/jpeg"
                style={{ display: 'none' }}
                type="file"
                name="gambar"
                id="gambar"
                onChange={(ev) => {
                  if (ev.target.files) {
                    setImage(ev.target.files[0])
                  }
                }}
              />
            </div>
            <input
              type="text"
              placeholder="Masukkan pesan"
              value={pesan}
              onFocus={() => {
                //@ts-ignore
                socket.emit('mengetik', selectedChat, user.data?.msg?.uuid)
              }}
              onBlur={() => {
                //@ts-ignore
                socket.emit('tidak-mengetik', selectedChat, user.data?.msg?.uuid)
              }}
              onKeyDown={(ev) => {
                if (ev.key != 'Enter') {
                  return
                }
                sendPesan()
              }}
              onChange={(ev) => {
                setPesan(ev.target.value)
              }}
            />
            <button
              onClick={() => {
                sendPesan()
              }}
            >
              <BiSend color="white" />
            </button>
          </div>
        ) : (
          <></>
        )}
        {image != null ? (
          <div className={Style.imagePreview}>
            {isMobile ? (
              <div
                className={Style.backSidePreview}
                onClick={() => {
                  console.log("LOl")
                  //@ts-ignore
                  setPreviewImage(null)
                  //@ts-ignore
                  setImage(null)
                }}
              >
                <BiArrowBack color="white" fontSize={'x-large'} />
              </div>
            ) : (
              <></>
            )}
            <div
              className={Style.imageBlur}
              onClick={() => {
                //@ts-ignore
                setPreviewImage(null)
                //@ts-ignore
                setImage()
              }}
            ></div>
            <div className={Style.imageBox}>
              <img src={URL.createObjectURL(image)} alt="preview" />
              <div className={Style.sendBox}>
                <input
                  type="text"
                  placeholder="Masukkan pesan"
                  value={pesan}
                  onFocus={() => {
                    //@ts-ignore
                    socket.emit('mengetik', selectedChat, user.data?.msg?.uuid)
                  }}
                  onBlur={() => {
                    //@ts-ignore
                    socket.emit('tidak-mengetik', selectedChat, user.data?.msg?.uuid)
                  }}
                  onKeyDown={(ev) => {
                    if (ev.key != 'Enter') {
                      return
                    }
                    sendImage()
                  }}
                  onChange={(ev) => {
                    setPesan(ev.target.value)
                  }}
                />
                <button>
                  <BiSend
                    fontSize={'x-large'}
                    color="whitesmoke"
                    onClick={() => {
                      sendImage()
                    }}
                  />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
        {displayMessage != null ? (
          <div className={Style.displayMessage}>
            <div className={Style.displayHeader}>{displayMessage}</div>
            <div className={Style.displayBody}>
              <img src={`/api/gambar/${displayMessage}`} alt={displayMessage} />
            </div>

            <div
              className={Style.exitDisplay}
              onClick={() => {
                setDisplayMessage(null)
              }}
            >
              <IoMdClose color="red" fontSize={'xx-large'} fontWeight={'bolder'} />
            </div>
          </div>
        ) : (
          <></>
        )}
      </main>
      {isCall ? (
        <Call
        setCalling={setCalling}
          isCalling={isCalling}
          from={
            //@ts-ignore
            user.data?.msg?.uuid
          }
          to={
            //@ts-ignore
            selectedChat
          }
          setCall={setCall}
        />
      ) : (
        <></>
      )}
    </div>
  )
}
