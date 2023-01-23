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

  const venueJson = JSON.parse(fs.readFileSync(venueJsonPath, 'utf-8'))
  let pos = venueJson.targets.findIndex((t: any) => t.no === body.targetNo)

  if (pos < 0) {
    return {
      msg: 'not found target'
    }
  }
  else {
    venueJson.targets.splice(pos, 1)
  }

  try {
    fs.writeFileSync(venueJsonPath, JSON.stringify(venueJson, null, 2))
  } catch (e) {
    return {
      msg: JSON.stringify(e)
    }
  }

  return {
    msg: ''
  }
})
