import fs from 'fs'
import path from 'path'
import { createCommonJS } from 'mlly'

const { __dirname } = createCommonJS(import.meta.url)
const VENUES_PATH = '../../data/venues'

export default defineEventHandler(async (e) => {
  const body = await readBody(e)

  const venuesDirPath = path.join(__dirname, VENUES_PATH)
  if (!fs.existsSync(venuesDirPath)) fs.mkdirSync(venuesDirPath, {recursive: true})

  const venueJsonPath = path.join(venuesDirPath, body.venue.venueName + '.json')

  const venue = {
    venueName: body.venue.venueName,
    lat: body.venue.lat,
    lng: body.venue.lng,
    comments: body.venue.comments,
    image: body.venue.image,
    pos: 0,
    targets: []
  }

  if (fs.existsSync(venueJsonPath)) {
    venue.targets = JSON.parse(fs.readFileSync(venueJsonPath, 'utf-8')).targets
  }

  try {
    fs.writeFileSync(venueJsonPath, JSON.stringify(venue, null, 2))
  } catch (e) {
    return {
      msg: JSON.stringify(e)
    }
  }

  return {
    msg: ''
  }
})