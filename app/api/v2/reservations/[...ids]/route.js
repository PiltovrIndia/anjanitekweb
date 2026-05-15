import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
import { send_notification } from '../../../send_notification';

// API for updates to user data
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){

            // get the list of reservations ordered by createdOn and by selected status
            if(params.ids[1] == 'U0'){
                try {

                    if(params.ids[4] == undefined){

                        // lets update the query to add user table as well to get user details
                        var query = 'SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, u.name as dealer, u.mobile, u.mapTo from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3];
                        var queryCount = 'SELECT count(*) as count from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id';

                        // if status is provided then filter by status as well
                        if(params.ids[2] != 'All'){

                            // expiryDate field is used to store the modified timestamp for the reservation. So we can filter the reservations modified after a particular timestamp using this field.
                            // if(params.ids[2] == 'Modified'){
                            //     query = 'SELECT r.*, p.*, u.name as dealer, u.mobile, u.mapTo from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.expiryDate > r.createdOn ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3];
                            // }
                            // else
                            query = 'SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, u.name as dealer, u.mobile, u.mapTo from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.status="'+params.ids[2]+'" ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3];
                            queryCount = 'SELECT count(*) as count from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.status="'+params.ids[2]+'"';
                        }
                    }
                    else {
                        if(params.ids[4] != 'SuperAdmin'){
                            // lets update the query to add user table as well to get user details
                            var query = 'SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, u.name as dealer, u.mobile, u.mapTo from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE u.relatedTo LIKE "%'+params.ids[5]+'%" ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3];
                            var queryCount = 'SELECT count(*) as count from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE u.relatedTo LIKE "%'+params.ids[5]+'%"';

                            // if status is provided then filter by status as well
                            if(params.ids[2] != 'All'){

                                // expiryDate field is used to store the modified timestamp for the reservation. So we can filter the reservations modified after a particular timestamp using this field.
                                // if(params.ids[2] == 'Modified'){
                                //     query = 'SELECT r.*, p.*, u.name as dealer, u.mobile, u.mapTo from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.expiryDate > r.createdOn ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3];
                                // }
                                // else
                                query = 'SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, u.name as dealer, u.mobile, u.mapTo from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.status="'+params.ids[2]+'" AND u.relatedTo LIKE "%'+params.ids[5]+'%" ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3];
                                queryCount = 'SELECT count(*) as count from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.status="'+params.ids[2]+'" AND u.relatedTo LIKE "%'+params.ids[5]+'%"';
                            }
                        }
                    }

                    
                    const [rows, fields] = await connection.execute(query);
                    const [countRows, countFields] = await connection.execute(queryCount);
                    connection.release();

                    if(rows.length > 0){
                        return Response.json({status: 200, data: rows, count: countRows[0].count, message:'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No reservation found!'+error}, {status: 200})
                }
            }
            // get the list of reservations by userId
            else if(params.ids[1] == 'U1'){
                try {
                    const [rows, fields] = await connection.execute('SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive from reservations r LEFT JOIN products1 p ON r.design = p.design WHERE r.userId LIKE "%'+params.ids[2]+'%" ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3]);
                    const [countRows, countFields] = await connection.execute('SELECT count(*) as count from reservations r LEFT JOIN products1 p ON r.design = p.design WHERE r.userId LIKE "%'+params.ids[2]+'%"');
                    connection.release();

                    if(rows.length > 0)
                        return Response.json({status: 200, data: rows, count: countRows[0].count}, {status: 200})
                    else 
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No reservation found!'+error}, {status: 200})
                }
            }
            // get the list of reservations by dealer name
            else if(params.ids[1] == 'U1.1'){
                try {
                    const [rows, fields] = await connection.execute('SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN dealer d ON r.userId=d.dealerId WHERE d.accountName LIKE "%'+params.ids[2]+'%" ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3]);
                    const [countRows, countFields] = await connection.execute('SELECT count(*) as count from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN dealer d ON r.userId=d.dealerId WHERE d.accountName LIKE "%'+params.ids[2]+'%"');
                    connection.release();

                    if(rows.length > 0)
                        return Response.json({status: 200, data: rows, count: countRows[0].count}, {status: 200})
                    else 
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No reservation found!'+error}, {status: 200})
                }
            }
            // get the list of reservations by design
            else if(params.ids[1] == 'U2'){
                try {
                    const [rows, fields] = await connection.execute('SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive from reservations r LEFT JOIN products1 p ON r.design = p.design WHERE r.design LIKE "%'+params.ids[2]+'%" ORDER BY r.createdOn DESC');
                    connection.release();

                    if(rows.length > 0)
                        return Response.json({status: 200, data: rows}, {status: 200})
                    else 
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No reservation found!'+error}, {status: 200})
                }
            }
            
            // update a reservation status
            else if(params.ids[1] == 'U3'){
                try {
                                        
                    // get the design of the reservation to update the stock if the reservation is approved
                    const [reservationRows, reservationFields] = await connection.execute('SELECT * from reservations WHERE id="'+params.ids[2]+'"');

                    // We shall use approvedOn field as modified timestamp 
                    const [rows, fields] = await connection.execute('UPDATE reservations SET approvedQty='+params.ids[4]+', approvedOn = "'+params.ids[6]+'", status="'+params.ids[3]+'" WHERE id="'+params.ids[2]+'"');
                    
                    // if status is 'approved', lets minus the approvedQty from the respective design stock
                    if(params.ids[3] == 'Approved' && reservationRows.length > 0){
                        const design = reservationRows[0].design;
                        const stockType = reservationRows[0].stockType;
                        const approvedQty = Number(params.ids[4]);

                        // update the stock directly based on stockType
                        if(stockType == 'std'){
                            await connection.execute('UPDATE products1 SET std = std - '+approvedQty+' WHERE design="'+design+'"');
                        }
                        else if(stockType == 'prm'){
                            await connection.execute('UPDATE products1 SET prm = prm - '+approvedQty+' WHERE design="'+design+'"');
                        }
                    }

                    connection.release();
                    
                    // send the notification
                    const notificationResult = await send_notification('Your stock request is '+params.ids[3], params.ids[5], 'Single');
                    
                    if(rows.affectedRows > 0){
                        // return successful update
                        // return Response.json({status: 200, message:'Posted to feed!', id: rows.insertId}, {status: 200})
                        return Response.json({status: 200, message:'Updated!', notification: notificationResult}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) {
                    return Response.json({status: 404, message:'No reservation found!'+error}, {status: 200})
                }
            }
            
            // modify a reservation status & quantity
            else if(params.ids[1] == 'U3.1'){
                try {
                    // get the design of the reservation to update the stock if the reservation is approved
                    const [reservationRows, reservationFields] = await connection.execute('SELECT * from reservations WHERE id="'+params.ids[2]+'"');

                    // We shall use approvedOn field as modified timestamp 
                    const [rows, fields] = await connection.execute('UPDATE reservations SET approvedQty='+params.ids[4]+', modifiedOn = "'+params.ids[6]+'", status="'+params.ids[3]+'" WHERE id="'+params.ids[2]+'"');

                    // if status is 'approved', lets minus the approvedQty from the respective design stock
                    if(params.ids[3] == 'Modified' && reservationRows.length > 0){
                        const design = reservationRows[0].design;
                        const stockType = reservationRows[0].stockType;
                        const approvedQty = Number(params.ids[4]);

                        // update the stock directly based on stockType
                        if(stockType == 'std'){
                            await connection.execute('UPDATE products1 SET std = std - '+approvedQty+' WHERE design="'+design+'"');
                        }
                        else if(stockType == 'prm'){
                            await connection.execute('UPDATE products1 SET prm = prm - '+approvedQty+' WHERE design="'+design+'"');
                        }
                    }
                    // rejected reservation should add the approvedQty back to the stock
                    else if(params.ids[3] == 'Rejected' && reservationRows.length > 0){
                        console.log(reservationRows[0]);
                        
                        const design = reservationRows[0].design;
                        const stockType = reservationRows[0].stockType;
                        const approvedQty = Number(reservationRows[0].approvedQty);
                        // const approvedQty = Number(params.ids[4]);

                        // update the stock directly based on stockType
                        if(stockType == 'std'){
                            await connection.execute('UPDATE products1 SET std = std + '+approvedQty+' WHERE design="'+design+'"');
                        }
                        else if(stockType == 'prm'){
                            await connection.execute('UPDATE products1 SET prm = prm + '+approvedQty+' WHERE design="'+design+'"');
                        }
                    }
                    connection.release();
                    
                    // send the notification
                    const notificationResult = await send_notification('Your stock request is '+params.ids[3], params.ids[5], 'Single');
                    
                    if(rows.affectedRows > 0){
                        // return successful update
                        // return Response.json({status: 200, message:'Posted to feed!', id: rows.insertId}, {status: 200})
                        return Response.json({status: 200, message:'Updated!', notification: notificationResult}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) {
                    return Response.json({status: 404, message:'No reservation found!'+error}, {status: 200})
                }
            }
            
            // create a reservation
            else if(params.ids[1] == 'U4'){
                try {
                    // for the given design and stock type, check if there is sufficient stock available before creating the reservation
                    const [stockRows, stockFields] = await connection.execute('SELECT design, prm, std from products1 WHERE design="'+params.ids[3]+'"');
                    
                    if(stockRows.length == 0){
                        connection.release();
                        return Response.json({status: 201, message:'Design not found!'}, {status: 200})
                    }

                    const stockType = params.ids[5];
                    const requestedQty = Number(params.ids[4]);
                    const availableStock = stockType == 'std' ? stockRows[0].std : stockRows[0].prm;

                    // (Future) if requested quantity is greater than available stock, then place 2 separate reservations - one for available stock with status 'approved' and another for remaining quantity with status 'submitted'. This is to make sure that the available stock is reserved for the user and the remaining quantity is in queue for approval once the stock is available.
                    // if requested quantity is greater than available stock, then place 2 separate reservations - one for available stock with isProduction = 0 and another for remaining quantity with isProduction = 1.
                    if(requestedQty > availableStock){
                        
                        // place the reservation for available stock with status 'submitted'
                        const [rows1, fields] = await connection.execute('INSERT into reservations (userId, design, requestedQty, status, approvedQty, stockType, createdOn, approvedOn, modifiedOn, isProduction) VALUES ("'+params.ids[2]+'", "'+params.ids[3]+'", "'+(requestedQty-availableStock)+'", "Submitted", 0, "'+params.ids[5]+'", "'+params.ids[6]+'", NULL, NULL, 1)');
                    }
                    const [rows, fields] = await connection.execute('INSERT into reservations (userId, design, requestedQty, status, approvedQty, stockType, createdOn, approvedOn, modifiedOn, isProduction) VALUES ("'+params.ids[2]+'", "'+params.ids[3]+'", "'+availableStock+'", "Submitted", 0, "'+params.ids[5]+'", "'+params.ids[6]+'", NULL, NULL, 0)');
                    
                    // const [nrows, nfields] = await connection.execute('SELECT gcm_regId FROM `user` where role IN ("SuperAdmin") or (role="Admin" AND branch = ?)', [ rows1[0].branch ],);
                    const [nrows, nfields] = await connection.execute(`SELECT gcm_regId FROM users where role='SuperAdmin'`);
                    connection.release();
                    
                    // get the gcm_regIds list from the query result
                    var gcmIds = [];
                    for (let index = 0; index < nrows.length; index++) {
                        const element = nrows[index].gcm_regId;
                        
                        if(element.length > 3)
                        gcmIds.push(element); 
                    }

                    // var gcmIds = 
                    // console.log(gcmIds);

                    // send the notification
                    const notificationResult = gcmIds.length > 0 ? await send_notification('New stock request received!', gcmIds, 'Multiple') : null;
                    
                    if(rows.insertId > 0){
                        // return successful update
                        // return Response.json({status: 200, message:'Posted to feed!', id: rows.insertId}, {status: 200})
                        return Response.json({status: 200, message:'Created!', data: rows.insertId, notification: notificationResult}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) {
                    return Response.json({status: 404, message:'No reservation found!'+error}, {status: 200})
                }
            }
            // delete a reservation
            else if(params.ids[1] == 'U5'){
                try {
                    const [rows, fields] = await connection.execute('DELETE from reservations WHERE id="'+params.ids[2]+'"');
                    connection.release();

                    if(rows.affectedRows > 0){
                        return Response.json({status: 200, data: rows, message:'Deleted!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) {
                    return Response.json({status: 404, message:'No reservation found!'+error}, {status: 200})
                }
            }
            else // get the list of reservations ordered by createdOn and by selected status
            if(params.ids[1] == 'report'){
                try {

                        // params.ids[3] will be date range, lets download the reservations modified/created in that date range.


                        // lets update the query to add user table as well to get user details based on the createdOn and modifiedOn fields using the provided date range in params.ids[3]
                        var query = 'SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, u.name as dealer, u.mobile, u.mapTo from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE (DATE(r.createdOn) BETWEEN ? AND ?) AND (DATE(r.modifiedOn) BETWEEN ? AND ?) ORDER BY r.createdOn DESC';
                        var queryCount = 'SELECT count(*) as count from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE (DATE(r.createdOn) BETWEEN ? AND ?) AND (DATE(r.modifiedOn) BETWEEN ? AND ?)';

                        // if status is provided then filter by status as well
                        if(params.ids[2] != 'All'){

                            // expiryDate field is used to store the modified timestamp for the reservation. So we can filter the reservations modified after a particular timestamp using this field.
                            // if(params.ids[2] == 'Modified'){
                            //     query = 'SELECT r.*, p.*, u.name as dealer, u.mobile, u.mapTo from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.expiryDate > r.createdOn ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3];
                            // }
                            // else
                            query = 'SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, u.name as dealer, u.mobile, u.mapTo from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE (DATE(r.createdOn) BETWEEN ? AND ?) AND (DATE(r.modifiedOn) BETWEEN ? AND ?) AND r.status="'+params.ids[2]+'" ORDER BY r.createdOn DESC';
                            queryCount = 'SELECT count(*) as count from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE (DATE(r.createdOn) BETWEEN ? AND ?) AND (DATE(r.modifiedOn) BETWEEN ? AND ?) AND r.status="'+params.ids[2]+'"';
                        }

                    
                    const [rows, fields] = await connection.execute(query, params.ids[3].split(',')[0], params.ids[3].split(',')[1], params.ids[3].split(',')[0], params.ids[3].split(',')[1]);
                    const [countRows, countFields] = await connection.execute(queryCount, params.ids[3].split(',')[0], params.ids[3].split(',')[1], params.ids[3].split(',')[0], params.ids[3].split(',')[1]);
                    connection.release();

                    if(rows.length > 0){
                        return Response.json({status: 200, data: rows, count: countRows[0].count, message:'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No reservation found!'+error}, {status: 200})
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
