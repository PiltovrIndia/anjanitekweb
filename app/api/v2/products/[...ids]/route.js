import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
import dayjs from 'dayjs'
const OneSignal = require('onesignal-node')

const client = new OneSignal.Client(process.env.ONE_SIGNAL_APPID, process.env.ONE_SIGNAL_APIKEY)

// API for updates to user data
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){

            // get the list of product related tags
            if(params.ids[1] == 'U0'){
                try {
                    const [rows, fields] = await connection.execute('SELECT * from product_tags');
                    connection.release();

                    if(rows.length > 0){
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            // get the list of products
            if(params.ids[1] == 'U1'){
                try {
                    
                    var query = '';
                    query = 'SELECT * from products LIMIT 20 OFFSET '+params.ids[3];
                    
                    const [rows, fields] = await connection.execute(query);
                    connection.release();

                    if(rows.length > 0){
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            // get products by size
            else if(params.ids[1] == 'U2'){
                try {
                    const [rows, fields] = await connection.execute('SELECT * from products WHERE size="'+params.ids[2]+'" LIMIT 20 OFFSET '+params.ids[3]);
                    connection.release();

                    if(rows.length > 0){
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) {
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            // get products by tags
            else if(params.ids[1] == 'U3'){
                try {
                    var str = '';
                    if(params.ids[2].length > 0){
                        str = params.ids[2].split(',').map(tag => `FIND_IN_SET(`+tag+`, tags)`).join(' AND ');
                    }
                    else {
                        str = 'FIND_IN_SET("39", tags)';
                    }
                        // const conditions = params.ids[2].split(',').map(tag => `FIND_IN_SET(`+tag+`, tags)`).join(' AND ');                    
                        const [rows, fields] = await connection.execute(`SELECT * from products WHERE ${str} LIMIT 20 OFFSET ${params.ids[3]}`);
                        const [countRows, countFields] = await connection.execute(`SELECT COUNT(*) as count from products WHERE ${str}`);
                        const totalCount = countRows[0].count;
                        connection.release();

                        // check if user is found
                        if(rows.length > 0){
                            return Response.json({status: 200, data: rows, count: totalCount, message:'Data found!'}, {status: 200})
                        }
                        else {
                            return Response.json({status: 201, message:'No data found!'}, {status: 200})
                        }
                    } catch (error) { // error updating
                        return Response.json({status: 404, message:'No product found!'}, {status: 200})
                }
            }
            // get products by search
            else if(params.ids[1] == 'U4'){
                try {
                    var str = `(design LIKE '%${params.ids[2]}%' OR name LIKE '%${params.ids[2]}%')`;
                    
                    const [rows, fields] = await connection.execute(`SELECT * from products WHERE ${str} LIMIT 20 OFFSET ${params.ids[3]}`);
                    connection.release();

                        // check if user is found
                        if(rows.length > 0){
                            return Response.json({status: 200, data: rows, message:'Data found!'}, {status: 200})
                        }
                        else {
                            return Response.json({status: 201, message:'No data found!'}, {status: 200})
                        }
                    } catch (error) { // error updating
                        return Response.json({status: 404, message:'No product found!'}, {status: 200})
                }
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
                            
console.log(query);

                                const [rows1, fields1] = await connection.execute(query);
                                console.log(rows1);
                                
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
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            
            
            else {
                return Response.json({status: 404, message:'No product found!'}, {status: 200})
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