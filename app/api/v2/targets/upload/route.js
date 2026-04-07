import pool from '../../../db'

// Here is where we receive JSON data and store it in the targets table
export async function POST(request) {
    let conn;

    try {
        const body = await request.json();
        const { targets } = body;
        const records = Array.isArray(targets) ? targets : targets.records || targets.data || [];

        console.log('Parsed body:', body);
        console.log('Is array:', Array.isArray(records), 'Length:', records.length);

            // console.log('Received records:', records);

        if (!Array.isArray(records) || records.length === 0) {
            return new Response(JSON.stringify({ error: 'No records provided' }), { status: 400 });
        }

        conn = await pool.getConnection();

        const insertedRecords = [];
        for (const [index, record] of records.entries()) {
            if (!record?.userId || record?.categoryId == null || !record?.monthDate) {
                return new Response(JSON.stringify({
                    error: `Record ${index + 1} is missing required fields`,
                }), { status: 400 });
            }

            const parsedCategoryId = parseInt(record.categoryId, 10);
            const monthDateValue = new Date(record.monthDate);
            const targetAmount = parseFloat(record.targetAmount);
            const targetOpening = parseFloat(record.actualAmount);
            const actualAmount = parseFloat(record.actualAmount);

            if (!Number.isInteger(parsedCategoryId)) {
                return new Response(JSON.stringify({
                    error: `Record ${index + 1} has an invalid categoryId`,
                }), { status: 400 });
            }

            if (Number.isNaN(monthDateValue.getTime())) {
                return new Response(JSON.stringify({
                    error: `Record ${index + 1} has an invalid monthDate`,
                }), { status: 400 });
            }

            if (Number.isNaN(targetAmount) || Number.isNaN(targetOpening) || Number.isNaN(actualAmount)) {
                return new Response(JSON.stringify({
                    error: `Record ${index + 1} has invalid numeric values`,
                }), { status: 400 });
            }

            const monthDate = monthDateValue.toISOString().slice(0, 10);

            try {
                await conn.query(
                    `INSERT INTO targets (userId, categoryId, monthDate, targetAmount, targetOpening, actualAmount, remarks)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        targetAmount = VALUES(targetAmount),
                        targetOpening = VALUES(targetOpening),
                        actualAmount = 0,
                        remarks = VALUES(remarks)`,
                    [
                        record.userId,
                        parsedCategoryId,
                        monthDate,
                        targetAmount,
                        targetOpening,
                        actualAmount,
                        record.remarks || null,
                    ],
                );
            } catch (rowError) {
                console.error('Error processing target row:', {
                    index: index + 1,
                    userId: record.userId,
                    categoryId: parsedCategoryId,
                    monthDate,
                    code: rowError.code,
                    sqlMessage: rowError.sqlMessage,
                });

                return new Response(JSON.stringify({
                    error: `Failed to process record ${index + 1}`,
                    details: rowError.sqlMessage || rowError.message,
                    processedCount: insertedRecords.length,
                }), { status: 500 });
            }

            insertedRecords.push({
                userId: record.userId,
                categoryId: parsedCategoryId,
                monthDate,
            });
        }

        console.log(`Inserted ${insertedRecords.length} records into the targets table.`);
        return new Response(JSON.stringify({
          message: 'Data processed successfully',
            count: insertedRecords.length,
            records: insertedRecords,
        }), { status: 200 });

    } catch (error) {
        console.error('Error processing data:', error);

        return new Response(JSON.stringify(
            {
                error: 'Failed to process data',
                details: error.sqlMessage || error.message,
            }
        ), { status: 500 });
    } finally {
        if (conn) {
            conn.release();
        }
    }
}
