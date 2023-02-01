import { useContext, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { UserCTX } from '../../layout'
import { trpc } from '../../utils/trpc'
import Style from './style.module.css'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import io from 'socket.io-client'
import Swal from 'sweetalert2'
const socket = io({
  path: '/api/socket',
})

export default function Chat() {
  const [isConnected, setIsConnected] = useState(socket.connected)
  const user = useContext(UserCTX)
  const params = useParams()
  //@ts-ignore
  const user2 = trpc.getUser.useQuery(params.uuid)
  //@ts-ignore
  const chat = trpc.getAllChat.useQuery({ uuid: user.uuid, uuid2: params.uuid })
  const sendMessage = trpc.sendChat.useMutation()
  const deleteMessage = trpc.deleteChat.useMutation()
  const [sedangMengetik, setSedangMengetik] = useState(false)
  const [prevChatLength, setpreChatLength] = useState(0)
  async function send() {
    //@ts-ignore
    const text = document.getElementById('msg').value
    //@ts-ignore
    document.getElementById('msg').value = ''
    try {
      const result = await sendMessage.mutateAsync({
        uuid: user.uuid,
        uuid2: params.uuid as string,
        //@ts-ignore
        text: text,
        from: user.uuid,
      })

      console.log(result)

      if (!result.status) {
        return
      }
      socket.emit('message', user.uuid)
      chat.refetch()
    } catch (err) {}
  }
  async function hapusPesan(id: number) {
    const result = await deleteMessage.mutateAsync(id)
    if (!result.status) {
      return
    }
    socket.emit('message', user.uuid)
    chat.refetch()
  }
  useEffect(() => {
    //@ts-ignore
    if (chat.data?.msg.length > prevChatLength) {
      //@ts-ignore
      const tes = document.getElementById('chatsContainer')?.lastChild
      console.log(tes)
      //@ts-ignore
      tes?.scrollIntoView()
    }
    //@ts-ignore
    setpreChatLength(chat.data?.msg.length)
  }, [chat.data])

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true)
    })

    socket.on('disconnect', () => {
      setIsConnected(false)
    })
    socket.on('message', (uuid) => {
      if (params.uuid != uuid) {
        return
      }
      chat.refetch()
    })
    socket.on('sedang-mengetik', (uuid) => {
      if (uuid == params.uuid) {
        setSedangMengetik(true)
      }
    })
    socket.on('tidak-mengetik', (uuid) => {
      if (uuid == params.uuid) {
        setSedangMengetik(false)
      }
    })

    socket.on('connect_failed', () => {
      Swal.fire('Tidak dapat terhubung', '', 'error')
    })

    socket.on('Error', () => {
      Swal.fire('Server Error', '', 'error')
    })

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('message')
      socket.off('sedang-mengetik')
      socket.off('tidak-mengetik')
      socket.off('connect_failed')
      socket.off('Error')
    }
  }, [])

  if (user2.isLoading || user2.isError || chat.isLoading || chat.isError) {
    return <h1>Loading</h1>
  }
  if (!user2.data.status) {
    return <h1>{user2.data.msg as string}</h1>
  }
  return (
    <div className={Style.chatMain}>
      <div className={Style.chatContainer}>
        <p className={Style.username}>
          {
            //@ts-ignore
            user2.data.msg.username
          }
          <br />
          {sedangMengetik ? '(Sedang Mengetik)' : ''}
        </p>
        <div className={Style.chatContainer} id={'chatsContainer'}>
          {chat.isLoading || chat.isError ? (
            <h1>Loading</h1>
          ) : (
            //@ts-ignore
            chat.data?.msg.map((item: any, index: number) => {
              return (
                <div
                  className={`${Style.chatBox} ${item.from == user.uuid ? Style.fromMe : ''}`}
                  key={index}
                >
                  {item.text}
                  <br />
                  <p style={{ fontWeight: 'lighter', fontSize: 'small' }}>
                    {new Date(item.date).toLocaleString()}
                  </p>
                  {item.from == user.uuid ? (
                    <>
                      <br />
                      <a
                        style={{ color: 'red', cursor: 'pointer', userSelect : "none" }}
                        onClick={() => {
                          hapusPesan(item.id)
                        }}
                      >
                        Hapus
                      </a>
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>

      <div className={Style.chatInput}>
        <div className={Style.inputan}>
          <InputGroup className="mb-3">
            <Form.Control
              placeholder="Pesan"
              aria-label="Pesan"
              aria-describedby="basic-addon2"
              className={Style.input}
              id="msg"
              onKeyDown={(ev) => {
                if (ev.key != 'Enter') {
                  return
                }
                send()
              }}
              onFocus={() => {
                socket.emit('mengetik', user.uuid)
              }}
              onBlur={() => {
                socket.emit('tidak-mengetik', user.uuid)
              }}
            />
            <Button
              variant="outline-secondary"
              id="button-addon2"
              onClick={() => {
                send()
              }}
            >
              Kirim
            </Button>
          </InputGroup>
        </div>
      </div>
    </div>
  )
}
