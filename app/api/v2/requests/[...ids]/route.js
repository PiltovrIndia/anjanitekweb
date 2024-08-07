import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
const dayjs = require('dayjs');

// get the requests based on the users role and timing
// params used for this API
// key, role, status, offset, collegeId, branch, requestType, hostelId

// requestType – if 3, its official request, 2 – Outcity, 1 – Local, 4 – Temporary day scholar
// hostelId – Used for fetching specific hostel official requests

// 1 role – SuperAdmin
// 2 requestStatus – Approved, Issued or All
// 3 offset – 0
// 4 collegeId - Super33
// 5 requestType – 1,2,3 or All
// 6 platformType – 111 (web) or 000 (mobile)
// 7 year – 1,2,3,4 or All
// 8 campusId - SVECW or All
// 9 dates – from,to
// 10 hostelId – for Issuers login to see hostel specific requests
// 10 branchYears
// 11 courses
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){

            // Platform check – Mobile or web
            // if 10th parameter is present, it means that the request is from web
            // 000 – Mobile
            // 111 – Web
            
            if(params.ids[6] == '111'){
                
                if(params.ids[1] == 'SuperAdmin'){
                
                    // this is mainly to use for web dashboard reports
                    var whr = '';
                    if(params.ids[2] != 'All'){ // check for multiple statues

                        if(params.ids[2] == 'Checkout'){
                            whr = whr + 'AND FIND_IN_SET("InOuting",r.requestStatus) > 0 '
                        }
                        else {
                            whr = whr + 'AND FIND_IN_SET("'+params.ids[2]+'",r.requestStatus) > 0 '
                        }
                    }
                    // if(params.ids[5] != 'All'){ // check for multiple branches
                    //     // split the branches if
                    //     const branchObjects = params.ids[5].split(',');
                    //     // check if there are more than 1 branches
                    //     if(branchObjects.length > 1){
                    //         whr = whr + 'AND (';
                    //         for (let i = 0; i < branchObjects.length; i++) {
                                
                    //             whr = whr + 'FIND_IN_SET("'+branchObjects[i]+'", u.branch) > 0'

                    //             if(i != branchObjects.length-1){
                    //                 whr = whr + ' OR '
                    //             }
                    //         }
                    //         whr = whr + ')'
                    //     }
                    //     else {
                    //         whr = whr + 'AND u.branch = "'+ params.ids[5]+'" '
                    //     }
                    // }
                    if(params.ids[5] != 'All'){ // check for requestTypes
                        // whr = whr + ' AND r.requestType in ('+params.ids[6]+') > 0 '

                        // split the requestTypes if
                        const typeObjects = params.ids[5].split(',');
                        // check if there are more than 1 branches
                        if(typeObjects.length > 1){
                            whr = whr + 'AND (';
                            for (let i = 0; i < typeObjects.length; i++) {
                                
                                whr = whr + 'FIND_IN_SET("'+typeObjects[i]+'", r.requestType) > 0'

                                if(i != typeObjects.length-1){
                                    whr = whr + ' OR '
                                }
                            }
                            whr = whr + ')'
                        }
                        else {
                            whr = whr + 'AND r.requestType = "'+ params.ids[6]+'" '
                        }
                    }
                    // if(params.ids[8] != '0'){ // check for multiple years
                    //     whr = whr + ' AND u.year in ('+params.ids[8]+') > 0 '
                    // }
                    if(params.ids[8] != 'All'){ // check for multiple campuses
                        whr = whr + ' AND FIND_IN_SET("'+params.ids[8]+'",u.campusId) > 0 AND ( ';

                        // Split the string into an array
                        if(params.ids[10] != 'All'){
                            const branches = params.ids[10].split(',');

                            // check if branches are present
                            if(branches.length > 0) {
                                // check if there are more than 1 branch
                                var conditionsString = '';
                                if(branches.length > 1){

                                    // Build the LIKE conditions with case sensitivity
                                    let likeConditions = branches.map(branch => `BINARY CONCAT(u.course,'-',u.branch,'-',u.year) LIKE '%${branch}%'`);

                                    // Join the conditions with OR
                                    conditionsString = likeConditions.join(' OR ');
                                    conditionsString = conditionsString + ') ';
                                }
                                else {
                                    conditionsString = `BINARY CONCAT(u.course,'-',u.branch,'-',u.year) LIKE '%${branchesString}%')`;
                                }

                                whr = whr + conditionsString;
                            }
                        }
                        else {
                            whr = whr + `BINARY CONCAT(u.course) LIKE '%${params.ids[11]}%')`;
                        }
                    }

                    // check for multiple dates
                    if(params.ids[9]!= null && params.ids[9] != 'All'){ // if it is All, then don't include date
                        const dateStrings = params.ids[9].split(','); 
                        const dateObjects = dateStrings.map(dateString => dayjs(dateString, { format: 'YYYY-MM-DD' }));
                        
                        
                        // Check if the two dates are the same
                        if(dateObjects[0].isSame(dateObjects[1], 'day')){

                            // for the requestFrom column
                            // whr = whr + ' AND DATE(r.requestFrom) = "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" ';
                            
                            // we need to get the date column based on the status
                            // if(params.ids[2] == 'All'){
                            //     whr = whr + ' AND DATE(r.requestDate) = "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" ';
                            // }
                            // else if(params.ids[2] == 'Submitted'){
                            //     whr = whr + ' AND DATE(r.requestDate) = "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" ';
                            // }
                            // else if(params.ids[2] == 'Approved'){
                            //     whr = whr + ' AND DATE(r.approvedOn) = "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" ';
                            // }
                            // else if(params.ids[2] == 'Issued'){
                            //     whr = whr + ' AND DATE(r.issuedOn) = "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" ';
                            // }
                            // else 
                            if(params.ids[2]=='Checkout'){
                                whr = whr + ' AND DATE(r.checkoutOn) = "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" ';
                            }
                            else if(params.ids[2] == 'Returned'){
                                whr = whr + ' AND DATE(r.returnedOn) = "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" ';
                            }
                        }
                        else {
                            // for the requestFrom column
                            // whr = whr + ' AND DATE(r.requestFrom) BETWEEN "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" AND "'+dayjs(dateObjects[1]).format('YYYY-MM-DD')+'" ';

                             // we need to get the date column based on the status
                            // if(params.ids[2] == 'All'){
                            //     whr = whr + ' AND DATE(r.requestDate) BETWEEN "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" AND "'+dayjs(dateObjects[1]).format('YYYY-MM-DD')+'" ';
                            // }
                            // else if(params.ids[2] == 'Submitted'){
                            //     whr = whr + ' AND DATE(r.requestDate) BETWEEN "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" AND "'+dayjs(dateObjects[1]).format('YYYY-MM-DD')+'" ';
                            // }
                            // else if(params.ids[2] == 'Approved'){
                            //     whr = whr + ' AND DATE(r.approvedOn) BETWEEN "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" AND "'+dayjs(dateObjects[1]).format('YYYY-MM-DD')+'" ';
                            // }
                            // else if(params.ids[2] == 'Issued'){
                            //     whr = whr + ' AND DATE(r.issuedOn) BETWEEN "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" AND "'+dayjs(dateObjects[1]).format('YYYY-MM-DD')+'" ';
                            // }
                            // else 
                            if(params.ids[2]=='Checkout'){
                                whr = whr + ' AND DATE(r.checkoutOn) BETWEEN "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" AND "'+dayjs(dateObjects[1]).format('YYYY-MM-DD')+'" ';
                            }
                            else if(params.ids[2] == 'Returned'){
                                whr = whr + ' AND DATE(r.returnedOn) BETWEEN "'+dayjs(dateObjects[0]).format('YYYY-MM-DD')+'" AND "'+dayjs(dateObjects[1]).format('YYYY-MM-DD')+'" ';
                            }
                        }
                    }
                    
                    // query
                    let query = 'SELECT r.*,u.*,ud.*,h.* FROM request r JOIN users u JOIN user_details ud JOIN hostel h WHERE r.collegeId = u.collegeId and u.collegeId=ud.collegeId and ud.hostelId=h.hostelId '+whr+' ORDER BY r.requestFrom ASC';
                    // let query = 'SELECT r.*,u.*,ud.* FROM request r JOIN users u JOIN user_details ud WHERE r.collegeId = u.collegeId and u.collegeId=ud.collegeId '+whr+' ORDER BY r.requestFrom ASC LIMIT 20 OFFSET '+params.ids[3];
                    // let query = 'SELECT r.*,u.*,ud.* FROM request r JOIN users u JOIN user_details ud WHERE r.collegeId = u.collegeId and u.collegeId=ud.collegeId '+whr+' ORDER BY r.requestFrom ASC LIMIT 50 OFFSET '+params.ids[3];
                    // let query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId '+whr+' ORDER BY r.requestFrom ASC LIMIT 50 OFFSET '+params.ids[3];
                    // console.log(query);

                    const [rows, fields] = await connection.execute(query);
                    connection.release();
                
                    // check if users is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, message:'Data founded!', data: rows}, {status: 200})

                    }
                    else {
                        // users doesn't exist in the system
                        return Response.json({status: 404, message:'No new requests!'}, {status: 200})
                    }
                }
                else{
                    // wrong role
                    return Response.json({status: 401, message:'Unauthorized'}, {status: 200})
                }

            }





            // this is from mobile
            else {

                // check for the users role
                // if SuperAdmin, get all the requests w.r.t status
                if(params.ids[1] == 'Student'){

                    let query = '';
                    // check what type of requests to be shown
                    // if status is Submitted, that means student is looking for recent request
                    if(params.ids[2] == 'Submitted'){
                        query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND r.collegeId = "'+params.ids[4]+'" AND isOpen = 1 ORDER BY requestDate DESC LIMIT 20 OFFSET '+params.ids[3];
                    }
                    // if not student is looking for requests from the past
                    else {
                        query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND r.collegeId = "'+params.ids[4]+'" AND isOpen = 0 ORDER BY requestDate DESC LIMIT 20 OFFSET '+params.ids[3];
                    }

                    const [rows, fields] = await connection.execute(query);
                    connection.release();

                    // check if users is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})

                    }
                    else {
                        // users doesn't exist in the system
                        return Response.json({status: 404, message:'No new requests!'}, {status: 200})
                    }
                }

                // check for the users role
                // if GlobalAdmin, get all the requests w.r.t status
                else if(params.ids[1] == 'GlobalAdmin'){

                    // verify what type of requests admin is asking
                    let query = '';

                    // based on the status, the query might change because of the ORDER BY
                    if(params.ids[2] == 'Submitted'){

                        // check for request type (official or general)
                        if(params.ids[6] == '3'){
                            query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestType="3" AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" AND isOpen = 1 ORDER BY requestFrom DESC LIMIT 50 OFFSET '+params.ids[3];
                        }
                        else {
                            query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestType!="3" AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" AND isOpen = 1 ORDER BY requestFrom DESC LIMIT 50 OFFSET '+params.ids[3];
                        }
                    }
                    else if(params.ids[2] == 'Approved'){
                        query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" ORDER BY approvedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                        // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY approvedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                    }
                    else if(params.ids[2] == 'Issued'){
                        query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" ORDER BY issuedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                        // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY issuedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                    }
                    else if(params.ids[2] == 'InOuting'){
                        query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" ORDER BY checkoutOn DESC LIMIT 50 OFFSET '+params.ids[3];
                        // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY issuedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                    }
                    else if(params.ids[2] == 'Returned' ){
                        query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" ORDER BY returnedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                        // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY returnedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                    }
                    else {
                        query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" ORDER BY requestFrom DESC LIMIT 50 OFFSET '+params.ids[3];
                        // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY requestFrom ASC LIMIT 50 OFFSET '+params.ids[3];
                        // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY requestDate DESC LIMIT 50 OFFSET '+params.ids[3];
                    }

                    const [rows, fields] = await connection.execute(query);
                    connection.release();
                
                    // check if users is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})

                    }
                    else {
                        // users doesn't exist in the system
                        return Response.json({status: 404, message:'No new requests!'}, {status: 200})
                    }
                }

                // check for the users role
                // if SuperAdmin, get all the requests w.r.t status
                else if(params.ids[1] == 'SuperAdmin'){

                    // verify what type of requests admin is asking
                    let query = '';

                    // based on the status, the query might change because of the ORDER BY
                    if(params.ids[2] == 'Submitted'){

                        // check for request type (official or general)
                        if(params.ids[6] == '3'){
                            query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestType="3" AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" AND isOpen = 1 ORDER BY requestFrom DESC LIMIT 50 OFFSET '+params.ids[3];
                        }
                        else {
                            query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestType!="3" AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" AND isOpen = 1 ORDER BY requestFrom DESC LIMIT 50 OFFSET '+params.ids[3];
                        }
                    }
                    else if(params.ids[2] == 'Approved'){
                        query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" ORDER BY approvedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                        // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY approvedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                    }
                    else if(params.ids[2] == 'Issued'){
                        query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" ORDER BY issuedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                        // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY issuedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                    }
                    else if(params.ids[2] == 'InOuting' ){
                        query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" ORDER BY checkoutOn DESC LIMIT 50 OFFSET '+params.ids[3];
                        // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY issuedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                    }
                    else if(params.ids[2] == 'Returned' ){
                        query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" ORDER BY returnedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                        // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY returnedOn DESC LIMIT 50 OFFSET '+params.ids[3];
                    }
                    else {
                        query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" ORDER BY requestFrom DESC LIMIT 50 OFFSET '+params.ids[3];
                        // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY requestFrom ASC LIMIT 50 OFFSET '+params.ids[3];
                        // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY requestDate DESC LIMIT 50 OFFSET '+params.ids[3];
                    }

                    const [rows, fields] = await connection.execute(query);
                    connection.release();
                
                    // check if users is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})

                    }
                    else {
                        // users doesn't exist in the system
                        return Response.json({status: 404, message:'No new requests!'}, {status: 200})
                    }
                }
                // if Admin, get all requests w.r.t status and course
                else if(params.ids[1] == 'Admin'){

                    // break down the branch string
                    var branchesString = params.ids[5];

                    // Split the string into an array
                    let branches = branchesString.split(',');

                    // check if there are more than 1 branch
                    var conditionsString = '';
                    if(branches.length > 1){
                        // Build the LIKE conditions with case sensitivity
                        let likeConditions = branches.map(branch => `BINARY CONCAT(u.course,'-',u.branch,'-',u.year) LIKE '%${branch}%'`);

                        // Join the conditions with OR
                        conditionsString = likeConditions.join(' OR ');
                    }
                    else {
                        conditionsString = `BINARY CONCAT(u.course,'-',u.branch,'-',u.year) LIKE '%${branchesString}%'`;
                    }

                    // verify what type of requests admin is asking
                    let query = '';
                    if(params.ids[6] == '3'){
                        // for the admin, removing the offset
                        // loading all the results at a time so that search can be made inline
                        query = `SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND r.campusId="`+params.ids[9]+`" AND requestStatus = "`+params.ids[2]+`" AND (${conditionsString}) AND requestType="3" ORDER BY requestFrom ASC`;
                        
                    }
                    else {
                        
                        query = `SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND r.campusId="`+params.ids[9]+`" AND requestStatus = "`+params.ids[2]+`" AND (${conditionsString}) AND requestType="`+params.ids[6]+`"  ORDER BY requestFrom ASC LIMIT 50 OFFSET `+params.ids[3];
                        
                    }
                    // // verify what type of requests admin is asking
                    // let query = '';
                    // if(params.ids[6] == '3'){
                    //     // for the admin, removing the offset
                    //     // loading all the results at a time so that search can be made inline
                    //     query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND FIND_IN_SET("'+params.ids[5]+'",u.branch) > 0 AND requestType="3" ORDER BY u.year,u.collegeId DESC';
                        
                    // }
                    // else {
                    //     query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND FIND_IN_SET("'+params.ids[5]+'",u.branch) > 0 AND requestType!="3"  ORDER BY u.year,u.collegeId DESC LIMIT 20 OFFSET '+params.ids[3];
                    // }
                    // console.log(query);
                    const [rows, fields] = await connection.execute(query);
                    connection.release();
                
                    // check if users is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})

                    }
                    else {
                        // users doesn't exist in the system
                        return Response.json({status: 404, message:'No new requests!'}, {status: 200})
                    }
                }
                // if OutingAdmin, get all requests that are approved by admins
                else if((params.ids[1] == 'OutingAdmin')){

                    // verify what type of requests issuer is asking
                    let query = '';
                    if(params.ids[6] == '3'){
                        query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" AND requestType="3" ORDER BY requestFrom ASC LIMIT 20 OFFSET '+params.ids[3];
                        // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND requestType="3" ORDER BY approvedOn DESC LIMIT 20 OFFSET '+params.ids[3];
                    }
                    else {
                        // we want to return all requests irrespective of official or general outing just for viewing
                        // if users is asking for pending requests (approved), then only return what they can approve
                        if(params.ids[2] == 'Approved'){
                            query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" AND requestType!="3" AND isOpen = 1 ORDER BY requestFrom ASC LIMIT 20 OFFSET '+params.ids[3];
                            // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND requestType!="3" ORDER BY approvedOn DESC LIMIT 20 OFFSET '+params.ids[3];
                        }
                        else {
                            query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" AND r.campusId="'+params.ids[9]+'" ORDER BY requestFrom ASC LIMIT 20 OFFSET '+params.ids[3];
                            // query = 'SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY approvedOn DESC LIMIT 20 OFFSET '+params.ids[3];
                        }
                    }

                    const [rows, fields] = await connection.execute(query);
                    connection.release();
                
                    // check if users is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})

                    }
                    else {
                        // users doesn't exist in the system
                        return Response.json({status: 404, message:'No new requests!'}, {status: 200})
                    }
                }
                // if OutingIssuer, get only OFFICIAL requests that are approved by admin and that belong to issuer hostel
                else if(params.ids[1] == 'OutingIssuer'){
                    const [rows, fields] = await connection.execute('SELECT r.*,u.*, d.* FROM request r JOIN users u ON r.collegeId = u.collegeId JOIN user_details d ON r.collegeId = d.collegeId WHERE r.requestStatus = "'+params.ids[2]+'" AND r.requestType="3" AND d.hostelId = "'+params.ids[11]+'" ORDER BY r.requestFrom ASC LIMIT 20 OFFSET '+params.ids[3]);
                    // const [rows, fields] = await connection.execute('SELECT r.*,u.*, d.* FROM request r JOIN users u ON r.collegeId = u.collegeId JOIN user_details d ON r.collegeId = d.collegeId WHERE r.requestStatus = "'+params.ids[2]+'" AND r.requestType="3" AND d.hostelId = "'+params.ids[6]+'" ORDER BY r.approvedOn DESC LIMIT 20 OFFSET '+params.ids[3]);
                    connection.release();
                
                    // check if users is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})

                    }
                    else {
                        // users doesn't exist in the system
                        return Response.json({status: 404, message:'No new requests!'}, {status: 200})
                    }
                }
                // if OutingAssistant, get all requests that are issued by OutingIssuer
                else if(params.ids[1] == 'OutingAssistant'){
                    const [rows, fields] = await connection.execute('SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND r.isOpen = 1 AND r.collegeId = "'+params.ids[2]+'" ORDER BY requestFrom ASC LIMIT 20 OFFSET '+params.ids[3]);
                    // const [rows, fields] = await connection.execute('SELECT r.*,u.* FROM request r JOIN users u WHERE r.collegeId = u.collegeId AND requestStatus = "'+params.ids[2]+'" ORDER BY issuedOn DESC LIMIT 20 OFFSET '+params.ids[3]);
                    connection.release();
                
                    // check if users is found
                    if(rows.length > 0){
                        // return the requests data
                        return Response.json({status: 200, message:'Data found!', data: rows}, {status: 200})

                    }
                    else {
                        // users doesn't exist in the system
                        return Response.json({status: 404, message:'No new requests!'}, {status: 200})
                    }
                }
                else{
                    // wrong role
                    return Response.json({status: 401, message:'Unauthorized'}, {status: 200})
                }

            }


            // search for users based on the provided collegeId
            // const [rows, fields] = await connection.execute('SELECT * FROM request where isOpen = 1 and collegeId = "'+params.ids[2]+'" ORDER BY requestDate LIMIT 5 OFFSET '+params.ids[3]);
            
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
  