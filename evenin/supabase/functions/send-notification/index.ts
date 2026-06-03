// supabase/functions/send-notification/index.ts
// Deploy: supabase functions deploy send-notification

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const FCM_URL = 'https://fcm.googleapis.com/v1/projects/ambw-5dd2d/messages:send'

serve(async (req) => {
  const { token, title, body, data = {} } = await req.json()

  const FCM_SERVER_KEY = Deno.env.get('FCM_SERVER_KEY') || ''

  const message = {
    message: {
      token,
      notification: { title, body },
      data: Object.fromEntries(Object.entries(data).map(([k, v]) => [k, String(v)])),
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    }
  }

  const res = await fetch(FCM_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${FCM_SERVER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message),
  })

  const result = await res.json()
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
    status: res.ok ? 200 : 500,
  })
})
