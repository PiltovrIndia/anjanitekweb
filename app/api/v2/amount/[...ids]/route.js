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
          
          if(params.ids[1] == 'U1'){ // get all hostels
            // const connection = await pool.getConnection();
            const [rows, fields] = await connection.execute('SELECT * FROM `invoices` where billTo="'+params.ids[2]+'" and status="NotPaid"');
            connection.release();

            
            // return Response.json({data:rows}, {status: 200})
            // return Response.json({data:rows},{data1:fields}, {status: 200})
            return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})
          }
          // get invoices of a dealer by Id
          else if(params.ids[1] == 'U2'){ 
                try {
                    // let q = 'SELECT * FROM users WHERE collegeId LIKE "%'+params.ids[2]+'%"';
                    // console.log(q);
                    let q = 'SELECT * FROM `invoices` WHERE billTo="'+params.ids[2]+'" LIMIT 20 OFFSET '+params.ids[3];
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
                    return Response.json({status: 404, message:'No users found!'}, {status: 200})
                }
            }
            // Get the payments done by the dealer by id
          else if(params.ids[1] == 'U3'){
                try {
                    let q = 'SELECT * FROM payments WHERE userId="'+params.ids[2]+'" LIMIT 20 OFFSET '+params.ids[3];
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
  
