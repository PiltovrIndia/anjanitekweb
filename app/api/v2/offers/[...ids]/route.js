import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
import dayjs from 'dayjs'
const OneSignal = require('onesignal-node')

const client = new OneSignal.Client(process.env.ONE_SIGNAL_APPID, process.env.ONE_SIGNAL_APIKEY)

// this is to create offers to sell the remaining stock from AnjaniTek to the dealers
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    // current date time for updating
    var currentDate =  dayjs(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss');
    // console.log(currentDate);

    try{
        // authorize secret key
        if(await Keyverify(params.ids[0])){

            if(params.ids[1] == 0){ // create offer event
                try {
                    var media = (params.ids[4] == '-') ? null: params.ids[4]; // check if media is available
                    const q = 'INSERT INTO offer_event (title, description, media, isOpen, createdBy, createdOn) VALUES ( ?, ?, ?, ?, ?, ?)';
                    const [rows, fields] = await connection.execute(q, [ decodeURIComponent(params.ids[2]), decodeURIComponent(params.ids[3]), media, 1, params.ids[5], currentDate ]);
                    
                    const [nrows, nfields] = await connection.execute(`SELECT gcm_regId FROM users where role='Dealer' and isActive=1 and gcm_regId IS NOT NULL and gcm_regId != ''`);
                    connection.release();
                        // console.log(`SELECT gcm_regId FROM users where ${conditionsString} `);
                        
                        // get the gcm_regIds list from the query result
                        var gcmIds = [];
                        for (let index = 0; index < nrows.length; index++) {
                          const element = nrows[index].gcm_regId;
                        
                          if(element.length > 3)
                            gcmIds.push(element); 
                          }

                        // send the notification
                        const notificationResult = gcmIds.length > 0 ? await send_notification('New offer is available. Grab it now!', gcmIds, 'Multiple') : null;
                        
                        // return successful update
                        return Response.json({status: 200, message:'Offer posted!', data: rows.insertId}, {status: 200})
                } catch (error) {
                    // user doesn't exist in the system
                    return Response.json({status: 404, message:'Error creating notification. Please try again later!'+error.message}, {status: 200})
                }
            }
            else if(params.ids[1] == 1){ // fetch all offer events
                const [rows, fields] = await connection.execute('SELECT e.id AS offerId, e.title, e.description, e.media, e.isOpen, e.createdBy, e.createdOn, COUNT(r.id) AS responses FROM  offer_event e LEFT JOIN  offer_response r ON e.id = r.offerId GROUP BY e.id ORDER BY e.createdOn DESC; ');
                connection.release();
            
                if(rows.length > 0){
                    return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})
                }
                else {
                    return Response.json({status: 404, message:'No data!'}, {status: 200})
                }
            }
            else if(params.ids[1] == 2){ // fetch all offer events which are active
                const [rows, fields] = await connection.execute('SELECT * from offer_event where isOpen = 1 ORDER BY createdOn DESC');
                connection.release();
            
                if(rows.length > 0){
                    return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})
                }
                else {
                    return Response.json({status: 404, message:'No data!'}, {status: 200})
                }
            }
            else if(params.ids[1] == 2.1){ // get previous responses for the dealer
                const [rows, fields] = await connection.execute('SELECT * from offer_response where dealer = "'+params.ids[2]+'" ORDER BY createdOn DESC');
                connection.release();
            
                if(rows.length > 0){
                    return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})
                }
                else {
                    return Response.json({status: 404, message:'No data!'}, {status: 200})
                }
            }
            else if(params.ids[1] == 3){ // insert response from dealer for a offer
                
                const q = 'INSERT INTO offer_response (offerId, dealer, createdOn) VALUES ( ?, ?, ?)';
                const [rows, fields] = await connection.execute(q, [ params.ids[2], params.ids[3], currentDate ]);
                connection.release();
                
                // send notification to the dealer's hierarchy
                const [rowsD, fieldsD] = await connection.execute('SELECT name, relatedTo FROM user WHERE role="Dealer" AND id="'+params.ids[3]+'"');

                var gcm_regIds = [];
                rowsD[0].relatedTo.split(',').map((item) => {
                  gcm_regIds.push(item);
                });

                await send_notification(rowsD[0].name+" is interested in AnjaniTek offer!", gcm_regIds, 'Multiple');
                
                if(rows.insertId > 0){
                    return Response.json({status: 200, message:'Response sent!'}, {status: 200})
                }
                else {
                    return Response.json({status: 404, message:'No data!'}, {status: 200})
                }
            }
            else if(params.ids[1] == 4){ // get the details of responses for a given offer event
              const [rows, fields] = await connection.execute('SELECT r.*, u.name, u.email, u.mobile from offer_response r JOIN user u ON r.dealer = u.id where r.offerId ="'+params.ids[2]+'"');
              connection.release();
          
              if(rows.length > 0){
                  return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})
              }
              else {
                  return Response.json({status: 404, message:'No data!'}, {status: 200})
              }
            }
            else if(params.ids[1] == 4.1){ // get the dealer details of responses for a given offer event under an hierarchy
              const [rows, fields] = await connection.execute('SELECT r.offerId, r.dealer, r.createdOn, u.name, u.email, u.mobile, u.mapTo from offer_response r JOIN user u ON r.dealer = u.id where r.offerId ="'+params.ids[2]+'" AND u.role="Dealer" AND u.relatedTo LIKE "%'+params.ids[3]+'%"');
              connection.release();
          
              if(rows.length > 0){
                  return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})
              }
              else {
                  return Response.json({status: 404, message:'No data!'}, {status: 200})
              }
            }
            else if(params.ids[1] == 5){ // close the event
              const [rows, fields] = await connection.execute('UPDATE offer_event SET isOpen=0 where id ='+params.ids[2]);
              connection.release();
          
              if(rows.affectedRows > 0){
                  return Response.json({status: 200, message:'Event closed!', data: rows}, {status: 200})
              }
              else {
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
    
    
    