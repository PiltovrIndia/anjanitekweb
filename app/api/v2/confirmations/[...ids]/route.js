import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
const OneSignal = require('onesignal-node')
import dayjs from 'dayjs'
const client = new OneSignal.Client(process.env.ONE_SIGNAL_APPID, process.env.ONE_SIGNAL_APIKEY)

// used for balance confirmations from the dealer
// Admins will create a balance confirmation event

// check if dealer's confirmation is present in the confirmations table for the latest confirmation event raised by the admin
// if present, check the response, if not present ask dealer for confirmation
// if "Yes", then no show
// if "No", then show the confirmation details
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();
    
    // current date time for updating
    var currentDate =  dayjs(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss');

    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){
          
            // get all confirmation events so far
            if(params.ids[1] == 'C1'){
            
                const [rows, fields] = await connection.execute('SELECT * FROM confirmation_event'); 
                connection.release();
                return Response.json({status: 200, data: rows}, {status: 200})
            }
            // get the list of confirmations done for a given event
            else if(params.ids[1] == 'C2'){
                try {
                    const [rows, fields] = await connection.execute('SELECT c.*,u.name,u.id as dealerGST FROM confirmations c JOIN user u ON c.dealer=u.id WHERE c.eventId = '+params.ids[2]);
                    connection.release();
                    
                    if(rows.length > 0){
                        return Response.json({status: 200, data: rows}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No users found!'+error}, {status: 200})
                }
            }
          // get all the confirmations so far for a given dealer
          else if(params.ids[1] == 'C3'){ 
                try {
                    let q = 'SELECT c.*,u.name,u.id as dealerGST FROM confirmations c JOIN user u ON c.dealer = u.id WHERE c.dealer LIKE "%'+params.ids[2]+'%"';
                    const [rows, fields] = await connection.execute(q);
                    connection.release();
                    
                    if(rows.length > 0){
                        return Response.json({status: 200, data: rows}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No users found!'+error}, {status: 200})
                }
            }
          // get the recent confirmation of a dealer
          else if(params.ids[1] == 'C4'){ 
                try {

                    const [latestEvent] = await connection.execute('SELECT * FROM confirmation_event ORDER BY eventDate DESC LIMIT 1');
                    if (latestEvent.length > 0) {
                        const latestEventId = latestEvent[0].id;
                        const query = 'SELECT * FROM confirmations WHERE dealer LIKE ? AND eventId = ?';
                        const [rows, fields] = await connection.execute(query, [`%${params.ids[2]}%`, latestEventId]);
                        connection.release();

                        if (rows.length > 0) {
                            return Response.json({ status: 200, data: rows }, { status: 200 });
                        } else {
                            return Response.json({ status: 201, message: 'No data found!', data: latestEvent[0] }, { status: 200 });
                        }
                    } else {
                        connection.release();
                        return Response.json({ status: 404, message: 'No events found!' }, { status: 200 });
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No users found!'+error}, {status: 200})
                }
            }
            // Add confirmation from a dealer for a given event
          else if(params.ids[1] == 'C5'){
                try {

                    var responseReason = params.ids[8] == '-' ? null : params.ids[8];
                    var media = params.ids[9] == '-' ? null : params.ids[9];

                    const q = 'INSERT INTO confirmations (eventId, anjaniAmount, confirmationOn, dealer, dealerAmount, response, responseReason, comment, media) VALUES ( ?, CAST(? AS DECIMAL(10, 2)), ?, ?, CAST(? AS DECIMAL(10, 2)), ?, ?, ?, ?)';
                    const [rows, fields] = await connection.execute(q,[params.ids[2], params.ids[3], params.ids[4], params.ids[5], params.ids[6], params.ids[7], responseReason, null, media]);
                    connection.release();
                    
                    // if(rows.insertId > 0){
                        return Response.json({status: 200, message: 'Updated your response!'}, {status: 200})
                    // }
                    // else {
                    //     return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    // }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No users found!'+error.message}, {status: 200})
                }
            }
            // create confirmation event by the admin
          else if(params.ids[1] == 'C6'){
                try {

                    const q = 'INSERT INTO confirmation_event (eventDate) VALUES ( ?)';
                    const [rows, fields] = await connection.execute(q,[params.ids[2]]);
                    connection.release();
                    
                    if(rows.affectedRows > 0){
                        return Response.json({status: 200, message: 'Confirmation event created!', id: rows.insertId}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No users found!'+error.message}, {status: 200})
                }
            }
            // add comment by admin to a selected confirmation
          else if(params.ids[1] == 'C7'){
                try {

                    const [rows, fields] = await connection.execute('UPDATE confirmations SET comment = "'+params.ids[3]+'" where id = '+params.ids[2]);
                    connection.release();
                    
                    if(rows.affectedRows > 0){
                        return Response.json({status: 200, message: 'Comment updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No users found!'+error.message}, {status: 200})
                }
            }
            // update response for second time by dealer after admin responded with comment
          else if(params.ids[1] == 'C8'){
                try {

                    const [rows, fields] = await connection.execute('UPDATE confirmations SET response = "Yes" where id = '+params.ids[2]);
                    connection.release();
                    
                    if(rows.affectedRows > 0){
                        return Response.json({status: 200, message: 'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No users found!'+error.message}, {status: 200})
                }
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



  
export async function POST(request, {params}) {
    
    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){
          
          
            if(params.ids[1] == 'U7'){ // Upload invoices in bulk
            
                // invoiceId, invoiceNo, invoiceType, invoiceDate, PoNo, vehicleNo, transport, LRNo, billTo, shipTo, totalAmount, amountPaid, pending, status, expiryDate, sales
                const items = await request.json();
                
                for (const [index, item] of items.entries()){
                    // console.log(`Item ${index}:`, item);
                    await applyInvoicesUpload(params.ids[2], item.invoiceNo.replace('***','/'), item.invoiceType, item.invoiceDate, item.dealerId, item.invoiceAmount, item.amountPaid, item.expiryDate, item.boxes);
                }
                    
                // items.forEach(async (item, index) => {
                //     console.log(`Item ${index}:`, item);
                //     await applyInvoicesUpload(item.invoiceNo.replace('***','/'), item.invoiceType, item.invoiceDate, item.dealerId, item.invoiceAmount, item.amountPaid, item.expiryDate);
                // });

                // await applyPayment(params.ids[2], params.ids[3], params.ids[4], params.ids[5], params.ids[6], paymentDate, params.ids[8], params.ids[9]);
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







  // apply invoices upload one by one
  // provided: invoiceNo, invoiceType, invoiceDate, dealerId, totalAmount, amountPaid, expiryDate
  // Needed for insertion: invoiceId, invoiceNo, invoiceType, invoiceDate, PoNo, vehicleNo, transport, LRNo, billTo, shipTo, totalAmount, amountPaid, pending, status, expiryDate, sales
  async function applyInvoicesUpload(adminId, invoiceNo, invoiceType, invoiceDate, dealerId, totalAmount, amountPaid, expiryDate, boxes) {
    
    // get the pool connection to db
    const connection = await pool.getConnection(); 
    
    try {
        await connection.beginTransaction();
        
        // 1. verify the totalAmount & amountPaid to estimate pending & status for the given invoice
        // 2. update the invoices table with the transaction of selected invoices
        // 3. Message/Notify the dealers and sales executives

        // 1
        // check if amount being paid is more, accordingly we need to update the status
        var status = (amountPaid == 0) ? 'NotPaid' : (totalAmount - amountPaid) > 0 ? 'PartialPaid' : 'Paid';
        // var status = (totalAmount == amountPaid) ? 'Pending' : (totalAmount - amountPaid) > 0 ? 'PartialPaid' : 'Paid';
        const pending = (parseFloat(totalAmount) - parseFloat(amountPaid));
        console.log(pending);
        
        // 2
        const q = 'INSERT INTO invoices (invoiceNo, invoiceType, invoiceDate, PoNo, vehicleNo, transport, LRNo, billTo, shipTo, totalAmount, amountPaid, pending, status, expiryDate, sales) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS DECIMAL(10, 2)),  CAST(? AS DECIMAL(10, 2)),  CAST(? AS DECIMAL(10, 2)), ?, ?, ? )';
        const [payments] = await connection.query(q,[invoiceNo, invoiceType, invoiceDate, '-','-','-','-',dealerId, dealerId, totalAmount, amountPaid, pending, status, expiryDate, boxes]);

        // 3
        const q1 = 'INSERT INTO notifications (sender, receiver, sentAt, message, seen, state) VALUES ( ?, ?, ?, ?, ?, ?)';
        const [rows, fields] = await connection.execute(q1, [ adminId, dealerId, currentDate, decodeURIComponent('Invoice number '+invoiceNo+' with '+totalAmount+' Amount is added'), 0, '-' ]);

        // send the notification
        var notificationResult = await send_notification("Invoice: "+invoiceNo+" updated!", dealerId, 'Single');

        await connection.commit();
    } catch (error) {
        console.log(error);
        await connection.rollback();
        throw error;
    } finally {
        await connection.release();
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
            include_external_user_ids: [playerId],
          };
        } else {
          notification = {
            contents: {
              'en': message,
            },
            include_external_user_ids: playerId,
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