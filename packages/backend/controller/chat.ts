import prisma from '.'
export async function getChat({uuid, uuid2} :{uuid : string, uuid2 : string}) {
  try {
    const result = await prisma.chat.findMany({
      where: {
        uuid: {
          in : [uuid, uuid2]
        },
        uuid2: {
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

export async function createChat({uuid, uuid2, from , text}:{uuid: string, uuid2: string, from : string, text : string}) {
    if(![uuid, uuid2].includes(from)) {
        return {
            status : false,
            msg : "Tidak dapat menentukan siapa pengirimnya"
        }
    }
    try {
        const result = await prisma.chat.create({
            data: {
                uuid,
                uuid2,
                from,
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