import fs from 'fs'
import path from 'path'
import { createCommonJS } from 'mlly'

const { __dirname } = createCommonJS(import.meta.url)
const USERS_PATH = '../../data/users'

export default defineEventHandler(async (e) => {
  const body = await readBody(e)

  const usersDirPath = path.join(__dirname, USERS_PATH)
  if (!fs.existsSync(usersDirPath)) {
    return {
      msg: 'not found users dir'
    }
  }

  const userJsonPath = path.join(usersDirPath, body.userId + '.json')

  if (!fs.existsSync(userJsonPath)) {
    return {
      msg: 'not found user json'
    }
  }

  fs.unlinkSync(userJsonPath)

  return {
    msg: ''
  }
})
