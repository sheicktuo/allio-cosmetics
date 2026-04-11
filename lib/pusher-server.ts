import Pusher from "pusher"

let _client: Pusher | null = null

export function getPusherServer(): Pusher | null {
  if (!process.env.PUSHER_APP_ID) return null
  if (!_client) {
    _client = new Pusher({
      appId:   process.env.PUSHER_APP_ID,
      key:     process.env.NEXT_PUBLIC_PUSHER_KEY!,
      secret:  process.env.PUSHER_SECRET!,
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      useTLS:  true,
    })
  }
  return _client
}
