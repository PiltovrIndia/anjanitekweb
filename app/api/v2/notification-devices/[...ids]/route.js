import { createHash } from 'node:crypto';
import pool from '../../../db';
import { Keyverify } from '../../../secretverify';

export async function POST(request, { params }) {
  if (!await Keyverify(params.ids[0])) return Response.json({ status: 403 }, { status: 403 });
  try {
    const { userId, installationId, platform, token } = await request.json();
    if (typeof userId !== 'string' || !userId.trim() || userId.length > 128 ||
        typeof installationId !== 'string' || !installationId.trim() || installationId.length > 128 ||
        !['android', 'ios'].includes(platform) ||
        typeof token !== 'string' || !token.trim() || token.length > 4096) {
      return Response.json({ status: 400, message: 'Invalid device registration' }, { status: 400 });
    }
    const [users] = await pool.execute('SELECT id FROM user WHERE id = ? AND isActive = 1 LIMIT 1', [userId]);
    if (!users.length) return Response.json({ status: 404 }, { status: 404 });
    const tokenHash = createHash('sha256').update(token).digest('hex');
    await pool.execute(
      `INSERT INTO notification_devices (installation_id, user_id, platform, token, token_hash, last_seen_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE installation_id = VALUES(installation_id), user_id = VALUES(user_id),
       platform = VALUES(platform), token = VALUES(token), token_hash = VALUES(token_hash), last_seen_at = NOW()`,
      [installationId, userId, platform, token, tokenHash]
    );
    return Response.json({ status: 200 });
  } catch (error) {
    console.error('Device registration failed', error.code || error.name);
    return Response.json({ status: 500 }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  if (!await Keyverify(params.ids[0])) return Response.json({ status: 403 }, { status: 403 });
  try {
    const { userId, installationId } = await request.json();
    if (typeof userId !== 'string' || !userId.trim() || typeof installationId !== 'string' || !installationId.trim()) {
      return Response.json({ status: 400 }, { status: 400 });
    }
    await pool.execute('DELETE FROM notification_devices WHERE user_id = ? AND installation_id = ?', [userId, installationId]);
    return Response.json({ status: 200 });
  } catch (error) {
    console.error('Device unregistration failed', error.code || error.name);
    return Response.json({ status: 500 }, { status: 500 });
  }
}
