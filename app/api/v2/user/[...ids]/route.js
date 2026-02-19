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

            // Log user session
            if(params.ids[1] == 'U0'){
                try {

                    // check if the user is logged in or visitor
                    if(params.ids[4] == 'visitor'){
                        
                        const [rows1, fields1] = await connection.execute('INSERT INTO user_logs (userId, role) values ("Visitor", "Visitor")');
                        connection.release();
                        return Response.json({status: 200, message:'Updated!'}, {status: 200})
                    }
                    else if(params.ids[4] == 'user'){
                        const [rows, fields] = await connection.execute('SELECT isActive FROM user WHERE id="'+params.ids[2]+'" LIMIT 1');

                        // we record the user log only if the user is active
                        if(rows.length > 0 && rows[0].isActive == 1){
                            const [rows1, fields1] = await connection.execute('INSERT INTO user_logs (userId, role) values ("'+params.ids[2]+'", "'+params.ids[3]+'")');
                            connection.release();
                            return Response.json({status: 200, message:'Updated!', data:rows[0].isActive}, {status: 200})
                        }
                        else {
                            return Response.json({status: 200, message:'User is not active!',data:0}, {status: 200})
                        }
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No user found!'}, {status: 200})
                }
            }

            // update the player Id for the user
            if(params.ids[1] == 'U1'){
                try {
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
                    if(params.ids[4] == 'SuperAdmin' || params.ids[4] == 'GlobalAdmin'){
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
                    const [rows, fields] = await connection.execute('SELECT u.*,d.*, (SELECT name from user where id=u.mapTo ) as mapName, (SELECT mobile from user where id=u.mapTo ) as mapMobile from `user` u JOIN dealer d ON u.id=d.dealerId WHERE u.id = "'+params.ids[2]+'"');
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

                    if(params.ids[2] == 'SuperAdmin' || params.ids[2] == 'GlobalAdmin'){
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
                        const [rowsss, fieldsss] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+params.ids[6]+'"');
                        
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
                        await Promise.all(promises2);
                        
                        // get the list of dealers mapped to each executive
                        var dealers = [];
                        const promises = executives.map(async (row) => {
                            const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+row+'"');
                            rows1.map((row1) => {
                                dealers.push(row1.id);
                                
                            })
                        });
                        await Promise.all(promises); // wait till above finishes

                        const promises3 = rowsss.map(async (rowss1) => {
                            dealers.push(rowss1.id);
                        });
                        await Promise.all(promises3);
                        

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
                    if(params.ids[2] == 'SuperAdmin' || params.ids[2] == 'GlobalAdmin'){
                        // query = `SELECT u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst,u.*,(SELECT name FROM user WHERE id = u.mapTo) AS salesperson FROM dealer d LEFT JOIN user u ON d.dealerId = u.id where u.role="Dealer"`;
                        query = `SELECT u.id,d.accountName,d.address1,d.city,d.district,d.state,d.gst,u.*,
                                    (SELECT name FROM user WHERE id = u.mapTo) AS salesperson,
                                    COALESCE(SUM(CASE WHEN i.invoiceType = 'ATL' and i.status IN ("NotPaid","PartialPaid") THEN i.pending ELSE 0 END), 0) AS pendingATL,
                                        COALESCE(SUM(CASE WHEN i.invoiceType = 'VCL' and i.status IN ("NotPaid","PartialPaid") THEN i.pending ELSE 0 END), 0) AS pendingVCL
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
                                                        COALESCE(SUM(CASE WHEN i.invoiceType = 'ATL' and i.status IN ("NotPaid","PartialPaid") THEN i.pending ELSE 0 END), 0) AS pendingATL,
                                                            COALESCE(SUM(CASE WHEN i.invoiceType = 'VCL' and i.status IN ("NotPaid","PartialPaid") THEN i.pending ELSE 0 END), 0) AS pendingVCL
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
                                                        COALESCE(SUM(CASE WHEN i.invoiceType = 'ATL' and i.status IN ("NotPaid","PartialPaid") THEN i.pending ELSE 0 END), 0) AS pendingATL,
                                                            COALESCE(SUM(CASE WHEN i.invoiceType = 'VCL' and i.status IN ("NotPaid","PartialPaid") THEN i.pending ELSE 0 END), 0) AS pendingVCL
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
                                                        COALESCE(SUM(CASE WHEN i.invoiceType = 'ATL' and i.status IN ("NotPaid","PartialPaid") THEN i.pending ELSE 0 END), 0) AS pendingATL,
                                                            COALESCE(SUM(CASE WHEN i.invoiceType = 'VCL' and i.status IN ("NotPaid","PartialPaid") THEN i.pending ELSE 0 END), 0) AS pendingVCL
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
                    
                    connection.release();
                    // return successful update

                    // check if user is found
                    if(rows.affectedRows > 0){
                        
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
                    const userDetailObject = JSON.parse(decodeURIComponent(params.ids[4]));
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
                      
                    // console.log(`INSERT INTO user (${userKeys}) VALUES (${userValues})`);
                    // console.log(`INSERT INTO dealer (${userDetailKeys}) VALUES (${userDetailValues})`);

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
                      
                    // console.log(`UPDATE user SET ${updateString} WHERE id = '${params.ids[3]}'`);
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
                    const [rows, fields] = await connection.execute('SELECT u.*, (SELECT name from user where id=u.mapTo ) as mapName, (SELECT mobile from user where id=u.mapTo ) as mapMobile from `user` u WHERE u.mobile = "'+params.ids[2]+'"');
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
            
            // get the org structure data
            else if(params.ids[1] == 'U15'){
                try {
                    const [rows, fields] = await connection.execute('SELECT  u1.id, u1.name, u1.role, u1.designation, u1.mapTo, u2.name as manager_name, u2.role as manager_role FROM  user u1 LEFT JOIN  user u2 ON u1.mapTo = u2.id ORDER BY  u1.mapTo, u1.id');
                    connection.release();
                    // return successful update

                    
                        return Response.json({status: 200, message:'User found!', data: rows}, {status: 200})
                    
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



export async function POST(request, {params}) {
    
    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){
          
            if(params.ids[1] == 'U33'){ // Upload dealers in bulk
                
                const items = await request.json();

                    // for (const [index, item] of items.entries()){
                    //     console.log(`Item ${index}:`, item);
                        await applyBulkDealersUpload(items);
                    // }
                    
                    // connection.release();
                    return Response.json({status: 200, message:'Success!'}, {status: 200})
                    
            }
            else {
                return Response.json({status: 404, message:'Not found!'}, {status: 200})
            }
        }
        else {
            // wrong secret key
            return Response.json({status: 401, message:'Unauthorized'}, {status: 200})
        }
    }
    catch (err){
        // some error occured
        return Response.json({status: 500, message:'Facing issues. Please try again!'+err}, {status: 200})
    }
  }




  // apply dealers upload one by one
  async function applyBulkDealersUpload(items) {
    // get the pool connection to db
    const connection = await pool.getConnection(); 
    
    try {
        await connection.beginTransaction();
        
        for (const [index, item] of items.entries()){
            
            let p = 'INSERT INTO user (id, name, email, mobile, role, designation, mapTo, relatedTo, userImage, gcm_regId, isActive) VALUES (?,?,?,?,?,?,?,?,?,?,?)';
            let p1 = 'INSERT INTO dealer (dealerId, accountName, salesId, address1, address2, address3, city, district, state, gst, id) VALUES (?,?,?,?,?,?,?,?,?,?,?)';

            const [pRows] = await connection.query(p,[item.gst, item.accountName, item.email, item.mobile, 'Dealer', 'Dealer', item.mapTo, item.relatedTo, '-', '-', 1]);
            const [p1Rows] = await connection.query(p1,[item.gst, item.accountName, item.mapTo, item.address1.replace('***', '/'), item.address2.replace('***', '/'), item.address3.replace('***', '/'), item.city, item.district, item.state, item.gst, item.dealerId]);
        }

        await connection.commit();
    } catch (error) {
        console.log(error);
        await connection.rollback();
        throw error;
    } finally {
        await connection.release();
    }
}
  