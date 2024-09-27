import pool from '../../../db'
import { Keyverify } from '../../../secretverify';

// API for updates to users data
// params used for this API
// key, type, userId
// U1 – get outstanding amount

// U2 – update hostels
// U3 – hostel stats
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){
          
          if(params.ids[1] == 'U1'){ // get all invoices for a dealer for calculating outstanding
            
            const [rows, fields] = await connection.execute('SELECT * FROM `invoices` where billTo="'+params.ids[2]+'" and status!="Paid"');
            connection.release();

            return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})
          }
          // get invoices of a dealer by Id for the dealer
          else if(params.ids[1] == 'U2'){ 
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
            // Get the payments done by the dealer by id
          else if(params.ids[1] == 'U3'){
                try {
                    let q = 'SELECT * FROM payments WHERE type="credit" AND id="'+params.ids[2]+'" ORDER BY paymentDate DESC  LIMIT 20 OFFSET '+params.ids[3];
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
                    
                    if(params.ids[2] == 'SuperAdmin'){
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
                
                const [rows, fields] = await connection.execute('SELECT * FROM invoices ORDER BY invoiceDate ASC LIMIT 20 OFFSET '+params.ids[2]);
                connection.release();
    
                
                // return Response.json({data:rows}, {status: 200})
                // return Response.json({data:rows},{data1:fields}, {status: 200})
                return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})
              }
            else if(params.ids[1] == 'U5'){ // get total outstanding of the business for admin
                
                const [rows, fields] = await connection.execute('SELECT * FROM `invoices` where status!="Paid"');
                connection.release();
    
                return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})
            }
            else if(params.ids[1] == 'U6'){ // get all invoices of dealers assigned to a list of executives
            
                if(params.ids[2] == 'SuperAdmin'){
                    const [rows2, fields2] = await connection.execute(`SELECT * FROM invoices where status!="Paid" ORDER BY expiryDate ASC`);
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
                
            
            }
            else if(params.ids[1] == 'U7'){ // Upload invoices in bulk
            
                // bulk upload from the web via excel
                // apply payment to multiple invoices at a time
                // invoiceId, invoiceNo, invoiceType, invoiceDate, PoNo, vehicleNo, transport, LRNo, billTo, shipTo, totalAmount, amountPaid, pending, status, expiryDate, sales
                // Parse the JSON string into an array
                const decodedItems = decodeURIComponent(params.ids[2]);
                const items = JSON.parse(decodedItems);
                
                items.forEach(async (item, index) => {
                    console.log(`Item ${index}:`, item);
                    await applyInvoicesUpload(item.invoiceNo, item.invoiceType, item.invoiceDate, item.dealerId, item.invoiceAmount, item.amountPaid, item.expiryDate);
                // await applyPayment(item.gst, item.amount, item.type, '', item.transactionId, item.paymentDate, params.ids[3],params.ids[4]);
                });

                // await applyPayment(params.ids[2], params.ids[3], params.ids[4], params.ids[5], params.ids[6], paymentDate, params.ids[8], params.ids[9]);
                return Response.json({status: 200, message:'Success!'}, {status: 200})
            }
            else {
                return Response.json({status: 404, message:'No Student found!'}, {status: 200})
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




  // apply invoices upload one by one
  // provided: invoiceNo, invoiceType, invoiceDate, dealerId, totalAmount, amountPaid, expiryDate
  // Needed for insertion: invoiceId, invoiceNo, invoiceType, invoiceDate, PoNo, vehicleNo, transport, LRNo, billTo, shipTo, totalAmount, amountPaid, pending, status, expiryDate, sales
  async function applyInvoicesUpload(invoiceNo, invoiceType, invoiceDate, dealerId, totalAmount, amountPaid, expiryDate) {
    
    // get the pool connection to db
    const connection = await pool.getConnection(); 
    
    try {
        await connection.beginTransaction();
        
        // 1. verify the totalAmount & amountPaid to estimate pending & status for the given invoice
        // 2. update the invoices table with the transaction of selected invoices

        // 1
        // check if amount being paid is more, accordingly we need to update the status
        var status = (totalAmount == amountPaid) ? 'Pending' : (totalAmount - amountPaid) > 0 ? 'PartialPaid' : 'Paid';
        const pending = (parseFloat(totalAmount) - parseFloat(amountPaid));
        console.log(pending);
        

        const q = 'INSERT INTO invoices (invoiceNo, invoiceType, invoiceDate, PoNo, vehicleNo, transport, LRNo, billTo, shipTo, totalAmount, amountPaid, pending, status, expiryDate, sales) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, CAST(? AS DECIMAL(10, 2)),  CAST(? AS DECIMAL(10, 2)),  CAST(? AS DECIMAL(10, 2)), ?, ?, ? )';
        const [payments] = await connection.query(q,[invoiceNo, invoiceType, invoiceDate, '-','-','-','-',dealerId, dealerId, totalAmount, amountPaid, pending, status, expiryDate, '-']);

        await connection.commit();
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        await connection.release();
    }
}
  
