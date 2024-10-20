import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
import dayjs from 'dayjs'
const OneSignal = require('onesignal-node')

const client = new OneSignal.Client(process.env.ONE_SIGNAL_APPID, process.env.ONE_SIGNAL_APIKEY)

// API for updates to user data
// params used for this API
// key, type, userId, playerId
// U1 – playerId update
// U2 – get user details
// U3 – Search user – by CollegeId
// U4 – Search user – by Username
// U5 – Search user requests(active) – by CollegeId
// U16 – Search user – by phoneNumber
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){

            // update the player Id for the user
            if(params.ids[1] == 'U1'){
                try {
                    console.log('UPDATE user SET gcm_regId ="'+params.ids[3]+'" where id = "'+params.ids[2]+'"');
                    const [rows, fields] = await connection.execute('UPDATE user SET gcm_regId ="'+params.ids[3]+'" where id = "'+params.ids[2]+'"');
                    connection.release();
                    // return successful update
                    return Response.json({status: 200, message:'Updated!'}, {status: 200})
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'}, {status: 200})
                }
            }
            // get details of the dealer by name
            else if(params.ids[1] == 'U2'){
                try {
                    
                    var query = '';
                    if(params.ids[4] == 'SuperAdmin'){
                        query = 'SELECT * from user WHERE role="dealer" AND name LIKE "%'+params.ids[2]+'%" LIMIT 20 OFFSET '+params.ids[3];
                    }
                    else if(params.ids[4] == 'StateHead'){
                        // find the assigned managers, executives and get dealers under them
                        // get the list of managers mapped to StateHead
                        const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role="SalesManager" AND mapTo="'+params.ids[5]+'"');
                        const [rowss, fieldss] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+params.ids[5]+'"');
                        
                        // get the list of executives mapped to each manager
                        var executives = [];
                        const promises1 = rows.map(async (row) => {
                            const [rows11, fields1] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+row.id+'"');
                            rows11.map((row11) => {
                                executives.push(row11.id);
                            })
                        });
                        await Promise.all(promises1);
                        const promises2 = rowss.map(async (rowss1) => {
                                executives.push(rowss1.id);
                        });
                        await Promise.all(promises2);
                        
                        // get the list of dealers mapped to each executive
                        var dealers = [];
                        const promises = executives.map(async (row) => {
                            const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+row+'"');
                            rows1.map((row1) => {
                                dealers.push(row1.id);
                                
                            })
                        });
                        await Promise.all(promises);

                        if(dealers.length > 0){
                            const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                            query = `SELECT * from user WHERE role="dealer" AND id IN (${dealersList}) AND name LIKE "%`+params.ids[2]+`%" LIMIT 20 OFFSET `+params.ids[3];
                        }
                    }
                    else if(params.ids[4] == 'SalesManager'){
                        // find the assigned executives and get dealers under them
                        // get the list of executives mapped to SalesManager
                        const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+params.ids[5]+'"');
                        
                        // get the list of dealers mapped to each executive
                        var dealers = [];
                        const promises = rows.map(async (row) => {
                            const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+row.id+'"');
                            rows1.map((row1) => {
                                dealers.push(row1.id);
                                
                            })
                        });
                        
                        await Promise.all(promises);

                        if(dealers.length > 0){
                            const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                            query = `SELECT * from user WHERE role="dealer" AND id IN (${dealersList}) AND name LIKE "%`+params.ids[2]+`%" LIMIT 20 OFFSET `+params.ids[3];
                        }
                    }
                    else if(params.ids[4] == 'SalesExecutive'){
                        // get the list of dealers mapped to SalesExecutive
                        var dealers = [];
                        const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+params.ids[5]+'"');
                        const promises = rows1.map((row1) => {
                            dealers.push(row1.id);
                        });
                        
                        await Promise.all(promises);

                        if(dealers.length > 0){
                            const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                            query = `SELECT * from user WHERE role="dealer" AND id IN (${dealersList}) AND name LIKE "%`+params.ids[2]+`%" LIMIT 20 OFFSET `+params.ids[3];
                        }
                    }

                    const [rows, fields] = await connection.execute(query);
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'+error}, {status: 200})
                }
            }
            // get user details of the dealer by id
            else if(params.ids[1] == 'U3'){
                try {
                    const [rows, fields] = await connection.execute('SELECT * from user WHERE role="dealer" AND id LIKE "%'+params.ids[2]+'%" LIMIT 20 OFFSET '+params.ids[3]);
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'+error}, {status: 200})
                }
            }
            // get dealer details of the dealer by id
            else if(params.ids[1] == 'U4'){
                try {
                    const [rows, fields] = await connection.execute('SELECT u.*,d.*, (SELECT name from user where id=u.mapTo ) as mapName from `user` u JOIN dealer d ON u.id=d.dealerId WHERE u.id = "'+params.ids[2]+'"');
                    connection.release();

                    // check if user is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows[0], message:'Data found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                        
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'}, {status: 200})
                }




                // try {
                //     const [rows, fields] = await connection.execute('SELECT * from dealer d LEFT JOIN user u ON d.dealerId = u.id WHERE d.dealerId = "'+params.ids[2]+'"');
                //     connection.release();
                //     // return successful update

                //     // check if user is found
                //     if(rows.length > 0){
                //         // return the requests data
                //         return Response.json({status: 200, data: rows[0], message:'Data found!'}, {status: 200})

                //     }
                //     else {
                //         // user doesn't exist in the system
                //         return Response.json({status: 201, message:'No data found!'}, {status: 200})
                //     }
                // } catch (error) { // error updating
                //     return Response.json({status: 404, message:'No user found!'+error}, {status: 200})
                // }
            }
            // get the dealers with pending amount for listing in web
            // getting all instead of limiting
            // This will be fetched role wise and assigned users wise.
            else if(params.ids[1] == 'U5'){

                var query = '';
                try {
                    // console.log('SELECT d.dealerId,d.accountName,d.address1,d.city,d.district,d.state,d.gst, SUM(i.pending) as pending FROM dealer d LEFT JOIN `invoices` i ON d.dealerId = i.billTo GROUP BY d.dealerId,d.accountName,d.address1,d.city,d.district,d.state,d.gst ORDER BY SUM(i.pending) DESC LIMIT 10 OFFSET '+params.ids[3]);

                    if(params.ids[2] == 'SuperAdmin'){
                        var state = '';
                        if(params.ids[5] != null && params.ids[5] != 'All'){
                            state = ' AND d.state="' + params.ids[5] + '" ';
                        }

                        // if(params.ids[4] != 0){ // number of days
                            // query = 'SELECT d.dealerId,d.accountName,d.address1,d.city,d.district,d.state,d.gst, SUM(i.pending) as pending FROM dealer d LEFT JOIN `invoices` i ON d.dealerId = i.billTo WHERE i.pending>0 AND i.expiryDate BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL '+params.ids[4]+' DAY) GROUP BY d.dealerId,d.accountName,d.address1,d.city,d.district,d.state,d.gst ORDER BY SUM(i.pending) DESC';
                            query = `SELECT DISTINCT 
                                d.*,
                                u_sales.name AS sales,i.*
                            FROM dealer d
                            JOIN invoices i ON d.dealerId = i.billTo
                            LEFT JOIN user u_dealer ON d.dealerId = u_dealer.id  -- Join to match dealer with user table
                            LEFT JOIN user u_sales ON u_dealer.mapTo = u_sales.id  -- Get the sales person from mapTo
                            WHERE i.status IN ('NotPaid', 'PartialPaid')
                            -- AND DATE(i.expiryDate) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL `+params.ids[4]+` DAY)  -- Invoices expiring within the next 5 days
                            AND DATE(i.expiryDate) <= DATE_ADD(CURDATE(), INTERVAL `+params.ids[4]+` DAY)  -- Invoices expiring within the next 5 days
                            `+state+`
                            ORDER BY i.expiryDate ASC`;
                        

                        const [rows, fields] = await connection.execute(query);
                        connection.release();
                        // return successful update

                        // check if user is found
                        if(rows.length > 0){
                            // return the requests data
                            return Response.json({status: 200, data: rows, message:'Data found!'}, {status: 200})

                        }
                        else {
                            // user doesn't exist in the system
                            return Response.json({status: 201, message:'No data found!'}, {status: 200})
                        }
                    }
                    else if(params.ids[2] == 'StateHead'){
                        
                        // find the assigned managers, executives and get dealers under them
                        // get the list of managers or executives mapped to StateHead
                        const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role="SalesManager" AND mapTo="'+params.ids[6]+'"');
                        const [rowss, fieldss] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+params.ids[6]+'"');
                        
                        // get the list of dealers mapped to each executive
                        var executives = [];
                        const promises1 = rows.map(async (row) => {
                            const [rows11, fields11] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+row.id+'"');
                            rows11.map((row11) => {
                                executives.push(row11.id);
                                
                            })
                        });
                        await Promise.all(promises1); // wait till above finishes
                        const promises2 = rowss.map(async (rowss1) => {
                                executives.push(rowss1.id);
                        });
                        await Promise.all(promises2); // wait till above finishes
                        
                        // get the list of dealers mapped to each executive
                        var dealers = [];
                        const promises = executives.map(async (row) => {
                            const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+row+'"');
                            rows1.map((row1) => {
                                dealers.push(row1.id);
                                
                            })
                        });
                        await Promise.all(promises); // wait till above finishes

                            if(dealers.length > 0){
                                
                                const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                                const dList = ` AND d.dealerId IN (${dealersList}) `;
                                
                                query = `SELECT DISTINCT d.*, u_sales.name AS sales,i.*
                                FROM dealer d
                                JOIN invoices i ON d.dealerId = i.billTo
                                LEFT JOIN user u_dealer ON d.dealerId = u_dealer.id  -- Join to match dealer with user table
                                LEFT JOIN user u_sales ON u_dealer.mapTo = u_sales.id  -- Get the sales person from mapTo
                                WHERE i.status IN ('NotPaid', 'PartialPaid')
                                -- AND DATE(i.expiryDate) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL `+params.ids[4]+` DAY)  -- Invoices expiring within the next 5 days
                                AND DATE(i.expiryDate) <= DATE_ADD(CURDATE(), INTERVAL `+params.ids[4]+` DAY)  -- Invoices expiring within the next 5 days
                                `+dList+`
                                ORDER BY i.expiryDate ASC`;

                                const [rows2, fields2] = await connection.execute(query);
                                connection.release();

                                // check if user is found
                                if(rows2.length > 0){
                                    // return the requests data
                                    return Response.json({status: 200, data: rows2, message:'Data found!'}, {status: 200})
                                }
                                else {
                                    // user doesn't exist in the system
                                    return Response.json({status: 201, message:'No data found!'}, {status: 200})
                                }
                            }
                            else {
                                // user doesn't exist in the system
                                return Response.json({status: 201, message:'No data found!'}, {status: 200})
                            }
                    }
                    else if(params.ids[2] == 'SalesManager'){
                        
                        // find the assigned executives and get dealers under them
                        // get the list of executives mapped to SalesManager
                        const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+params.ids[6]+'"');
                        
                        // get the list of dealers mapped to each executive
                        var dealers = [];
                        const promises = rows.map(async (row) => {
                            const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+row.id+'"');
                            rows1.map((row1) => {
                                dealers.push(row1.id);
                                
                            })
                        });
                        
                        await Promise.all(promises); // wait till above finishes

                            if(dealers.length > 0){
                                
                                const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                                const dList = ` AND d.dealerId IN (${dealersList}) `;
                                
                                query = `SELECT DISTINCT d.*, u_sales.name AS sales,i.*
                                FROM dealer d
                                JOIN invoices i ON d.dealerId = i.billTo
                                LEFT JOIN user u_dealer ON d.dealerId = u_dealer.id  -- Join to match dealer with user table
                                LEFT JOIN user u_sales ON u_dealer.mapTo = u_sales.id  -- Get the sales person from mapTo
                                WHERE i.status IN ('NotPaid', 'PartialPaid')
                                -- AND DATE(i.expiryDate) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL `+params.ids[4]+` DAY)  -- Invoices expiring within the next 5 days
                                AND DATE(i.expiryDate) <= DATE_ADD(CURDATE(), INTERVAL `+params.ids[4]+` DAY)  -- Invoices expiring within the next 5 days
                                `+dList+`
                                ORDER BY i.expiryDate ASC`;

                                const [rows2, fields2] = await connection.execute(query);
                                connection.release();

                                // check if user is found
                                if(rows2.length > 0){
                                    // return the requests data
                                    return Response.json({status: 200, data: rows2, message:'Data found!'}, {status: 200})
                                }
                                else {
                                    // user doesn't exist in the system
                                    return Response.json({status: 201, message:'No data found!'}, {status: 200})
                                }
                            }
                            else {
                                // user doesn't exist in the system
                                return Response.json({status: 201, message:'No data found!'}, {status: 200})
                            }
                    }
                    else if(params.ids[2] == 'SalesExecutive'){

                        // find the assigned dealers under them
                        // get the list of dealers mapped to SalesExecutive
                        var dealers = [];
                        
                        const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+params.ids[6]+'"');
                        const promises = rows1.map((row1) => {
                            dealers.push(row1.id);
                        })

                        await Promise.all(promises); // wait till above finishes

                            var state = '';
                            if(dealers.length > 0){
                                
                                const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                                const dList = ` AND d.dealerId IN (${dealersList}) `;

                                query = `SELECT DISTINCT 
                                    d.*,
                                    u_sales.name AS sales,i.*
                                FROM dealer d
                                JOIN invoices i ON d.dealerId = i.billTo
                                LEFT JOIN user u_dealer ON d.dealerId = u_dealer.id  -- Join to match dealer with user table
                                LEFT JOIN user u_sales ON u_dealer.mapTo = u_sales.id  -- Get the sales person from mapTo
                                WHERE i.status IN ('NotPaid', 'PartialPaid')
                                -- AND DATE(i.expiryDate) BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL `+params.ids[4]+` DAY)  -- Invoices expiring within the next 5 days
                                AND DATE(i.expiryDate) <= DATE_ADD(CURDATE(), INTERVAL `+params.ids[4]+` DAY)  -- Invoices expiring within the next 5 days
                                `+dList+`
                                ORDER BY i.expiryDate ASC`;
                            

                                const [rows1, fields1] = await connection.execute(query);
                                connection.release();
                                // return successful update

                                // check if user is found
                                if(rows1.length > 0){
                                    // return the requests data
                                    return Response.json({status: 200, data: rows1, message:'Data found!'}, {status: 200})

                                }
                                else {
                                    // user doesn't exist in the system
                                    return Response.json({status: 201, message:'No data found!'}, {status: 200})
                                }
                            
                            }
                            else {
                                // user doesn't exist in the system
                                return Response.json({status: 201, message:'No data found!'}, {status: 200})
                            }
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'+error}, {status: 200})
                }
            }
            // get all the dealers for listing in web
            // Listing all dealers at a time as the count is below 500
            else if(params.ids[1] == 'U6'){
                try {

                    // we shall use the role to identify the dealers below them
                    var query = '';
                    if(params.ids[2] == 'SuperAdmin'){
                        // query = `SELECT u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst,u.*,(SELECT name FROM user WHERE id = u.mapTo) AS salesperson FROM dealer d LEFT JOIN user u ON d.dealerId = u.id where u.role="Dealer"`;
                        query = `SELECT u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst,u.*,
                                    (SELECT name FROM user WHERE id = u.mapTo) AS salesperson,
                                    COALESCE(SUM(CASE WHEN i.invoiceType = 'ATL' THEN i.pending ELSE 0 END), 0) AS pendingATL,
                                        COALESCE(SUM(CASE WHEN i.invoiceType = 'VCL' THEN i.pending ELSE 0 END), 0) AS pendingVCL
                                    FROM dealer d 
                                    LEFT JOIN user u ON d.dealerId = u.id 
                                    LEFT JOIN invoices i ON i.billTo = d.dealerId
                                    where u.role="Dealer"
                                    GROUP BY u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst
                                    ORDER BY pendingATL DESC;`;
                        const [rows, fields] = await connection.execute(query)
                        connection.release();
                            
                        if(rows.length > 0){
                            return Response.json({status: 200, length: rows.length, data: rows, message:'Details found!'}, {status: 200})
                        }
                        else {
                            return Response.json({status: 201, message:'No Data found!'}, {status: 200})
                        }
                    }

                    else if(params.ids[2] == 'StateHead'){
                        // find the assigned managers, get executives and get dealers under them
                        // get the list of managers or executives mapped to StateHead
                        const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role="SalesManager" AND mapTo="'+params.ids[3]+'"');
                        const [rowss, fieldss] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+params.ids[3]+'"');
                        
                        // get the list of executives mapped to each manager
                        var executives = [];
                        const promises1 = rows.map(async (row) => {
                            const [rows11, fields11] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+row.id+'"');
                            rows11.map((row11) => {
                                executives.push(row11.id);
                            })
                        });
                        await Promise.all(promises1); // wait till above finishes
                        const promises21 = rowss.map(async (rowss1) => {
                                executives.push(rowss1.id);
                        });
                        await Promise.all(promises21); // wait till above finishes
                        
                        // get the list of dealers mapped to each executive
                        var dealers = [];
                        const promises2 = executives.map(async (row) => {
                            
                            const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+row+'"');
                            rows1.map((row1) => {
                                dealers.push(row1.id);
                            })
                        });
                        await Promise.all(promises2); // wait till above finishes

                        // get the dealers
                        if(dealers.length > 0){
                            const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                            // const [rows2, fields2] = await connection.execute(`SELECT u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst,u.*,(SELECT name FROM user WHERE id = u.mapTo) AS salesperson FROM dealer d LEFT JOIN user u ON d.dealerId = u.id where u.role="Dealer" AND u.id IN (${dealersList})`);
                            const [rows2, fields2] = await connection.execute(`SELECT u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst,u.*,
                                                        (SELECT name FROM user WHERE id = u.mapTo) AS salesperson,
                                                        COALESCE(SUM(CASE WHEN i.invoiceType = 'ATL' THEN i.pending ELSE 0 END), 0) AS pendingATL,
                                                            COALESCE(SUM(CASE WHEN i.invoiceType = 'VCL' THEN i.pending ELSE 0 END), 0) AS pendingVCL
                                                        FROM dealer d 
                                                        LEFT JOIN user u ON d.dealerId = u.id 
                                                        LEFT JOIN invoices i ON i.billTo = d.dealerId
                                                        where u.role="Dealer" and u.id IN (${dealersList})
                                                        GROUP BY u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst
                                                        ORDER BY pendingATL DESC;`);
                            connection.release();
                            
                            return Response.json({status: 200, length: rows2.length, data: rows2, message:'Details found!'}, {status: 200})
                        }
                        else {
                            connection.release();
                            return Response.json({status: 201, message:'No Data found!'}, {status: 200})
                        }
                    }

                    else if(params.ids[2] == 'SalesManager'){
                        // find the assigned executives and get dealers under them
                        // get the list of executives mapped to SalesManager
                        const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+params.ids[3]+'"');
                        
                        // get the list of dealers mapped to each executive
                        var dealers = [];
                        const promises = rows.map(async (row) => {
                            
                            const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+row.id+'"');
                            rows1.map((row1) => {
                                dealers.push(row1.id);
                            })
                        });

                        await Promise.all(promises); // wait till above finishes

                        // get the dealers
                        if(dealers.length > 0){
                            const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                            // const [rows2, fields2] = await connection.execute(`SELECT u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst,u.*,(SELECT name FROM user WHERE id = u.mapTo) AS salesperson FROM dealer d LEFT JOIN user u ON d.dealerId = u.id where u.role="Dealer" AND u.id IN (${dealersList})`);
                            const [rows2, fields2] = await connection.execute(`SELECT u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst,u.*,
                                                        (SELECT name FROM user WHERE id = u.mapTo) AS salesperson,
                                                        COALESCE(SUM(CASE WHEN i.invoiceType = 'ATL' THEN i.pending ELSE 0 END), 0) AS pendingATL,
                                                            COALESCE(SUM(CASE WHEN i.invoiceType = 'VCL' THEN i.pending ELSE 0 END), 0) AS pendingVCL
                                                        FROM dealer d 
                                                        LEFT JOIN user u ON d.dealerId = u.id 
                                                        LEFT JOIN invoices i ON i.billTo = d.dealerId
                                                        where u.role="Dealer" and u.id IN (${dealersList})
                                                        GROUP BY u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst
                                                        ORDER BY pendingATL DESC;`);
                            connection.release();
                            
                            return Response.json({status: 200, length: rows2.length, data: rows2, message:'Details found!'}, {status: 200})
                        }
                        else {
                            connection.release();
                            return Response.json({status: 201, message:'No Data found!'}, {status: 200})
                        }
                    }

                    else if(params.ids[2] == 'SalesExecutive'){
                        
                        // get the list of dealers mapped to each executive
                        var dealers = [];
                        const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+params.ids[3]+'"');
                        const promises = rows1.map((row1) => {
                            dealers.push(row1.id);
                        });

                        await Promise.all(promises); // wait till above finishes

                        // get the dealers
                        if(dealers.length > 0){
                            const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                            // const [rows2, fields2] = await connection.execute(`SELECT u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst,u.*,(SELECT name FROM user WHERE id = u.mapTo) AS salesperson FROM dealer d LEFT JOIN user u ON d.dealerId = u.id where u.role="Dealer" AND u.id IN (${dealersList})`);
                            const [rows2, fields2] = await connection.execute(`SELECT u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst,u.*,
                                                        (SELECT name FROM user WHERE id = u.mapTo) AS salesperson,
                                                        COALESCE(SUM(CASE WHEN i.invoiceType = 'ATL' THEN i.pending ELSE 0 END), 0) AS pendingATL,
                                                            COALESCE(SUM(CASE WHEN i.invoiceType = 'VCL' THEN i.pending ELSE 0 END), 0) AS pendingVCL
                                                        FROM dealer d 
                                                        LEFT JOIN user u ON d.dealerId = u.id 
                                                        LEFT JOIN invoices i ON i.billTo = d.dealerId
                                                        where u.role="Dealer" and u.id IN (${dealersList})
                                                        GROUP BY u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst
                                                        ORDER BY pendingATL DESC;`);
                            connection.release();
                            return Response.json({status: 200, length: rows2.length, data: rows2, message:'Details found!'}, {status: 200})
                        }
                        else {

                            connection.release();
                            return Response.json({status: 201, message:'No Data found!'}, {status: 200})
                        }
                    }

                    

                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'+error}, {status: 200})
                }
            }
            // get ALL SALES PEOPLE for listing in web
            // get Sales Managers & Sales Executives listing
            // proper loading to be taken care
            else if(params.ids[1] == 'U7'){
                try {
                    const [rows, fields] = await connection.execute('SELECT * from user where role IN ("StateHead","SalesManager","SalesExecutive") ORDER BY role DESC');
                    
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.length > 0){
                        console.log(rows.length);
                        
                        // return the requests data
                        return Response.json({status: 200, length: rows.length, data: rows, message:'Data found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'+error}, {status: 200})
                }
            }
            // get ALL PEOPLE mapped to single person for listing in web
            // used for viewing who is assigned to whom
            // proper loading to be taken care
            else if(params.ids[1] == 'U8'){
                try {
                    const [rows, fields] = await connection.execute('SELECT * from user where mapTo = "'+params.ids[3]+'" ORDER BY role ASC');
                    
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.length > 0){
                        console.log(rows.length);
                        
                        // return the requests data
                        return Response.json({status: 200, length: rows.length, data: rows, message:'Data found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'+error}, {status: 200})
                }
            }
            // Search by Name in Sales Manager, Sales Executive, Dealers list
            // used for search and assign to a person
            // proper loading to be taken care
            else if(params.ids[1] == 'U9'){
                try {
                    const [rows, fields] = await connection.execute('SELECT * from user where role IN ("StateHead","SalesManager","SalesExecutive","Dealer") AND name LIKE "%'+params.ids[3]+'%" ORDER BY role DESC');
                    
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.length > 0){
                        console.log(rows.length);
                        
                        // return the requests data
                        return Response.json({status: 200, length: rows.length, data: rows, message:'Data found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'+error}, {status: 200})
                }
            }
            // update the mapping of the user
            // used for search and assign to a person
            // proper loading to be taken care
            else if(params.ids[1] == 'U10'){
                try {
                    const [rows, fields] = await connection.execute('UPDATE user SET mapTo="'+params.ids[3]+'" where id = "'+params.ids[4]+'"');
                    console.log('UPDATE user SET mapTo="'+params.ids[4]+'" where id = "'+params.ids[3]+'"');
                    
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.affectedRows > 0){
                        console.log(rows.length);
                        
                        // return the requests data
                        return Response.json({status: 200, message:'Updated!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'+error}, {status: 200})
                }
            }
            // creating sales user
            else if(params.ids[1] == 'U11'){
                try {

                    // get the list of things to update
                    const jsonObject = JSON.parse(params.ids[3]);
                    var updateString = '';
                    var uDKeys = '', uDValues = '';

                    // userDetailObject
                    for (const key in jsonObject) {
                        if (jsonObject.hasOwnProperty(key)) {
                        const value = jsonObject[key];
                        
                            if(uDKeys.length == 0){
                                uDKeys = `${key}`;
                                uDValues = `'${value}'`;

                            }
                            else {
                                uDKeys = uDKeys + `,${key}`;
                                uDValues = uDValues + `,'${value}'`;
                            }
                        }
                    }

                    let q = `INSERT INTO user (${uDKeys}) VALUES (${uDValues})`;
                
                        const [rows1, fields1] = await connection.execute(q);
                        connection.release();
                        // return successful update

                        // check if user is found
                        if(rows1.affectedRows > 0){
                            // return the requests data
                            return Response.json({status: 200, data1: rows1, message:'Updated successfully!'}, {status: 200})

                        }
                        else {
                            // user doesn't exist in the system
                            return Response.json({status: 201, message:'No updated!'}, {status: 200})
                        }

                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'+error}, {status: 200})
                }
            }
            // creating dealer
            else if(params.ids[1] == 'U12'){
                try {

                    // get the list of things to update
                    const userObject = JSON.parse(params.ids[3]);
                    const userDetailObject = JSON.parse(params.ids[4]);
                    // var updateString = '';
                    var userKeys = '', userValues = '', userDetailKeys = '', userDetailValues = '';

                    // parse through the list of things to update and form a string
                    // userObject
                    for (const key in userObject) {
                        if (userObject.hasOwnProperty(key)) {
                          const value = userObject[key];
                          
                            if(userKeys.length == 0){
                                // updateString = `${key}='${value}'`;
                                userKeys = `${key}`;
                                userValues = `'${value}'`;

                            }
                            else {
                                // updateString = updateString + `,${key}='${value}'`;
                                userKeys = userKeys + `,${key}`;
                                userValues = userValues + `,'${value}'`;
                            }
                        }
                      }
                    // parse through the list of things to update and form a string
                    // userDetailObject
                    for (const key in userDetailObject) {
                        if (userDetailObject.hasOwnProperty(key)) {
                          const value = userDetailObject[key];
                          
                            if(userDetailKeys.length == 0){
                                // updateString = `${key}='${value}'`;
                                userDetailKeys = `${key}`;
                                userDetailValues = `'${value}'`;

                            }
                            else {
                                // updateString = updateString + `,${key}='${value}'`;
                                userDetailKeys = userDetailKeys + `,${key}`;
                                userDetailValues = userDetailValues + `,'${value}'`;
                            }
                        }
                      }
                      
                    console.log(`INSERT INTO user (${userKeys}) VALUES (${userValues})`);
                    console.log(`INSERT INTO dealer (${userDetailKeys}) VALUES (${userDetailValues})`);

                    let p = `INSERT INTO user (${userKeys}) VALUES (${userValues})`;
                    let q = `INSERT INTO dealer (${userDetailKeys}) VALUES (${userDetailValues})`;
                    
                    const [rows, fields] = await connection.execute(p);
                    const [rows1, fields1] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.affectedRows > 0 && rows1.affectedRows > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, data1: rows1, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No Student found!'}, {status: 200})
                    }

                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'+error}, {status: 200})
                }
            }
            
            // update dealer
            else if(params.ids[1] == 'U13'){
                try {
                    // get the list of things to update
                    const jsonObject = JSON.parse(params.ids[4]);
                    var updateString = '';

                    // parse through the list of things to update and form a string
                    for (const key in jsonObject) {
                        if (jsonObject.hasOwnProperty(key)) {
                            const value = jsonObject[key];
                            
                            if(updateString.length == 0){
                                updateString = `${key}='${value}'`;
                            }
                            else {
                                updateString = updateString + `,${key}='${value}'`;
                            }
                        }
                    }
                      
                    console.log(`UPDATE user SET ${updateString} WHERE id = '${params.ids[3]}'`);
                    let q = `UPDATE user SET ${updateString} WHERE id = '${params.ids[3]}'`;
                    
                    const [rows, fields] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.affectedRows > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No Student found!'}, {status: 200})
                    }

                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'+error}, {status: 200})
                }
            }
            
            
            else if(params.ids[1] == 'U14'){
                try {
                    const [rows, fields] = await connection.execute('SELECT u.*, (SELECT name from user where id=u.mapTo ) as mapName from `user` u WHERE u.mobile = "'+params.ids[2]+'"');
                    connection.release();
                    // return successful update

                    if(rows[0].role == 'Dealer' || rows[0].role == 'dealer'){
                        let p = 'SELECT * from dealer WHERE dealerId ="'+rows[0].id+'"';
                        // let p = 'SELECT d.*, (SELECT name from user where id="'+rows[0].mapTo+'" ) as mapName  from dealer WHERE dealerId ="'+rows[0].id+'"';
                        const [drows, dfields] = await connection.execute(p);
                        return Response.json({status: 200, message:'User found!', data: rows[0], data1: drows[0]}, {status: 200})
                    }
                    else {
                        return Response.json({status: 200, message:'User found!', data: rows[0]}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'}, {status: 200})
                }
            }
            
            
            //////////////////////
            // Student 360 feature
            //////////////////////
            // search for user details by "userId","username","phoneNumber"
            // based on the role, branch, campusId, universityId
            // PARAMETERS: pass, action(U3 => Search), searchType, userId, role, branch, campusId, universityId, searchText, offset
            else if(params.ids[1] == 'U3'){
                try {
                    var q = '';
                    var conditionsString = '';
                    var search = '';

                    // STEP 1
                    // main searchText comparison
                    if(params.ids[2] == "1"){
                        search = `AND u.userId LIKE "%`+params.ids[8]+`%" `;
                    }
                    else if(params.ids[2] == "2"){
                        search = `AND u.username LIKE "%`+params.ids[8]+`%" `;
                    }
                    else if(params.ids[2] == "3"){
                        search = `AND (u.phoneNumber LIKE "%`+params.ids[8]+`%" OR d.fatherPhoneNumber LIKE "%`+params.ids[8]+`%" OR d.motherPhoneNumber LIKE "%`+params.ids[8]+`%" OR d.guardianPhoneNumber LIKE "%`+params.ids[8]+`%" OR d.guardian2PhoneNumber LIKE "%`+params.ids[8]+`%") `
                    }

                    // STEP 2
                    // where conditions w.r.to role
                    if(params.ids[4]=='GlobalAdmin'){ 
                        
                        // from all the user of university
                        conditionsString = conditionsString + ` AND u.universityId="`+params.ids[7]+`" AND u.campusId="`+params.ids[6]+`" `;
                    }
                    else if(params.ids[4]=='SuperAdmin' || params.ids[4]=='OutingAdmin'){ 

                        // from all the user of a college from university
                        conditionsString = conditionsString + ` AND u.universityId="`+params.ids[7]+`" AND u.campusId="`+params.ids[6]+`" `;
                    }
                    else if(params.ids[4]=='Admin'){ 

                        // Split the branches string into an array
                        let branches = (params.ids[5]).split(',');

                        // check if there are more than 1 branch
                        if(branches.length > 1){
                            // Build the LIKE conditions with case sensitivity
                            let likeConditions = branches.map(branch => `BINARY CONCAT(u.course,'-',u.branch,'-',u.year) LIKE '%${branch}%'`);

                            // Join the conditions with OR
                            conditionsString = likeConditions.join(' OR ');
                        }
                        else {
                            conditionsString = `BINARY CONCAT(u.course,'-',u.branch,'-',u.year) LIKE '%${branchesString}%'`;
                        }

                        // from all the user of a branch from a college from university
                        conditionsString = ` AND u.universityId="`+params.ids[7]+`" AND u.campusId="`+params.ids[6]+`" AND (${conditionsString})`;
                    }

                    q = `SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN hostel h ON d.hostelId = h.hostelId WHERE u.role = "Student" ${conditionsString} ${search} LIMIT 20 OFFSET `+params.ids[9];
                    console.log(q);
                    // let q = 'SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN `hostel` h ON d.hostelId = h.hostelId WHERE u.role = "Student" AND u.profileUpdated=1 AND u.userId LIKE "%'+params.ids[2]+'%" LIMIT 20 OFFSET '+params.ids[3];
                    const [rows, fields] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'}, {status: 200})
                }
            }

            // search for user details by "userId"
            // else if(params.ids[1] == 'U3'){
            //     try {
            //         // let q = 'SELECT * FROM user WHERE userId LIKE "%'+params.ids[2]+'%"';
            //         // console.log(q);
            //         var q = '';
            //         if(params.ids[4]!=null){ // check if campusId is being passed from new version

            //             if(params.ids[4] == 'All'){ // check its Super Admin or only Admin
            //                 q = 'SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN `hostel` h ON d.hostelId = h.hostelId WHERE u.role = "Student" AND u.userId LIKE "%'+params.ids[2]+'%" LIMIT 20 OFFSET '+params.ids[3];
            //             }
            //             else {
            //                 q = 'SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN `hostel` h ON d.hostelId = h.hostelId WHERE u.role = "Student" AND u.userId LIKE "%'+params.ids[2]+'%" AND u.campusId = "'+params.ids[4]+'" LIMIT 20 OFFSET '+params.ids[3];
            //             }
            //         }
            //         else{
            //             q = 'SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN `hostel` h ON d.hostelId = h.hostelId WHERE u.role = "Student" AND u.userId LIKE "%'+params.ids[2]+'%" LIMIT 20 OFFSET '+params.ids[3];
            //         }
                    
            //             // let q = 'SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN `hostel` h ON d.hostelId = h.hostelId WHERE u.role = "Student" AND u.profileUpdated=1 AND u.userId LIKE "%'+params.ids[2]+'%" LIMIT 20 OFFSET '+params.ids[3];
            //         const [rows, fields] = await connection.execute(q);
            //         connection.release();
            //         // return successful update

            //         // check if user is found
            //         if(rows.length > 0){
            //             // return the requests data
            //             return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

            //         }
            //         else {
            //             // user doesn't exist in the system
            //             return Response.json({status: 201, message:'No data found!'}, {status: 200})
            //         }
            //     } catch (error) { // error updating
            //         return Response.json({status: 404, message:'No user found!'}, {status: 200})
            //     }
            // }

            

            // reset the user login by Admin
            // else if(params.ids[1] == 'U4'){
            //     try {
                    
            //         var q = 'DELETE FROM user_sessions WHERE userId="'+params.ids[2]+'"';

            //         const [rows, fields] = await connection.execute(q);
            //         connection.release();

            //             return Response.json({status: 200, data: rows, message:'Login reset success!'}, {status: 200})

            //         } catch (error) { // error updating
            //             return Response.json({status: 404, message:'No user found!'}, {status: 200})
            //     }
            // }

            // search for user requests that are active by "userId"
            else if(params.ids[1] == 'U5'){
                try {
                    // get outing requests
                    let q = 'SELECT * from request where userId = "'+params.ids[2]+'" AND isOpen = 1';
                    const [rows, fields] = await connection.execute(q);
                    // get visitor passes
                    let q1 = 'SELECT * from visitorpass where userId = "'+params.ids[2]+'" AND isOpen = 1';
                    const [rows1, fields1] = await connection.execute(q1);

                    // Check if requests are found
                    if (rows1.length > 0) {
                        
                        // Use each request to get visitors of it
                        const requestsData = await Promise.all(
                            rows1.map(async (row) => {
                            const [visitors, visitorFields] = await connection.execute('SELECT v.* FROM visitors v WHERE v.vRequestId = ?',[row.vRequestId]);
                            
                            // Add visitors data to the current row
                            return { ...row, visitors };
                            })
                        );
                        connection.release();

                        // Return the requests data
                        return Response.json({status: 200, outing: rows, visitorpass: requestsData, message:'Details found!'})
                    } else {
                        // Return the requests data
                        return Response.json({status: 200, outing: rows, visitorpass: rows1, message:'Details found!'})
                    }

                    // connection.release();
                    // return successful update

                    // check if data is found
                    // if(rows.length > 0 || rows1.length > 0){
                    //     // return the data
                    //     return Response.json({status: 200, outing: rows, visitorpass: rows1, message:'Details found!'})

                    // }
                    // else {
                    //     // user doesn't exist in the system
                    //     return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    // }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'+error}, {status: 200})
                }
            }
            // search for basic user details by "userId"
            // this is to check whether the user exists in the DB
            // only used for student registration purpose
            else if(params.ids[1] == 'U6'){
                try {
                    // let q = 'SELECT * FROM user WHERE userId LIKE "%'+params.ids[2]+'%"';
                    // console.log(q);
                    let q = 'SELECT * FROM user WHERE role = "Student" AND profileUpdated=0 AND userId = "'+params.ids[2]+'" LIMIT 1 OFFSET '+params.ids[3];
                    const [rows, fields] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No Student found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No Student found!'}, {status: 200})
                }
            }
            // create/update user details by "userId"
            // this is to check and update during student registration
            else if(params.ids[1] == 'U7'){
                try {
                    // let q = 'SELECT * FROM user WHERE userId LIKE "%'+params.ids[2]+'%"';
                    // console.log(params.ids[2]);
                    
                    let i = "https://firebasestorage.googleapis.com/v0/b/smartcampusimages-1.appspot.com/o/"+params.ids[2]+".jpeg?alt=media";

                    let q = `UPDATE user SET mediaCount = 1, userImage = '${i}' WHERE userId = '${params.ids[2]}'`;
                    const [rows, fields] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.affectedRows > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No Student found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No Student found!'+error.message}, {status: 200})
                }
            }
            // get user details by who are freshly registered
            else if(params.ids[1] == 'U8'){
                try {
                    // let q = `SELECT *,( SELECT COUNT(*)
                    //  FROM user 
                    //  WHERE mediaCount = 1 AND profileUpdated = 0) AS user_count FROM user WHERE mediaCount = 1 AND profileUpdated = 0 LIMIT 10 OFFSET `+params.ids[2];
                    let q1 = `SELECT COUNT(*) AS registered
                     FROM user 
                     WHERE profileUpdated = 0`;
                    let q2 = `SELECT COUNT(*) AS user_count
                    FROM user 
                    WHERE mediaCount = 1 AND profileUpdated = 0`;
                    let q3 = `SELECT *
                     FROM user 
                     WHERE (mediaCount = 1 OR mediaCount = 0) AND profileUpdated = 0 ORDER BY (mediaCount = 1) DESC, CAST(userId AS SIGNED) ASC `;
                    //  WHERE (mediaCount = 1 OR mediaCount = 0) AND profileUpdated = 0 ORDER BY (mediaCount = 1) DESC, CAST(userId AS SIGNED) ASC LIMIT 10 OFFSET `+params.ids[2];
                    
                    const [rows, fields] = await connection.execute(q1);
                    const [rows1, fields1] = await connection.execute(q2);
                    const [rows2, fields2] = await connection.execute(q3);
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows2.length > 0){
                        // return the requests data
                        return Response.json({status: 200, registered: rows[0].registered, count: rows1[0].user_count, data: rows2, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No Student found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No Student found!'+error.message}, {status: 200})
                }
            }
            // create/update user basic details by "userId"
            // admin can update from Student360
            else if(params.ids[1] == 'U9'){
                try {

                    // get the list of things to update
                    const jsonObject = JSON.parse(params.ids[3]);
                    var updateString = '';

                    // parse through the list of things to update and form a string
                    for (const key in jsonObject) {
                        if (jsonObject.hasOwnProperty(key)) {
                          const value = jsonObject[key];
                          
                            if(updateString.length == 0){
                                updateString = `${key}='${value}'`;
                            }
                            else {
                                updateString = updateString + `,${key}='${value}'`;
                            }
                        }
                      }
                      
                    console.log(`UPDATE user SET ${updateString} WHERE userId = '${params.ids[2]}'`);
                    let q = `UPDATE user SET ${updateString} WHERE userId = '${params.ids[2]}'`;
                    
                    const [rows, fields] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.affectedRows > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No Student found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No Student found!'+error.message}, {status: 200})
                }
            }
            // UPDATE user parent details by "userId"
            // admin can update from Student360
            // this update happens via key value pairs
            else if(params.ids[1] == 'U10'){
                try {

                    // get the list of things to update
                    const jsonObject = JSON.parse(params.ids[3]);
                    var updateString = '';
                    var uDKeys = '', uDValues = '';

                    console.log(jsonObject);
                    // check if the details are present or not
                    const [drows, dfields] = await connection.execute('SELECT detailsId from user_details WHERE userId = ?', [params.ids[2]]);
                    console.log(drows.length);
                    // user parent details are present, hence just run the update query
                    if(drows.length > 0){

                        // parse through the list of things to update and form a string
                        for (const key in jsonObject) {
                            if (jsonObject.hasOwnProperty(key)) {
                            const value = jsonObject[key];
                            
                                if(updateString.length == 0){
                                    updateString = `${key}='${value}'`;
                                }
                                else {
                                    updateString = updateString + `,${key}='${value}'`;
                                }
                            }
                        }

                        // check if parents record exist or not
                        // update if exisits, else create new
                        
                        console.log(`UPDATE user_details SET ${updateString} WHERE userId = '${params.ids[2]}'`);
                        let q = `UPDATE user_details SET ${updateString} WHERE userId = '${params.ids[2]}'`;
                        
                        const [rows, fields] = await connection.execute(q);
                        connection.release();
                        // return successful update

                        // check if updated
                        if(rows.affectedRows > 0){
                            // return the requests data
                            return Response.json({status: 200, data: rows, message:'Updated successfully!'}, {status: 200})

                        }
                        else {
                            // user doesn't exist in the system
                            return Response.json({status: 201, message:'No updated!'}, {status: 200})
                        }

                    }
                    // user parent details are NOT present, hence insert the details
                    else {

                        // userDetailObject
                        for (const key in jsonObject) {
                            if (jsonObject.hasOwnProperty(key)) {
                            const value = jsonObject[key];
                            
                                if(uDKeys.length == 0){
                                    // updateString = `${key}='${value}'`;
                                    uDKeys = `${key}`;
                                    uDValues = `'${value}'`;

                                }
                                else {
                                    // updateString = updateString + `,${key}='${value}'`;
                                    uDKeys = uDKeys + `,${key}`;
                                    uDValues = uDValues + `,'${value}'`;
                                }
                            }
                        }

                        let q = `INSERT INTO user_details (userId,${uDKeys}) VALUES ('${params.ids[2]}',${uDValues})`;
                    
                            const [rows1, fields1] = await connection.execute(q);
                            connection.release();
                            // return successful update

                            // check if user is found
                            if(rows1.affectedRows > 0){
                                // return the requests data
                                return Response.json({status: 200, data1: rows1, message:'Updated successfully!'}, {status: 200})

                            }
                            else {
                                // user doesn't exist in the system
                                return Response.json({status: 201, message:'No updated!'}, {status: 200})
                            }

                    }
                    

                    
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No Student found!'+error.message}, {status: 200})
                }
            }
            // CREATE user basic and parent details
            // admin can CREATE from Student360
            // this update happens via key value pairs
            else if(params.ids[1] == 'U11'){
                try {

                    // get the list of things to update
                    const userObject = JSON.parse(params.ids[2]);
                    const userDetailObject = JSON.parse(params.ids[3]);
                    // var updateString = '';
                    var userKeys = '', userValues = '', userDetailKeys = '', userDetailValues = '';

                    // parse through the list of things to update and form a string
                    // userObject
                    for (const key in userObject) {
                        if (userObject.hasOwnProperty(key)) {
                          const value = userObject[key];
                          
                            if(userKeys.length == 0){
                                // updateString = `${key}='${value}'`;
                                userKeys = `${key}`;
                                userValues = `'${value}'`;

                            }
                            else {
                                // updateString = updateString + `,${key}='${value}'`;
                                userKeys = userKeys + `,${key}`;
                                userValues = userValues + `,'${value}'`;
                            }
                        }
                      }
                    // parse through the list of things to update and form a string
                    // userDetailObject
                    for (const key in userDetailObject) {
                        if (userDetailObject.hasOwnProperty(key)) {
                          const value = userDetailObject[key];
                          
                            if(userDetailKeys.length == 0){
                                // updateString = `${key}='${value}'`;
                                userDetailKeys = `${key}`;
                                userDetailValues = `'${value}'`;

                            }
                            else {
                                // updateString = updateString + `,${key}='${value}'`;
                                userDetailKeys = userDetailKeys + `,${key}`;
                                userDetailValues = userDetailValues + `,'${value}'`;
                            }
                        }
                      }
                      
                    console.log(`INSERT INTO user (${userKeys}) VALUES (${userValues})`);
                    console.log(`INSERT INTO user (${userDetailKeys}) VALUES (${userDetailValues})`);

                    let p = `INSERT INTO user (${userKeys}) VALUES (${userValues})`;
                    let q = `INSERT INTO user_details (${userDetailKeys}) VALUES (${userDetailValues})`;
                    
                    const [rows, fields] = await connection.execute(p);
                    const [rows1, fields1] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.affectedRows > 0 && rows1.affectedRows > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, data1: rows1, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No Student found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No Student found!'+error.message}, {status: 200})
                }
            }
            // get all details of the user
            // this is requested by the user itself to refresh their profile after update by admin
            else if(params.ids[1] == 'U12'){
                try {
                    const [rows, fields] = await connection.execute('SELECT * from user WHERE u.userId = "'+params.ids[2]+'"');
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.length > 0){

                        if(rows[0].role == 'dealer'){
                            let p = 'SELECT * from dealer WHERE userId ="'+rows[0].userId+'"';
                            const [drows, dfields] = await connection.execute(p);
                            return Response.json({status: 200, message:'User found!', data: rows[0], data1: drows[0]}, {status: 200})
                        }
                        else {
                            return Response.json({status: 200, message:'User found!', data: rows[0]}, {status: 200})
                        }

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'}, {status: 200})
                }
            }
            // update the profileUpdated to 3 for blocking or unblocking user
            // 4 – Temporary day scholar
            // 3 – Blocked from taking outing
            // 2 – Active & profile is not updated
            // 1 – Active & profile is updated
            // 0 – Inactive – out of college

            // Also change the student Type
            // Day Scholar
            // Hostel
            else if(params.ids[1] == 'U13'){
                try {
                    let type = decodeURIComponent(params.ids[4]);
                    
                    const [rows, fields] = await connection.execute('UPDATE user SET profileUpdated ="'+params.ids[3]+'", type = "'+type+'" where userId = "'+params.ids[2]+'"');
                    const [rows2, fields2] = await connection.execute('SELECT gcm_regId FROM user WHERE userId = "'+params.ids[2]+'"');

                    // send the notification
                    const notificationResult = await send_notification('✅ Your profile is updated by admin. Refresh profile to view.', rows2[0].gcm_regId, 'Single');
                        
                    connection.release();
                    // return successful update
                    return Response.json({status: 200, message:'Profile updated!',notification: notificationResult}, {status: 200})
                    

                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'}, {status: 200})
                }
            }
            // Change the outingType
            // yes - self-permitted
            // no - not self-permitted
            else if(params.ids[1] == 'U14'){
                try {
                    const [rows, fields] = await connection.execute('UPDATE user SET outingType ="'+params.ids[3]+'" where userId = "'+params.ids[2]+'"');
                    const [rows2, fields2] = await connection.execute('SELECT gcm_regId FROM user WHERE userId = "'+params.ids[2]+'"');

                    // send the notification
                    const notificationResult = await send_notification('✅ Your outing type is changed by admin. Refresh profile to view.', rows2[0].gcm_regId, 'Single');
                        
                    connection.release();
                    // return successful update
                    return Response.json({status: 200, message:'Outing type updated!',notification: notificationResult}, {status: 200})

                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!',error: error.message}, {status: 200})
                }
            }
            // Change the phoneNumber
            else if(params.ids[1] == 'U15'){
                try {
                    const [rows, fields] = await connection.execute('UPDATE user SET phoneNumber ="'+params.ids[3]+'" where userId = "'+params.ids[2]+'"');
                    connection.release();
                    // return successful update
                    return Response.json({status: 200, message:'Phone number updated!'}, {status: 200})
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'}, {status: 200})
                }
            }
            // Search with phoneNumber
            else if(params.ids[1] == 'U16'){
                try {
                    // let q = 'SELECT * FROM user WHERE userId LIKE "%'+params.ids[2]+'%"';
                    // console.log(q);
                    var q = '';
                    if(params.ids[4]!=null){ // check if campusId is being passed from new version

                        if(params.ids[4] == 'All'){ // check its Super Admin or only Admin
                            q = 'SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN `hostel` h ON d.hostelId = h.hostelId WHERE u.role = "Student" AND (u.phoneNumber LIKE "%'+params.ids[2]+'%" OR d.fatherPhoneNumber LIKE "%'+params.ids[2]+'%" OR d.motherPhoneNumber LIKE "%'+params.ids[2]+'%" OR d.guardianPhoneNumber LIKE "%'+params.ids[2]+'%" OR d.guardian2PhoneNumber LIKE "%'+params.ids[2]+'%") LIMIT 20 OFFSET '+params.ids[3];
                        }
                        else {
                            q = 'SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN `hostel` h ON d.hostelId = h.hostelId WHERE u.role = "Student" AND u.campusId = "'+params.ids[4]+'" AND (u.phoneNumber LIKE "%'+params.ids[2]+'%" OR d.fatherPhoneNumber LIKE "%'+params.ids[2]+'%" OR d.motherPhoneNumber LIKE "%'+params.ids[2]+'%" OR d.guardianPhoneNumber LIKE "%'+params.ids[2]+'%" OR d.guardian2PhoneNumber LIKE "%'+params.ids[2]+'%") LIMIT 20 OFFSET '+params.ids[3];
                        }
                    }
                    else{
                        q = 'SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN `hostel` h ON d.hostelId = h.hostelId WHERE u.role = "Student" AND (u.phoneNumber LIKE "%'+params.ids[2]+'%" OR d.fatherPhoneNumber LIKE "%'+params.ids[2]+'%" OR d.motherPhoneNumber LIKE "%'+params.ids[2]+'%" OR d.guardianPhoneNumber LIKE "%'+params.ids[2]+'%" OR d.guardian2PhoneNumber LIKE "%'+params.ids[2]+'%") LIMIT 20 OFFSET '+params.ids[3];
                    }
                    
                    // let q = 'SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN `hostel` h ON d.hostelId = h.hostelId WHERE u.role = "Student" AND u.profileUpdated=1 AND u.userId LIKE "%'+params.ids[2]+'%" LIMIT 20 OFFSET '+params.ids[3];
                    const [rows, fields] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'}, {status: 200})
                }
            }

            //////////////////////////////
            // faculty 360 starts from here
            // get admins + faculty list for SuperAdmin or GlobalAdmin
            else if(params.ids[1] == 'U17'){
                try {
                   
                    var q = '';
                    if(params.ids[7] == null){
                        q = `SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN hostel h ON d.hostelId = h.hostelId 
                                WHERE (u.role = "GlobalAdmin" OR u.role = "SuperAdmin" OR u.role = "Admin" OR u.role = "OutingAdmin" OR u.role = "Faculty") 
                                AND u.universityId = "`+params.ids[2]+`" AND u.campusId = "`+params.ids[3]+`" ORDER BY FIELD(u.role, 'GlobalAdmin', 'SuperAdmin', 'Admin', 'OutingAdmin', 'Faculty') ASC LIMIT 40 OFFSET `+params.ids[6];
                    }
                    else {
                        q = `SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN hostel h ON d.hostelId = h.hostelId 
                                WHERE (u.role = "GlobalAdmin" OR u.role = "SuperAdmin" OR u.role = "Admin" OR u.role = "OutingAdmin" OR u.role = "Faculty") 
                                AND u.universityId = "`+params.ids[2]+`" AND u.campusId = "`+params.ids[3]+`" AND u.username LIKE "%`+params.ids[7]+`%" ORDER BY u.username ASC LIMIT 40 OFFSET `+params.ids[6];
                    }
                    console.log(q);
                    const [rows, fields] = await connection.execute(q);
                    connection.release();

                    // check if user is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'}, {status: 200})
                }
            }
            // get faculty data for Admin and SuperAdmin
            else if(params.ids[1] == 'U18'){
                try {
                   
                    var q = '';
                    if(params.ids[4] == 'SuperAdmin' || params.ids[4] == 'Admin'){

                        var branchesString = params.ids[5];

                        // Split the string into an array
                        let branches = branchesString.split(',');

                        // check if there are more than 1 branch
                        var conditionsString = '';
                        if(branches.length > 1){
                            // Build the LIKE conditions with case sensitivity
                            let likeConditions = branches.map(branch => `FIND_IN_SET(u.branch,"${branch}")>0`);

                            // Join the conditions with OR
                            conditionsString = likeConditions.join(' OR ');
                        }
                        else {
                            conditionsString = `FIND_IN_SET(u.branch, "${branchesString}")>0`;
                        }
                        
                        q = `SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN hostel h ON d.hostelId = h.hostelId WHERE u.role = "Faculty" AND u.universityId = "`+params.ids[2]+`" AND u.campusId = "`+params.ids[3]+`" AND (${conditionsString}) ORDER BY u.username ASC`;
                    }
                    console.log(q);
                    // let q = 'SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN `hostel` h ON d.hostelId = h.hostelId WHERE u.role = "Student" AND u.profileUpdated=1 AND u.userId LIKE "%'+params.ids[2]+'%" LIMIT 20 OFFSET '+params.ids[3];
                    const [rows, fields] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'}, {status: 200})
                }
            }
            // search for faculty details by Id
            else if(params.ids[1] == 'U19'){
                try {
                    var q = `SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN hostel h ON d.hostelId = h.hostelId WHERE u.universityId="`+params.ids[2]+`" AND u.campusId="`+params.ids[3]+`" AND u.userId="`+params.ids[4]+`"`;
                    console.log(q);
                    // let q = 'SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN `hostel` h ON d.hostelId = h.hostelId WHERE u.role = "Student" AND u.profileUpdated=1 AND u.userId LIKE "%'+params.ids[2]+'%" LIMIT 20 OFFSET '+params.ids[3];
                    const [rows, fields] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // user doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'}, {status: 200})
                }
            }
            else {
                return Response.json({status: 404, message:'No user found!'}, {status: 200})
            }
        }
        else {
            // wrong secret key
            return Response.json({status: 401, message:'Unauthorized'}, {status: 200})
        }
    }
    catch (err){
        // some error occured
        return Response.json({status: 500, message:'Facing issues. Please try again!'}, {status: 200})
    }
  }
  

    // send the notification using onesignal.
  // use the playerIds of the user.
  // check if playerId length > 2
  async function send_notification(message, playerId, type) {

    return new Promise(async (resolve, reject) => {
      // send notification only if there is playerId for the user
      if (playerId.length > 0) {
        var playerIds = [];
        playerIds.push(playerId);
  
        var notification;
        // notification object
        if (type == 'Single') {
          notification = {
            contents: {
              'en': message,
            },
            // include_player_ids: ['playerId'],
            // include_player_ids: ['90323-043'],
            include_player_ids: [playerId],
          };
        } else {
          notification = {
            contents: {
              'en': message,
            },
            include_player_ids: playerIds,
          };
        }
  
        try {
          // create notification
          const notificationResult = await client.createNotification(notification);
          
          resolve(notificationResult);

        } catch (error) {
          
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  }