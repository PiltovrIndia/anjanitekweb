import { randomUUID } from 'crypto';
import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
import nodemailer from 'nodemailer';
const OneSignal = require('onesignal-node')
import dayjs from 'dayjs'

const client = new OneSignal.Client(process.env.ONE_SIGNAL_APPID, process.env.ONE_SIGNAL_APIKEY)
// this is used to verify the user and send OTP for authorizing into the system
// returns the user data on success

// pass, mobile, OTP, deviceId, loginTime
// campusId to be added – helps to identify the student campus
export async function GET(request,{params}) {

    // Send emails to each user with their respective OTP code
    const transporter = nodemailer.createTransport({
        // host: 'smtp.gmail.com',
        // port: 587,
        // secure: false,
        service: 'gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PWD,
        },
      })

    // get the pool connection to db
    const connection = await pool.getConnection();

    // current date time for updating
    var currentDate =  dayjs(new Date(Date.now())).format('YYYY-MM-DD HH:mm:ss');

    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){

            let q = 'SELECT u.*, (SELECT name from user where id=u.mapTo ) as mapName, (SELECT mobile from user where id=u.mapTo ) as mapMobile from `user` u WHERE u.mobile = "'+params.ids[1]+'"';
            // let q = 'SELECT u.*, IFNULL(d.fatherName, "") AS fatherName, IFNULL(d.fatherPhoneNumber, "") AS fatherPhoneNumber, IFNULL(d.motherName, "") AS motherName, IFNULL(d.motherPhoneNumber, "") AS motherPhoneNumber, IFNULL(d.address, "") AS address, IFNULL(d.guardianName, "") AS guardianName, IFNULL(d.guardianPhoneNumber, "") AS guardianPhoneNumber, IFNULL(d.guardian2Name, "") AS guardian2Name, IFNULL(d.guardian2PhoneNumber, "") AS guardian2PhoneNumber, IFNULL(d.hostelId, "") AS hostelId, IFNULL(d.roomNumber, "") AS roomNumber, IFNULL(h.hostelName, "") AS hostelName FROM user u LEFT JOIN user_details d ON u.userId = d.userId LEFT JOIN `hostel` h ON d.hostelId = h.hostelId WHERE u.userId = "'+params.ids[1]+'"';
            // 'SELECT u.*,d.* FROM user u LEFT JOIN user_details d ON u.userId = d.userId WHERE u.userId = "'+params.ids[1]+'"'
     
            // search for user based on the provided mobile
            const [rows, fields] = await connection.execute(q);

            
            // check if user is found
            if(rows.length > 0){

                // isActive value is used to remove the student from the central system
                // other features outside the central system can be still accessed.
                if(rows[0].isActive == 1){
                    
                    // check if the user is loggin in for the first time.
                    // if YES, create new session
                    // if NO, check if the user is logging in from same device Id.
                    // if YES, increment the session
                    // if NO, block the user from logging in and contact admin
                    // (Admin to remove the session using reset Login feature in Student360).
                
                    var sessionExists = 'SELECT * FROM user_sessions WHERE userId=?'
                    const [rowsSession, fieldsSession] = await connection.execute(sessionExists, [ params.ids[1]]);

                    // check if there are already user sessions
                    if(rowsSession.length > 0){

                        // check device Id if it already exists.
                        // this check is only for students. Admins can login any number of times.
                        // if((rows[0].role != 'Student') || ((rowsSession[0].deviceId.length > 2) && rowsSession[0].deviceId.includes(params.ids[3]))){
                        
                            // increment the session
                            const updateSession = 'UPDATE user_sessions SET loginCount = loginCount + 1, deviceId = ?, lastActivityTime = ? WHERE userId=?'
                            const [rowsUpdateSession, fieldsUpdateSession] = await connection.execute(updateSession, [ params.ids[3], currentDate, rows[0].id]);
                            // const updateSession = 'UPDATE user_sessions SET loginCount = loginCount + 1, lastActivityTime = ? WHERE userId=? and deviceId = ?'
                            // const [rowsUpdateSession, fieldsUpdateSession] = await connection.execute(updateSession, [ currentDate, params.ids[1], params.ids[3]]);

                            // check if email is present
                            // if(rows[0].email.length > 2){
                            //     // send mail with defined transport object
                            //     let info = await transporter.sendMail({
                            //         name: 'Anjani Tek',
                            //         from: '"Anjani Tek" <piltovrindia@gmail.com>', // sender address
                            //         // from: '"Smart campus" <hello.helpmecode@gmail.com>', // sender address
                            //         to: rows[0].email, // list of receivers
                            //         subject: "OTP for "+rows[0].name+" login", // Subject line
                            //         // text: "Hello world?", // plain text body
                            //         html: '<center><table style="text-align: center;border:1px solid  rgba(80,80,80,0.3);border-radius:8px; padding:16px;"><tr><td><span style="font-size: 50px;display: inline-block; color: #1b6aff;">SC</span></td></tr><tr><td><h1 style="color:#333;font-size:20px;line-height:10px;">Login to Smart Campus</h1></td></tr><tr><td><p>Copy and paste below OTP to verify <b>'+rows[0].name+'</b> login</p></td></tr><tbody><tr><td><h1 style="background-color: #f5f5f5;text-align: center;padding: 10px;border-radius:8px;font-family: monospace;letter-spacing: 12px;font-size: xx-large;">'+params.ids[2]+'</h1></td></tr> <tr><td><p style="color: #697882;">Smart Campus<br>A smart assistant to you at your campus.</p></td></tr><tr><td height="10" style="line-height:1px;font-size:1px;height:10px">&nbsp;</td></tr><tr><td><br><div style="display: flex;justify-content: space-between;color: #697882;"><span><a href="https://piltovr.com" style="text-decoration:none;color:#697882" target="_blank">A Piltovr Product</a></span></div></td></tr></tbody></table><br></center>', // html body
                            //         // html: '<center><table style="text-align: center;border:1px solid  rgba(80,80,80,0.3);border-radius:8px; padding:16px;"><tr><td><h1 style="color:#333;font-size:20px">Login to Smart Campus</h1></td></tr><tr><td><p>Copy and paste below OTP to verify your '+rows[0].userId+' login</p></td></tr><tbody><tr><td><h1 style="background-color: #f5f5f5;text-align: center;padding: 10px;border-radius:8px;">'+params.ids[2]+'</h1></td></tr> <tr><td><p style="color: #697882;">Smart Campus<br><span style="font-size:14px">A smart assistant to you at your campus.</span></p></td></tr><tr><td height="10" style="line-height:1px;font-size:1px;height:10px">&nbsp;</td></tr><tr><td><br><div style="display: flex;flex-direction:row;justify-content: space-between;color: #697882;"><span><a href="https://piltovr.com" style="text-decoration:none;color:#697882" target="_blank">A Piltovr Product</a></span><a href="https://www.smartcampus.tools/privacy" style="text-decoration:none;color:#697882" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.smartcampus.tools/privacy&amp;source=gmail&amp;ust=1701507513628000&amp;usg=AOvVaw0a_wK1kV3y2bLZRnHvj_cK">Privacy policy</a></div></td></tr></tbody></table><br></center>', // html body
                            //         // html: '<center><table style="text-align: center;"><tr><td><h1 style="color:#333;font-size:20px">Login to Smart Campus</h1></td></tr><tr><td><p>Copy and paste below OTP to verify your '+rows[0].userId+' login</p></td></tr><tbody><tr><td><h1 style="background-color: #f5f5f5;text-align: center;padding: 10px;">'+params.ids[2]+'</h1></td></tr> <tr><td><p>Smart Campus, a smart assistant to you at your campus.</p></td></tr></tbody></table><br></center>', // html body
                            //         // html: '<center><table><tr><td><p>Copy and paste below OTP to verify your login</p></td></tr> <tr><td><h1 style="background-color:#f5f5f5,text-align:center">'+params.ids[2]+'</h1></td></tr></table><br/></center>', // html body
                            //     });
                            // }
                            // else {
                            //     // block the user
                            //     return Response.json({status: 404, message:'No email address found for your account. Contact sales person to add email to your account.'}, {status: 200})
                            // }

                        // }
                        // else {

                        //     // send mail to their email about the new device addition
                        //     let info = await transporter.sendMail({
                        //         name: 'Smart Campus',
                        //         from: '"Smart campus" <smartcampus@svecw.edu.in>', // sender address
                        //         // from: '"Smart campus" <hello.helpmecode@gmail.com>', // sender address
                        //         to: rows[0].email, // list of receivers
                        //         subject: "Important: Login from new device detected for "+rows[0].userId, // Subject line
                        //         // text: "Hello world?", // plain text body
                        //         html: '<center><table style="text-align: center;border:1px solid  rgba(80,80,80,0.3);border-radius:8px; padding:16px;"><tr><td><span style="font-size: 50px;display: inline-block; color: #1b6aff;">SC</span></td></tr><tr><td><h1 style="color:#333;font-size:20px;line-height:10px;">New login detected for Smart Campus</h1></td></tr><tr><td><p>Reach out your admin incase you tried logging in from another device.<br/>At present, you can only use Smart Campus from one device.</p></td></tr><tbody><tr><td><p style="color: #697882;">Smart Campus<br>A smart assistant to you at your campus.</p></td></tr><tr><td height="10" style="line-height:1px;font-size:1px;height:10px">&nbsp;</td></tr><tr><td><br><div style="display: flex;justify-content: space-between;color: #697882;"><span><a href="https://piltovr.com" style="text-decoration:none;color:#697882" target="_blank">A Piltovr Product</a></span></div></td></tr></tbody></table><br></center>', // html body
                        //         // html: '<center><table style="text-align: center;border:1px solid  rgba(80,80,80,0.3);border-radius:8px; padding:16px;"><tr><td><h1 style="color:#333;font-size:20px">Login to Smart Campus</h1></td></tr><tr><td><p>Copy and paste below OTP to verify your '+rows[0].userId+' login</p></td></tr><tbody><tr><td><h1 style="background-color: #f5f5f5;text-align: center;padding: 10px;border-radius:8px;">'+params.ids[2]+'</h1></td></tr> <tr><td><p style="color: #697882;">Smart Campus<br><span style="font-size:14px">A smart assistant to you at your campus.</span></p></td></tr><tr><td height="10" style="line-height:1px;font-size:1px;height:10px">&nbsp;</td></tr><tr><td><br><div style="display: flex;flex-direction:row;justify-content: space-between;color: #697882;"><span><a href="https://piltovr.com" style="text-decoration:none;color:#697882" target="_blank">A Piltovr Product</a></span><a href="https://www.smartcampus.tools/privacy" style="text-decoration:none;color:#697882" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.smartcampus.tools/privacy&amp;source=gmail&amp;ust=1701507513628000&amp;usg=AOvVaw0a_wK1kV3y2bLZRnHvj_cK">Privacy policy</a></div></td></tr></tbody></table><br></center>', // html body
                        //         // html: '<center><table style="text-align: center;"><tr><td><h1 style="color:#333;font-size:20px">Login to Smart Campus</h1></td></tr><tr><td><p>Copy and paste below OTP to verify your '+rows[0].userId+' login</p></td></tr><tbody><tr><td><h1 style="background-color: #f5f5f5;text-align: center;padding: 10px;">'+params.ids[2]+'</h1></td></tr> <tr><td><p>Smart Campus, a smart assistant to you at your campus.</p></td></tr></tbody></table><br></center>', // html body
                        //         // html: '<center><table><tr><td><p>Copy and paste below OTP to verify your login</p></td></tr> <tr><td><h1 style="background-color:#f5f5f5,text-align:center">'+params.ids[2]+'</h1></td></tr></table><br/></center>', // html body
                        //     });

                        //     // New login detected.
                        //     return Response.json({status: 404, message:'You tried to login from new device. Contact campus admin to reset your login.'}, {status: 200})
                        // }
                        
                    }
                    else {
                        // Insert new session
                        const q1 = 'INSERT INTO user_sessions (userId, deviceId, sessionToken, loginCount, lastActivityTime) VALUES ( ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE loginCount = loginCount + 1, lastActivityTime = "'+currentDate+'";';
                        // create new request
                        const [rows1, fields] = await connection.execute(q1, [ rows[0].id, params.ids[3], randomUUID(), 1, currentDate]);

                        // check if email is present
                        // if(rows[0].email.length > 2){
                        //     // send mail with defined transport object
                        //     let info = await transporter.sendMail({
                        //         name: 'Anjani Tek',
                        //         from: '"Anjani Tek" <piltovrindia@gmail.com>', // sender address
                        //         // from: '"Smart campus" <hello.helpmecode@gmail.com>', // sender address
                        //         to: rows[0].email, // list of receivers
                        //         subject: "OTP for "+rows[0].userId+" login", // Subject line
                        //         // text: "Hello world?", // plain text body
                        //         html: '<center><table style="text-align: center;border:1px solid  rgba(80,80,80,0.3);border-radius:8px; padding:16px;"><tr><td><span style="font-size: 50px;display: inline-block; color: #1b6aff;">SC</span></td></tr><tr><td><h1 style="color:#333;font-size:20px;line-height:10px;">Login to Smart Campus</h1></td></tr><tr><td><p>Copy and paste below OTP to verify your <b>'+rows[0].userId+'</b> login</p></td></tr><tbody><tr><td><h1 style="background-color: #f5f5f5;text-align: center;padding: 10px;border-radius:8px;font-family: monospace;letter-spacing: 12px;font-size: xx-large;">'+params.ids[2]+'</h1></td></tr> <tr><td><p style="color: #697882;">Smart Campus<br>A smart assistant to you at your campus.</p></td></tr><tr><td height="10" style="line-height:1px;font-size:1px;height:10px">&nbsp;</td></tr><tr><td><br><div style="display: flex;justify-content: space-between;color: #697882;"><span><a href="https://piltovr.com" style="text-decoration:none;color:#697882" target="_blank">A Piltovr Product</a></span></div></td></tr></tbody></table><br></center>', // html body
                        //         // html: '<center><table style="text-align: center;border:1px solid  rgba(80,80,80,0.3);border-radius:8px; padding:16px;"><tr><td><h1 style="color:#333;font-size:20px">Login to Smart Campus</h1></td></tr><tr><td><p>Copy and paste below OTP to verify your '+rows[0].userId+' login</p></td></tr><tbody><tr><td><h1 style="background-color: #f5f5f5;text-align: center;padding: 10px;border-radius:8px;">'+params.ids[2]+'</h1></td></tr> <tr><td><p style="color: #697882;">Smart Campus<br><span style="font-size:14px">A smart assistant to you at your campus.</span></p></td></tr><tr><td height="10" style="line-height:1px;font-size:1px;height:10px">&nbsp;</td></tr><tr><td><br><div style="display: flex;flex-direction:row;justify-content: space-between;color: #697882;"><span><a href="https://piltovr.com" style="text-decoration:none;color:#697882" target="_blank">A Piltovr Product</a></span><a href="https://www.smartcampus.tools/privacy" style="text-decoration:none;color:#697882" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.smartcampus.tools/privacy&amp;source=gmail&amp;ust=1701507513628000&amp;usg=AOvVaw0a_wK1kV3y2bLZRnHvj_cK">Privacy policy</a></div></td></tr></tbody></table><br></center>', // html body
                        //         // html: '<center><table style="text-align: center;"><tr><td><h1 style="color:#333;font-size:20px">Login to Smart Campus</h1></td></tr><tr><td><p>Copy and paste below OTP to verify your '+rows[0].userId+' login</p></td></tr><tbody><tr><td><h1 style="background-color: #f5f5f5;text-align: center;padding: 10px;">'+params.ids[2]+'</h1></td></tr> <tr><td><p>Smart Campus, a smart assistant to you at your campus.</p></td></tr></tbody></table><br></center>', // html body
                        //         // html: '<center><table><tr><td><p>Copy and paste below OTP to verify your login</p></td></tr> <tr><td><h1 style="background-color:#f5f5f5,text-align:center">'+params.ids[2]+'</h1></td></tr></table><br/></center>', // html body
                        //     });
                        // }
                    }
                    
                    connection.release();
                    // console.log("Message sent: %s", info.messageId);
                    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

                    // Preview only available when sending through an Ethereal account
                    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

                    // return the user data
                    // if user is a dealer, get dealer details
                    if(rows[0].role == 'Dealer' || rows[0].role == 'dealer'){
                        let p = 'SELECT * from dealer WHERE dealerId ="'+rows[0].id+'"';
                        // let p = 'SELECT d.*, (SELECT name from user where id="'+rows[0].mapTo+'" ) as mapName  from dealer WHERE dealerId ="'+rows[0].id+'"';
                        const [drows, dfields] = await connection.execute(p);
                        return Response.json({status: 200, message:'User found!', data: rows[0], data1: drows[0]}, {status: 200})
                    }
                    else {
                        return Response.json({status: 200, message:'User found!', data: rows[0]}, {status: 200})
                    }
                    
                }
                else {
                    // wrong secret key
                    return Response.json({status: 402, message:'Your access is revoked. Contact sales person!'}, {status: 200})
                }

            }
            else {
                // user doesn't exist in the system
                return Response.json({status: 404, message:'This mobile does not match with our records. Contact Sales person.'}, {status: 200})
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
  