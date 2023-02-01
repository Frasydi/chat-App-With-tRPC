import jwt from 'jsonwebtoken'
import { getUserfromuid } from '../controller/user'

export async function validation(token: string) {

  try {
    const val: any = jwt.verify(token, process?.env?.SECRET_TOKEN as string)
    if (!val) {
      return {
        status: false,
        msg: 'Unauthorized',
      }
    }
    const user = await getUserfromuid(val.uid)

    return user
  } catch (err) {
    console.log(err)
    return {
      status: false,
      msg: 'Server error',
    }
  }
}

export function createToken(data: any) {
  const token = jwt.sign(data, process.env.SECRET_TOKEN as string, {
    expiresIn : "30m"
  })
  return token
}
