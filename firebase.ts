import { initializeApp } from 'firebase/app'
import { getMessaging, getToken } from 'firebase/messaging'

const firebaseConfig = {
    apiKey: "[GCP_API_KEY]",
    authDomain: "ambw-5dd2d.firebaseapp.com",
    projectId: "ambw-5dd2d",
    storageBucket: "ambw-5dd2d.firebasestorage.app",
    messagingSenderId: "1038683905284",
    appId: "1:1038683905284:web:65f302edd8de95bee78451"
}

const app = initializeApp(firebaseConfig)
export const messaging = getMessaging(app)

export async function getFCMToken() {
    const token = await getToken(messaging, {
        vapidKey: 'BD78PvxhVxBN8G_p9u6rz5TQ8ZVd_vUU7xBi5OJt3QAeSN7GBxtjEZ9f3lO1eEh3GB3HGFYWifsdb5Ze_CYCP0o' // dari Firebase Console
    })
    console.log('FCM Token:', token)
    return token
}