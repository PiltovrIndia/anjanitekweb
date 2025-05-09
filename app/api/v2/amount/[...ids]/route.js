import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
const OneSignal = require('onesignal-node')
import dayjs from 'dayjs'
const client = new OneSignal.Client(process.env.ONE_SIGNAL_APPID, process.env.ONE_SIGNAL_APIKEY)

// API for updates to users data
// params used for this API
// key, type, userId
// U1 – get outstanding amount

// U2 – update hostels
// U3 – hostel stats
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();
    
    // current date time for updating
    var currentDate =  dayjs(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss');

    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){
          
          if(params.ids[1] == 'U1'){ // get all invoices for a dealer for calculating outstanding
            
            const [rows, fields] = await connection.execute('SELECT * FROM `invoices` where billTo="'+params.ids[2]+'" and status!="Paid"'); // pending balance
            const [rows1, fields1] = await connection.execute('SELECT * FROM `payments` where id="'+params.ids[2]+'" ORDER BY paymentDate DESC LIMIT 1'); // latest payment
            connection.release();

            return Response.json({status: 200, data: rows, balance: rows1[0], message:'Details found!'}, {status: 200})
          }
          // get invoices of a dealer by Id for the dealer
          else if(params.ids[1] == 'U2'){ // deprecate after the launch 2.0
                try {
                    // let q = 'SELECT * FROM users WHERE collegeId LIKE "%'+params.ids[2]+'%"';
                    // console.log(q);
                    let q = 'SELECT * FROM `invoices` WHERE billTo="'+params.ids[2]+'" ORDER BY invoiceDate ASC LIMIT 5 OFFSET '+params.ids[3];
                    const [rows, fields] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if users is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // users doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No users found!'+error}, {status: 200})
                }
            }
          // get invoices of a dealer by Id for the admins
          else if(params.ids[1] == 'U2.1'){ 
                try {
                    // let q = 'SELECT * FROM users WHERE collegeId LIKE "%'+params.ids[2]+'%"';
                    // console.log(q);
                    let q = 'SELECT * FROM `invoices` WHERE billTo="'+params.ids[2]+'" ORDER BY invoiceDate ASC';
                    const [rows, fields] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if users is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // users doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No users found!'+error}, {status: 200})
                }
            }
          // get invoices of a dealer by Id for the dealer itself
          else if(params.ids[1] == 'U2.2'){ 
                try {
                    // let q = 'SELECT * FROM users WHERE collegeId LIKE "%'+params.ids[2]+'%"';
                    // console.log(q);
                    let q = 'SELECT * FROM `invoices` WHERE billTo="'+params.ids[2]+'" ORDER BY invoiceDate DESC LIMIT 50 OFFSET '+params.ids[3];
                    const [rows, fields] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if users is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // users doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No users found!'+error}, {status: 200})
                }
            }
            // Get the payments done by the dealer by id
          else if(params.ids[1] == 'U3'){
                try {
                    let q = 'SELECT * FROM payments WHERE type="credit" AND id="'+params.ids[2]+'" ORDER BY paymentDate DESC LIMIT 20 OFFSET '+params.ids[3];
                    const [rows, fields] = await connection.execute(q);
                    connection.release();
                    // return successful update

                    // check if users is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})

                    }
                    else {
                        // users doesn't exist in the system
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No users found!'+error.message}, {status: 200})
                }
            }
            // Get the payments done by related dealers in the hirearchy of the selected admin
          else if(params.ids[1] == 'U3.1'){
                
                    // let q = 'SELECT * FROM payments WHERE type="credit" AND id="'+params.ids[2]+'" LIMIT 20 OFFSET '+params.ids[3];
                    // const [rows, fields] = await connection.execute(q);
                    // connection.release();
                    
                    if(params.ids[2] == 'SuperAdmin' || params.ids[2]=='GlobalAdmin'){
                        const [rows2, fields2] = await connection.execute(`SELECT * FROM payments p JOIN dealer d ON p.id=d.dealerId WHERE p.type="credit" ORDER BY p.paymentDate DESC LIMIT 20 OFFSET `+params.ids[4]);
                        connection.release();
                        return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                    }
                    else if(params.ids[2] == 'StateHead'){
                        // get the list of managers or executives mapped to StateHead
                        const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role="SalesManager" AND mapTo="'+params.ids[3]+'"');
                        const [rowss, fieldss] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+params.ids[3]+'"');
                        
                        // get the list of executives mapped to each managers
                        var executives = [];
                        const promises1 = rows.map(async (row) => {
                            const [rows11, fields1] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+row.id+'"');
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
    
                        // get the dealers
                        if(dealers.length > 0){
                            const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                            const [rows2, fields2] = await connection.execute(`SELECT * FROM payments p JOIN dealer d ON p.id=d.dealerId WHERE p.type="credit" AND p.id IN (${dealersList}) ORDER BY p.paymentDate DESC LIMIT 20 OFFSET `+params.ids[4]);
                            connection.release();
                            return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                        }
                        else {
                            connection.release();
                            return Response.json({status: 404, message:'No Data found!'}, {status: 200})
                        }
                        
                    }
                    else if(params.ids[2] == 'SalesManager'){
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
                            const [rows2, fields2] = await connection.execute(`SELECT * FROM payments p JOIN dealer d ON p.id=d.dealerId WHERE p.type="credit" AND p.id IN (${dealersList}) ORDER BY p.paymentDate DESC LIMIT 20 OFFSET `+params.ids[4]);
                            connection.release();
                            return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                        }
                        else {
                            connection.release();
                            return Response.json({status: 404, message:'No Data found!'}, {status: 200})
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
                            const [rows2, fields2] = await connection.execute(`SELECT * FROM payments p JOIN dealer d ON p.id=d.dealerId WHERE p.type="credit" AND p.id IN (${dealersList}) ORDER BY p.paymentDate DESC LIMIT 20 OFFSET `+params.ids[4]);
                            connection.release();
                            return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                        }
                        else {
    
                            connection.release();
                            return Response.json({status: 404, message:'No Data found!'}, {status: 200})
                        }
                    }
            }
            else if(params.ids[1] == 'U4'){ // get all invoices for admin based on the role
                
                const [rows, fields] = await connection.execute('SELECT * FROM invoices ORDER BY invoiceDate ASC LIMIT 400 OFFSET '+params.ids[2]);
                const [rows1, fields1] = await connection.execute('SELECT count(*) as count FROM invoices');
                connection.release();
    
                
                // return Response.json({data:rows}, {status: 200})
                // return Response.json({data:rows},{data1:fields}, {status: 200})
                return Response.json({status: 200, data: rows, total: rows1[0].count, message:'Details found!'}, {status: 200})
              }
            else if(params.ids[1] == 'U4.1'){ // To search invoices for the web listing.
                
                const [rows, fields] = await connection.execute('SELECT * FROM invoices where invoiceNo LIKE "%'+params.ids[2]+'%" LIMIT 20');
                connection.release();
                
                return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})
              }
              else if(params.ids[1] == 'U4.2'){ // get all invoices for admin in web
                
                const [rows, fields] = await connection.execute('SELECT i.*,u.name FROM invoices i JOIN user u ON i.billTo=u.id ORDER BY i.invoiceDate DESC');
                const [rows1, fields1] = await connection.execute('SELECT count(*) as count FROM invoices i JOIN user u ON i.billTo=u.id ORDER BY i.invoiceDate DESC');
                // const [rows1, fields1] = await connection.execute('SELECT count(*) as count FROM invoices');
                connection.release();
    
                
                // return Response.json({data:rows}, {status: 200})
                // return Response.json({data:rows},{data1:fields}, {status: 200})
                return Response.json({status: 200, data: rows, total: rows1[0].count, message:'Details found!'}, {status: 200})
              }
            else if(params.ids[1] == 'U5'){ // get total outstanding of the business for admin
                
                const [rows, fields] = await connection.execute('SELECT * FROM `invoices` where status!="Paid"');
                connection.release();
    
                return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})
            }
            else if(params.ids[1] == 'U6'){ // get all invoices of dealers assigned to a list of executives that are unpaid
            
                if(params.ids[2] == 'SuperAdmin' || params.ids[2]=='GlobalAdmin'){
                    const [rows2, fields2] = await connection.execute(`SELECT * FROM invoices where status!="Paid" ORDER BY expiryDate ASC`);
                    connection.release();
                    return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                }
                else if(params.ids[2] == 'StateHead'){
                    // get the list of managers or executives mapped to StateHead
                    const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role="SalesManager" AND mapTo="'+params.ids[3]+'"');
                    const [rowss, fieldss] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+params.ids[3]+'"');
                    const [rowsss, fieldsss] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+params.ids[3]+'"');
                    
                    // get the list of executives mapped to each managers
                    var executives = [];
                    const promises1 = rows.map(async (row) => {
                        const [rows11, fields1] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+row.id+'"');
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

                    const promises3 = rowsss.map(async (rowss1) => {
                        dealers.push(rowss1.id);
                    });
                    await Promise.all(promises3);

                    // get the dealers
                    if(dealers.length > 0){
                        const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                        const [rows2, fields2] = await connection.execute(`SELECT * FROM invoices where billTo IN (${dealersList}) and status!="Paid" ORDER BY expiryDate ASC`);
                        connection.release();
                        return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                    }
                    else {
                        connection.release();
                        return Response.json({status: 404, message:'No Data found!'}, {status: 200})
                    }
                    
                }
                else if(params.ids[2] == 'SalesManager'){
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
                        const [rows2, fields2] = await connection.execute(`SELECT * FROM invoices where billTo IN (${dealersList}) and status!="Paid" ORDER BY expiryDate ASC`);
                        connection.release();
                        return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                    }
                    else {
                        connection.release();
                        return Response.json({status: 404, message:'No Data found!'}, {status: 200})
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
                        const [rows2, fields2] = await connection.execute(`SELECT * FROM invoices where billTo IN (${dealersList}) and status!="Paid" ORDER BY expiryDate ASC`);
                        connection.release();
                        return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                    }
                    else {

                        connection.release();
                        return Response.json({status: 404, message:'No Data found!'}, {status: 200})
                    }
                }
                else if(params.ids[2] == 'Dealer'){
                    
                    // get the list of dealers mapped to each executive
                    const [rows2, fields2] = await connection.execute(`SELECT * FROM invoices where billTo = "`+params.ids[3]+`" and status!="Paid" ORDER BY invoiceDate ASC`);
                    connection.release();
                    
                    if(rows2.length > 0){
                        return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                    }
                    else {
                        connection.release();
                        return Response.json({status: 404, message:'No Data found!'}, {status: 200})
                    }
                }
                
            
            }
            else if(params.ids[1] == 'U7'){ // Upload invoices in bulk
            
                // bulk upload from the web via excel
                // apply payment to multiple invoices at a time
                // invoiceId, invoiceNo, invoiceType, invoiceDate, PoNo, vehicleNo, transport, LRNo, billTo, shipTo, totalAmount, amountPaid, pending, status, expiryDate, sales
                // Parse the JSON string into an array
                const decodedItems = decodeURIComponent(params.ids[2]);
                const items = JSON.parse(decodedItems);
                
                items.forEach(async (item, index) => {
                    // console.log(`Item ${index}:`, item);
                    await applyInvoicesUpload(params.ids[2], item.invoiceNo.replace('***','/'), item.invoiceType, item.invoiceDate, item.dealerId, item.invoiceAmount, item.amountPaid, item.expiryDate, item.boxes);
                // await applyPayment(item.gst, item.amount, item.type, '', item.transactionId, item.paymentDate, params.ids[3],params.ids[4]);
                });

                // await applyPayment(params.ids[2], params.ids[3], params.ids[4], params.ids[5], params.ids[6], paymentDate, params.ids[8], params.ids[9]);
                return Response.json({status: 200, message:'Success!'}, {status: 200})
            }
            else if(params.ids[1] == 'U8'){ // Update individual invoice by superAdmin
            
                var totalAmount = params.ids[2];
                var amountPaid = params.ids[3];
                var pending = params.ids[4];
                var invoiceId = params.ids[5];
                // var invoiceNo = decodeURIComponent(params.ids[5]);

                // check if amount being paid is more, accordingly we need to update the status
                var status = (amountPaid == 0) ? 'NotPaid' : (totalAmount - amountPaid) > 0 ? 'PartialPaid' : 'Paid';
                
                // const pending = (parseFloat(totalAmount) - parseFloat(amountPaid));
                // console.log(pending);
                

                const q = "UPDATE invoices SET totalAmount= CONVERT("+totalAmount+", DECIMAL(10, 2)), amountPaid=  CONVERT("+amountPaid+", DECIMAL(10, 2)), pending=  CONVERT("+pending+", DECIMAL(10, 2)), status='"+status+"' WHERE invoiceId = "+invoiceId;
                
                const [rows2, fields2] = await connection.execute(q);
                connection.release();
                
                if(rows2.affectedRows > 0){
                    return Response.json({status: 200, message:'Success!'}, {status: 200})
                }
                else {
                    return Response.json({status: 404, message:'No Data found!'}, {status: 200})
                }
            }
            else if(params.ids[1] == 'U9'){ // DELETE SELECTED INVOICE
            
                var invoiceNo = params.ids[2].replace('***','/');

                const q = "DELETE FROM invoices WHERE invoiceNo = '"+invoiceNo+"'";
                
                const [rows2, fields2] = await connection.execute(q);
                
                // await applyPayment(params.ids[2], params.ids[3], params.ids[4], params.ids[5], params.ids[6], paymentDate, params.ids[8], params.ids[9]);
                return Response.json({status: 200, message:'Success!'}, {status: 200})
            }
            else if(params.ids[1] == 'U10'){ // Create Single INVOICE
            
                var invoiceNo = params.ids[2].replace('***','/');
                // var invoiceNo = decodeURIComponent(params.ids[2]);
                var invoiceType = params.ids[3];
                var invoiceDate = params.ids[4];
                var dealerId = params.ids[5];
                var invoiceAmount = params.ids[6];
                var amountPaid = params.ids[7];
                var expiryDate = params.ids[8];
                var adminId = params.ids[9];
                var boxes = params.ids[10];
                                
                await applyInvoicesUpload(adminId, invoiceNo, invoiceType, invoiceDate, dealerId, invoiceAmount, amountPaid, expiryDate, boxes);

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
    
    // current date time for updating
    var currentDate1 =  dayjs(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss');
    
    // get the pool connection to db
    const connection = await pool.getConnection(); 
    
    try {
        await connection.beginTransaction();
        
        // 0. Need to check if there is any credit balance and add it into the amountPaid section
            // add the amountPaid section with credit balance
            // check if the pending is left more and accordingly update the payment status
            // update the balance if there is any leftover after adding into the invoice
        // 1. verify the totalAmount & amountPaid to estimate pending & status for the given invoice
        // 2. update the invoices table with the transaction of selected invoices
        // 3. Message/Notify the dealers and sales executives

        var status = '';
        var pending = 0;
        // 0
        // check if there is any dealer's credit that pending with us
        var [rows12, fields] = await connection.query('SELECT COALESCE( (SELECT ABS(balance) FROM payments WHERE id = "'+dealerId+'" ORDER BY paymentDate DESC LIMIT 1), 0) AS balance');
        var creditBalance = rows12[0].balance;

        // if there is credit, need to make adjustment to the current invoice that is getting uploaded
        if(creditBalance > 0){
            
            // 1
            // check if amount being paid is more, accordingly we need to update the status
            amountPaid = (parseFloat(amountPaid) + parseFloat(creditBalance));
            pending = (parseFloat(totalAmount) - parseFloat(amountPaid));
            if(amountPaid >= totalAmount){
                status = 'Paid';
                pending = 0;
                amountPaid = totalAmount;
            }
            else {
                status = (pending > 0) ? 'PartialPaid' : 'Paid';
            }

            if(pending > 0) {
                creditBalance = 0;
            }
            else {
                creditBalance = (totalAmount - creditBalance);
            }
            
            // round of the credit balance
            creditBalance = parseFloat(creditBalance.toFixed(2));
            

            // update the new balance
            await connection.query('UPDATE payments SET balance = '+creditBalance+' WHERE id = "'+dealerId+'" ORDER BY paymentDate DESC LIMIT 1');

        }
        else {
            // 1
            // check if amount being paid is more, accordingly we need to update the status
            status = (amountPaid == 0) ? 'NotPaid' : (totalAmount - amountPaid) > 0 ? 'PartialPaid' : 'Paid';
            // var status = (totalAmount == amountPaid) ? 'Pending' : (totalAmount - amountPaid) > 0 ? 'PartialPaid' : 'Paid';
            pending = (parseFloat(totalAmount) - parseFloat(amountPaid));
            console.log(pending);
        }

        // 1
        // check if amount being paid is more, accordingly we need to update the status
        // status = (amountPaid == 0) ? 'NotPaid' : (totalAmount - amountPaid) > 0 ? 'PartialPaid' : 'Paid';
        // // var status = (totalAmount == amountPaid) ? 'Pending' : (totalAmount - amountPaid) > 0 ? 'PartialPaid' : 'Paid';
        // pending = (parseFloat(totalAmount) - parseFloat(amountPaid));
        // console.log(pending);
        
        // 2
        const q = 'INSERT INTO invoices (invoiceNo, invoiceType, invoiceDate, PoNo, vehicleNo, transport, LRNo, billTo, shipTo, totalAmount, amountPaid, pending, status, expiryDate, sales) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS DECIMAL(10, 2)),  CAST(? AS DECIMAL(10, 2)),  CAST(? AS DECIMAL(10, 2)), ?, ?, ? )';
        const [payments] = await connection.query(q,[invoiceNo, invoiceType, invoiceDate, '-','-','-','-',dealerId, dealerId, totalAmount, amountPaid, pending, status, expiryDate, boxes]);

        // 3
        const q1 = 'INSERT INTO notifications (sender, receiver, sentAt, message, seen, state) VALUES ( ?, ?, ?, ?, ?, ?)';
        const [rows, fields] = await connection.execute(q1, [ adminId, dealerId, currentDate1, decodeURIComponent('Invoice number '+invoiceNo+' with '+totalAmount+' Amount is added.'), 0, '-' ]);

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