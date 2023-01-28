import fs from 'fs'
import path from 'path'
import { createCommonJS } from 'mlly'

const { __dirname } = createCommonJS(import.meta.url)
const USERS_PATH = '../../data/users'
const VENUES_PATH = '../../data/venues'

export default defineEventHandler(async (e) => {
  const query = getQuery(e)
  const userId = query.userId as string

  const userJsonPath = path.join(__dirname, USERS_PATH, userId + '.json')

  if (!fs.existsSync(userJsonPath)) {
    return {
      userId: '',
      userName: '',
      comments: '',
      venue: {
        venueName: '',
        comments: '',
        pos: 0,
        targets: [],
      },
    }
  }

  const userJson = JSON.parse(fs.readFileSync(userJsonPath, 'utf-8'))

  const venueJsonPath = path.join(__dirname, VENUES_PATH, userJson.venue.venueName + '.json')

  if (!fs.existsSync(venueJsonPath)) {
    userJson.venue = {
        venueName: userJson.venue.venueName,
        comments: "",
        pos: 0,
        targets: [],
      }
    return userJson
  }

  userJson.venue = JSON.parse(fs.readFileSync(venueJsonPath, 'utf-8'))

  return userJson
})