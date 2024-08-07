import pool from '../../../db'
import { Keyverify } from '../../../secretverify';

// API for updates to users data
// params used for this API
// key, type, collegeId, playerId, date
// U1 – get hostels
// U2 – update hostels
// U3 – hostel stats
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){
          
          if(params.ids[1] == 'U1'){ // get all hostels
            const connection = await pool.getConnection();
            const [rows, fields] = await connection.execute('SELECT * FROM hostel order by hostelname ASC');
            connection.release();

            
            // return Response.json({data:rows}, {status: 200})
            // return Response.json({data:rows},{data1:fields}, {status: 200})
            return Response.json({status: 200, data: rows, message:'Details found!'}, {status: 200})
          }
          else if(params.ids[1] == 'U2'){ // student details
                try {
                    // let q = 'SELECT * FROM users WHERE collegeId LIKE "%'+params.ids[2]+'%"';
                    // console.log(q);
                    let q = 'SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM users u LEFT JOIN user_details d ON u.collegeId = d.collegeId LEFT JOIN `hostel` h ON d.hostelId = h.hostelId WHERE u.role = "Student" AND u.profileUpdated=1 AND u.collegeId LIKE "%'+params.ids[2]+'%" LIMIT 20 OFFSET '+params.ids[3];
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
            // this is to get the count of HOSTEL students who are available for food on a given day.
          else if(params.ids[1] == 'U3'){
                try {
                    // Students Available for Breakfast
                    // Incampus strength + (Inouting Students checkin before 9AM) - (Submitted/Approved/Issued Students checkout before 7AM)
                    
                    // Students Available for lunch
                    // Incampus strength + (Inouting Students checkin before 2PM) - (Submitted/Approved/Issued Students checkout before 11AM)
                    
                    // Students Available for dinner
                    // Incampus strength + (Inouting Students checkin after 2PM) - (Submitted/Approved/Issued Students checkout before 7PM)

                    let q = `SELECT
                                'Breakfast' as requestStatus,
                                CAST(
                                    (
                                        (SELECT COUNT(*) FROM users WHERE type = 'hostel' AND role = 'student' and (year=1 or year=2 or year=3))
                                        - (SELECT COUNT(*) FROM request WHERE requestStatus = 'InOuting')
                                        + (SELECT COUNT(*) FROM request WHERE requestStatus = 'InOuting' AND DATE(requestTo) = "`+params.ids[2]+`" AND TIME(requestTo) < '09:00:00')
                                        - (SELECT COUNT(*) FROM request WHERE requestStatus IN ('Submitted', 'Approved', 'Issued') AND DATE(requestFrom) = "`+params.ids[2]+`" AND TIME(requestFrom) < '7:00:00')
                                        ) AS SIGNED
                                    ) as count
                            
                            UNION

                            SELECT 
                                'Lunch' as requestStatus,
                                CAST(
                                    (
                                        (SELECT COUNT(*) FROM users WHERE type = 'hostel' AND role = 'student' and (year=1 or year=2 or year=3))
                                        - (SELECT COUNT(*) FROM request WHERE requestStatus = 'InOuting')
                                        + (SELECT COUNT(*) FROM request WHERE requestStatus = 'InOuting' AND DATE(requestTo) = "`+params.ids[2]+`" AND TIME(requestTo) < '14:00:00')
                                        - (SELECT COUNT(*) FROM request WHERE requestStatus IN ('Submitted', 'Approved', 'Issued') AND DATE(requestFrom) = "`+params.ids[2]+`" AND TIME(requestFrom) < '11:00:00')
                                        - (SELECT COUNT(*) FROM visitorpass WHERE foodCount > 0 AND DATE(visitOn) = "`+params.ids[2]+`" AND isOpen = 1)
                                    ) AS SIGNED 
                                ) as count
                            
                            UNION

                            SELECT 
                                'Visitors' as requestStatus,
                                CAST(
                                    (
                                        (SELECT COUNT(*) FROM visitorpass WHERE DATE(visitOn) = "`+params.ids[2]+`" AND TIME(visitOn) < '14:00:00' AND isOpen = 1 AND foodCount > 0)
                                        + (SELECT CASE WHEN SUM(foodCount) > 0 THEN SUM(foodCount) ELSE 0 END AS LUNCH FROM visitorpass WHERE DATE(visitOn) = "`+params.ids[2]+`" AND isOpen = 1)
                                    ) AS SIGNED 
                                ) as count
                            
                            UNION
                            
                            SELECT
                                'Dinner' as requestStatus,
                                CAST(
                                    (
                                        (SELECT COUNT(*) FROM users WHERE type = 'hostel' AND role = 'student' and (year=1 or year=2 or year=3))
                                        - (SELECT COUNT(*) FROM request WHERE requestStatus = 'InOuting')
                                        + (SELECT COUNT(*) FROM request WHERE requestStatus = 'InOuting' AND DATE(requestTo) = "`+params.ids[2]+`" AND TIME(requestTo) > '14:00:00')
                                        - (SELECT COUNT(*) FROM request WHERE requestStatus IN ('Submitted', 'Approved', 'Issued') AND DATE(requestFrom) = "`+params.ids[2]+`" AND TIME(requestFrom) < '19:00:00')
                                        ) AS SIGNED
                                    ) as count;
                            `;
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
            // this is to get HOSTEL wise students count for inouting on a given day.
          else if(params.ids[1] == 'U4'){
                try {
                    // Hostel wise Students strength for inouting
                    // SELECT h.hostelName, h.hostelId, COUNT(DISTINCT ud.collegeId) AS userCount, SUM(CASE WHEN r.requestStatus='InOuting' THEN 1 ELSE 0 END) AS outingCount, COUNT(DISTINCT ud.collegeId) - SUM(CASE WHEN r.requestStatus='InOuting' THEN 1 ELSE 0 END) AS inHostel FROM hostel h LEFT JOIN user_details ud ON h.hostelId = ud.hostelId LEFT JOIN users u ON ud.collegeId = u.collegeId AND u.type='hostel' AND u.role='student' LEFT JOIN request r ON ud.collegeId = r.collegeId GROUP BY h.hostelName, h.hostelId
                    // select COUNT(DISTINCT collegeId) AS total from users where role='student' and type='hostel' group by campusId
                    // SELECT u.campusId,
                //     COUNT(DISTINCT u.collegeId) AS total, 
                //     SUM(CASE WHEN r.requestStatus='InOuting' THEN 1 ELSE 0 END) AS InOuting, 
                //     COUNT(DISTINCT u.collegeId) - SUM(CASE WHEN r.requestStatus='InOuting' THEN 1 ELSE 0 END) AS InHostel 
                // FROM users u
                // LEFT JOIN request r ON u.collegeId = r.collegeId 
                // GROUP BY u.campusId

                    let q = `SELECT h.hostelName, 
                                h.hostelId, 
                                COUNT(DISTINCT ud.collegeId) AS total, 
                                SUM(CASE WHEN r.requestStatus='InOuting' THEN 1 ELSE 0 END) AS InOuting, 
                                COUNT(DISTINCT ud.collegeId) - SUM(CASE WHEN r.requestStatus='InOuting' THEN 1 ELSE 0 END) AS InHostel 
                            FROM hostel h 
                            LEFT JOIN user_details ud ON h.hostelId = ud.hostelId 
                            LEFT JOIN users u ON ud.collegeId = u.collegeId AND u.type='hostel' AND u.role='student' 
                            LEFT JOIN request r ON ud.collegeId = r.collegeId 
                            GROUP BY h.hostelName, h.hostelId;
                            `;
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
            // this is to get College wise students count for inouting on a given day.
          else if(params.ids[1] == 'U5'){
                try {
                    let q = `SELECT 
                                u.campusId,
                                COUNT(DISTINCT u.collegeId) AS total,
                                SUM(CASE WHEN r.requestStatus = 'InOuting' THEN 1 ELSE 0 END) AS InOuting,
                                (COUNT(DISTINCT u.collegeId) - SUM(CASE WHEN r.requestStatus='InOuting' THEN 1 ELSE 0 END)) AS InHostel 
                            FROM users u
                            LEFT JOIN request r ON u.collegeId = r.collegeId WHERE u.role = 'student' AND u.type = 'hostel'
                            GROUP BY u.campusId;
                            `;
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
            // this is to get College + branch + year wise students count for inouting on a given day.
          else if(params.ids[1] == 'U6'){
                try {
                    let q = `SELECT u.campusId,u.department,u.branch,u.year, COUNT(DISTINCT u.collegeId) AS total, SUM(CASE WHEN r.requestStatus = 'InOuting' THEN 1 ELSE 0 END) AS InOuting, (COUNT(DISTINCT u.collegeId) - SUM(CASE WHEN r.requestStatus='InOuting' THEN 1 ELSE 0 END)) AS InHostel FROM users u LEFT JOIN request r ON u.collegeId = r.collegeId WHERE u.role = 'student' AND u.type = 'hostel' GROUP BY u.campusId,u.department,u.branch,u.year;
                            `;
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
  



  ///
//   SELECT
//                                 'Breakfast' as requestStatus,
//                                 CAST(
//                                     (
//                                         (SELECT COUNT(*) FROM users WHERE type = 'hostel' AND role = 'student')
//                                         - (SELECT COUNT(*) FROM request WHERE requestStatus = 'InOuting')
//                                         + (SELECT COUNT(*) FROM request WHERE requestStatus = 'InOuting' AND DATE(requestTo) = "`+params.ids[2]+`" AND TIME(requestTo) < '10:00:00')
//                                         - (SELECT COUNT(*) FROM request WHERE requestStatus IN ('Submitted', 'Approved', 'Issued') AND DATE(requestFrom) = "`+params.ids[2]+`" AND TIME(requestFrom) < '7:00:00')
//                                         + (SELECT CASE WHEN SUM(foodCount) > 0 THEN SUM(foodCount) ELSE 0 END AS BREAKFAST FROM visitorpass WHERE DATE(visitOn) = "`+params.ids[2]+`" AND isOpen = 1)
//                                         ) AS SIGNED
//                                     ) as count
                            
//                             UNION

//                             SELECT 
//                                 'Lunch' as requestStatus,
//                                 CAST(
//                                     (
//                                         (SELECT COUNT(*) FROM users WHERE type = 'hostel' AND role = 'student')
//                                         - (SELECT COUNT(*) FROM request WHERE requestStatus = 'InOuting')
//                                         + (SELECT COUNT(*) FROM request WHERE requestStatus = 'InOuting' AND DATE(requestTo) = "`+params.ids[2]+`" AND TIME(requestTo) < '14:00:00')
//                                         - (SELECT COUNT(*) FROM request WHERE requestStatus IN ('Submitted', 'Approved', 'Issued') AND DATE(requestFrom) = "`+params.ids[2]+`" AND TIME(requestFrom) < '12:00:00')
//                                         + (SELECT CASE WHEN SUM(foodCount) > 0 THEN SUM(foodCount) ELSE 0 END AS LUNCH FROM visitorpass WHERE DATE(visitOn) = "`+params.ids[2]+`" AND isOpen = 1)
//                                     ) AS SIGNED 
//                                 ) as count
                            
//                             UNION
                            
//                             SELECT
//                                 'Dinner' as requestStatus,
//                                 CAST(
//                                     (
//                                         (SELECT COUNT(*) FROM users WHERE type = 'hostel' AND role = 'student')
//                                         - (SELECT COUNT(*) FROM request WHERE requestStatus = 'InOuting')
//                                         + (SELECT COUNT(*) FROM request WHERE requestStatus = 'InOuting' AND DATE(requestTo) = "`+params.ids[2]+`" AND TIME(requestTo) > '14:00:00')
//                                         - (SELECT COUNT(*) FROM request WHERE requestStatus IN ('Submitted', 'Approved', 'Issued') AND DATE(requestFrom) = "`+params.ids[2]+`" AND TIME(requestFrom) < '19:00:00')
//                                         + (SELECT CASE WHEN SUM(foodCount) > 0 THEN SUM(foodCount) ELSE 0 END AS DINNER FROM visitorpass WHERE DATE(visitOn) = "`+params.ids[2]+`" AND isOpen = 1)
//                                         ) AS SIGNED
//                                     ) as count;
  //
  