export default defineEventHandler(async (e) => {
  const body = await readBody(e)
  const message = {
    venueName: body.venueName,
    users: body.users,
    msg: body.msg
  }

  let messages = await useStorage().getItem('messages')

  if (!messages) messages = []

  if (!messages.some((_message: any) => _message.venueName === _message.venueName)) {
    messages = [...messages, message];
  } else {
    messages = messages.map((_message: any) =>
    _message.venueName === _message.venueName ? message : _message
    );
  }

  useStorage().setItem('messages', messages)

  return {
    msg: ''
  }
})