import { supabase } from './supabase'

export async function sendNotification({ userId, title, body, type = 'info', data = {} }) {
  // Save to DB
  await supabase.from('notifications').insert({
    user_id: userId,
    title,
    body,
    type,
    read: false,
  })

  // Get FCM token
  const { data: user } = await supabase
    .from('users')
    .select('fcm_token')
    .eq('id', userId)
    .single()

  if (!user?.fcm_token) return

  // Call Supabase Edge Function to send FCM
  await supabase.functions.invoke('send-notification', {
    body: { token: user.fcm_token, title, body, data }
  })
}

export async function sendNotificationToAll({ title, body, type = 'info' }) {
  const { data: users } = await supabase.from('users').select('id, fcm_token')
  if (users && users.length > 0) {
    const payloads = users.map(user => ({
      user_id: user.id,
      title,
      body,
      type,
      read: false
    }))
    await supabase.from('notifications').insert(payloads)
  }
  // Batch FCM via edge function
  const tokens = (users || []).map(u => u.fcm_token).filter(Boolean)
  if (tokens.length) {
    await supabase.functions.invoke('send-notification-batch', {
      body: { tokens, title, body }
    })
  }
}
