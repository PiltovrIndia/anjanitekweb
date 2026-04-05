import { NextResponse } from 'next/server';
import db from '../../../db'
import { Keyverify } from '@/app/api/secretverify';

export async function GET(request, { params }) {
    try {
        const { ids } = await params;
        
        if (!ids || ids.length < 2) {
            return NextResponse.json(
                { error: 'Month and at least one userId are required' },
                { status: 400 }
            );
        }

        if(await Keyverify(params.ids[0])){

            const month = params.ids[1];
            const userIds = params.ids[2].split(',');
            
            // Build conditions string for SQL IN clause
            var conditionsString = `(${userIds.map((userId) => `'${userId}'`).join(', ')})`;


            const [rows, fields] = [];
            // Recursively get userIds until we reach Dealer role
            let currentIds = userIds;
            const allUserIds = new Set(userIds);
            
            // Loop until there are no more userIds to process
            while (currentIds.length > 0) {
                const conditionStr = `(${currentIds.map((id) => `'${id}'`).join(', ')})`;
                const [rows] = await db.query(`SELECT id, role FROM user WHERE mapTo IN ${conditionStr}`);
                
                if (rows.length === 0) break;
                
                const nextIds = [];
                rows.forEach((row) => {
                    allUserIds.add(row.id);
                    if (row.role !== 'Dealer') {
                        nextIds.push(row.id);
                    }
                });
                
                currentIds = nextIds;
            }
            
            // Build conditions string for SQL IN clause with all userIds
            var conditionsString1 = `(${Array.from(allUserIds).map((userId) => `st.userId LIKE '%${userId}%'`).join(' OR ')})`;

            const query = `SELECT st.id, st.userId, st.monthDate, st.categoryId, st.targetAmount, st.actualAmount, 
                    st.createdAt, st.updatedAt, u.name, u.mapTo, u.relatedTo
                FROM targets st
                JOIN user u ON st.userId = u.id
                WHERE st.monthDate = '${month}' AND ${conditionsString1}`;
            console.log(query);
            const [targets] = await db.query(query);

            var groupedByUser = {};

            // check if targets is empty, if so we need to get the previous month targets for the same userIds
            if(targets.length === 0){
                const previousMonth = new Date(new Date(month).setMonth(new Date(month).getMonth() - 1)).toISOString().slice(0, 7) + '-01';
                console.log(previousMonth);
                
                const query = `SELECT st.id, st.userId, st.monthDate, st.categoryId, st.targetAmount, st.actualAmount, 
                    st.createdAt, st.updatedAt, u.name, u.mapTo, u.relatedTo
                FROM targets st
                JOIN user u ON st.userId = u.id
                WHERE st.monthDate = '${previousMonth}' AND ${conditionsString1}`;
                
                const [targets] = await db.query(query);
                
                groupedByUser = targets.reduce((acc, target) => {
                    const userId = target.userId;
                    if (!acc[userId]) {
                    acc[userId] = {
                        userId: userId,
                        name: target.name,
                        monthDate: 'To be decided',
                        targets: []
                        };
                    }
                    acc[userId].targets.push(target);
                    return acc;
                }, {});
            }
            else {
                // Group targets by userId
                groupedByUser = targets.reduce((acc, target) => {
                    const userId = target.userId;
                    if (!acc[userId]) {
                    acc[userId] = {
                        userId: userId,
                        name: target.name,
                        monthDate: target.monthDate,
                        targets: []
                    };
                    }
                    acc[userId].targets.push(target);
                    return acc;
                }, {});
            }
            return NextResponse.json({
                success: true,
                data: Object.values(groupedByUser),
                count: targets.length,
            });
        } 
        
        else {
            // wrong secret key
            return Response.json({status: 401, message:'Unauthorized'}, {status: 200})
        }
        
    } catch (error) {
        console.error('Error fetching targets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch targets' },
            { status: 500 }
        );
    }
}