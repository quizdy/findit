import fs from 'fs'
import path from 'path'
import { createCommonJS } from 'mlly'

const { __dirname } = createCommonJS(import.meta.url)
const VENUES_PATH = '../../data/venues'

export default defineEventHandler(async (e) => {
  const body = await readBody(e)

  const venuesDirPath = path.join(__dirname, VENUES_PATH)
  if (!fs.existsSync(venuesDirPath)) fs.mkdirSync(venuesDirPath, {recursive: true})

  const venueJsonPath = path.join(venuesDirPath, body.venueName + '.json')

  if (!fs.existsSync(venueJsonPath)) {
    return {
      msg: 'not found venue json'
    }
  }

  const venueJson = JSON.parse(fs.readFileSync(venueJsonPath, 'utf-8'))
  let pos = venueJson.targets.findIndex((t: any) => t.no === body.target.no)

  if (pos < 0) {
    const t = {
      no: venueJson.targets.length === 0 ? 1 : venueJson.targets[venueJson.targets.length - 1].no + 1,
      title: body.target.title,
      lat: body.target.lat,
      lng: body.target.lng,
      gap: body.target.gap,
      type: body.target.type,
      icon: body.target.icon,
      image: body.target.image,
      comments: body.target.comments,
      targetStatus: 0,
    }
    venueJson.targets.push(t)
  }
  else {
    venueJson.targets[pos].title = body.target.title
    venueJson.targets[pos].lat = body.target.lat
    venueJson.targets[pos].lng = body.target.lng
    venueJson.targets[pos].gap = body.target.gap
    venueJson.targets[pos].type = body.target.type
    venueJson.targets[pos].icon = body.target.icon
    venueJson.targets[pos].image = body.target.image
    venueJson.targets[pos].comments = body.target.comments
    venueJson.targets[pos].targetStatus = 0
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
