import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
import dayjs from 'dayjs'
import nodemailer from 'nodemailer';
const OneSignal = require('onesignal-node')

const client = new OneSignal.Client(process.env.ONE_SIGNAL_APPID, process.env.ONE_SIGNAL_APIKEY)

// params used for this API
// Keyverify,stage,requestId,name,collegeId,role,status,updatedAt,comment, playerId,type,consentBy

// type –– Single/Bulk update

// stage is useful to define which stage of the request is
// Stage1 –– To be Approved –– get the playerId of student for sending the status update for Stage 1 and 2
// Stage2 –– To be Issed –– get the consentBy as well
// Stage3 –– To be CheckOut –– get the playerId of student for check and checkIn to send notification
// Stage4 –– To be CheckIn
// Stage4.5 –– To be CheckIn *** LATE RETURN
// Stage1.5 –– To be Rejected and move to closed –– by updating isOpen = 0
// Stage0.5 –– To be Canceled –– Move the request to closed by updating isOpen = 0 and status to Canceled – This can be done by Student or Admin (Add extra comment to mention who did it)

// Stage33 –– This is the consolidated stage to verify at security
// Stage331 –– This is the consolidated stage to verify at security – Correct one

export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    // check for the comment string incase if its empty
    let comment = '';
    if(params.ids[8] == '-'){
        comment = '-';
    }
    else {
        comment = decodeURIComponent(params.ids[8])+'\n';
        // comment = '\n'+params.ids[8];
    }

    // current date time for updating
    var currentDate =  dayjs(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss');

    const paymentDate = new Date(params.ids[6]);
    
    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){

          // is it a single operation of bulk from web
          if(params.ids[1] == 'mobile'){

            // apply payment to multiple invoices at a time
            await applyPayment(params.ids[2], params.ids[3], params.ids[4], params.ids[5], params.ids[6], paymentDate, params.ids[8], params.ids[9]);
            return Response.json({status: 200, message:'Success!'}, {status: 200})
          }
          else {

            // apply payment to multiple invoices at a time
            // userId, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular
            // Parse the JSON string into an array
            const decodedItems = decodeURIComponent(params.ids[2]);
            const items = JSON.parse(decodedItems);
            
            items.forEach(async (item, index) => {
              console.log(`Item ${index}:`, item);
              await applyPayment(item.dealerId, item.amount, item.type, '', item.transactionId, item.paymentDate, params.ids[3],params.ids[4]);
            });

            // await applyPayment(params.ids[2], params.ids[3], params.ids[4], params.ids[5], params.ids[6], paymentDate, params.ids[8], params.ids[9]);
            return Response.json({status: 200, message:'Success!'}, {status: 200})
          }
        }
        else {
            // wrong secret key
            return Response.json({status: 401, message:'Unauthorized'}, {status: 200})
        }
    }
    catch (error) {
        console.error('Payment application failed:', error);
        return Response.json({status: 500, message:'Facing issues. Please try again!'+error.message}, {status: 200})
        
    }
  }


  // apply payment to the invoices one by one
  // userId, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular
  async function applyPayment(userId, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular) {
    
    var amount = paymentAmount;

    // get the pool connection to db
    const connection = await pool.getConnection(); 

    // current date time for updating
    var currentDate =  dayjs(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss');
    
    try {
        await connection.beginTransaction();
        
        // 1. get the pending invoices from table for the given dealer
        // 2. update the invoices table with pending amount for the selected invoices
        // 3. update the payments table with the transaction of selected invoices

        // 1
        const [invoices] = await connection.query('SELECT invoiceNo, pending FROM invoices WHERE billTo = "'+userId+'" AND pending > 0 ORDER BY invoiceDate ASC',[]);

        // 2
        // collect the invoices list for updating in payments table
        var invcs = '';
        for (const invoice of invoices) {
        
            if (paymentAmount <= 0) break;

            invcs += invoice.invoiceNo; // get the invoice which is getting updated

            const amountToApply = Math.min(paymentAmount, invoice.pending); // get the minimum amount to apply

            // check if amount being paid is more, accordingly we need to update the status
            let newStatus = (invoice.pending - amountToApply) > 0 ? 'PartialPaid' : 'Paid';

            await connection.query(
                `UPDATE invoices SET 
                    amountPaid = amountPaid + ?, 
                    pending = pending - ?,
                    status = ?
                    WHERE invoiceNo = ?`,
                [amountToApply, amountToApply, newStatus, invoice.invoiceNo]
            );
            paymentAmount -= amountToApply;
            
            if(paymentAmount > 0)  invcs += ','; // add , for next invoice in the list

        }

        // 3
        const [balance] = await connection.query('SELECT balance FROM payments WHERE userId = "'+userId+'" ORDER BY paymentDate DESC LIMIT 1',[]);
        // console.log(balance[0].balance);
        // console.log(paymentDate);

        // 4
        var bal = 0;
        if(type == 'credit'){
            bal = parseFloat(balance[0].balance) - parseFloat(amount);
        }
        else {
            bal = parseFloat(balance[0].balance) + parseFloat(amount);
        }
        const q = 'INSERT INTO payments (amount, type, userId, invoiceNo, transactionId, paymentDate, adminId, particular, balance) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS DECIMAL(10, 2)) )';
        const [payments] = await connection.query(q,[amount, type, userId,invcs,transactionId,paymentDate,adminId, particular, bal]);

        

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        await connection.release();
    }
}


    // function to call the SMS API
    async function sendSMS(type, name, number, date){

        var query = '';

        if(type == 'S3'){
            query = "http://webprossms.webprosindia.com/submitsms.jsp?user=SVCEWB&key=c280f55d6bXX&mobile="+number+"&message=Dear Parent, your ward "+name+", has left the campus for outing at "+date+". SVECWB Hostels&senderid=SVECWB&accusage=1&entityid=1001168809218467265&tempid=1007626043853520503";
        }
        else if(type == 'S4'){
            query = "http://webprossms.webprosindia.com/submitsms.jsp?user=SVCEWB&key=c280f55d6bXX&mobile="+number+"&message=Dear Parent, your ward "+name+" has returned to the campus from outing at "+date+". SVECWB Hostels&senderid=SVECWB&accusage=1&entityid=1001168809218467265&tempid=1007892539567152714";
        }
        else if(type == 'S4.5'){
            query = "http://webprossms.webprosindia.com/submitsms.jsp?user=SVCEWB&key=c280f55d6bXX&mobile="+number+"&message=Dear Parent, your ward "+name+" has not returned to the campus after her outing from "+date+". SVECWB Hostels&senderid=SVECWB&accusage=1&entityid=1001168809218467265&tempid=1007149047352803219";
        }
        const result  = await fetch(query, {
              method: "POST",
              headers: {
                  "Content-Type": "application/json",
                  Accept: "application/json",
              },
            });
              const queryResult = await result.text() // get data
            //   console.log(queryResult);
      }
  
  // send the notification using onesignal.
  // use the playerIds of the users.
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

//   async function send_notification(message, playerId, type){
    
//     // send notification only if there is playerId for the user
//     if(playerId.length > 0){
//         var playerIds = []
//         playerIds.push(playerId)

//         var notification;
//         // notification object
//         if(type == 'Single'){
//             notification = {
//                 contents: {
//                     'en' : message,
//                 },
//                 // include_player_ids: ['playerId'],
//                 include_player_ids: [playerId]
//             };
//         }
//         else {
//             notification = {
                
//             contents: {
//                 'en' : message,
//             },
//             include_player_ids: playerIds,
//         };
//         }

//         await client.createNotification(notification).then(res => {
//             console.log(res);
//         }).catch(e => {
//             console.log(e);
//         })
        
        
//     }
//   }