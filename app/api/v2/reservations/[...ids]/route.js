import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
import dayjs from 'dayjs'

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
                    const [rows, fields] = await connection.execute('SELECT r.*, p.* from reservations r LEFT JOIN products1 p ON r.design = p.design WHERE r.userId="'+params.ids[2]+'" ORDER BY r.createdOn DESC');
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
                    const [rows, fields] = await connection.execute('UPDATE reservations SET approvedQty='+params.ids[4]+', status="'+params.ids[3]+'" WHERE id="'+params.ids[2]+'"');
                    connection.release();

                    if(rows.affectedRows > 0){
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})
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
                    const [rows, fields] = await connection.execute('INSERT into reservations (userId, design, requestedQty, status, approvedQty, stockType, expiryDate, createdOn) VALUES ("'+params.ids[2]+'", "'+params.ids[3]+'", "'+params.ids[4]+'", "Submitted", 0, "'+params.ids[5]+'", "'+params.ids[6]+'", "'+params.ids[7]+'")');
                    connection.release();

                    if(rows.insertId > 0){
                        return Response.json({status: 200, data: rows.insertId, message:'Created!'}, {status: 200})
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
