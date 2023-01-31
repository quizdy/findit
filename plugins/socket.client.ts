import io from 'socket.io-client'

export default defineNuxtPlugin(() => {
    const $config = useRuntimeConfig();
    // const socket = io($config.SOCKET_IO, {
    //     transports: ['websocket', 'flashsocket']
    // })
    const socket = null
    return {
        provide: {
            socket: socket
        }
    }
})