import prisma from "."
import bcrypt from "bcrypt"
import * as uuid from "uuid"
import {createToken} from "../utils/jwt"

export async function getUserfromuid(uuid:string) {
    try{
        if(uuid == null) {
            return {
                status : false,
                msg : "UUID Kosong"
            }
        }
        const result = await prisma.user_Kelompok4.findFirst(
            {where : {
                uuid : uuid
            },
            select : {
                uuid : true,
                username : true,
            }
        }
        )
        if(result == null) {
            return {
                status :false,
                msg : "Tidak menemukan user"
            }
        }
        return {
            status : true,
            msg : result
        }
    }catch(err) {
        console.log(err)
        return {
            status : false, 
            msg : "Ada masalah pada server"
        }
    }
}

export async function createUsername({username, password} : {username:string, password:string}) {
    try {
        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(password, salt)
        const uid = uuid.v4()
        const result = await prisma.user_Kelompok4.create({
            data : {
                uuid : uid,
                username : username,
                password : hash
            }
        })
        return {
            status : true,
            msg : "Berhasil membuat user"
        }
    }catch(err) {
        console.log(err)
        return {
            status : false,
            msg : "Server sedang bermasalah"
        }
    }
}

export async function getAllUser(uuid:string)  {
    try {
        const result = await prisma.user_Kelompok4.findMany({
            select : {
                uuid : true,
                username : true,
            }
            ,
            where : {
                NOT : {
                    uuid : uuid
                }
            },
            
        })
        if(result.length == 0) 
        {
            return {
                status : false,
                msg : "Users Kosong"
            }
        }
        return {
            status : true,
            msg : result
        }
    }catch(err) {
        console.log(err)
        return {
            status : false,
            msg : "Server Error"
        }
    }
}


export async function searchUser(uuid:string, search:string) {
    try {
        const result = await prisma.user_Kelompok4.findMany({
            select : {
                uuid : true,
                username : true,
            }
            ,
            where : {
                NOT : {
                    uuid : uuid
                },
                username : {
                    contains : search
                }
            },
            
        })
        if(result.length == 0) 
        {
            return {
                status : false,
                msg : "Users Kosong"
            }
        }
        return {
            status : true,
            msg : result
        }
    }catch(err) {
        console.log(err)
        return {
            status : false,
            msg : "Server Error"
        }
    }
}

export async function login({username, password} : {username : string, password : string}) {
    try{
        const user = await prisma.user_Kelompok4.findFirst({where : {
            username : username
        }})
        if(user == null) {
            return {
                status : false,
                msg : "Password/User Salah"
            }
        }
        const validate = bcrypt.compare(password, user.password)
        if(!validate) {
            return {
                status : false,
                msg : "Password/User Salah"
            }
        }
        return {
            status : true,
            msg : createToken({
                username : user.username,
                uid : user.uuid
            })
        }
    }catch(err) {
        console.log(err)
        return {
            status : false,
            msg : "Server sedang bermasalah"
        }
    }
}

export async function hapusAkun(uuid:string) {
    try{
        const result = await prisma.user_Kelompok4.delete({
            where : {
                uuid : uuid
            }
        })

        if(result == null) {
            return {
                status : false,
                msg : "Tidak menemukan user"
            }
        }
        await prisma.chat_Kelompok4.deleteMany({where : {
            OR : {
                from : uuid,
                to : uuid
            }
        }})
        return {
            status : true,
            msg : "Berhasil menghapus user"
        }
    }catch(err) {
        console.log(err)
        return {
            status : false,
            msg : "Server sedang bermasalah"
        }
    }
}