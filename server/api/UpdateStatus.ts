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

  if (!fs.existsSync(userJsonPath)) {
    return {
      msg: 'not found user json'
    }
  }

  const userJson = JSON.parse(fs.readFileSync(userJsonPath, 'utf-8'))

  const user = {
    userId: userJson.userId,
    userName: userJson.userName,
    image: userJson.image,
    comments: userJson.comments,
    venue: userJson.venue,
  }

  const targets = user.venue.targets.filter((_target: any) => _target.no === body.no)

  if (targets.length === 1) {
    targets[0].targetStatus = body.targetStatus
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