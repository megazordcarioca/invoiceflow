import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

export async function sendPushNotification(pushToken: string, title: string, body: string) {
  if (!Expo.isExpoPushToken(pushToken)) {
    throw new Error(`Invalid Expo push token: ${pushToken}`);
  }

  const message: ExpoPushMessage = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data: { withSome: 'data' },
  };

  const chunks = expo.chunkPushNotifications([message]);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error(error);
    }
  }

  return tickets;
}
