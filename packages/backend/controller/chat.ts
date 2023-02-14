import prisma from '.'
import autoIncrementFileNames from '../utils/duplicateFileNames'
import * as fs from "fs"
export async function getChat({uuid, uuid2} :{uuid : string, uuid2 : string}) {
  try {
    const result = await prisma.chat.findMany({
      where: {
        from: {
          in : [uuid, uuid2]
        },
        to: {
          in : [uuid, uuid2]
        },
      },
      orderBy: {
        date: 'asc',
      },
    })
    
    return {
        status : true,
        msg : result
    }
  } catch (err) {
    console.log(err)
    return {
      status: false,
      msg: 'Terdapat masalah pada server',
    }
  }
}

export async function createChat({uuid, uuid2 , text}:{uuid: string, uuid2: string, text : string}) {
    
    try {
        const result = await prisma.chat.create({
            data: {
                to : uuid2,
                from : uuid,
                text,
                date: new Date()
            }
        }
        )
        return {
          status : true,
          msg : "Berhasil mengirim chat"
        }
    }catch(err ) {
        console.log(err)
        return {
            status : false,
            msg : "Server Error"
        }
    }
}

export async function deletePesan(id:number, who : string) {
  try {
    const validate = await prisma.chat.findFirst({where : {
      id : id
    }})
    if(!validate) {
      return {
        status : false,
        msg : "Pesan tidak ditemukan"
      }
    }
    if(validate.from != who) {
      return {
        status : false,
        msg : "Anda bukan pengirim pesan ini"
      }
    }
    const result = await prisma.chat.delete({
      where: {
        id
      }
    })
    if(result.image != null) {
      try {

        fs.unlinkSync("image/"+result.image)
      }catch(err) {
        console.log(err)
      }
    }
    return {
      status : true,
      msg : "Berhasil menghapus pesan"
    }
  }
  catch (err) {
    console.log(err)
    return { 
      status : false,
      msg : "Server Error"
    }
  }
}

export async function kirimGambar(imageName:string, imageBuffer:string, from:string, to : string, text : string) {
  const check = autoIncrementFileNames(imageName, imageBuffer)
  if(!check) {
    return {
      status : false,
      msg : "Tidak dapat mengirim gambar"
    }
  }
  try {
    const result = await prisma.chat.create({
      data : {
        from,
        to, 
        image : check,
        date: new Date(),
        text : text
      }
    })
    return {
      status : true,
      msg : "Berhasil mengirim gambar"
    }
  }catch(err) {
    console.log(err)
    return { 
      status : false,
      msg : "Server Error"
    }
  }
}