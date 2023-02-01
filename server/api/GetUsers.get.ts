import fs from 'fs'
import path from 'path'
import { createCommonJS } from 'mlly'

const { __dirname } = createCommonJS(import.meta.url)
const USERS_PATH = '../../data/users'

export default defineEventHandler(async (e) => {
  const usersDirPath = path.join(__dirname, USERS_PATH)

  if (!fs.existsSync(usersDirPath)) {
    return {
      users: []
    }
  }

  const files = fs.readdirSync(usersDirPath)

  const users = [];

  for(let i = 0; i < files.length; i++) {
    const user = JSON.parse(fs.readFileSync(path.join(usersDirPath, files[i]), 'utf-8'))
    const json = {
      userId: user.userId,
      userName: user.userName,
      image: user.image,
      comments: user.comments,
      venue: user.venue,
    }
    users.push(json)
  }

  return {
    users: users
  }
})