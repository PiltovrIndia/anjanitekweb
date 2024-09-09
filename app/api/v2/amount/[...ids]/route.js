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
                    let q = 'SELECT * FROM `invoices` WHERE billTo="'+params.ids[2]+'" ORDER BY invoiceDate DESC LIMIT 5 OFFSET '+params.ids[3];
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
                    let q = 'SELECT * FROM payments WHERE type="credit" AND id="'+params.ids[2]+'" LIMIT 20 OFFSET '+params.ids[3];
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
            else if(params.ids[1] == 'U4'){ // get all invoices for admin
                
                const [rows, fields] = await connection.execute('SELECT * FROM invoices ORDER BY invoiceDate DESC LIMIT 5 OFFSET '+params.ids[2]);
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
            
                if(params.ids[2] == 'SalesManager'){
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
                        const [rows2, fields2] = await connection.execute(`SELECT * FROM invoices where billTo IN (${dealersList}) and status!="Paid"`);
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
                        const [rows2, fields2] = await connection.execute(`SELECT * FROM invoices where billTo IN (${dealersList}) and status!="Paid"`);
                        connection.release();
                        return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                    }
                    else {

                        connection.release();
                        return Response.json({status: 404, message:'No Data found!'}, {status: 200})
                    }
                }
                
            
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
  
