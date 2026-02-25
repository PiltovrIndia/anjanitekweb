import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
import dayjs from 'dayjs'
const OneSignal = require('onesignal-node')

const client = new OneSignal.Client(process.env.ONE_SIGNAL_APPID, process.env.ONE_SIGNAL_APIKEY)

// API for updates to user data
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){

            // get the list of product related tags
            if(params.ids[1] == 'U0'){
                try {
                    const [rows, fields] = await connection.execute('SELECT * from product_tags');
                    connection.release();

                    if(rows.length > 0){
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            // get the list of products1
            if(params.ids[1] == 'U1'){
                try {
                    
                    const [rows, fields] = await connection.execute('SELECT p.*, s.design as favorite FROM products1 p LEFT JOIN products_selected s ON p.design=s.design LIMIT 20 OFFSET '+params.ids[3]);
                    // const [rows, fields] = await connection.execute('SELECT * from products1 LIMIT 20 OFFSET '+params.ids[3]);
                    connection.release();

                    if(rows.length > 0)
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})
                    else 
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            // get all products1
            if(params.ids[1] == 'U1.1'){
                try {
                    
                    const [rows, fields] = await connection.execute('SELECT p.*, s.design as favorite FROM products1 p LEFT JOIN products_selected s ON p.design=s.design');
                    connection.release();

                    if(rows.length > 0)
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})
                    else 
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            // get products1 by size
            else if(params.ids[1] == 'U2'){
                try {
                    const [rows, fields] = await connection.execute('SELECT * from products1 WHERE size="'+params.ids[2]+'" LIMIT 20 OFFSET '+params.ids[3]);
                    connection.release();

                    if(rows.length > 0){
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) {
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            // get products1 by tags
            else if(params.ids[1] == 'U3'){
                try {
                    var str = '';
                    if(params.ids[2].length > 0){
                        str = params.ids[2].split(',').map(tag => `FIND_IN_SET(`+tag+`, tags)`).join(' AND ');
                    }
                    else {
                        str = 'FIND_IN_SET("39", tags)';
                    }console.log(`SELECT * from products1 WHERE ${str} LIMIT 20 OFFSET ${params.ids[3]}`);;
                    
                        // const conditions = params.ids[2].split(',').map(tag => `FIND_IN_SET(`+tag+`, tags)`).join(' AND ');                    
                        const [rows, fields] = await connection.execute(`SELECT * from products1 WHERE ${str} LIMIT 20 OFFSET ${params.ids[3]}`);
                        const [countRows, countFields] = await connection.execute(`SELECT COUNT(*) as count from products1 WHERE ${str}`);
                        const totalCount = countRows[0].count;
                        connection.release();

                        // check if user is found
                        if(rows.length > 0){
                            return Response.json({status: 200, data: rows, count: totalCount, message:'Data found!'}, {status: 200})
                        }
                        else {
                            return Response.json({status: 201, message:'No data found!'}, {status: 200})
                        }
                    } catch (error) { // error updating
                        return Response.json({status: 404, message:'No product found!'}, {status: 200})
                }
            }
            // get products1 by search
            else if(params.ids[1] == 'U4'){
                try {
                    var str = `(design LIKE '%${params.ids[2]}%' OR name LIKE '%${params.ids[2]}%')`;
                    
                    const [rows, fields] = await connection.execute(`SELECT * from products1 WHERE ${str} LIMIT 20 OFFSET ${params.ids[3]}`);
                    connection.release();

                        // check if user is found
                        if(rows.length > 0){
                            return Response.json({status: 200, data: rows, message:'Data found!'}, {status: 200})
                        }
                        else {
                            return Response.json({status: 201, message:'No data found!'}, {status: 200})
                        }
                    } catch (error) { // error updating
                        return Response.json({status: 404, message:'No product found!'}, {status: 200})
                }
            }
            // update a product
            else if(params.ids[1] == 'U5'){
                try {
                    const [rows, fields] = await connection.execute('UPDATE products1 SET tags="'+params.ids[3]+'", size="'+params.ids[4]+'" WHERE productId="'+params.ids[2]+'"');
                    connection.release();

                    if(rows.affectedRows > 0){
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) {
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            
            // update the images for a product
            else if(params.ids[1] == 'U6'){
                try {
                    const [rows, fields] = await connection.execute('UPDATE products1 SET imageUrls="'+params.ids[3]+'" WHERE productId="'+params.ids[2]+'"');
                    connection.release();

                    if(rows.affectedRows > 0){
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) {
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            
            // create a product
            else if(params.ids[1] == 'U7'){
                try {

                    // get the list of things to update
                    const productObject = JSON.parse(params.ids[2]);
                    // var updateString = '';
                    var productKeys = '', productValues = '';

                    // parse through the list of things to update and form a string
                    // productObject
                    for (const key in productObject) {
                        if (productObject.hasOwnProperty(key)) {
                          const value = productObject[key];
                          
                            if(productKeys.length == 0){
                                // updateString = `${key}='${value}'`;
                                productKeys = `${key}`;
                                productValues = `'${value}'`;

                            }
                            else {
                                // updateString = updateString + `,${key}='${value}'`;
                                productKeys = productKeys + `,${key}`;
                                productValues = productValues + `,'${value}'`;
                            }
                        }
                      }
                      
                      
                    // console.log(`INSERT INTO user (${productKeys}) VALUES (${productValues})`);
                    // console.log(`INSERT INTO dealer (${userDetailKeys}) VALUES (${userDetailValues})`);

                    let p = `INSERT INTO products1 (${productKeys}) VALUES (${productValues})`;
                    const [rows, fields] = await connection.execute(p);

                    // const [rows, fields] = await connection.execute('INSERT into products1 (design, name, description, size, tags, imageUrls, createdOn) VALUES ("'+params.ids[2]+'", "'+params.ids[3]+'", "'+params.ids[4]+'", "'+params.ids[5]+'", "'+params.ids[6]+'", "'+params.ids[7]+'", "'+params.ids[8]+'")');
                    connection.release();
                    

                    if(rows.insertId > 0){
                        return Response.json({status: 200, data: rows.insertId, message:'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) {
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            
            // design of the day
            else if(params.ids[1] == 'U8'){
                try {

                    // get the list of things to update
                    const productObject = JSON.parse(params.ids[2]);
                    // var updateString = '';
                    var productKeys = '', productValues = '';

                    // parse through the list of things to update and form a string
                    // productObject
                    for (const key in productObject) {
                        if (productObject.hasOwnProperty(key)) {
                          const value = productObject[key];
                          
                            if(productKeys.length == 0){
                                // updateString = `${key}='${value}'`;
                                productKeys = `${key}`;
                                productValues = `'${value}'`;

                            }
                            else {
                                // updateString = updateString + `,${key}='${value}'`;
                                productKeys = productKeys + `,${key}`;
                                productValues = productValues + `,'${value}'`;
                            }
                        }
                      }
                      
                      
                    // console.log(`INSERT INTO products_selected (${productKeys}) VALUES (${productValues})`);
                    // console.log(`INSERT INTO dealer (${userDetailKeys}) VALUES (${userDetailValues})`);

                    let p = `INSERT INTO products_selected (${productKeys}) VALUES (${productValues})`;
                    const [rows, fields] = await connection.execute(p);

                    // const [rows, fields] = await connection.execute('INSERT into products1 (design, name, description, size, tags, imageUrls, createdOn) VALUES ("'+params.ids[2]+'", "'+params.ids[3]+'", "'+params.ids[4]+'", "'+params.ids[5]+'", "'+params.ids[6]+'", "'+params.ids[7]+'", "'+params.ids[8]+'")');
                    connection.release();
                    

                    if(rows.insertId > 0){
                        return Response.json({status: 200, data: rows.insertId, message:'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) {
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            // get the design of the day
            // fetch the latest entry from products_selected
            else if(params.ids[1] == 'U9'){
                try {
                    const [rows, fields] = await connection.execute('SELECT p.*, s.design as favorite FROM products1 p RIGHT JOIN products_selected s ON p.design=s.design ORDER BY s.createdOn DESC LIMIT 1');
                    const [rowsTags, fieldsTags] = await connection.execute('SELECT * from product_tags');
                    connection.release();

                    if(rows.length > 0){
                        return Response.json({status: 200, data: rows, tags: rowsTags}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) {
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            
            // update product name
            else if(params.ids[1] == 'U10'){
                try {
                    console.log('UPDATE products1 SET name="'+params.ids[3]+'" WHERE productId="'+params.ids[2]+'"');
                    
                    const [rows, fields] = await connection.execute('UPDATE products1 SET name="'+params.ids[3]+'" WHERE productId="'+params.ids[2]+'"');
                    connection.release();

                    if(rows.affectedRows > 0){
                        return Response.json({status: 200, data: rows, message:'Name updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                } catch (error) {
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
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


  export async function POST(request, {params}) {
      
      try{
        const connection = await pool.getConnection();
  
          // authorize secret key
          if(await Keyverify(params.ids[0])){
            
            
              if(params.ids[1] == 'U0'){ // Upload invoices in bulk
              
                  // invoiceId, invoiceNo, invoiceType, invoiceDate, PoNo, vehicleNo, transport, LRNo, billTo, shipTo, totalAmount, amountPaid, pending, status, expiryDate, sales
                  const items = await request.json();
                  
                //   for (const [index, item] of items.entries()){
                      // console.log(`Item ${index}:`, item);
                    //   await applyStockData(params.ids[2], item.design, item.prm, item.std);
                //   }
                  
                  const cols = ['design', 'prm', 'std', 'createdOn'];
                    const chunkSize = 500;
                    
                    try {
                    
                        await connection.beginTransaction();

                        for (let i = 0; i < items.length; i += chunkSize) {
                        const chunk = items.slice(i, i + chunkSize);
                        // const placeholders = chunk.map(() => `(${cols.map(() => '?').join(',')})`).join(',');
                        // const values = chunk.flatMap((s) => cols.map((c) => s[c]));

                            // perform bulk UPDATE using CASE ... WHEN for each column, matching rows by the key column
                            const keyCol = 'design'; // column to match rows on
                            const updateCols = cols.filter(c => c !== keyCol);

                            // build SET clause: col = CASE keyCol WHEN k1 THEN v1 WHEN k2 THEN v2 ... ELSE col END
                            const setClause = updateCols.map(col => {
                              const whenParts = chunk.map(() => `WHEN ? THEN ?`).join(' ');
                              return `${col} = CASE ${keyCol} ${whenParts} ELSE ${col} END`;
                            }).join(', ');

                            // WHERE clause to limit affected rows to the chunk keys
                            const wherePlaceholders = chunk.map(() => '?').join(', ');
                            const sql = `UPDATE products1 SET ${setClause} WHERE ${keyCol} IN (${wherePlaceholders});`;

                            // build values in the exact order the SQL expects:
                            // for each update column -> for each row push (keyValue, columnValue)
                            const values = [];
                            for (const col of updateCols) {
                              for (const row of chunk) {
                                values.push(row[keyCol], row[col]);
                              }
                            }
                            // finally push the key values for the WHERE ... IN (...)
                            for (const row of chunk) values.push(row[keyCol]);
                        
                            await connection.query(sql, values);
                        }

                        await connection.commit();
                        return Response.json({status: 200, message:`Stock details updated! ✅`}, {status: 200})
                    
                    } catch (err) {
                        await connection.rollback();
                        return Response.json({status: 500, message:'Facing issues. Please try again!'+err.message}, {status: 500})

                    } finally {
                        connection.release();
                    }
  
              }
              else {
                  return Response.json({status: 404, message:'Not found!'}, {status: 200})
              }
          }
          else {
              // wrong secret key
              return Response.json({status: 401, message:'Unauthorized'}, {status: 200})
          }
      }
      catch (err){
          // some error occured
          return Response.json({status: 500, message:'Facing issues. Please try again!'+err}, {status: 200})
      }
    }

