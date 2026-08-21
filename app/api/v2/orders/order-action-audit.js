export async function resolveOrderActionActor(connection, actorId) {
    if (!actorId) return null;

    const [rows] = await connection.query(
        'SELECT id, name FROM user WHERE id = ? AND isActive = 1 LIMIT 1',
        [actorId]
    );

    return rows[0] || null;
}

export async function recordOrderAction(connection, {
    orderId,
    cartId,
    actor,
    actionType,
    actionOn,
    actionNotes,
}) {
    if (!actor?.id || !orderId || !actionType || !actionOn) {
        throw new Error('A valid actor, order, action type, and timestamp are required for order auditing');
    }

    await connection.query(
        `UPDATE orders
         SET lastActionById = ?, lastActionByName = ?, lastActionType = ?, lastActionOn = ?
         WHERE id = ?`,
        [actor.id, actor.name, actionType, actionOn, orderId]
    );

    await connection.query(
        `INSERT INTO order_action_history
         (orderId, cartId, actionType, actorId, actorName, actionNotes, actionOn)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, cartId || null, actionType, actor.id, actor.name, actionNotes || null, actionOn]
    );
}
