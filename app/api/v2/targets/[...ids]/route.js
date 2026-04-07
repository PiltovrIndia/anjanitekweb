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

            // OLD VERSION TO BE DELETED LATER
            if(params.ids[1] === 'T0'){

                // check if month value is All, if so we need to get the targets for all months for the given userIds
                var monthCondition = '';
                if(params.ids[2] === 'All'){
                    monthCondition = '';
                }
                else {
                    monthCondition = `AND st.monthDate = '${params.ids[2]}'`;
                }
                const userIds = params.ids[3].split(',');
                
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

                const query = `SELECT st.id, st.userId, st.monthDate, st.categoryId, st.targetAmount, st.targetOpening, st.actualAmount, 
                        st.createdAt, st.updatedAt, u.name, u.mapTo, u.relatedTo
                    FROM targets st
                    JOIN user u ON st.userId = u.id
                    WHERE ${conditionsString1} ${monthCondition}`;
                console.log(query);
                const [targets] = await db.query(query);

                var groupedByUser = {};

                // check if targets is empty, if so we need to get the previous month targets for the same userIds
                if(targets.length === 0 && monthCondition !== ''){
                    const previousMonth = new Date(new Date(params.ids[2]).setMonth(new Date(params.ids[2]).getMonth() - 1)).toISOString().slice(0, 7) + '-01';
                    console.log(previousMonth);
                    
                    const query = `SELECT st.id, st.userId, st.monthDate, st.categoryId, st.targetAmount, st.targetOpening, st.actualAmount, 
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
        
        else  if(params.ids[1] === 'T1'){

                // check if month value is All, if so we need to get the targets for all months for the given userIds
                var monthCondition = '';
                if(params.ids[2] === 'All'){
                    monthCondition = '';
                }
                else {
                    
                    monthCondition = `AND st.monthDate = '${new Date(new Date(params.ids[2]).setMonth(new Date(params.ids[2]).getMonth())).toISOString().slice(0, 7) + '-01'}'`;
                }
                const userIds = params.ids[3].split(',');
                
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

                const query = `SELECT st.id, st.userId, st.monthDate, st.categoryId, st.targetAmount, st.targetOpening, st.actualAmount, 
                        st.createdAt, st.updatedAt, u.name, u.mapTo, u.relatedTo
                    FROM targets st
                    JOIN user u ON st.userId = u.id
                    WHERE ${conditionsString1} ${monthCondition}`;
                
                    const [targets] = await db.query(query);

                var groupedByUser = {};

                // check if targets is empty, if so we need to get the previous month targets for the same userIds
                if(targets.length === 0 && monthCondition !== ''){
                    
                    // Add 3 entries for all the users with role 'dealer' for the given month with categoryId 1, 2 and 3 with targetAmount and actualAmount as 0, we can identify these entries by checking the monthDate value as 'To be decided'
                    const newMonth = new Date(new Date(params.ids[2]).setMonth(new Date(params.ids[2]).getMonth())).toISOString().slice(0, 7) + '-01';
                    
                    // get all users with role 'dealer'
                    const [dealerRows] = await db.query(`SELECT id FROM user WHERE role='Dealer'`);
                    
                    // insert 3 entries for each dealer for the given month
                    for(const dealer of dealerRows){
                        await db.query(`INSERT INTO targets (userId, monthDate, categoryId, targetAmount, targetOpening, actualAmount, createdAt, updatedAt) VALUES ('${dealer.id}', '${newMonth}', 1, 0, 0, 0, NOW(), NOW())`);
                        await db.query(`INSERT INTO targets (userId, monthDate, categoryId, targetAmount, targetOpening, actualAmount, createdAt, updatedAt) VALUES ('${dealer.id}', '${newMonth}', 2, 0, 0, 0, NOW(), NOW())`);
                        await db.query(`INSERT INTO targets (userId, monthDate, categoryId, targetAmount, targetOpening, actualAmount, createdAt, updatedAt) VALUES ('${dealer.id}', '${newMonth}', 3, 0, 0, 0, NOW(), NOW())`);
                    }
                    
                    const query = `SELECT st.id, st.userId, st.monthDate, st.categoryId, st.targetAmount, st.targetOpening, st.actualAmount, 
                        st.createdAt, st.updatedAt, u.name, u.mapTo, u.relatedTo
                    FROM targets st
                    JOIN user u ON st.userId = u.id
                    WHERE st.monthDate = '${newMonth}' AND ${conditionsString1}`;
                    
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
                            monthDate: target.targetAmount > 0 ? target.monthDate : 'To be decided',
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