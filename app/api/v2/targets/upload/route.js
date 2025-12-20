import pool from '../../../db'

// Here is where we receive JSON data and store it in the targets table
export async function POST(request) {
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

        let conn = await pool.getConnection();

        console.log('SUCCESSSS');
        conn.beginTransaction();

        // Insert records into targets table
        const insertedRecords = [];
        for (const record of records) {
            const result = await conn.query(
            `INSERT INTO targets (userId, categoryId, monthDate, targetAmount, actualAmount, remarks) 
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE 
                targetAmount = VALUES(targetAmount),
                actualAmount = VALUES(actualAmount),
                remarks = VALUES(remarks)`,
            [
                record.userId,
                parseInt(record.categoryId),
                new Date(record.monthDate),
                parseFloat(record.targetAmount),
                parseFloat(record.actualAmount),
                record.remarks || null,
            ],
            );
            insertedRecords.push(result);
        }
        conn.commit();

        console.log(`Inserted ${insertedRecords.length} records into the targets table.`);
        conn.release();
        return new Response(JSON.stringify({
          message: 'Data processed successfully',
            count: insertedRecords.length,
            records: insertedRecords,
        }), { status: 200 });

    } catch (error) {
        console.error('Error processing data:', error);
        return new Response(JSON.stringify(
            { error: 'Failed to process data' }
        ), { status: 500 });
    }
}
