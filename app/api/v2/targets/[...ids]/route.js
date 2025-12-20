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
            
            var conditionsString = `(${userIds.map((userId) => `st.userId LIKE '%${userId}%'`).join(' OR ')})`;
            

            const query = `
                SELECT st.id, st.userId, st.monthDate, st.categoryId, st.targetAmount, st.actualAmount, 
                    st.createdAt, st.updatedAt, u.name
                FROM targets st
                JOIN user u ON st.userId = u.id
                WHERE st.monthDate = '${month}' AND ${conditionsString}
            `;
            
            const [targets] = await db.query(query);

            // Group targets by userId
            const groupedByUser = targets.reduce((acc, target) => {
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