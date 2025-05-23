import pool from '../../../db'
// const OneSignal = require('onesignal-node')
import { Keyverify } from '../../../secretverify';

// const client = new OneSignal.Client(process.env.ONE_SIGNAL_APPID, process.env.ONE_SIGNAL_APIKEY)
// if 0, get all campuses list
// else, get campus record of specifc campusId
export async function GET(request,{params}) {

    const connection = await pool.getConnection();
    
        try{

          // authorize secret key
        if(await Keyverify(params.ids[0])){
            // authorize secret key
            if(params.ids[1] == '0'){

              var query = '';
              
              if(params.ids[2]=='SuperAdmin' || params.ids[2]=='GlobalAdmin'){
                  query =
                    `SELECT 
                        'All' AS state, 
                        COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                        COUNT(DISTINCT d.dealerId) AS dealers,
                        COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                        COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL, 
                        COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL 
                    FROM 
                        dealer d 
                    LEFT JOIN 
                        invoices i ON i.billTo = d.dealerId
                    
                    UNION ALL

                    SELECT 
                        d.state, 
                        COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                        COUNT(DISTINCT d.dealerId) AS dealers,
                        COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                        COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL,
                        COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL
                    FROM 
                        dealer d 
                    LEFT JOIN 
                        invoices i ON i.billTo = d.dealerId 
                    GROUP BY 
                        d.state;`;
                }
                else if(params.ids[2]=='StateHead'){

                  // get the list of managers or executives mapped to StateHead
                  const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role="SalesManager" AND mapTo="'+params.ids[3]+'"');
                  const [rowss, fieldss] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+params.ids[3]+'"');
                  const [rowsss, fieldsss] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+params.ids[3]+'"');
                  // const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role IN ("SalesManager","SalesExecutive") AND mapTo="'+params.ids[3]+'"');
                  
                  // get the list of executives mapped to each head
                  var executives = [];
                  const promises1 = rows.map(async (row) => {
                      const [rows11, fields1] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+row.id+'"');
                      rows11.map((row11) => {
                          executives.push(row11.id);
                      })
                  });
                  await Promise.all(promises1); // wait till above finishes
                  const promises2 = rowss.map((rowss1) => {
                        executives.push(rowss1.id);
                  });
                  await Promise.all(promises2); // wait till above finishes
                  
                  var dealers = [];
                  // get the list of dealers mapped to each executive
                  const promises = executives.map(async (row) => {
                      const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+row+'"');
                      rows1.map((row1) => {
                          dealers.push(row1.id);
                      })
                  });
                  await Promise.all(promises); // wait till above finishes
                  
                  // get the list of dealers mapped directly to StateHead
                  const promises11 = rowsss.map(async (row) => {
                      dealers.push(row.id);
                  });
                  await Promise.all(promises11);

                  // get the dealers
                  if(dealers.length > 0){
                    console.log('q4');
                      const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                      
                      query =
                        `SELECT 
                            'All' AS state, 
                            COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                            COUNT(DISTINCT d.dealerId) AS dealers,
                            COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL, 
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL 
                        FROM 
                            dealer d 
                        LEFT JOIN 
                            invoices i ON i.billTo = d.dealerId
                        WHERE i.billTo IN (${dealersList}) 
                        UNION ALL

                        SELECT 
                            d.state, 
                            COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                            COUNT(DISTINCT d.dealerId) AS dealers,
                            COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL
                        FROM 
                            dealer d 
                        LEFT JOIN 
                            invoices i ON i.billTo = d.dealerId 
                        WHERE i.billTo IN (${dealersList}) 
                        GROUP BY 
                            d.state;`;

                      const [rows2, fields2] = await connection.execute(query);
                      connection.release();
                      return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                  }
                  else {
                      connection.release();
                      return Response.json({status: 404, message:'No Data found!'}, {status: 200})
                  }

                  
                }
                else if(params.ids[2]=='SalesManager'){

                  // get the list of executives mapped to SalesManager
                  const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+params.ids[3]+'"');
                  console.log('q2');
                  // get the list of dealers mapped to each executive
                  var dealers = [];
                  const promises = rows.map(async (row) => {
                    console.log('q3');
                      const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+row.id+'"');
                      rows1.map((row1) => {
                          dealers.push(row1.id);
                      })
                  });

                  await Promise.all(promises); // wait till above finishes

                  // get the dealers
                  if(dealers.length > 0){
                    console.log('q4');
                      const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                      
                      query =
                        `SELECT 
                            'All' AS state, 
                            COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                            COUNT(DISTINCT d.dealerId) AS dealers,
                            COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL, 
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL 
                        FROM 
                            dealer d 
                        LEFT JOIN 
                            invoices i ON i.billTo = d.dealerId
                        WHERE i.billTo IN (${dealersList}) 
                        UNION ALL

                        SELECT 
                            d.state, 
                            COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                            COUNT(DISTINCT d.dealerId) AS dealers,
                            COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL
                        FROM 
                            dealer d 
                        LEFT JOIN 
                            invoices i ON i.billTo = d.dealerId 
                        WHERE i.billTo IN (${dealersList}) 
                        GROUP BY 
                            d.state;`;

                      const [rows2, fields2] = await connection.execute(query);
                      connection.release();
                      return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                  }
                  else {
                      connection.release();
                      return Response.json({status: 404, message:'No Data found!'}, {status: 200})
                  }

                  
                }
                else if(params.ids[2]=='SalesExecutive'){

                  // get the list of dealers mapped to each executive
                  var dealers = [];
                      const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+params.ids[3]+'"');
                      const promises = rows1.map((row1) => {
                          dealers.push(row1.id);
                      });

                  await Promise.all(promises); // wait till above finishes

                  // get the dealers
                  if(dealers.length > 0){
                    console.log('q4');
                      const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                      
                      query =
                        `SELECT 
                            'All' AS state, 
                            COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                            COUNT(DISTINCT d.dealerId) AS dealers,
                            COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL, 
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL 
                        FROM 
                            dealer d 
                        LEFT JOIN 
                            invoices i ON i.billTo = d.dealerId
                        WHERE i.billTo IN (${dealersList}) 
                        UNION ALL

                        SELECT 
                            d.state, 
                            COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                            COUNT(DISTINCT d.dealerId) AS dealers,
                            COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL
                        FROM 
                            dealer d 
                        LEFT JOIN 
                            invoices i ON i.billTo = d.dealerId 
                        WHERE i.billTo IN (${dealersList}) 
                        GROUP BY 
                            d.state;`;

                      const [rows2, fields2] = await connection.execute(query);
                      connection.release();
                      return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                  }
                  else {
                      connection.release();
                      return Response.json({status: 404, message:'No Data found!'}, {status: 200})
                  }

                  
                }


              // const [rows, fields] = await connection.execute(
              //   `SELECT d.state, 
              //     count(CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) as invoices, 
              //     COUNT(DISTINCT d.dealerId) AS dealers,
              //     COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersdue,
              //     COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') THEN i.pending END), 0) AS pending
              //     FROM dealer d LEFT JOIN invoices i ON i.billTo = d.dealerId GROUP BY d.state`);
              // const [rows, fields] = await connection.execute('SELECT DISTINCT(state),count(*) as count FROM dealer group by state');
              const [rows, fields] = await connection.execute(query);
              connection.release();

              // send the notification
              // const notificationResult = await send_notification('Notification check', 'f2d0fbcf-24a7-4ba1-ab2f-886e1ce8f874', 'Single');
                              
              return Response.json({status: 200, data:rows}, {status: 200})

            }
            // get the outstandings by a given date
            if(params.ids[1] == '0.1'){

              var query = '';
              
              if(params.ids[2]=='SuperAdmin' || params.ids[2]=='GlobalAdmin'){
                  query =
                    `SELECT 
                        'All' AS state, 
                        COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                        COUNT(DISTINCT d.dealerId) AS dealers,
                        COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                        COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL, 
                        COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL 
                    FROM 
                        dealer d 
                    LEFT JOIN 
                        invoices i ON i.billTo = d.dealerId
                      WHERE DATE(i.expiryDate) <= "`+params.ids[4]+`"
                    UNION ALL

                    SELECT 
                        d.state, 
                        COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                        COUNT(DISTINCT d.dealerId) AS dealers,
                        COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                        COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL,
                        COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL
                    FROM 
                        dealer d 
                    LEFT JOIN 
                        invoices i ON i.billTo = d.dealerId 
                        WHERE DATE(i.expiryDate) <= "`+params.ids[4]+`"
                    GROUP BY 
                        d.state;`;

                }
                else if(params.ids[2]=='StateHead'){

                  // get the list of managers or executives mapped to StateHead
                  const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role="SalesManager" AND mapTo="'+params.ids[3]+'"');
                  const [rowss, fieldss] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+params.ids[3]+'"');
                  const [rowsss, fieldsss] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+params.ids[3]+'"');
                  // const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role IN ("SalesManager","SalesExecutive") AND mapTo="'+params.ids[3]+'"');
                  
                  // get the list of executives mapped to each head
                  var executives = [];
                  const promises1 = rows.map(async (row) => {
                      const [rows11, fields1] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+row.id+'"');
                      rows11.map((row11) => {
                          executives.push(row11.id);
                      })
                  });
                  await Promise.all(promises1); // wait till above finishes
                  const promises2 = rowss.map((rowss1) => {
                        executives.push(rowss1.id);
                  });
                  await Promise.all(promises2); // wait till above finishes
                  
                  var dealers = [];
                  // get the list of dealers mapped to each executive
                  const promises = executives.map(async (row) => {
                      const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+row+'"');
                      rows1.map((row1) => {
                          dealers.push(row1.id);
                      })
                  });
                  await Promise.all(promises); // wait till above finishes
                  
                  // get the list of dealers mapped directly to StateHead
                  const promises11 = rowsss.map(async (row) => {
                      dealers.push(row.id);
                  });
                  await Promise.all(promises11);

                  // get the dealers
                  if(dealers.length > 0){
                    console.log('q4');
                      const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                      
                      query =
                        `SELECT 
                            'All' AS state, 
                            COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                            COUNT(DISTINCT d.dealerId) AS dealers,
                            COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL, 
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL 
                        FROM 
                            dealer d 
                        LEFT JOIN 
                            invoices i ON i.billTo = d.dealerId
                        WHERE i.billTo IN (${dealersList}) and DATE(i.expiryDate) <= "`+params.ids[4]+`"
                        UNION ALL

                        SELECT 
                            d.state, 
                            COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                            COUNT(DISTINCT d.dealerId) AS dealers,
                            COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL
                        FROM 
                            dealer d 
                        LEFT JOIN 
                            invoices i ON i.billTo = d.dealerId 
                        WHERE i.billTo IN (${dealersList}) and  DATE(i.expiryDate) <= "`+params.ids[4]+`"
                        GROUP BY 
                            d.state;`;

                      const [rows2, fields2] = await connection.execute(query);
                      connection.release();
                      return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                  }
                  else {
                      connection.release();
                      return Response.json({status: 404, message:'No Data found!'}, {status: 200})
                  }

                  
                }
                else if(params.ids[2]=='SalesManager'){

                  // get the list of executives mapped to SalesManager
                  const [rows, fields] = await connection.execute('SELECT * FROM user WHERE role="SalesExecutive" AND mapTo="'+params.ids[3]+'"');
                  console.log('q2');
                  // get the list of dealers mapped to each executive
                  var dealers = [];
                  const promises = rows.map(async (row) => {
                    console.log('q3');
                      const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+row.id+'"');
                      rows1.map((row1) => {
                          dealers.push(row1.id);
                      })
                  });

                  await Promise.all(promises); // wait till above finishes

                  // get the dealers
                  if(dealers.length > 0){
                    console.log('q4');
                      const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                      
                      query =
                        `SELECT 
                            'All' AS state, 
                            COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                            COUNT(DISTINCT d.dealerId) AS dealers,
                            COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL, 
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL 
                        FROM 
                            dealer d 
                        LEFT JOIN 
                            invoices i ON i.billTo = d.dealerId
                        WHERE i.billTo IN (${dealersList}) and  DATE(i.expiryDate) <= "`+params.ids[4]+`"
                        UNION ALL

                        SELECT 
                            d.state, 
                            COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                            COUNT(DISTINCT d.dealerId) AS dealers,
                            COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL
                        FROM 
                            dealer d 
                        LEFT JOIN 
                            invoices i ON i.billTo = d.dealerId 
                        WHERE i.billTo IN (${dealersList}) and  DATE(i.expiryDate) <= "`+params.ids[4]+`"
                        GROUP BY 
                            d.state;`;

                      const [rows2, fields2] = await connection.execute(query);
                      connection.release();
                      return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                  }
                  else {
                      connection.release();
                      return Response.json({status: 404, message:'No Data found!'}, {status: 200})
                  }

                  
                }
                else if(params.ids[2]=='SalesExecutive'){

                  // get the list of dealers mapped to each executive
                  var dealers = [];
                      const [rows1, fields1] = await connection.execute('SELECT * FROM user WHERE role="Dealer" AND mapTo="'+params.ids[3]+'"');
                      const promises = rows1.map((row1) => {
                          dealers.push(row1.id);
                      });

                  await Promise.all(promises); // wait till above finishes

                  // get the dealers
                  if(dealers.length > 0){
                    console.log('q4');
                      const dealersList = dealers.map(dealer => `'${dealer}'`).join(","); // Each dealer ID is wrapped in single quotes
                      
                      query =
                        `SELECT 
                            'All' AS state, 
                            COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                            COUNT(DISTINCT d.dealerId) AS dealers,
                            COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL, 
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL 
                        FROM 
                            dealer d 
                        LEFT JOIN 
                            invoices i ON i.billTo = d.dealerId
                        WHERE i.billTo IN (${dealersList}) and  DATE(i.expiryDate) <= "`+params.ids[4]+`"
                        UNION ALL

                        SELECT 
                            d.state, 
                            COUNT(CASE WHEN i.status NOT IN ('Paid') THEN i.invoiceId END) AS invoices,
                            COUNT(DISTINCT d.dealerId) AS dealers,
                            COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersDue,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'ATL' THEN i.pending END), 0) AS pendingATL,
                            COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') AND i.invoiceType = 'VCL' THEN i.pending END), 0) AS pendingVCL
                        FROM 
                            dealer d 
                        LEFT JOIN 
                            invoices i ON i.billTo = d.dealerId 
                        WHERE i.billTo IN (${dealersList}) and  DATE(i.expiryDate) <= "`+params.ids[4]+`"
                        GROUP BY 
                            d.state;`;

                      const [rows2, fields2] = await connection.execute(query);
                      connection.release();
                      return Response.json({status: 200, data: rows2, message:'Details found!'}, {status: 200})
                  }
                  else {
                      connection.release();
                      return Response.json({status: 404, message:'No Data found!'}, {status: 200})
                  }

                  
                }


              // const [rows, fields] = await connection.execute(
              //   `SELECT d.state, 
              //     count(CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) as invoices, 
              //     COUNT(DISTINCT d.dealerId) AS dealers,
              //     COUNT(DISTINCT CASE WHEN i.status NOT IN ('Paid') THEN d.dealerId END) AS dealersdue,
              //     COALESCE(SUM(CASE WHEN i.status NOT IN ('Paid') THEN i.pending END), 0) AS pending
              //     FROM dealer d LEFT JOIN invoices i ON i.billTo = d.dealerId GROUP BY d.state`);
              // const [rows, fields] = await connection.execute('SELECT DISTINCT(state),count(*) as count FROM dealer group by state');
              const [rows, fields] = await connection.execute(query);
              connection.release();

              // send the notification
              // const notificationResult = await send_notification('Notification check', 'f2d0fbcf-24a7-4ba1-ab2f-886e1ce8f874', 'Single');
                              
              return Response.json({status: 200, data:rows}, {status: 200})

            }
            // this will give the outstanding amount of each user in the hierarchy
            else if(params.ids[1] == '1'){
              
              // get the pending amount of each state head grouping
              var q1 = `SELECT SUM(a_pending) as total, mapTo as id FROM user aa JOIN (SELECT count(*),SUM(e_pending) as a_pending, mapTo as a_map FROM user ue JOIN (SELECT SUM(p.total_pending) as e_pending, u.mapTo as e_map FROM user u JOIN (SELECT billTo, SUM(pending) AS total_pending FROM invoices WHERE status != 'Paid' GROUP BY billTo) AS p ON u.id = p.billTo GROUP BY u.mapTo) AS e ON ue.id=e.e_map GROUP BY ue.mapTo) AS h ON aa.id=h.a_map WHERE aa.mapTo!='-' GROUP BY aa.mapTo;`
              
              // get the pending amount of each sales executive grouping
              var q2 = `SELECT SUM(e_pending) as total, mapTo as id FROM user ue
              JOIN (
              SELECT SUM(p.total_pending) as e_pending, u.mapTo as e_map FROM user u
              JOIN (SELECT billTo, SUM(pending) AS total_pending FROM invoices WHERE status != 'Paid' GROUP BY billTo) AS p ON u.id = p.billTo GROUP BY u.mapTo) as e ON ue.id=e.e_map GROUP BY ue.mapTo;`

              // get the pending amount of each sales executive
              var q3 = "SELECT SUM(p.total_pending) as total, u.mapTo as id FROM user u JOIN (SELECT billTo, SUM(pending) AS total_pending FROM invoices WHERE status != 'Paid' GROUP BY billTo) AS p ON u.id = p.billTo GROUP BY u.mapTo;"

              const [r1, f1] = await connection.execute(q1);
              const [r2, f2] = await connection.execute(q2);
              const [r3, f3] = await connection.execute(q3);

              const combinedResults = [...r1, ...r2, ...r3];
              return Response.json({status: 200, message:'Data found!', data: combinedResults}, {status: 200})

            }
            // this will give the outstanding amount of each dealer under an Sales executive
            else if(params.ids[1] == '2'){
              
              // get the pending amount of each state head grouping
              var q1 = 'SELECT total_pending as total, u.id as id FROM user u JOIN (SELECT billTo, SUM(pending) AS total_pending FROM invoices WHERE status != "Paid" GROUP BY billTo) AS p ON u.id = p.billTo WHERE u.mapTo="'+params.ids[2]+'"';
              
              const [r1, f1] = await connection.execute(q1);

              return Response.json({status: 200, message:'Data found!', data: r1}, {status: 200})

            }
            else{
                
              const [rows, fields] = await connection.execute('SELECT * FROM dealer where state=?',[params.ids[2]]);
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

    return new Promise(async (resolve, reject) => {
      // send notification only if there is playerId for the user
      if (playerId.length > 0) {
        var playerIds = [];
        playerIds.push(playerId);
        console.log('Sending1...');
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
            include_player_ids: playerIds,
          };
        }
  
        try {
          // create notification
          const notificationResult = await client.createNotification(notification);
          console.log(notificationResult);
          resolve(notificationResult);

        } catch (error) {
          console.log(error);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    });
  }

