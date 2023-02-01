import fs from 'fs'
import path from 'path'
import { createCommonJS } from 'mlly'

const { __dirname } = createCommonJS(import.meta.url)
const VENUES_PATH = '../../data/venues'

export default defineEventHandler(async (e) => {
  const venuesDirPath = path.join(__dirname, VENUES_PATH)

  if (!fs.existsSync(venuesDirPath)) {
    return {
      venues: []
    }
  }

  const files = fs.readdirSync(venuesDirPath)

  const venues = [];

  for(let i = 0; i < files.length; i++) {
    const venue = JSON.parse(fs.readFileSync(path.join(venuesDirPath, files[i]), 'utf-8'))
    const json = {
      venueName: venue.venueName,
      lat: venue.lat,
      lng: venue.lng,
      comments: venue.comments,
      image: venue.image,
      pos:  venue.pos,
    }
    venues.push(json)
  }

  return {
    venues: venues
  }
})