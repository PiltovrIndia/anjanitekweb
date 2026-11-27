import pool from './db';
import { fcmMessaging } from './fcm_client';

// Recipients are user IDs, never FCM tokens.
export async function send_notification(message, recipients) {
  const userIds = [...new Set((Array.isArray(recipients) ? recipients : [recipients])
    .filter((id) => typeof id === 'string' && id.trim() && id.trim() !== '-')
    .map((id) => id.trim()))];
  if (!userIds.length || !message) return null;
  try {
    const devices = [];
    for (let offset = 0; offset < userIds.length; offset += 500) {
      const ids = userIds.slice(offset, offset + 500);
      const [rows] = await pool.query(
        `SELECT d.token, d.token_hash FROM notification_devices d JOIN user u ON u.id = d.user_id WHERE u.isActive = 1 AND d.user_id IN (${ids.map(() => '?').join(',')})`, ids);
      devices.push(...rows);
    }
    let sent = 0;
    let failed = 0;
    for (let offset = 0; offset < devices.length; offset += 500) {
      const batch = devices.slice(offset, offset + 500);
      const response = await fcmMessaging().sendEachForMulticast({
        tokens: batch.map((device) => device.token),
        notification: { title: 'AnjaniTek', body: String(message).slice(0, 1000) },
        android: { notification: { channelId: 'anjanitek_updates' } },
        apns: { payload: { aps: { sound: 'default' } } },
      });
      sent += response.successCount;
      failed += response.failureCount;
      for (let i = 0; i < response.responses.length; i++) {
        const error = response.responses[i].error;
        if (!error) continue;
        console.error('FCM delivery failed', error.code || 'unknown');
        if (error.code === 'messaging/registration-token-not-registered') {
          await pool.execute('DELETE FROM notification_devices WHERE token_hash = ?', [batch[i].token_hash]);
        }
      }
    }
    console.info('FCM send result', { users: userIds.length, devices: devices.length, sent, failed });
    return { sent, failed };
  } catch (error) {
    console.error('FCM send failed', error.code || error.name);
    return null;
  }
}
