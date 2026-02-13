const OneSignal = require('onesignal-node')

const client = new OneSignal.Client(process.env.ONE_SIGNAL_APPID, process.env.ONE_SIGNAL_APIKEY)

// send the notification using onesignal.
// use the playerIds of the users.
// check if playerId length > 2
export async function send_notification(message, playerId, type) {
  return new Promise(async (resolve, reject) => {
    // send notification only if there is playerId for the user
    if (playerId.length > 0) {
      var notification;
      // notification object
      if (type == 'Single') {
        notification = {
          contents: {
            'en': message,
          },
          include_external_user_ids: [playerId],
        };
      } else {
        notification = {
          contents: {
            'en': message,
          },
          include_external_user_ids: playerId,
        };
      }

      try {
        // create notification
        const notificationResult = await client.createNotification(notification);
        resolve(notificationResult);
      } catch (error) {
        resolve(null);
      }
    } else {
      resolve(null);
    }
  });
}
