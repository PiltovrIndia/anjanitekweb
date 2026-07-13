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
            // get the list of products
            if(params.ids[1] == 'U1'){
                try {
                    
                    const [rows, fields] = await connection.execute('SELECT p.*, s.design as favorite FROM products p LEFT JOIN products_selected s ON p.design=s.design LIMIT 20 OFFSET '+params.ids[3]);
                    // const [rows, fields] = await connection.execute('SELECT * from products LIMIT 20 OFFSET '+params.ids[3]);
                    connection.release();

                    if(rows.length > 0)
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})
                    else 
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            // get all products
            if(params.ids[1] == 'U1.1'){
                try {
                    
                    const [rows, fields] = await connection.execute('SELECT p.*, s.design as favorite FROM products p LEFT JOIN products_selected s ON p.design=s.design');
                    connection.release();

                    if(rows.length > 0)
                        return Response.json({status: 200, data: rows, message:'Updated!'}, {status: 200})
                    else 
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No product found!'+error}, {status: 200})
                }
            }
            // get products by size
            else if(params.ids[1] == 'U2'){
                try {
                    const [rows, fields] = await connection.execute('SELECT * from products WHERE size="'+params.ids[2]+'" LIMIT 20 OFFSET '+params.ids[3]);
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
            // get products by tags
            else if(params.ids[1] == 'U3'){
                try {
                    var str = '';
                    if(params.ids[2].length > 0){
                        str = params.ids[2].split(',').map(tag => `FIND_IN_SET(`+tag+`, tags)`).join(' AND ');
                    }
                    else {
                        str = 'FIND_IN_SET("39", tags)';
                    }
                    
                        // const conditions = params.ids[2].split(',').map(tag => `FIND_IN_SET(`+tag+`, tags)`).join(' AND ');                    
                        const [rows, fields] = await connection.execute(`SELECT * from products WHERE ${str} LIMIT 20 OFFSET ${params.ids[3]}`);
                        const [countRows, countFields] = await connection.execute(`SELECT COUNT(*) as count from products WHERE ${str}`);
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
            // get products by search
            else if(params.ids[1] == 'U4'){
                try {
                    var str = `(design LIKE '%${params.ids[2]}%' OR name LIKE '%${params.ids[2]}%')`;
                    
                    const [rows, fields] = await connection.execute(`SELECT * from products WHERE ${str} LIMIT 20 OFFSET ${params.ids[3]}`);
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
                    const [rows, fields] = await connection.execute('UPDATE products SET tags="'+params.ids[3]+'", size="'+params.ids[4]+'" WHERE productId="'+params.ids[2]+'"');
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
                    const [rows, fields] = await connection.execute('UPDATE products SET imageUrls="'+params.ids[3]+'" WHERE productId="'+params.ids[2]+'"');
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

                    let p = `INSERT INTO products (${productKeys}) VALUES (${productValues})`;
                    const [rows, fields] = await connection.execute(p);

                    // const [rows, fields] = await connection.execute('INSERT into products (design, name, description, size, tags, imageUrls, createdOn) VALUES ("'+params.ids[2]+'", "'+params.ids[3]+'", "'+params.ids[4]+'", "'+params.ids[5]+'", "'+params.ids[6]+'", "'+params.ids[7]+'", "'+params.ids[8]+'")');
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

                    // const [rows, fields] = await connection.execute('INSERT into products (design, name, description, size, tags, imageUrls, createdOn) VALUES ("'+params.ids[2]+'", "'+params.ids[3]+'", "'+params.ids[4]+'", "'+params.ids[5]+'", "'+params.ids[6]+'", "'+params.ids[7]+'", "'+params.ids[8]+'")');
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
                    const [rows, fields] = await connection.execute('SELECT p.*, s.design as favorite FROM products p RIGHT JOIN products_selected s ON p.design=s.design ORDER BY s.createdOn DESC LIMIT 1');
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
                    console.log('UPDATE products SET name="'+params.ids[3]+'" WHERE productId="'+params.ids[2]+'"');
                    
                    const [rows, fields] = await connection.execute('UPDATE products SET name="'+params.ids[3]+'" WHERE productId="'+params.ids[2]+'"');
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


//   export async function POST(request, {params}) {
      
//       try{
//         const connection = await pool.getConnection();
  
//           // authorize secret key
//           if(await Keyverify(params.ids[0])){
            
            
//               if(params.ids[1] == 'U0'){ // Upload invoices in bulk
              
//                   const items = await request.json();
                  
//                   const cols = ['design', 'prm', 'std', 'createdOn'];
//                     const chunkSize = 500;
                    
//                     try {
                    
//                         await connection.beginTransaction();

//                         for (let i = 0; i < items.length; i += chunkSize) {
//                         const chunk = items.slice(i, i + chunkSize);

//                             // perform bulk UPDATE using CASE ... WHEN for each column, matching rows by the key column
//                             const keyCol = 'design'; // column to match rows on
//                             const updateCols = cols.filter(c => c !== keyCol);

//                             // build SET clause: col = CASE keyCol WHEN k1 THEN v1 WHEN k2 THEN v2 ... ELSE col END
//                             const setClause = updateCols.map(col => {
//                               const whenParts = chunk.map(() => `WHEN ? THEN ?`).join(' ');
//                               return `${col} = CASE ${keyCol} ${whenParts} ELSE ${col} END`;
//                             }).join(', ');

//                             // WHERE clause to limit affected rows to the chunk keys
//                             const wherePlaceholders = chunk.map(() => '?').join(', ');
//                             const sql = `UPDATE products SET ${setClause} WHERE ${keyCol} IN (${wherePlaceholders});`;

//                             // build values in the exact order the SQL expects:
//                             // for each update column -> for each row push (keyValue, columnValue)
//                             const values = [];
//                             for (const col of updateCols) {
//                               for (const row of chunk) {
//                                 values.push(row[keyCol], row[col]);
//                               }
//                             }
//                             // finally push the key values for the WHERE ... IN (...)
//                             for (const row of chunk) values.push(row[keyCol]);
                        
//                             await connection.query(sql, values);
//                         }

//                         await connection.commit();
//                         return Response.json({status: 200, message:`Stock details updated! ✅`}, {status: 200})
                    
//                     } catch (err) {
//                         await connection.rollback();
//                         return Response.json({status: 500, message:'Facing issues. Please try again!'+err.message}, {status: 500})

//                     } finally {
//                         connection.release();
//                     }
  
//               }
//               else {
//                   return Response.json({status: 404, message:'Not found!'}, {status: 200})
//               }
//           }
//           else {
//               // wrong secret key
//               return Response.json({status: 401, message:'Unauthorized'}, {status: 200})
//           }
//       }
//       catch (err){
//           // some error occured
//           return Response.json({status: 500, message:'Facing issues. Please try again!'+err}, {status: 200})
//       }
//     }

  export async function POST(request, {params}) {
      let connection;
      try{
        connection = await pool.getConnection();

          // authorize secret key
          if(await Keyverify(params.ids[0])){


              if(params.ids[1] == 'U0'){ // Upload stock in bulk

                    const items = await request.json();

                    const chunkSize = 200;
                    const allocationSummary = [];

                    for (let i = 0; i < items.length; i += chunkSize) {
                        const chunk = items.slice(i, i + chunkSize);

                        const designs = chunk
                        .map((row) => row.design)
                        .filter(Boolean);

                        if (designs.length === 0) continue;

                        try {
                        await connection.beginTransaction();

                        /**
                         * Lock product rows first.
                         * This prevents stock conflicts while allocation is happening.
                         */
                        const placeholders = designs.map(() => "?").join(",");

                        const [productRows] = await connection.query(
                        `
                        SELECT productId, design, prm, std
                        FROM products
                        WHERE design IN (${placeholders})
                        FOR UPDATE
                        `,
                        designs
                        );

                        const productMap = new Map(
                        productRows.map((product) => [String(product.design), product])
                        );

                        for (const row of chunk) {
                        const design = row.design;
                        const product = productMap.get(String(design));

                        if (!design || !product) {
                            allocationSummary.push({
                            design,
                            success: false,
                            message: "Product not found",
                            });
                            continue;
                        }

                        let finalPrmStock = normalizeQty(row.prm);
                        let finalStdStock = normalizeQty(row.std);

                        const designAllocations = {
                            design,
                            prm: null,
                            std: null,
                        };

                        /**
                         * Allocate PRM stock
                         */
                        if (finalPrmStock !== null) {
                            const result = await allocatePendingOrdersForDesign({
                            connection,
                            design,
                            stockType: "prm",
                            availableStock: finalPrmStock,
                            });

                            finalPrmStock = result.remainingStock;

                            designAllocations.prm = {
                            uploadedQty: normalizeQty(row.prm),
                            allocatedQty: result.allocatedQty,
                            remainingStock: result.remainingStock,
                            allocations: result.allocations,
                            };
                        }

                        /**
                         * Allocate STD stock
                         */
                        if (finalStdStock !== null) {
                            const result = await allocatePendingOrdersForDesign({
                            connection,
                            design,
                            stockType: "std",
                            availableStock: finalStdStock,
                            });

                            finalStdStock = result.remainingStock;

                            designAllocations.std = {
                            uploadedQty: normalizeQty(row.std),
                            allocatedQty: result.allocatedQty,
                            remainingStock: result.remainingStock,
                            allocations: result.allocations,
                            };
                        }

                        /**
                         * Update product stock with remaining stock after allocation.
                         * If prm/std was not provided in Excel, keep existing DB value.
                         */
                        await connection.query(
                            `
                            UPDATE products
                            SET
                            prm = CASE WHEN ? IS NULL THEN prm ELSE ? END,
                            std = CASE WHEN ? IS NULL THEN std ELSE ? END,
                            createdOn = COALESCE(?, createdOn)
                            WHERE design = ?
                            `,
                            [
                            finalPrmStock,
                            finalPrmStock,
                            finalStdStock,
                            finalStdStock,
                            row.createdOn || null,
                            design,
                            ]
                        );

                        allocationSummary.push({
                            success: true,
                            ...designAllocations,
                        });
                        }

                        await connection.commit();

                        } catch (chunkErr) {
                        await connection.rollback();
                        console.error(`Bulk stock update error at chunk index ${i}:`, chunkErr);
                        allocationSummary.push({
                            chunkStart: i,
                            success: false,
                            message: "Chunk failed: " + chunkErr.message,
                        });
                        }
                    }

                    return Response.json(
                        {
                        status: 200,
                        success: true,
                        message: "Stock upload complete.",
                        data: allocationSummary,
                        },
                        { status: 200 }
                    );

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
          return Response.json({status: 500, message:'Facing issues. Please try again! ' + err.message}, {status: 200})
      }
      finally {
          if (connection) connection.release();
      }
    }


// Helpers
    async function allocatePendingOrdersForDesign({
        connection,
        design,
        stockType,
        availableStock,
        }) {
        let remainingStock = Number(availableStock || 0);

        if (remainingStock <= 0) {
            return {
            allocatedQty: 0,
            remainingStock: 0,
            allocations: [],
            };
        }

        /**
         * Lock pending order rows in waitlist order.
         */
        const [pendingRows] = await connection.query(
            `
            SELECT
            id,
            cartId,
            dealerId,
            design,
            stockType,
            requestedQty,
            approvedQty,
            productionQty,
            createdOn
            FROM orders
            WHERE design = ?
            AND stockType = ?
            AND productionQty > 0
            AND isDeleted = 0
            AND status NOT IN ('Cancelled', 'Rejected')
            ORDER BY
            COALESCE(modifiedOn, approvedOn, createdOn) ASC,
            id ASC
            FOR UPDATE
            `,
            [design, stockType]
        );

        const allocations = [];
        let totalAllocatedQty = 0;

        for (const order of pendingRows) {
            if (remainingStock <= 0) break;

            const pendingQty = Number(order.productionQty || 0);

            if (pendingQty <= 0) continue;

            const allocateQty = Math.min(remainingStock, pendingQty);

            const newApprovedQty = Number(order.approvedQty || 0) + allocateQty;
            const newProductionQty = pendingQty - allocateQty;

            await connection.query(
            `
            UPDATE orders
            SET
                approvedQty = ?,
                productionQty = ?,
                modifiedOn = NOW()
            WHERE id = ?
            `,
            [newApprovedQty, newProductionQty, order.id]
            );

            remainingStock -= allocateQty;
            totalAllocatedQty += allocateQty;

            allocations.push({
            orderId: order.id,
            cartId: order.cartId,
            dealerId: order.dealerId,
            design: order.design,
            stockType: order.stockType,
            allocatedQty: allocateQty,
            approvedQty: newApprovedQty,
            productionQty: newProductionQty,
            });
        }

        return {
            allocatedQty: totalAllocatedQty,
            remainingStock,
            allocations,
        };
    }


    function normalizeQty(value) {
        if (value === undefined || value === null || value === "") {
            return null;
        }

        const qty = Number(value);

        if (Number.isNaN(qty) || qty < 0) {
            return null;
        }

        return qty;
    }