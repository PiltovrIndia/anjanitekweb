import { timingSafeEqual } from 'node:crypto';
import { send_notification } from '../../send_notification';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  const secret = process.env.FCM_TEST_SECRET;
  if (!secret) {
    return Response.json({ error: 'Test endpoint is not configured' }, { status: 503 });
  }
  const supplied = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  const actualBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length ||
      !timingSafeEqual(actualBytes, expectedBytes)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body;
  try {
    body = await request.json();
  } catch (_) {
    return Response.json({ error: 'Expected a JSON request' }, { status: 400 });
  }
  if (typeof body?.userId !== 'string' || !body.userId.trim() ||
      body.userId.trim().length > 128) {
    return Response.json({ error: 'A userId is required' }, { status: 400 });
  }
  const result = await send_notification('This is a test notification from AnjaniTek.', body.userId.trim());
  if (result === null) {
    return Response.json({ error: 'Notification send failed; check backend logs' }, { status: 502 });
  }
  return Response.json({
    message: result.sent > 0 ? 'Accepted by FCM' : 'No devices accepted the notification',
    sent: result.sent,
    failed: result.failed,
  }, { headers: { 'Cache-Control': 'no-store' } });
}
