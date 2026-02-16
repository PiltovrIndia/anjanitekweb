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
                    // lets update the query to add user table as well to get user details
                    var query = 'SELECT r.*, p.*, u.name as dealer, u.mobile, u.mapTo from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3];
                    if(params.ids[2] != 'All'){

                        // expiryDate field is used to store the modified timestamp for the reservation. So we can filter the reservations modified after a particular timestamp using this field.
                        // if(params.ids[2] == 'Modified'){
                        //     query = 'SELECT r.*, p.*, u.name as dealer, u.mobile, u.mapTo from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.expiryDate > r.createdOn ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3];
                        // }
                        // else
                        query = 'SELECT r.*, p.*, u.name as dealer, u.mobile, u.mapTo from reservations r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.status="'+params.ids[2]+'" ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3];
                    }
                    const [rows, fields] = await connection.execute(query);
                    connection.release();

                    if(rows.length > 0){
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})
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
                    const [rows, fields] = await connection.execute('SELECT r.*, p.* from reservations r LEFT JOIN products1 p ON r.design = p.design WHERE r.userId="'+params.ids[2]+'" ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3]);
                    connection.release();

                    if(rows.length > 0)
                        return Response.json({status: 200, data: rows}, {status: 200})
                    else 
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No reservation found!'+error}, {status: 200})
                }
            }
            // get the list of reservations by design
            else if(params.ids[1] == 'U2'){
                try {
                    const [rows, fields] = await connection.execute('SELECT r.*, p.* from reservations r LEFT JOIN products1 p ON r.design = p.design WHERE r.design="'+params.ids[2]+'" ORDER BY r.createdOn DESC');
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
                    // We shall use approvedOn field as modified timestamp 
                    const [rows, fields] = await connection.execute('UPDATE reservations SET approvedQty='+params.ids[4]+', approvedOn = "'+params.ids[6]+'", status="'+params.ids[3]+'" WHERE id="'+params.ids[2]+'"');
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
                    // We shall use approvedOn field as modified timestamp 
                    const [rows, fields] = await connection.execute('UPDATE reservations SET approvedQty='+params.ids[4]+', modifiedOn = "'+params.ids[6]+'", status="'+params.ids[3]+'" WHERE id="'+params.ids[2]+'"');
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
                    const [rows, fields] = await connection.execute('INSERT into reservations (userId, design, requestedQty, status, approvedQty, stockType, expiryDate, createdOn, approvedOn) VALUES ("'+params.ids[2]+'", "'+params.ids[3]+'", "'+params.ids[4]+'", "Submitted", 0, "'+params.ids[5]+'", "'+params.ids[6]+'", "'+params.ids[7]+'", NULL)');
                    
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
