import pool from '../../../db'
import { Keyverify } from '../../../secretverify';

// params used for this API
// key, collegeId

export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){

            
            if(params.ids[1] == 1){

                let q = 'SELECT * from showrooms';
                const [rows, fields] = await connection.execute(q);


                // check for the updated app version
                if(rows.length>0){

                    // return the requests data
                    return Response.json({status: 200, message:'Updated!', data: rows}, {status: 200})

                }
                else{
                    // wrong role
                    return Response.json({status: 404, message:'No list found'}, {status: 200})
                }
            }
            else {
                // wrong role
                return Response.json({status: 402, message:'Your donot have access!'}, {status: 200})
            }

            
        }
        else {
            // wrong secret key
            return Response.json({status: 401, message:'Unauthorized'}, {status: 200})
        }
    }
    catch (err){
        // some error occured
        return Response.json({status: 500, message:'Facing issues. Please try again!'+err.message}, {status: 200})
    }
    
    
  }
  