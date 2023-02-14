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
  const [stream, setStream] = useState<any>()
  const [calls, setCalls] = useState(true)
  useEffect(() => {
    setCall(calls)
    setCalling(calls)
  }, [calls])

  function stop() {
    console.log(stream)
    stream?.getVideoTracks().forEach((track:any) => { 
      track.stop()
    })
    stream?.getAudioTracks().forEach((track:any) => { 
      track.stop()
    })
  }


  useEffect(() => {
    
    const peers = new Peer()
    console.log(peers)
    const MediaDevices =
    navigator?.mediaDevices ||
    //@ts-ignore
    navigator?.mozGetUserMedia ||
    //@ts-ignore
    navigator?.webkitGetUserMedia ||
    //@ts-ignore
    navigator?.getUserMedia

    MediaDevices.getUserMedia({video : true, audio : true}).then(streams => {
      setStream(streams)
      if(!isCalling) {
        socket.on("calling", id => {
          const call = peers.call(id, streams)
          call.on("stream", stream2 => {
            userVideo.current.srcObject = stream2
          })
        })
      } else {

        peers.on("call", call => {
          call.answer(streams)
          call.on('stream', stream2 => {
            userVideo.current.srcObject = stream2
          })
        })
        peers.on("open", (id) => {
          socket.emit("calling", to, id)
        })
        
      }

      socket.on("call-stop", () => {
        console.log("Hello")
        stop()
        setCalls(false)
      })
      
  
      peers.on("error", () => {
        Swal.fire("Ada masalah", "" ,"error")
        socket.emit("call-stop", to, from)
        
      })


    })
    
    
    return () => {
      
    }
  }, [0])

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
