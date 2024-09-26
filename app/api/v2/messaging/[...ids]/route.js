import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
import dayjs from 'dayjs'
const OneSignal = require('onesignal-node')

const client = new OneSignal.Client(process.env.ONE_SIGNAL_APPID, process.env.ONE_SIGNAL_APIKEY)

// create new officialrequest for outing by the Admins
// key, what, oRequestId, type, duration, from, to, by, description, branch, year – Super admin
// key, what, today – Super admin, Outing Issuer Admin, Outing Issuer
// key, what, today, branch – Department Admin
// key, what, today, branch, year – student

// what is used to understand what the request is about – whether to send data back or create data
// what – If it is 0, then create
// what – If it is 1, // This is onHold
// what – If it is 2, // This is onHold
// what – If it is 3, fetch data of receivers list for admin.
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    // current date time for updating
    // var currentDate =  dayjs(new Date(params.ids[2])).format('YYYY-MM-DD');
    // console.log(currentDate);

    try{
        // authorize secret key
        if(await Keyverify(params.ids[0])){

            if(params.ids[1] == 0){ // create notification
                try {
                    // create query for insert
                    const q = 'INSERT INTO notifications (sender, receiver, sentAt, message, seen, state) VALUES ( ?, ?, ?, ?, ?, ?)';
                    // create new notification
                    const [rows, fields] = await connection.execute(q, [ params.ids[2], params.ids[3], params.ids[4], decodeURIComponent(params.ids[5]), params.ids[6], params.ids[7] ]);
                    

                    // send notification to notification specific dealer

                    // get the gcm_regIds of Students to notify
                        // Split the branches string into an array
                        var conditionsString = '';
                        var query = '';
                        if(params.ids[3]!='All'){ // check for the student type
                            // conditionsString = conditionsString + ' userId="'+params.ids[3]+'" ';
                            query = 'SELECT gcm_regId FROM user where id="'+params.ids[3]+'" AND CHAR_LENGTH(gcm_regId) > 3';
                        }
                        else {
                            // conditionsString = conditionsString + ' role="dealer" ';
                            query = 'SELECT u.gcm_regId from user u JOIN dealer d where d.dealerId=u.id AND d.state="'+params.ids[7]+'" AND CHAR_LENGTH(u.gcm_regId) > 3'
                        }
                        // console.log(query);
                        
                        // const [nrows, nfields] = await connection.execute('SELECT gcm_regId FROM `user` where role IN ("SuperAdmin") or (role="Admin" AND branch = ?)', [ rows1[0].branch ],);
                        const [nrows, nfields] = await connection.execute(query);
                        connection.release();
                        // console.log(`SELECT gcm_regId FROM user where ${conditionsString} `);
                        
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
                        var notificationResult;
                          if(gcmIds.length > 1){ 
                            notificationResult = await send_notification(params.ids[5], gcmIds, 'Multiple');
                          }
                          else if(gcmIds.length == 1){ 
                            notificationResult = await send_notification(params.ids[5], gcmIds[0], 'Single');
                          }
                          else {
                            notificationResult = null;
                          }
                        
                        // await send_notification(params.ids[5], gcmIds[0], 'Single') : null;
                        // const notificationResult = gcmIds.length > 0 ? await send_notification(params.ids[5], gcmIds[0], 'Single') : null;
                            
                        // return successful update
                        return Response.json({status: 200, message:'Message sent!', notification: notificationResult}, {status: 200})


                    // return the user data
                    // return Response.json({status: 200, message: ' Circular created!'}, {status: 200})
                } catch (error) {
                    // user doesn't exist in the system
                    return Response.json({status: 404, message:'Error creating notification. Please try again later!'+error.message}, {status: 200})
                }
            }
            else if(params.ids[1] == 1){ // fetch data for all notifications – Super admin 
                // console.log('SELECT * from officialrequest WHERE (DATE(oFrom) >= DATE("'+currentDate+'") OR DATE(oTo) >= DATE("'+currentDate+'")) ORDER BY createdOn DESC');
                // const [rows, fields] = await connection.execute('SELECT * from notification WHERE universityId="'+params.ids[2]+'" AND campusId="'+params.ids[3]+'" ORDER BY createdOn DESC');
                const [rows, fields] = await connection.execute('SELECT * from notifications ORDER BY sentAt DESC LIMIT 20 OFFSET '+params.ids[2]);
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
            else if(params.ids[1] == 2){ // fetch data for specific dealer
                
                var q = 'SELECT * from notifications WHERE sentAt < "'+params.ids[3]+'" AND (receiver="'+params.ids[2]+'" OR receiver="All" OR sender="'+params.ids[2]+'") ORDER BY sentAt ASC LIMIT 50 OFFSET '+params.ids[4];
                
                const [rows, fields] = await connection.execute(q);
                // const [rows, fields] = await connection.execute('SELECT * from notification WHERE universityId="'+params.ids[2]+'" AND campusId="'+params.ids[3]+'" AND branch = "All" or FIND_IN_SET("'+params.ids[4]+'", branch)>0 ORDER BY createdOn DESC');
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
            else if(params.ids[1] == 3){ // fetch data for all receivers who got messages to show as list for – Super admin 
              // console.log('SELECT * from officialrequest WHERE (DATE(oFrom) >= DATE("'+currentDate+'") OR DATE(oTo) >= DATE("'+currentDate+'")) ORDER BY createdOn DESC');
              // const [rows, fields] = await connection.execute('SELECT * from notification WHERE universityId="'+params.ids[2]+'" AND campusId="'+params.ids[3]+'" ORDER BY createdOn DESC');
              const [rows, fields] = await connection.execute('SELECT DISTINCT(n.receiver),u.name FROM `notifications` n JOIN user u ON n.receiver=u.id where n.sender="'+params.ids[2]+'"');
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
            else if(params.ids[1] == 4){ // fetch data for all messages sent and received from a specific receiver to show to – Super admin 
              // console.log('SELECT * from officialrequest WHERE (DATE(oFrom) >= DATE("'+currentDate+'") OR DATE(oTo) >= DATE("'+currentDate+'")) ORDER BY createdOn DESC');
              // const [rows, fields] = await connection.execute('SELECT * from notification WHERE universityId="'+params.ids[2]+'" AND campusId="'+params.ids[3]+'" ORDER BY createdOn DESC');
              var query = '';
              if(params.ids[3] == "All"){ // this gets only broadcasted messages
                query = 'SELECT * FROM notifications WHERE sender ="'+params.ids[2]+'" AND receiver = "'+params.ids[3]+'" ORDER BY sentAt ASC';
              }
              else { // this fetches all the messages along with broadcasted ones in sequential order
                query = `(SELECT n.*,u.name as receiverName FROM notifications n JOIN user u ON n.receiver=u.id 
                          WHERE (n.sender IN ("`+params.ids[2]+`", "`+params.ids[3]+`") AND n.receiver = "`+params.ids[3]+`" ) 
                          OR (n.receiver IN ("`+params.ids[2]+`", "`+params.ids[3]+`") AND n.sender = "`+params.ids[3]+`") 
                          ORDER BY n.sentAt ASC)
                          UNION ALL 
                          (SELECT *,'All' as receiverName FROM notifications where receiver = "All" ORDER BY sentAt ASC) 
                          ORDER BY sentAt ASC;`;
              }
              
              const [rows, fields] = await connection.execute(query);
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
          else if(params.ids[1] == 5){ // fetch count of unread messages for specific dealer
                
            var q = 'SELECT count(*) as count from notifications WHERE sentAt < "'+params.ids[3]+'" AND (receiver="'+params.ids[2]+'" OR receiver="All") AND seen = 0 ORDER BY sentAt DESC LIMIT 20 OFFSET '+params.ids[4];
            
            const [rows, fields] = await connection.execute(q);
            // const [rows, fields] = await connection.execute('SELECT * from notification WHERE universityId="'+params.ids[2]+'" AND campusId="'+params.ids[3]+'" AND branch = "All" or FIND_IN_SET("'+params.ids[4]+'", branch)>0 ORDER BY createdOn DESC');
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
          else if(params.ids[1] == 6){ // update the notifications as SEEN by the dealer which are sent to them
            
            var q = 'UPDATE notifications set seen=1 WHERE notificationId IN ('+params.ids[2].split(',')+')';
            
            const [rows, fields] = await connection.execute(q);
            connection.release();
        
            // check if user is found
            if(rows.affectedRows > 0){
                // return the requests data
                return Response.json({status: 200, message:'Seen!', data: rows}, {status: 200})

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
    
    
    