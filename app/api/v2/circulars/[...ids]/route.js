import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
import dayjs from 'dayjs'

// create new officialrequest for outing by the Admins
// key, what, oRequestId, type, duration, from, to, by, description, branch, year – Super admin
// key, what, today – Super admin, Outing Issuer Admin, Outing Issuer
// key, what, today, branch – Department Admin
// key, what, today, branch, year – student

// what is used to understand what the request is about – whether to send data back or create data
// what – If it is 0, then create
// what – If it is 1, fetch data for all branches – Super admin
// what – If it is 2, fetch data for specific branch – Department Admin
// what – If it is 3, fetch data for specific branch and year – student
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    // current date time for updating
    // var currentDate =  dayjs(new Date(params.ids[2])).format('YYYY-MM-DD');
    // console.log(currentDate);

    try{
        // authorize secret key
        if(await Keyverify(params.ids[0])){

            if(params.ids[1] == 0){ // create circular
                try {
                    // create query for insert
                    const q = 'INSERT INTO circular (circularId, universityId, campusId, createdBy, createdOn, branch, year, subject, description, media, isActive, link, studentType, circularType) VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
                    // create new circular
                    const [rows, fields] = await connection.execute(q, [ params.ids[2], params.ids[3], params.ids[4], params.ids[5], params.ids[6], params.ids[7], params.ids[8], decodeURIComponent(params.ids[9]), decodeURIComponent(params.ids[10]), params.ids[11], params.ids[12],params.ids[13],params.ids[14],params.ids[15] ]);
                    connection.release();

                    // send notification to circular specific students

                    // get the gcm_regIds of Students to notify
                        // Split the branches string into an array
                        var conditionsString = '';
                        if(params.ids[14]!='All'){ // check for the student type
                            conditionsString = conditionsString + ' type="'+params.ids[14]+'" AND';
                        }
                        if(params.ids[7]!='All'){ // check for the branches
                        
                            let branches = (params.ids[7]).split(',');

                            // check if there are more than 1 branch
                            if(branches.length > 1){
                                // Build the LIKE conditions with case sensitivity
                                let likeConditions = branches.map(branch => `BINARY CONCAT(course,'-',branch,'-',year) LIKE '%${branch}%'`);

                                // Join the conditions with OR
                                conditionsString = likeConditions.join(' OR ');
                            }
                            else {
                                conditionsString = `BINARY CONCAT(course,'-',branch,'-',year) LIKE '%${branches}%'`;
                            }
                        }

                        // from all the users of a branch from a college from university
                        conditionsString = ` universityId="`+params.ids[3]+`" AND campusId="`+params.ids[4]+`" AND role="Student" AND (${conditionsString})`;
                        // const [nrows, nfields] = await connection.execute('SELECT gcm_regId FROM `user` where role IN ("SuperAdmin") or (role="Admin" AND branch = ?)', [ rows1[0].branch ],);
                        const [nrows, nfields] = await connection.execute(`SELECT gcm_regId FROM users where ${conditionsString} AND CHAR_LENGTH(gcm_regId) > 3`);
                        // console.log(`SELECT gcm_regId FROM users where ${conditionsString} `);
                        
                        // get the gcm_regIds list from the query result
                        var gcmIds = [];
                        for (let index = 0; index < nrows.length; index++) {
                          const element = nrows[index].gcm_regId;
                        //   console.log(element)
                          if(element.length > 3)
                            gcmIds.push(element); 
                        }

                        // var gcmIds = 
                        // console.log(gcmIds);

                        // send the notification
                        const notificationResult = await send_notification('New '+params.ids[15]+' available', gcmIds, 'Multiple');
                            
                        // return successful update
                        return Response.json({status: 200, message:'Circular created!', notification: notificationResult}, {status: 200})





                    // return the user data
                    // return Response.json({status: 200, message: ' Circular created!'}, {status: 200})
                } catch (error) {
                    // user doesn't exist in the system
                    return Response.json({status: 404, message:'Error creating request. Please try again later!'+error.message}, {status: 200})
                }
            }
            else if(params.ids[1] == 1){ // fetch data for all circulars – Super admin & Outing Issuer Admin & Outing Issuer
                // console.log('SELECT * from officialrequest WHERE (DATE(oFrom) >= DATE("'+currentDate+'") OR DATE(oTo) >= DATE("'+currentDate+'")) ORDER BY createdOn DESC');
                const [rows, fields] = await connection.execute('SELECT * from circular WHERE universityId="'+params.ids[2]+'" AND campusId="'+params.ids[3]+'" ORDER BY createdOn DESC');
                connection.release();
            
                // check if user is found
                if(rows.length > 0){
                    // return the requests data
                    return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})

                }
                else {
                    // user doesn't exist in the system
                    return Response.json({status: 404, message:'No data!'}, {status: 200})
                }
            }
            else if(params.ids[1] == 2){ // fetch data for specific branch – Department Admin
                
                var q = '';
                // check if all branches
                if(params.ids[4]!='All'){
                    var branchesString = params.ids[4];

                    // Split the string into an array
                    let branches = branchesString.split(',');

                    // check if there are more than 1 branch
                    var conditionsString = '';
                    if(branches.length > 1){
                        // Build the LIKE conditions with case sensitivity
                        let likeConditions = branches.map(branch => `branch LIKE '%${branch}%'`);

                        // Join the conditions with OR
                        conditionsString = likeConditions.join(' OR ');
                    }
                    else {
                        conditionsString = `branch LIKE '%${branchesString}%'`;
                    }

                    q = `SELECT * from circular WHERE universityId="`+params.ids[2]+`" AND campusId="`+params.ids[3]+`" AND  (${conditionsString}) ORDER BY createdOn DESC`;
                }
                else {
                    q = `SELECT * from circular WHERE universityId="`+params.ids[2]+`" AND campusId="`+params.ids[3]+`" ORDER BY createdOn DESC`;
                }

                const [rows, fields] = await connection.execute(q);
                // const [rows, fields] = await connection.execute('SELECT * from circular WHERE universityId="'+params.ids[2]+'" AND campusId="'+params.ids[3]+'" AND branch = "All" or FIND_IN_SET("'+params.ids[4]+'", branch)>0 ORDER BY createdOn DESC');
                connection.release();
            
                // check if user is found
                if(rows.length > 0){
                    // return the requests data
                    return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})

                }
                else {
                    // user doesn't exist in the system
                    return Response.json({status: 404, message:'No data!'}, {status: 200})
                }
            }
            else if(params.ids[1] == 3){ // fetch data for specific branch and year – student
                const [rows, fields] = await connection.execute('SELECT * from circular WHERE universityId="'+params.ids[2]+'" AND campusId = "'+params.ids[3]+'" AND (branch = "All" or FIND_IN_SET("'+params.ids[4]+'", branch)>0) AND (studentType="All" or studentType="'+params.ids[5]+'") ORDER BY createdOn DESC');
                // const [rows, fields] = await connection.execute('SELECT * from officialrequest WHERE (campusId = "All" or FIND_IN_SET("'+params.ids[5]+'", campusId)>0) AND (course = "All" or FIND_IN_SET("'+params.ids[6]+'", course)>0) AND (branch = "All" or FIND_IN_SET("'+params.ids[3]+'", branch)>0) AND (year="All" or FIND_IN_SET("'+params.ids[4]+'",year)>0) AND (oFrom >= "'+currentDate+'" OR oTo >= "'+currentDate+'") ORDER BY oFrom DESC');
                connection.release();
            
                // check if user is found
                if(rows.length > 0){
                    // return the requests data
                    return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})

                }
                else {
                    // user doesn't exist in the system
                    return Response.json({status: 404, message:'No data!'}, {status: 200})
                }
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
  


  // send the notification using onesignal.
  // use the playerIds of the users.
  // check if playerId length > 2
  async function send_notification(message, playerId, type) {
    // console.log(playerId);
        return new Promise(async (resolve, reject) => {
          // send notification only if there is playerId for the user
          if (playerId.length > 0) {
            // var playerIds = [];
            // playerIds.push(playerId);
      
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
                include_player_ids: playerId,
              };
            }
      
            try {
              // create notification
              const notificationResult = await client.createNotification(notification);
              
              resolve(notificationResult);
    
            } catch (error) {
            //     console.log('ok');
            //   console.log(error);
              resolve(null);
            }
          } else {
            // console.log('ok1');console.log(error);
            resolve(null);
          }
        });
      }
    
    
    