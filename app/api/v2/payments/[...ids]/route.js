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

    const paymentDate = new Date(params.ids[7]);
    
    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){

          // is it a single operation of bulk from web
          if(params.ids[1] == 'mobile'){
            // apply payment to multiple invoices at a time
            await applyPayment(params.ids[2], params.ids[3], params.ids[4], decodeURIComponent(params.ids[5]), params.ids[6], paymentDate, params.ids[8], params.ids[9]);
            return Response.json({status: 200, message:'Success!'}, {status: 200})
          }
          if(params.ids[1] == 'websingle'){
            // apply payment to multiple invoices at a time
            // applyPayment(id, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular)
            await applyPayment(params.ids[2], params.ids[3], params.ids[4], params.ids[5].replace('***','/'), params.ids[6], paymentDate, params.ids[8],params.ids[9]);
            return Response.json({status: 200, message:'Success!'}, {status: 200})
          }
          if(params.ids[1] == 'addcredit'){
            
            // check if there is any pending payment request from the dealer that admin is approving
            if(params.ids[9] == '-'){
              
              // get the previous balance value of a dealer if the balance value is negative
              const [balanceResult] = await connection.query('SELECT CAST(balance AS DECIMAL(10, 2)) as bal FROM payments WHERE id="'+params.ids[4]+'" AND type="credit" AND balance < 0 ORDER BY paymentDate DESC LIMIT 1');
              let newbal = parseFloat(-params.ids[8]) + parseFloat(balanceResult[0]?.bal || 0);
              
              // Add the credit to the dealer
              const q = 'INSERT INTO payments (amount, amounts, type, id, invoiceNo, transactionId, paymentDate, adminId, particular, balance) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS DECIMAL(10, 2)) )';
              const [payments] = await connection.query(q,[params.ids[2], '', params.ids[3], params.ids[4],'-',params.ids[5].replace('***','/'),params.ids[6], params.ids[7],'-', newbal]);
              connection.release();
              
              if(payments.insertId > 0){
                return Response.json({status: 200, message:'Updated!', id: payments.insertId}, {status: 200})
              }
              else {
                return Response.json({status: 201, message:'No data found!'}, {status: 200})
              }

            }
            else {
              // update the payment request with the admin approval
              
              // Add the credit to the dealer
              const [payments] = await connection.query('UPDATE payments SET adminId="'+params.ids[7]+'" WHERE paymentId='+params.ids[9]);
              connection.release();
              
              if(payments.affectedRows > 0){
                return Response.json({status: 200, message:'Updated!', id: payments.insertId}, {status: 200})
              }
              else {
                return Response.json({status: 201, message:'No data found!'}, {status: 200})
              }

            }

            
          }
          if(params.ids[1] == 'paymentrequest'){
            // dealer can place a payment request for approval by admin
            // paymentrequest, amount, 'credit', id, transactionId, paymentDate, particular, bal
            const q = 'INSERT INTO payments (amount, amounts, type, id, invoiceNo, transactionId, paymentDate, adminId, particular, balance) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS DECIMAL(10, 2)) )';
            const [payments] = await connection.query(q,[params.ids[2], '', params.ids[3], params.ids[4],'-',params.ids[5].replace('***','/'),params.ids[6],'-', params.ids[7], params.ids[8]]);
            connection.release();

            if(payments.insertId > 0){
                return Response.json({status: 200, message:'Updated!', id: payments.insertId}, {status: 200})
            }
            else {
                return Response.json({status: 201, message:'No data found!'}, {status: 200})
            }
          }
          if(params.ids[1] == 'getpaymentrequest'){
            // dealer can place a payment request for approval by admin
            // paymentrequest, amount, 'credit', id, transactionId, paymentDate, particular, bal
            const q = 'SELECT * FROM payments WHERE id=? AND adminId="-"';
            const [payments] = await connection.query(q,[params.ids[2]]);
            connection.release();

            // return Response.json({status: 200, message:'Success!'}, {status: 200})
            if(payments.length > 0){
                return Response.json({status: 200, message:'Found!', data: payments}, {status: 200})
            }
            else {
                return Response.json({status: 201, message:'No data found!'}, {status: 200})
            }
          }
          
          // if(params.ids[1] == 'webbulk'){
            
          //   await applyPaymentToSelectedInvoices(params.ids[2], params.ids[3], params.ids[4], JSON.parse(decodeURIComponent(params.ids[5])), decodeURIComponent(params.ids[6]), new Date(params.ids[7]), params.ids[8],params.ids[9]);
          //   return Response.json({status: 200, message:'Success!'}, {status: 200})
          // }
          else {
            // bulk upload from the web via excel
            // apply payment to multiple invoices at a time
            // id, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular
            // Parse the JSON string into an array
            const decodedItems = decodeURIComponent(params.ids[2]);
            const items = JSON.parse(decodedItems);
            
            items.forEach(async (item, index) => {
              // console.log(`Item ${index}:`, item);
              await applyPayment(item.gst, item.amount, item.type, item.invoiceNo, item.transactionId, item.paymentDate, params.ids[3],params.ids[4]);
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




  
export async function POST(request, {params}) {
    
  try{
      // authorize secret key
      if(await Keyverify(params.ids[0])){

        if(params.ids[1] == 'webbulk'){ // Upload invoices in bulk
          
              const transactionId = decodeURIComponent(params.ids[5]).replace('***','/');
          
              // invoiceId, invoiceNo, invoiceType, invoiceDate, PoNo, vehicleNo, transport, LRNo, billTo, shipTo, totalAmount, amountPaid, pending, status, expiryDate, sales
              const items = await request.json();
              
              await applyPaymentToSelectedInvoices(params.ids[2], params.ids[3], params.ids[4], items, transactionId, new Date(params.ids[6]), params.ids[7],params.ids[8]);
              
              return Response.json({status: 200, message:'Success!'}, {status: 200})
              
          }
          else if(params.ids[1] == 'web'){
            // bulk upload from the web via excel
            // apply payment to multiple invoices at a time
            // id, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular
            // Parse the JSON string into an array
            // const decodedItems = decodeURIComponent(params.ids[2]);
            // const items = JSON.parse(decodedItems);
            const items = await request.json();
            
            items.forEach(async (item, index) => {
              // console.log(`Item ${index}:`, item);
              await applyPayment(item.gst, item.amount, item.type, item.invoiceNo.replace('***','/'), item.transactionId, item.paymentDate, params.ids[2],params.ids[3]);
            });

            return Response.json({status: 200, message:'Success!'}, {status: 200})
          }
          else if(params.ids[1] == 'delete'){
            
            const paymentItem = await request.json();
            
            // items.forEach(async (item, index) => {
              console.log(`Item :`, paymentItem.invoiceNo);
              await deletePayment(paymentItem);
            // });

            return Response.json({status: 200, message:'Success!'}, {status: 200})
          }
          else if(params.ids[1] == 'delete_receipt'){
            
            const paymentItem = await request.json();
            
            // items.forEach(async (item, index) => {
              console.log(`Item :`, paymentItem.invoiceNo);
              await deletePaymentReceipt(paymentItem);
            // });

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





  // apply payment to SELECTED invoices one by one
  // id, paymentAmount, invoiceList, transactionId, paymentDate, adminId, particular
  async function applyPaymentToSelectedInvoices(id, paymentAmount, type, invoicesList, transactionId, paymentDate, adminId, particular) {
    
    var amount = paymentAmount;
    var appliedAmounts = invoicesList.map(invoice => invoice.appliedAmount).join(',');

    // get the pool connection to db
    const connection = await pool.getConnection(); 

    try {
        await connection.beginTransaction();
        
        // 1. get the selected invoices provided
        // 1.1 get the pending balance from invoices table
        // 2. update the invoices table with pending amount for the selected invoices
        // 3. check if the payment update is for the uploaded receipt or manual by admin
            // update or insert the payment into the table with the transaction of selected invoices
        // 4. Send notification to Dealer(s)
        // 5. Include the notification in the chat history and SENT BY will be the respective executive.

        // 1.1 get the pending balance from invoices table
        const [balance] = await connection.query('SELECT CAST(SUM(pending) AS DECIMAL(10, 2)) as bal FROM invoices WHERE billTo = "'+id+'" AND status!="Paid"',[]);
        // console.log(balance);
        
          var bal = 0;
          bal = parseFloat(balance.length > 0 ? balance[0].bal : 0) - parseFloat(amount);

          // if bal is negative, then dealer is paying more than pending and add it as credit
          // if bal is positive, make it zero as dealer is paying less than pending
          // bal = (bal >= 0) ? 0 : abs(bal);

        // 2
        // collect the invoices list for updating in payments table
        var invcs = '';
        // var appliedAmounts = '';

        invoicesList.forEach(async (invoice, index) => {
          // console.log(`Item ${index}:`, invoice.invoiceNo.replace('***','/'));
          
          if(invcs.length > 1){
            invcs = invcs + "," + invoice.invoiceNo.replace('***','/'); // get the invoice which is getting updated
          }
          else {
            invcs = invoice.invoiceNo.replace('***','/')
          }
          
          // update the invoices table
          await connection.query(
                `UPDATE invoices SET 
                    amountPaid = amountPaid + ?, 
                    pending = pending - ?,
                    status = ?
                    WHERE invoiceNo = ?`,
                [invoice.appliedAmount, invoice.appliedAmount, invoice.status, invoice.invoiceNo.replace('***','/')]
            );
            
            // add applied amounts for each invoice in sequence
            // if(appliedAmounts.length > 0){
            //   appliedAmounts = appliedAmounts + "," + invoice.appliedAmount;
            // }
            // else {
            //   appliedAmounts = invoice.appliedAmount; // get the sequence of amounts applied to sequence of invoices
            // }
        });

        // 3
        // update the payments table
        // const [balance] = await connection.query('SELECT balance FROM payments WHERE id = "'+id+'" ORDER BY paymentDate DESC LIMIT 1',[]);
        // const [balance] = await connection.query('SELECT CAST(SUM(pending) AS DECIMAL(10, 2)) as bal FROM invoices WHERE billTo = "'+id+'" AND status!="Paid"',[]);
        // console.log(balance);
        
        //   var bal = 0;
        //   bal = parseFloat(balance.length > 0 ? balance[0].bal : 0) - parseFloat(amount);
          // if(type == 'credit' && balance.length > 0){
          //     bal = parseFloat(balance.length > 0 ? balance[0].balance : 0) - parseFloat(amount);
          // }
          // else {
          //     bal = parseFloat(balance.length > 0 ? balance[0].balance : 0) + parseFloat(amount);
          // }
        
          // 3. check if the payment update is for the uploaded receipt or manual by admin
          if(particular.split(',')[1] == '-'){
          
            const q = 'INSERT INTO payments (amount, amounts, type, id, invoiceNo, transactionId, paymentDate, adminId, particular, balance) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS DECIMAL(10, 2)) )';
            const [payments] = await connection.query(q,[amount, appliedAmounts, type, id,invcs,transactionId,paymentDate,adminId, particular.split(',')[1], bal]);
    
          } 
          else {
          
            const q = 'UPDATE payments SET amounts=?,invoiceNo=?, paymentDate=?, adminId=?, balance=? WHERE paymentId=?';
            const [payments] = await connection.query(q,[appliedAmounts,invcs, paymentDate, adminId, bal, particular.split(',')[1]]);
    
          }

        // 4
        // send notification to Dealer(s)
        var msg = '';
        if(particular.split(',')[0] == 'Bank'){
          msg = "Payment of ₹"+amount+" is updated with Transaction ID: "+transactionId;
        }
        else {
          msg = "Payment of ₹"+amount+" is updated due to "+transactionId;
        }

        // get the gcm_regIds of dealer & hierarchy to notify
        const [rowsD, fieldsD] = await connection.execute('SELECT name, mapTo, relatedTo FROM user WHERE role="Dealer" AND id="'+id+'"');

        // var gcm_regIds_dealer = [];
        // gcm_regIds_dealer.push(id);
        var gcm_regIds = [];
        rowsD[0].relatedTo.split(',').map((item) => {
          gcm_regIds.push(item);
        });

        await send_notification(msg, id, 'Single');
        await send_notification('Payment of ₹'+amount+' is updated for '+rowsD[0].name, gcm_regIds, 'Multiple');

            // var query = 'SELECT u.name, u.mapTo, u.gcm_regId, (SELECT gcm_regId from user where id=u.mapTo) as mappedTo FROM user u where u.id="'+id+'"';
            // const [nrows, nfields] = await connection.execute(query);
            
            // // get the gcm_regIds list from the query result
            // var gcmIds = [];
            // for (let index = 0; index < nrows.length; index++) {
            //   const element = nrows[index].gcm_regId;
            //   const element1 = nrows[index].mappedTo;
            //   const dealer_name = nrows[index].name;
              
            //   if(element.length > 3){
            //     gcmIds.push(element); 
            //     // send notification to the dealer
            //     const notificationResult = await send_notification(msg, element, 'Single');
            //   }
            //   if(element1.length > 3){
            //     gcmIds.push(element1); 
            //     // send notification to the executive
            //     const notificationResult = await send_notification('Payment of ₹'+amount+' is updated for '+dealer_name, element1, 'Single');
            //   }
            // }

        // 5
        // Include in the chat history
        // create query for insert
        const q1 = 'INSERT INTO notifications (sender, receiver, sentAt, message, seen, state) VALUES ( ?, ?, ?, ?, ?, ?)';
        const [rows, fields] = await connection.execute(q1, [ rowsD[0].mapTo, id, paymentDate, decodeURIComponent(msg), 0, '-' ]);
        connection.release();

        await connection.commit();
    } catch (error) {
      console.log(error);
      
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
}


  // apply payment to the invoices one by one
  // id, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular
  async function applyPayment(id, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular) {
    
    var amount = paymentAmount;
    var appliedAmounts = invoicesList.map(invoice => invoice.appliedAmount).join(',');

    // get the pool connection to db
    const connection = await pool.getConnection(); 

    // current date time for updating
    var currentDate =  dayjs(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss');
    
    try {
        await connection.beginTransaction();
        
        // 1. get the pending invoices from table for the given dealer
        // 2. update the invoices table with pending amount for the selected invoices
        // 3. update the payments table with the transaction of selected invoices
        // 4. Send notification to Dealer(s)
        // 5. Include the notification in the chat history and SENT BY will be the respective executive.

        // 1
        var query1;
        if(invoiceNo.length > 3){
          query1 = 'SELECT invoiceNo, pending FROM invoices WHERE invoiceNo = "'+invoiceNo+'" AND pending > 0 ORDER BY invoiceDate ASC';
          }
        else{
          query1 = 'SELECT invoiceNo, pending FROM invoices WHERE billTo = "'+id+'" AND pending > 0 ORDER BY invoiceDate ASC';
        }

        const [invoices] = await connection.query(query1,[]);


        // 1.1 get the pending balance from invoices table
        const [balance] = await connection.query('SELECT CAST(SUM(pending) AS DECIMAL(10, 2)) as bal FROM invoices WHERE billTo = "'+id+'" AND status!="Paid"',[]);
        console.log(balance);
        
          var bal = 0;
          bal = parseFloat(balance.length > 0 ? balance[0].bal : 0) - parseFloat(amount);

        // 2
        // collect the invoices list for updating in payments table
        var invcs = '';
        // var appliedAmounts = '';
        for (const invoice of invoices) {
        
            if (paymentAmount <= 0) break;

            invcs += invoice.invoiceNo; // get the invoice which is getting updated

            if(invcs.length > 1){
              invcs = invcs + "," + invoice.invoiceNo; // add , for next invoice in the list
            }
            else{
              invcs = invoice.invoiceNo;
            }

            const amountToApply = Math.min(paymentAmount, invoice.pending); // get the minimum amount to apply

            // check if amount being paid is more, accordingly we need to update the status
            let newStatus = (amountToApply == 0) ? 'NotPaid' : (invoice.pending - amountToApply) > 0 ? 'PartialPaid' : 'Paid';

            await connection.query(
                `UPDATE invoices SET 
                    amountPaid = amountPaid + ?, 
                    pending = pending - ?,
                    status = ?
                    WHERE invoiceNo = ?`,
                [amountToApply, amountToApply, newStatus, invoice.invoiceNo]
            );
            paymentAmount -= amountToApply;
            
            // if(paymentAmount > 0)  invcs += ','; // add , for next invoice in the list
            // add applied amounts for each invoice in sequence
            // if(appliedAmounts.length > 0){
            //   appliedAmounts = appliedAmounts + "," + amountToApply;
            // }
            // else {
            //   appliedAmounts = amountToApply; // get the sequence of amounts applied to sequence of invoices
            // }

        }

        // 3
        // const [balance] = await connection.query('SELECT balance FROM payments WHERE id = "'+id+'" ORDER BY paymentDate DESC LIMIT 1',[]);
        // console.log(balance);
        // console.log("plpl"+balance[0].balance);
        // console.log(paymentDate);

        // var bal = 0;
        // if(type == 'credit'){
        //     bal = parseFloat(balance.length > 0 ? balance[0].balance : 0) - parseFloat(amount);
        // }
        // else {
        //     bal = parseFloat(balance.length > 0 ? balance[0].balance : 0) + parseFloat(amount);
        // }
        // const q = 'INSERT INTO payments (amount, amounts, type, id, invoiceNo, transactionId, paymentDate, adminId, particular, balance) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS DECIMAL(10, 2)) )';
        // const [payments] = await connection.query(q,[amount, appliedAmounts, type, id,invcs,transactionId,paymentDate,adminId, particular, bal]);

        // 3. check if the payment update is for the uploaded receipt or manual by admin
        if(particular == '-'){
          
          const q = 'INSERT INTO payments (amount, amounts, type, id, invoiceNo, transactionId, paymentDate, adminId, particular, balance) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS DECIMAL(10, 2)) )';
          const [payments] = await connection.query(q,[amount, appliedAmounts, type, id,invcs,transactionId,paymentDate,adminId, particular, bal]);
  
        } 
        else {
        
          const q = 'UPDATE payments SET amounts=?,invoiceNo=?, adminId=?, balance=? WHERE paymentId=?';
          const [payments] = await connection.query(q,[appliedAmounts,invcs,adminId, bal, particular]);
  
        }

        // 4
        // send notification to Dealer(s)
        // send notification to the dealer and his hierarchy
        // const [rowsD, fieldsD] = await connection.execute('SELECT name, relatedTo FROM user WHERE role="Dealer" AND id="'+dealerId+'"');

        // var gcm_regIds = [];
        // rowsD[0].relatedTo.split(',').map((item) => {
        //   gcm_regIds.push(item);
        // });

        // get the gcm_regIds of Students to notify
            // Split the branches string into an array
            var query = 'SELECT u.name, u.mapTo, u.gcm_regId, (SELECT gcm_regId from user where id=u.mapTo)  as mappedTo FROM user u where u.id="'+id+'" AND CHAR_LENGTH(u.gcm_regId) > 3';
            const [nrows, nfields] = await connection.execute(query);
            
            // console.log(query);
            // console.log(nrows);
            
            // get the gcm_regIds list from the query result
            var gcmIds = [];
            for (let index = 0; index < nrows.length; index++) {
              const element = nrows[index].gcm_regId;
              const element1 = nrows[index].mappedTo;
              const dealer_name = nrows[index].name;
            
              if(element.length > 3){
                gcmIds.push(element); 
                // send notification to the dealer
                const notificationResult = await send_notification('Payment of ₹'+amount+' is updated for '+id, element, 'Single');
              }
              if(element1.length > 3){
                gcmIds.push(element1); 
                // send notification to the executive
                const notificationResult = await send_notification('Payment of ₹'+amount+' is updated for '+dealer_name, element1, 'Single');
              }
            }
                
        // 5
        // Include in the chat history
        // create query for insert
        const q1 = 'INSERT INTO notifications (sender, receiver, sentAt, message, seen, state) VALUES ( ?, ?, ?, ?, ?, ?)';
        const [rows, fields] = await connection.execute(q1, [ nrows[0].mapTo, id, paymentDate, decodeURIComponent('Payment of ₹'+amount+' is updated'), 0, '-' ]);
        connection.release();

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
  }


  // delete payment from the invoices one by one
  // id, paymentAmount, type, invoiceNo, transactionId, paymentDate, adminId, particular
  async function deletePayment(paymentItem) {
    
    // get the pool connection to db
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // 1. get the pending invoices and amounts to each invoice for the given payment
        // 2. update (add) the invoices table with pending amount for the selected invoices
        // 3. delete the payment from payments table
        // 4. Delete the notification in the chat history and SENT BY will be the respective executive.

        // 1
        const invoices = paymentItem.invoiceNo.split(','); // await connection.query(query1,[]);
        const amounts = paymentItem.amounts.split(','); // await connection.query(query1,[]);


        // 2
        // collect the invoices list for updating in payments table
        for (let index = 0; index < invoices.length; index++) {
          const invoice = invoices[index];
          const amount = parseFloat(amounts[index]);

          const [selectedInvoice] = await connection.query('SELECT * FROM invoices WHERE invoiceNo = "'+invoice+'" ORDER BY invoiceDate DESC LIMIT 1',[]);
          
            if (amount <= 0) break;

            // check if amount being paid is more, accordingly we need to update the status
            const updatedPending = selectedInvoice[0].pending + amount;
            
            // get the updated status
            let newStatus = (updatedPending == selectedInvoice[0].totalAmount) ? 'NotPaid' : 'PartialPaid';

            await connection.query(`UPDATE invoices SET amountPaid = amountPaid - `+amount+`, pending = pending + `+amount+`, status = "`+newStatus+`" WHERE invoiceNo = "`+invoice+`"`, []);
            
        }

        // 3
        // delete from payments list
        const del = await connection.query('DELETE FROM payments WHERE paymentId = '+paymentItem.paymentId,[]);

        // 4
        // Delete in the chat history
        // create query for delete
        const q11 = await connection.query('DELETE FROM notifications WHERE receiver = "'+paymentItem.id+'" and sentAt = "'+dayjs(new Date(paymentItem.paymentDate)).format('YYYY-MM-DD HH:mm:ss')+'"',[]);
        // const q1 = 'INSERT INTO notifications (sender, receiver, sentAt, message, seen, state) VALUES ( ?, ?, ?, ?, ?, ?)';
        // const [rows, fields] = await connection.execute(q11, [ paymentItem.id, dayjs(new Date(paymentItem.paymentDate)).format('YYYY-MM-DD HH:mm:ss')]);
        connection.release();

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
  }
  async function deletePaymentReceipt(paymentItem) {
    
    // get the pool connection to db
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();
        
        // // 1. get the pending invoices and amounts to each invoice for the given payment
        // // 2. update (add) the invoices table with pending amount for the selected invoices
        // // 3. delete the payment from payments table
        // // 4. Delete the notification in the chat history and SENT BY will be the respective executive.

        // // 1
        // const invoices = paymentItem.invoiceNo.split(','); // await connection.query(query1,[]);
        // const amounts = paymentItem.amounts.split(','); // await connection.query(query1,[]);


        // // 2
        // // collect the invoices list for updating in payments table
        // for (let index = 0; index < invoices.length; index++) {
        //   const invoice = invoices[index];
        //   const amount = parseFloat(amounts[index]);

        //   const [selectedInvoice] = await connection.query('SELECT * FROM invoices WHERE invoiceNo = "'+invoice+'" ORDER BY invoiceDate DESC LIMIT 1',[]);
          
        //     if (amount <= 0) break;

        //     // check if amount being paid is more, accordingly we need to update the status
        //     const updatedPending = selectedInvoice[0].pending + amount;
            
        //     // get the updated status
        //     let newStatus = (updatedPending == selectedInvoice[0].totalAmount) ? 'NotPaid' : 'PartialPaid';

        //     await connection.query(`UPDATE invoices SET amountPaid = amountPaid - `+amount+`, pending = pending + `+amount+`, status = "`+newStatus+`" WHERE invoiceNo = "`+invoice+`"`, []);
            
        // }

        // 3
        // delete from payments list
        const del = await connection.query('DELETE FROM payments WHERE paymentId = '+paymentItem.paymentId,[]);

        // 4
        // Delete in the chat history
        // create query for delete
        // const q11 = await connection.query('DELETE FROM notifications WHERE receiver = "'+paymentItem.id+'" and sentAt = "'+dayjs(new Date(paymentItem.paymentDate)).format('YYYY-MM-DD HH:mm:ss')+'"',[]);
        // const q1 = 'INSERT INTO notifications (sender, receiver, sentAt, message, seen, state) VALUES ( ?, ?, ?, ?, ?, ?)';
        // const [rows, fields] = await connection.execute(q11, [ paymentItem.id, dayjs(new Date(paymentItem.paymentDate)).format('YYYY-MM-DD HH:mm:ss')]);
        connection.release();

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
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
            include_external_user_ids: [playerId],
          };
        } else {
          notification = {
            contents: {
              'en': message,
            },
            include_external_user_ids: playerIds,
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