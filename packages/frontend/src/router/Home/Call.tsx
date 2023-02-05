import { useEffect, useRef, useState } from 'react'
import Style from './Call.style.module.css'
import { HiOutlinePhoneMissedCall } from 'react-icons/hi'
import Swal from 'sweetalert2'
import { socket } from '.'
import { Peer } from 'peerjs'
export default function Call({
  setCall,
  to,
  from,
  isCalling,
  setCalling
}: {
  setCall: any
  to: string
  from: string
  isCalling: boolean
  setCalling : any
}) {
  const myVideo = useRef<any>()
  const userVideo = useRef<any>()
  useEffect(() => {
    const peers = new Peer()
    const MediaDevices =
      navigator?.mediaDevices ||
      //@ts-ignore
      navigator?.mozGetUserMedia ||
      //@ts-ignore
      navigator?.webkitGetUserMedia ||
      //@ts-ignore
      navigator?.getUserMedia

    if(!isCalling) {
      socket.on("calling", id => {
        console.log(id)
        MediaDevices.getUserMedia({video : true,audio : true}).then(stream => {
          const call = peers.call(id, stream)
          call.on("stream", stream => {
            userVideo.current.srcObject = stream
          })
          
          socket.on("call-stop", () => {
            stream.getVideoTracks().forEach(track => { 
              track.stop()
            })
            stream.getAudioTracks().forEach(track => { 
              track.stop()
            })
            setCall(false)
          })
        })
      
      })
    } else {

    peers.on('call', call => {
      MediaDevices.getUserMedia({video : true, audio : true}).then(stream => {
        call.answer(stream)
        call.on('stream', stream2 => {
          userVideo.current.srcObject = stream2
        })
        
        socket.on("call-stop", () => {
          stream.getVideoTracks().forEach(track => { 
            track.stop()
          })
          stream.getAudioTracks().forEach(track => { 
            track.stop()
          })
          setCall(false)
          setCalling(false)
        })
      })
    })
    peers.on("open", (id) => {
      socket.emit("calling", to, id)
    })
    }

    peers.on("error", () => {
      Swal.fire("Ada masalah", "" ,"error")
      setCall(false)
      setCalling(false)
    })
    return () => {
      peers.off("call")
      peers.off("open")
      socket.off("calling")
      peers.disconnect()
    }
  }, [])

  return (
    <div className={Style.call}>
      <div className={Style.callBox}>
        <div className={Style.userVideo}>
          <video ref={userVideo} autoPlay></video>
        </div>
        <div className={Style.btnGroup}>
          <button
            className={Style.closeCall}
            onClick={() => {
              socket.emit('call-stop', to, from)
            }}
          >
            <HiOutlinePhoneMissedCall enableBackground={"transparent"} color={"red"} />
          </button>
        </div>
      </div>
    </div>
  )
}
