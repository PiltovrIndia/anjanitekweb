import pool from '../../../db'
import { Keyverify } from '../../../secretverify';

export async function GET(request,{params}) {

console.log(params);

  try {
    // authorize secret key
    if(await Keyverify(params.ids[0])){

      // get the list of product related tags
      if(params.ids[1] == 'U0'){
    
          // month query param: "2025-10" (YYYY-MM). Default = current month.
          const monthParam = params.ids[2];
          const monthStartParam = params.ids[3];
          const monthEndParam = params.ids[4];

          let userIds = []; // for multiple user ids

          if(params.ids[5] != 'All'){
            userIds = params.ids[5].split(',').map((id) => id.trim()).filter(Boolean);
          }

          const month = `${monthParam}-01`; // e.g. "2025-11"
          const monthStart = monthStartParam || month; // e.g. "2025-11-01"
          const monthEnd = monthEndParam || `${monthEndParam}-31`; // e.g. "2025-11-01"

          const conn = await pool.getConnection();
          try {
            let sql = `
              SELECT
                u.id   AS userId,
                u.name AS userName,
                u.mobile,
                c.id   AS categoryId,
                c.code AS categoryCode,
                c.name AS categoryName,
                t.targetAmount,
                COALESCE(da.totalActual, 0) AS achievedAmount
              FROM user u
              JOIN sales_monthly_target t
                ON t.userId    = u.id
              AND t.monthDate = ?
              JOIN target_category c
                ON c.id = t.categoryId
              LEFT JOIN (
                SELECT
                  userId,
                  categoryId,
                  SUM(amount) AS totalActual
                FROM sales_daily_actual
                WHERE saleDate BETWEEN ? AND ?
                GROUP BY userId, categoryId
              ) da
                ON da.userId     = t.userId
              AND da.categoryId = t.categoryId
              WHERE u.isActive = 1
            `;

            const params = [month, monthStart, monthEnd];

            // If userIds filter present, add IN (...) condition
            if (userIds.length > 0) {
              const placeholders = userIds.map(() => '?').join(',');
              sql += ` AND u.id IN (${placeholders})`;
              params.push(...userIds);
            }

            sql += ' ORDER BY u.name, c.code';

            const [rows] = await conn.query(sql, params);
            const result = groupByUser(rows);

            return Response.json({status: 200, data: {
              monthDate: month,
              monthStartDate: monthStart,
              monthEndDate: monthEnd,
              filteredUserIds: userIds,
              users: result,
            }, message:'Data fetched!'}, {status: 200});

            // return new Response(JSON.stringify({
            //   monthDate: month,
            //   monthStartDate: monthStart,
            //   monthEndDate: monthEnd,
            //   filteredUserIds: userIds,
            //   users: result,
            // }), {
            //   status: 200,
            //   headers: {
            //     'Content-Type': 'application/json'
            //   }
            // });
          } finally {
            conn.release();
          }
          }
    }
  } catch (err) {
    console.error('Error in /api/salespersons-targets:', err);
    return new Response(JSON.stringify({
      error: 'Failed to load salesperson targets',
      details: err.message || String(err),
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

/**
 * Group flat SQL rows into:
 * [
 *   {
 *     userId,
 *     userName,
 *     mobile,
 *     totalTarget,            // excludes COLLECTION
 *     totalAchieved,          // excludes COLLECTION
 *     collectionAchieved,     // COLLECTION achieved only
 *     collectionTarget,       // COLLECTION target only
 *     categories: [
 *       { categoryId, categoryCode, categoryName, targetAmount, achievedAmount }
 *     ]
 *   },
 *   ...
 * ]
 */
function groupByUser(rows) {
  const byUser = new Map();

  for (const r of rows) {
    if (!byUser.has(r.userId)) {
      byUser.set(r.userId, {
        userId: r.userId,
        userName: r.userName,
        mobile: r.mobile,
        totalTarget: 0,
        totalAchieved: 0,
        collectionTarget: 0,
        collectionAchieved: 0,
        categories: [],
      });
    }

    const user = byUser.get(r.userId);
    const categoryCode = String(r.categoryCode || '').toUpperCase();
    const target = Number(r.targetAmount || 0);
    const achieved = Number(r.achievedAmount || 0);

    user.categories.push({
      categoryId: r.categoryId,
      categoryCode,
      categoryName: r.categoryName,
      targetAmount: target,
      achievedAmount: achieved,
    });

    if (categoryCode === 'COLLECTION') {
      user.collectionTarget += target;
      user.collectionAchieved += achieved;
    } else {
      // Don't count COLLECTION in sales totals
      user.totalTarget += target;
      user.totalAchieved += achieved;
    }
  }

  return Array.from(byUser.values());
}

