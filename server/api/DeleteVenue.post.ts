import fs from 'fs'
import path from 'path'
import { createCommonJS } from 'mlly'

const { __dirname } = createCommonJS(import.meta.url)
const VENUES_PATH = '../../data/venues'

export default defineEventHandler(async (e) => {
  const body = await readBody(e)

  const venuesDirPath = path.join(__dirname, VENUES_PATH)
  if (!fs.existsSync(venuesDirPath)) {
    return {
      msg: 'not found venues dir'
    }
  }

  const venueJsonPath = path.join(venuesDirPath, body.venueName + '.json')

  if (!fs.existsSync(venueJsonPath)) {
    return {
      msg: 'not found venue json'
    }
  }

  fs.unlinkSync(venueJsonPath)

  return {
    msg: ''
  }
})
