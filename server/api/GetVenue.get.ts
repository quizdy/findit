import fs from 'fs'
import path from 'path'
import { createCommonJS } from 'mlly'

const { __dirname } = createCommonJS(import.meta.url)
const VENUES_PATH = '../../data/venues'

export default defineEventHandler(async (e) => {
  const query = getQuery(e)
  const venueName = query.venueName as string

  const venueJsonPath = path.join(__dirname, VENUES_PATH, venueName + '.json')

  if (!fs.existsSync(venueJsonPath)) {
    return {
      venue: {
        venueName: "",
        comments: "",
        pos: 0,
        targets: [],
      }
    }
  }

  const venueJson = JSON.parse(fs.readFileSync(venueJsonPath, 'utf-8'))
  return {
    venue: venueJson
  }
})