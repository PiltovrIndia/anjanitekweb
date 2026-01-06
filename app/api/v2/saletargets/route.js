import pool from '../../db'
import { Keyverify } from '../../secretverify';

/**
 * Expected payload from Excel parser:
 *
 * {
 *   monthDate: "2025-10-01",
 *   sheetNames: ["ATL", "VCL", "COLLECTION"],
 *   rows: [
 *     {
 *       categoryCode: "ATL",
 *       excelId: "A0021",    // maps directly to users.id
 *       monthly: {
 *         targetAmount: 10000,
 *         stretchTargetAmount: 10000,
 *         closingActualAmount: 11000,
 *         closingBalanceAmount: 7938
 *       },
 *       daily: [
 *         { date: "2025-10-01", amount: 0 },
 *         { date: "2025-10-02", amount: 1000 },
 *         ...
 *       ]
 *     },
 *     ...
 *   ]
 * }
 */

export async function POST(req) {
  
  
      const payload = await req.json() || {};
      // get monthDate and rows from payload
      const { monthDate, rows } = payload;
      if (!monthDate || !Array.isArray(rows)) {
        return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
      }

      let conn;

      try {
        conn = await pool.getConnection();
        await conn.beginTransaction();

        // 1) Load target_category map once: { ATL: 1, VCL: 2, COLLECTION: 3 }
        const categoryMap = await loadCategoryMap(conn);

        let processed = 0;

        for (const row of rows) {
          const categoryCode = String(row.categoryCode || '').toUpperCase();
          const categoryId = categoryMap[categoryCode];

          if (!categoryId) {
            console.warn('Unknown categoryCode in payload:', categoryCode);
            continue; // or throw if you want hard failure
          }

          const userId = (row.excelId || '').trim();
          if (!userId) {
            console.warn('Missing excelId/userId in row:', row);
            continue;
          }

          const monthly = row.monthly || {};
          const daily = Array.isArray(row.daily) ? row.daily : [];

          // 2a) Upsert monthly target
          await upsertMonthlyTarget(conn, {
            userId,
            categoryId,
            monthDate,
            targetAmount: monthly.targetAmount ?? 0,
            stretchTargetAmount: monthly.stretchTargetAmount ?? null,
            closingActualAmount: monthly.closingActualAmount ?? null,
            closingBalanceAmount: monthly.closingBalanceAmount ?? null,
          });

          // 2b) Upsert all daily rows
          if (daily.length > 0) {
            await upsertDailyActuals(conn, { userId, categoryId, daily });
          }

          processed++;
        }

        await conn.commit();

        return new Response(JSON.stringify({
          ok: true,
          monthDate,
          processedRows: processed,
        }), { status: 200 });
      } catch (err) {
        if (conn) {
          try {
            await conn.rollback();
          } catch (_) {
            // ignore rollback errors
          }
        }
        console.error('Error in /api/saletargets:', err);
        return new Response(JSON.stringify({
          error: 'Failed to import sale targets',
          details: err.message || String(err),
        }), { status: 500 });
      } finally {
        if (conn) conn.release();
      }
}

/**
 * Load target_category into { [code]: id }
 */
async function loadCategoryMap(conn) {
  const [rows] = await conn.query(
    'SELECT id, code FROM target_category'
  );

  const map = {};
  for (const r of rows) {
    map[String(r.code).toUpperCase()] = r.id;
  }
  return map;
}

/**
 * Upsert into sales_monthly_target via unique key:
 * (userId(64), categoryId, monthDate)
 */
async function upsertMonthlyTarget(conn, params) {
  const {
    userId,
    categoryId,
    monthDate,
    targetAmount,
    stretchTargetAmount,
    closingActualAmount,
    closingBalanceAmount,
  } = params;

  const sql = `
    INSERT INTO sales_monthly_target
      (userId, categoryId, monthDate,
       targetAmount, stretchTargetAmount,
       closingActualAmount, closingBalanceAmount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      targetAmount = VALUES(targetAmount),
      stretchTargetAmount = VALUES(stretchTargetAmount),
      closingActualAmount = VALUES(closingActualAmount),
      closingBalanceAmount = VALUES(closingBalanceAmount),
      updatedAt = CURRENT_TIMESTAMP
  `;

  const values = [
    userId,
    categoryId,
    monthDate,
    targetAmount,
    stretchTargetAmount,
    closingActualAmount,
    closingBalanceAmount,
  ];

  await conn.query(sql, values);
}

/**
 * Bulk upsert into sales_daily_actual using unique key:
 * (userId(64), categoryId, saleDate)
 *
 * daily = [{ date: '2025-10-01', amount: 1234 }, ...]
 */
async function upsertDailyActuals(conn, params) {
  const { userId, categoryId, daily } = params;

  const rows = daily
    .filter((d) => d && d.date)
    .map((d) => [
      userId,
      categoryId,
      d.date, // 'YYYY-MM-DD'
      Number(d.amount || 0),
      'IMPORT_EXCEL',
      null, // notes
    ]);

  if (rows.length === 0) return;

  const sql = `
    INSERT INTO sales_daily_actual
      (userId, categoryId, saleDate, amount, source, notes)
    VALUES ?
    ON DUPLICATE KEY UPDATE
      amount = VALUES(amount),
      source = VALUES(source),
      updatedAt = CURRENT_TIMESTAMP
  `;

  await conn.query(sql, [rows]);
}
