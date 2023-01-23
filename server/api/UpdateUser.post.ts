import fs from 'fs'
import path from 'path'
import { createCommonJS } from 'mlly'

const { __dirname } = createCommonJS(import.meta.url)
const USERS_PATH = '../../data/users'

export default defineEventHandler(async (e) => {
  const body = await readBody(e)

  const usersDirPath = path.join(__dirname, USERS_PATH)
  if (!fs.existsSync(usersDirPath)) fs.mkdirSync(usersDirPath, {recursive: true})

  const userJsonPath = path.join(usersDirPath, body.userId + '.json')

  const user = {
    userId: body.userId,
    userName: body.userName,
    comments: body.comments,
    venue: body.venue,
  }

  try {
    fs.writeFileSync(userJsonPath, JSON.stringify(user, null, 2))
  } catch (e) {
    return {
      msg: JSON.stringify(e)
    }
  }

  return {
    msg: ''
  }
})