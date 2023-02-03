import fs from 'fs'
import path from 'path'
import { createCommonJS } from 'mlly'

const { __dirname } = createCommonJS(import.meta.url)
const USERS_PATH = '../../data/users'

export default defineEventHandler(async (e) => {
  const query = getQuery(e)
  const venueName = query.venueName as string

  const usersDirPath = path.join(__dirname, USERS_PATH)

  if (!fs.existsSync(usersDirPath)) {
    return {
      users: []
    }
  }

  const files = fs.readdirSync(usersDirPath)

  let users = [];

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

  if (venueName) {
    users = users.filter((_user: any) =>
    _user.venue.venueName === venueName
    );
  }

  return {
    users: users
  }
})