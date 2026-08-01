import pool from '../../../db'
import { Keyverify } from '../../../secretverify';

// Role settings for the mobile app.
//
// GET /api/v2/roles/<pass>/U0                  -> every role with its stock flag
// GET /api/v2/roles/<pass>/U1/<role>           -> stock flag for one role
// GET /api/v2/roles/<pass>/U2/<userId>         -> stock flag for a user's role
//
// `stock` is returned as a number (1 or 0) plus a boolean for convenience.
export async function GET(request, { params }) {

    const connection = await pool.getConnection();

    try {

        // authorize secret key
        if (await Keyverify(params.ids[0])) {

            // list every role and its stock flag
            if (params.ids[1] == 'U0') {

                const [rows] = await connection.execute(
                    'SELECT role, stock FROM role_settings ORDER BY role ASC'
                );

                const data = rows.map((row) => ({
                    role: row.role,
                    stock: Number(row.stock || 0),
                    stockEnabled: Number(row.stock || 0) === 1,
                }));

                if (data.length > 0) {
                    return Response.json({ status: 200, data, message: 'Data found!' }, { status: 200 })
                }
                else {
                    return Response.json({ status: 201, data: [], message: 'No roles configured!' }, { status: 200 })
                }
            }

            // stock flag for a single role
            else if (params.ids[1] == 'U1') {

                const role = params.ids[2] ? decodeURIComponent(params.ids[2]).trim() : '';

                if (!role) {
                    return Response.json({ status: 400, message: 'role is required' }, { status: 200 })
                }

                // the column collation is case-insensitive, so 'dealer' matches 'Dealer'
                const [rows] = await connection.execute(
                    'SELECT role, stock FROM role_settings WHERE role = ? LIMIT 1',
                    [role]
                );

                // an unconfigured role gets no stock access — the flag has to be
                // switched on deliberately rather than defaulting open
                if (rows.length === 0) {
                    return Response.json({
                        status: 201,
                        data: { role, stock: 0, stockEnabled: false, configured: false },
                        message: 'Role not configured!'
                    }, { status: 200 })
                }

                const stock = Number(rows[0].stock || 0);

                return Response.json({
                    status: 200,
                    data: { role: rows[0].role, stock, stockEnabled: stock === 1, configured: true },
                    message: 'Data found!'
                }, { status: 200 })
            }

            // stock flag for a user, resolved through their role
            else if (params.ids[1] == 'U2') {

                const userId = params.ids[2] ? decodeURIComponent(params.ids[2]).trim() : '';

                if (!userId) {
                    return Response.json({ status: 400, message: 'userId is required' }, { status: 200 })
                }

                const [rows] = await connection.execute(
                    `
                    SELECT u.id, u.role, COALESCE(r.stock, 0) AS stock, r.role IS NOT NULL AS configured
                    FROM user u
                    LEFT JOIN role_settings r ON r.role = u.role
                    WHERE u.id = ?
                    LIMIT 1
                    `,
                    [userId]
                );

                if (rows.length === 0) {
                    return Response.json({ status: 404, message: 'User not found!' }, { status: 200 })
                }

                const stock = Number(rows[0].stock || 0);

                return Response.json({
                    status: 200,
                    data: {
                        userId: rows[0].id,
                        role: rows[0].role,
                        stock,
                        stockEnabled: stock === 1,
                        configured: Number(rows[0].configured || 0) === 1,
                    },
                    message: 'Data found!'
                }, { status: 200 })
            }

            else {
                return Response.json({ status: 404, message: 'Not found!' }, { status: 200 })
            }
        }
        else {
            // wrong secret key
            return Response.json({ status: 401, message: 'Unauthorized' }, { status: 200 })
        }
    }
    catch (err) {
        // some error occured
        return Response.json({ status: 500, message: 'Facing issues. Please try again! ' + err.message }, { status: 200 })
    }
    finally {
        connection.release();
    }
}
