import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
import { send_notification } from '../../../send_notification';

// API for updates to user data
export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();

    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){

            // get the list of orders ordered by createdOn and by selected status
            
            // get listing for admins
            // /U0/$selectedStatus/$offset/$role/$id/$sortBy
            if (params.ids[1] == "U0.1") {
                try {
                    const status = params.ids[2];      // All / Submitted / Approved / etc.
                    // const offset = params.ids[3];        // GlobalAdmin
                    const role = params.ids[4];        // GlobalAdmin
                    const userId = params.ids[5];      // Test002
                    const sortBy = params.ids[6] || "createdOn";

                    const search = "";
                    const page = 1;
                    const limit = 20;

                    const pageNo = Math.max(Number(page), 1);
                    const pageLimit = Math.min(Math.max(Number(limit), 1), 100);
                    const offset = (pageNo - 1) * pageLimit;

                    const where = ["o.isDeleted = 0"];
                    const queryParams = [];

                    if (status && status !== "All") {
                    where.push("o.status = ?");
                    queryParams.push(status);
                    }

                    /**
                     * Access scoping
                     *
                     * If GlobalAdmin should see everything, do not filter by user.
                     * If this admin should see mapped users/dealers only, apply relation filter.
                     */
                    if ((role !== "GlobalAdmin" && role !== "SuperAdmin") && userId) {
                        where.push("(u.relatedTo LIKE ? OR u.id = ? OR o.userId = ? OR o.dealerId = ?)");
                        queryParams.push(`%${userId}%`, userId, userId, userId);
                    }

                    if (search) {
                    where.push(`
                        (
                        o.cartId LIKE ?
                        OR o.design LIKE ?
                        OR o.userId LIKE ?
                        OR o.dealerId LIKE ?
                        OR u.name LIKE ?
                        )
                    `);

                    queryParams.push(
                        `%${search}%`,
                        `%${search}%`,
                        `%${search}%`,
                        `%${search}%`,
                        `%${search}%`
                    );
                    }

                    const whereSql = `WHERE ${where.join(" AND ")}`;

                    const orderBySql =
                    sortBy === "createdOn"
                        ? "createdOn ASC"
                        : "createdOn ASC";

                    /**
                     * Step 1:
                     * Fetch paginated cartIds.
                     * Keep access filter here.
                     */
                    const cartQuery = `
                    SELECT
                        o.cartId,
                        MIN(o.createdOn) AS createdOn
                    FROM orders o
                    LEFT JOIN user u ON o.userId = u.id
                    ${whereSql}
                    GROUP BY o.cartId
                    ORDER BY ${orderBySql}
                    LIMIT ? OFFSET ?
                    `;

                    const [cartRows] = await pool.query(cartQuery, [
                    ...queryParams,
                    pageLimit,
                    offset,
                    ]);

                    const cartIds = cartRows.map((row) => row.cartId);

                    if (cartIds.length === 0) {
                    return Response.json({
                        status: 200,
                        success: true,
                        message: "Orders fetched successfully",
                        page: pageNo,
                        limit: pageLimit,
                        totalOrders: 0,
                        totalPages: 0,
                        data: [],
                    });
                    }

                    const placeholders = cartIds.map(() => "?").join(",");

                    /**
                     * Step 2:
                     * Fetch all rows for selected cartIds.
                     */
                    const itemsQuery = `
                    SELECT
                        o.id,
                        o.userId,
                        o.dealerId,
                        o.cartId,
                        o.serialId,
                        o.design,
                        o.requestedQty,
                        o.approvedQty,
                        o.productionQty,
                        o.stockType,
                        o.status,
                        o.createdOn,
                        o.approvedOn,
                        o.modifiedOn,

                        p.name,
                        p.description,
                        p.size,
                        p.tags,
                        p.media,
                        p.prm,
                        p.std,
                        p.isActive,
                        p.designType,

                        u.name AS orderedBy,
                        u.mobile,
                        u.mapTo,

                        u_dealer.name AS dealer,

                        CASE
                            WHEN o.productionQty > 0 THEN (
                                SELECT COUNT(*) + 1
                                FROM orders x
                                WHERE x.design = o.design
                                AND x.stockType = o.stockType
                                AND x.productionQty > 0
                                AND x.isDeleted = 0
                                AND x.status NOT IN ('Cancelled', 'Rejected')
                                AND (
                                    x.createdOn < o.createdOn
                                    OR (
                                    x.createdOn = o.createdOn
                                    AND x.id < o.id
                                    )
                                )
                            )
                            ELSE NULL
                            END AS waitlistPosition

                    FROM orders o
                    LEFT JOIN products1 p 
                        ON o.design = p.design
                    LEFT JOIN user u 
                        ON o.userId = u.id
                    LEFT JOIN user u_dealer 
                        ON o.dealerId = u_dealer.id

                    WHERE o.cartId IN (${placeholders})
                        AND o.isDeleted = 0

                    ORDER BY o.createdOn ASC, o.cartId DESC, o.serialId ASC, o.id ASC
                    `;

                    const [itemRows] = await pool.query(itemsQuery, cartIds);

                    /**
                     * Count total cart groups with same filters as Step 1.
                     */
                    const countQuery = `
                    SELECT COUNT(*) AS total
                    FROM (
                        SELECT o.cartId
                        FROM orders o
                        LEFT JOIN user u ON o.userId = u.id
                        ${whereSql}
                        GROUP BY o.cartId
                    ) t
                    `;

                    const [countRows] = await pool.query(countQuery, queryParams);
                    const totalOrders = Number(countRows[0]?.total || 0);

                    const groupedOrders = groupAdminOrders(itemRows);

                    return Response.json({
                    status: 200,
                    success: true,
                    message: "Orders fetched successfully",
                    page: pageNo,
                    limit: pageLimit,
                    totalOrders,
                    totalPages: Math.ceil(totalOrders / pageLimit),
                    data: groupedOrders,
                    });
                } catch (error) {
                    console.error("Admin orders fetch error:", error);

                    return Response.json({
                    status: 500,
                    success: false,
                    message: "Failed to fetch admin orders",
                    error: error.message,
                    });
                }
            }
            // Approve by admin for an order item
            else if(params.ids[1] == 'U0.2'){
                // 1. Fail fast: Parse body and validate orderId before hitting the database
                
                // var adminId = params.ids[2];
                var orderId = params.ids[2];
                var toBeApprovedQty = params.ids[3];
                var adminId = params.ids[4];
                
                if (!orderId) {
                    return Response.json({
                    status: 400,
                    success: false,
                    message: "orderId is required",
                    });
                }

                // 2. Get connection only when data validation passes
                const connection = await pool.getConnection();

                try {
                    await connection.beginTransaction();

                    // 3. Combined Query: Fetch both order and product in a single DB round-trip using FOR UPDATE
                    const [[order], [product]] = await Promise.all([
                    connection.query(
                        `SELECT id, status, stockType, requestedQty, design, waitlistSequence 
                        FROM orders WHERE id = ? AND isDeleted = 0 FOR UPDATE`,
                        [orderId]
                    ).then(([rows]) => rows),
                    
                    connection.query(
                        `SELECT productId, design, prm, std 
                        FROM products1 WHERE design = (SELECT design FROM orders WHERE id = ? AND isDeleted = 0) FOR UPDATE`,
                        [orderId]
                    ).then(([rows]) => rows)
                    ]);

                    // 4. Validate Order existence and state
                    if (!order) {
                    await connection.rollback();
                    return Response.json({ status: 404, success: false, message: "Order item not found" });
                    }

                    if (order.status === "Approved") {
                    await connection.rollback();
                    return Response.json({ status: 409, success: false, message: "Order item is already approved" });
                    }

                    if (["Rejected", "Cancelled"].includes(order.status)) {
                    await connection.rollback();
                    return Response.json({ status: 409, success: false, message: `Cannot approve ${order.status} item` });
                    }

                    // 5. Validate Product existence
                    if (!product) {
                    await connection.rollback();
                    return Response.json({ status: 404, success: false, message: "Product not found" });
                    }


                    // 6. Memory Math Calculations
                    const stockColumn = getStockColumn(order.stockType);
                    const availableStock = Number(product[stockColumn] || 0);
                    const requestedQty = Number(order.requestedQty || 0);

                    const approvedQty = Math.min(toBeApprovedQty, availableStock);
                    // const productionQty1 = (requestedQty - approvedQty) > 0 ? 0 : (availableStock - approvedQty) * -1; // If approvedQty exhausts stock, then production is 0, else it's the remaining qty that needs production
                    const productionQty = (approvedQty - availableStock) >= 0 ? (toBeApprovedQty - availableStock) : 0;
                    const remainingStock = approvedQty - availableStock >= 0 ? 0 : availableStock - toBeApprovedQty;
                    
                    // const approvedQty = Math.min(requestedQty, availableStock);
                    // const productionQty = requestedQty - approvedQty;
                    // const remainingStock = availableStock - approvedQty;

                    // 7. Parallel Writes: Execute both UPDATE statements concurrently
                    await Promise.all([
                    connection.query(
                        `UPDATE orders SET approvedQty = ?, productionQty = ?, 
                                status = 'Approved', approvedOn = NOW(), modifiedOn = NOW()
                        WHERE id = ?`,
                        [approvedQty, productionQty, orderId]
                    ),
                    connection.query(
                        `UPDATE products1 SET ${stockColumn} = ? WHERE design = ?`,
                        [remainingStock, order.design]
                    )
                    ]);

                    await connection.commit();

                    return Response.json({
                    status: 200,
                    success: true,
                    message: "Order item approved successfully",
                    data: {
                        orderId, design: order.design, stockType: order.stockType,
                        requestedQty, approvedQty, productionQty,
                        previousStock: availableStock, remainingStock,
                    },
                    });
                } catch (error) {
                    await connection.rollback();
                    return Response.json({
                    status: 500,
                    success: false,
                    message: "Failed to approve order item",
                    error: error.message,
                    });
                } finally {
                    connection.release();
                }
                
            }
            // Reject by admin
            else if (params.ids[1] === "U0.3") {
                try {
                    var orderId = params.ids[2];

                    if (!orderId) {
                    return Response.json({
                        status: 400,
                        success: false,
                        message: "orderId is required",
                    });
                    }

                    const [result] = await pool.query(
                    `
                    UPDATE orders
                    SET
                        status = 'Rejected',
                        productionQty = 0,
                        modifiedOn = NOW()
                    WHERE id = ?
                        AND isDeleted = 0
                        AND status NOT IN ('Approved', 'Cancelled', 'Rejected')
                    `,
                    [orderId]
                    );

                    if (result.affectedRows === 0) {
                    return Response.json({
                        status: 409,
                        success: false,
                        message: "Order item could not be rejected or is already processed",
                    });
                    }

                    return Response.json({
                    status: 200,
                    success: true,
                    message: "Order item rejected successfully",
                    data: { orderId },
                    });
                } catch (error) {
                    return Response.json({
                    status: 500,
                    success: false,
                    message: "Failed to reject order item",
                    error: error.message,
                    });
                }
            }
            // soft delete
            else if (params.ids[1] === "U0.4") {
                try {
                    var orderId = params.ids[2];

                    if (!orderId) {
                    return Response.json({
                        status: 400,
                        success: false,
                        message: "orderId is required",
                    });
                    }

                    const [result] = await pool.query(
                    `
                    UPDATE orders
                    SET
                        status = 'Deleted',
                        isDeleted = 1,
                        modifiedOn = NOW()
                    WHERE id = ?
                        AND isDeleted = 0
                        AND status NOT IN ('Approved', 'Deleted')
                    `,
                    [orderId]
                    );

                    if (result.affectedRows === 0) {
                    return Response.json({
                        status: 409,
                        success: false,
                        message: "Order item could not be deleted or is already processed",
                    });
                    }

                    return Response.json({
                    status: 200,
                    success: true,
                    message: "Order item deleted successfully",
                    data: { orderId },
                    });
                } catch (error) {
                    return Response.json({
                    status: 500,
                    success: false,
                    message: "Failed to delete order item",
                    error: error.message,
                    });
                }
            }
            // get listing for mobile by userId
            else if(params.ids[1] == 'U0'){
                try {
                    var queryCount = 'SELECT count(*) as count from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE (u.relatedTo LIKE "%'+params.ids[5]+'%" OR u.id LIKE "%'+params.ids[5]+'%") AND r.isDeleted = 0';
                    const query = `
                            SELECT
                                o.id,
                                o.userId,
                                o.dealerId,
                                o.cartId,
                                o.serialId,
                                o.design,
                                o.requestedQty,
                                o.approvedQty,
                                o.productionQty,
                                o.stockType,
                                o.status,
                                o.createdOn,
                                o.approvedOn,
                                o.modifiedOn,
                                p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType, u.name as orderedBy, u_dealer.name as dealer, u.mobile, u.mapTo,

                                CASE
                                    WHEN o.productionQty > 0 THEN (
                                    SELECT COUNT(*) + 1
                                    FROM orders x
                                    WHERE x.design = o.design
                                        AND x.stockType = o.stockType
                                        AND x.productionQty > 0
                                        AND x.isDeleted = 0
                                        AND x.status NOT IN ('Cancelled', 'Rejected')
                                        AND (
                                        x.createdOn < o.createdOn
                                        OR (
                                            x.createdOn = o.createdOn
                                            AND x.id < o.id
                                        )
                                        )
                                    )
                                    ELSE NULL
                                END AS waitlistPosition

                            FROM orders o
                            LEFT JOIN products1 p ON o.design = p.design LEFT JOIN user u ON o.userId = u.id LEFT JOIN user u_dealer ON o.dealerId=u_dealer.id WHERE (u.relatedTo LIKE ? OR u.id LIKE ?) 
                            
                                AND o.isDeleted = 0
                            ORDER BY o.`+params.ids[6]+` DESC, o.cartId DESC, o.serialId ASC
                            `;

                            const [rows] = await pool.query(query, [`%${params.ids[5]}%`, `%${params.ids[5]}%`]);

                            const groupedOrders = groupOrdersByCart(rows);

                            // return Response.json({
                            //     status: 200, 
                            // success: true,
                            // message: "Orders fetched successfully",
                            // totalOrders: groupedOrders.length,
                            // data: groupedOrders,
                            // });

                           

                            // if status is provided then filter by status as well
                            // if(params.ids[2] != 'All'){

                            //     query = 'SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType, u.name as orderedBy, u_dealer.name as dealer, u.mobile, u.mapTo from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id LEFT JOIN user u_dealer ON r.dealerId=u_dealer.id WHERE r.isDeleted = 0 AND r.status="'+params.ids[2]+'" AND (u.relatedTo LIKE "%'+params.ids[5]+'%" OR u.id LIKE "%'+params.ids[5]+'%") ORDER BY r.'+params.ids[6]+' DESC LIMIT 20 OFFSET '+params.ids[3];
                            //     queryCount = 'SELECT count(*) as count from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.isDeleted = 0 AND r.status="'+params.ids[2]+'" AND (u.relatedTo LIKE "%'+params.ids[5]+'%" OR u.id LIKE "%'+params.ids[5]+'%")';
                            // }
                        // }
                    // }

                    
                    // const [rows, fields] = await connection.execute(query);
                    const [countRows, countFields] = await connection.execute(queryCount);
                    connection.release();

                    if(rows.length > 0){
                        return Response.json({status: 200, totalOrders: groupedOrders.length, data: groupedOrders, count: countRows[0].count, message:'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No Order found!'+error}, {status: 200})
                }
            }
            // get the list of orders by userId
            else if(params.ids[1] == 'U1'){
                try {
                    const [rows, fields] = await connection.execute('SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType from orders r LEFT JOIN products1 p ON r.design = p.design WHERE r.isDeleted = 0 AND (r.userId LIKE "%'+params.ids[2]+'%" OR r.dealerId LIKE "%'+params.ids[2]+'%") ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3]);
                    const [countRows, countFields] = await connection.execute('SELECT count(*) as count from orders r LEFT JOIN products1 p ON r.design = p.design WHERE r.isDeleted = 0 AND (r.userId LIKE "%'+params.ids[2]+'%" OR r.dealerId LIKE "%'+params.ids[2]+'%")');
                    connection.release();

                    if(rows.length > 0)
                        return Response.json({status: 200, data: rows, count: countRows[0].count}, {status: 200})
                    else 
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No Order found!'+error}, {status: 200})
                }
            }
            // get the list of orders by dealer name
            else if(params.ids[1] == 'U1.1'){
                try {
                    const [rows, fields] = await connection.execute('SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN dealer d ON r.dealerId=d.dealerId WHERE d.accountName LIKE "%'+params.ids[2]+'%" ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3]);
                    const [countRows, countFields] = await connection.execute('SELECT count(*) as count from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN dealer d ON r.dealerId=d.dealerId WHERE d.accountName LIKE "%'+params.ids[2]+'%"');
                    connection.release();

                    if(rows.length > 0)
                        return Response.json({status: 200, data: rows, count: countRows[0].count}, {status: 200})
                    else 
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No Order found!'+error}, {status: 200})
                }
            }
            // get the list of orders by design
            else if (params.ids[1] == "U2") {
                try {
                    const designSearch = `%${params.ids[2]}%`;

                    const [rows] = await connection.execute(
                    `SELECT
                        r.*,

                        p.name,
                        p.productId,
                        p.description,
                        p.size,
                        p.tags,
                        p.media,
                        p.prm,
                        p.std,
                        p.isActive,
                        p.designType,

                        CASE
                        WHEN r.productionQty > 0 THEN (
                            SELECT COUNT(*) + 1
                            FROM orders x
                            WHERE x.design = r.design
                            AND x.stockType = r.stockType
                            AND x.productionQty > 0
                            AND x.isDeleted = 0
                            AND x.status NOT IN ('Cancelled', 'Rejected')
                            AND (
                                x.createdOn < r.createdOn
                                OR (
                                x.createdOn = r.createdOn
                                AND x.id < r.id
                                )
                            )
                        )
                        ELSE NULL
                        END AS waitlistSequence,

                        CASE
                        WHEN r.requestedQty > 0 THEN ROUND((r.approvedQty / r.requestedQty) * 100)
                        ELSE 0
                        END AS availabilityPercent

                    FROM orders r

                    LEFT JOIN products1 p
                        ON r.design = p.design

                    WHERE r.design LIKE ?
                        AND r.isDeleted = 0

                    ORDER BY
                        CASE WHEN r.productionQty > 0 THEN 0 ELSE 1 END,
                        r.createdOn ASC,
                        r.id ASC
                    `,
                    [designSearch]
                    );

                    if (rows.length > 0) {
                    return Response.json(
                        {
                        status: 200,
                        data: rows,
                        },
                        { status: 200 }
                    );
                    }

                    return Response.json(
                    {
                        status: 201,
                        message: "No data found!",
                    },
                    { status: 200 }
                    );
                } catch (error) {
                    return Response.json(
                    {
                        status: 404,
                        message: "No Order found! " + error.message,
                    },
                    { status: 200 }
                    );
                } finally {
                    connection.release();
                }
                }
            else  if(params.ids[1] == 'report'){
                try {

                    var query = '';
                    var queryCount = '';
                        // params.ids[3] will be date range, lets download the orders modified/created in that date range.


                        // if params.ids[4] value is 'All', then lets have a where condition which we can add in the query to get all the orders irrespective of the production status. If params.ids[4] value is not 'All', then we will filter the orders based on the production status as well.
                        if(params.ids[4] == 'All'){
                            query = 'SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType, u.name as orderedBy, u_dealer.name as dealer, u.mobile, u.mapTo from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id LEFT JOIN user u_dealer ON r.dealerId=u_dealer.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) ORDER BY r.createdOn DESC';
                            queryCount = 'SELECT count(*) as count from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?))';
                        }
                        else {

                            // lets update the query to add user table as well to get user details based on the createdOn and modifiedOn fields using the provided date range in params.ids[3]
                            query = 'SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType, u.name as orderedBy, u_dealer.name as dealer, u.mobile, u.mapTo from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id LEFT JOIN user u_dealer ON r.dealerId=u_dealer.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) AND r.isProduction="'+params.ids[4]+'" ORDER BY r.createdOn DESC';
                            queryCount = 'SELECT count(*) as count from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) AND r.isProduction="'+params.ids[4]+'"';
                        }

                        // if status is provided then filter by status as well
                        if(params.ids[2] != 'All'){

                            // expiryDate field is used to store the modified timestamp for the order. So we can filter the orders modified after a particular timestamp using this field.
                            // if(params.ids[2] == 'Modified'){
                            //     query = 'SELECT r.*, p.*, u.name as dealer, u.mobile, u.mapTo from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.expiryDate > r.createdOn ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3];
                            // }
                            // else

                                if(params.ids[4] == 'All'){
                                    query = 'SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType, u.name as orderedBy, u_dealer.name as dealer, u.mobile, u.mapTo from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id LEFT JOIN user u_dealer ON r.dealerId=u_dealer.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) AND r.status="'+params.ids[2]+'" ORDER BY r.createdOn DESC';
                                    queryCount = 'SELECT count(*) as count from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) AND r.status="'+params.ids[2]+'"';
                                }
                                else {
                                    query = 'SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType, u.name as orderedBy, u_dealer.name as dealer, u.mobile, u.mapTo from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id LEFT JOIN user u_dealer ON r.dealerId=u_dealer.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) AND r.status="'+params.ids[2]+'" AND r.isProduction="'+params.ids[4]+'" ORDER BY r.createdOn DESC';
                                    queryCount = 'SELECT count(*) as count from orders r LEFT JOIN products1 p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) AND r.status="'+params.ids[2]+'" AND r.isProduction="'+params.ids[4]+'"';
                                }
                        }

                    const [rows, fields] = await connection.execute(query, [params.ids[3].split(',')[0], params.ids[3].split(',')[1], params.ids[3].split(',')[0], params.ids[3].split(',')[1]]);
                    const [countRows, countFields] = await connection.execute(queryCount, [params.ids[3].split(',')[0], params.ids[3].split(',')[1], params.ids[3].split(',')[0], params.ids[3].split(',')[1]]);
                    connection.release();

                    if(rows.length > 0){
                        return Response.json({status: 200, data: rows, count: countRows[0].count, message:'Updated!'}, {status: 200})
                    }
                    else {
                        return Response.json({status: 201, message:'No data found!'}, {status: 200})
                    }
                
                } catch (error) { // error updating
                    return Response.json({status: 404, message:'No order found!'+error}, {status: 200})
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
        return Response.json({status: 500, message:'Facing issues. Please try again!'+err.message}, {status: 200})
    }
  }



export async function POST(request, {params}) {

  // get the pool connection to db
  const connection = await pool.getConnection();
    
  try{
      // authorize secret key
      if(await Keyverify(params.ids[0])){

        if(params.ids[1] == 'U4'){

                try {
                    const body = await request.json();
                    const { userId, designs, createdOn } = body;
                    var isProductionOrder = 0;

                    if (!userId || !Array.isArray(designs) || designs.length === 0) {
                        connection.release();
                        return Response.json({ status: 400, message: 'Invalid request body' }, { status: 200 });
                    }

                    await connection.beginTransaction();

                    let insertedCount = 0;

                    // 1. get the next cart ID for the given dealerId
                    const [rows] = await connection.execute(
                        `SELECT COALESCE(
                            CONCAT(
                                LEFT(MAX(cartId), 1), 
                                LPAD(CAST(SUBSTRING(MAX(cartId), 2) AS UNSIGNED) + 1, 6, '0')
                            ),
                            'O000001'
                        ) AS nextCartId 
                        FROM orders`,[] 
                        // WHERE dealerId = ?`,
                        // [designs[0].dealerId]
                    );

                    // 2. Store the calculated ID in a variable
                    const nextCartId = rows[0].nextCartId;

                    for (const item of designs) {
                        const { cartId, serialId, dealerId, design, quantity, stockType, isProduction } = item;
                        
                        await connection.execute(
                            'INSERT INTO orders (userId, dealerId, design, requestedQty, status, approvedQty, stockType, createdOn, approvedOn, modifiedOn, serialId, cartId) VALUES (?, ?, ?, ?, "Submitted", 0, ?, ?, NULL, NULL, ?, ?)',
                            [userId, dealerId, design, quantity, stockType, createdOn, serialId, nextCartId]
                        );
                        insertedCount++;
                    }

                    await connection.commit();

                    const [nrows] = await connection.execute(`SELECT gcm_regId FROM user where role='SuperAdmin'`);
                    const [nrows1] = await connection.execute(`SELECT id, relatedTo FROM user where mapTo ='${params.ids[5]}'`);
                    connection.release();

                    // var gcmIds = nrows.map(r => r.gcm_regId).filter(id => id && id.length > 3);
                    // // nrows1 has 2 columns one is id which we can add to the gcmIds directly the other is relatedTo which will be comma separated string, lets split and add into gcmIds
                    // if(nrows1.length > 0){
                    //     for (let index = 0; index < nrows1.length; index++) {
                    //         const element = nrows1[index];
                    //         gcmIds.push(element.id);
                    //         if(element.relatedTo){
                    //             const relatedIds = element.relatedTo.split(',');
                    //             for (let index = 0; index < relatedIds.length; index++) {
                    //                 const relatedId = relatedIds[index];
                    //                 gcmIds.push(relatedId);
                    //             }
                    //         }
                    //     }
                    // }
                    
                    // // send the notification
                    // const notificationResult = gcmIds.length > 0 ? await send_notification(`Stock request received`, gcmIds, 'Multiple') : null;


                    return Response.json({ status: 200, message: 'Success!', data: insertedCount }, { status: 200 });
                    return Response.json({ status: 200, message: 'Success!', data: insertedCount, notification: notificationResult }, { status: 200 });

                } catch (error) {
                    await connection.rollback();
                    connection.release();
                    return Response.json({ status: 404, message: 'Order creation failed! ' + error }, { status: 200 });
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

function groupOrdersByCart(rows) {
  const orderMap = new Map();

  for (const row of rows) {
    const cartId = row.cartId;

    if (!orderMap.has(cartId)) {
      orderMap.set(cartId, {
        cartId,
        dealerId: row.dealerId,
        userId: row.userId,
        createdOn: row.createdOn,

        totalDesigns: 0,
        totalRequestedQty: 0,
        totalApprovedQty: 0,
        totalProductionQty: 0,

        orderStatus: "Submitted",
        items: [],
      });
    }

    const order = orderMap.get(cartId);

    const requestedQty = Number(row.requestedQty || 0);
    const approvedQty = Number(row.approvedQty || 0);
    const productionQty = Number(row.productionQty || 0);

    const availabilityPercent =
      requestedQty > 0 ? Math.round((approvedQty / requestedQty) * 100) : 0;

    order.totalDesigns += 1;
    order.totalRequestedQty += requestedQty;
    order.totalApprovedQty += approvedQty;
    order.totalProductionQty += productionQty;

    order.items.push({
      id: row.id,
      serialId: row.serialId,
      productId: row.productId,
      design: row.design,
      requestedQty,
      approvedQty,
      productionQty,
      stockType: row.stockType,
      isProduction: row.isProduction === 1,
      status: row.status,
      availabilityPercent,
      waitlistPosition: row.waitlistPosition,
      createdOn: row.createdOn,
      approvedOn: row.approvedOn,
      modifiedOn: row.modifiedOn,
      name: row.name,
      description: row.description,
      size: row.size,
      tags: row.tags,
      media: row.media,
      prm: row.prm,
      std: row.std,
      isActive: row.isActive,
      designType: row.designType,
      orderedBy: row.orderedBy,
      dealer: row.dealer,
      mobile: row.mobile,
      mapTo: row.mapTo,
      waitlistPosition: row.waitlistPosition,

    });
  }

  for (const order of orderMap.values()) {
    order.orderStatus = getBasketStatus(order.items);
  }

  return Array.from(orderMap.values());
}

function getBasketStatus(items) {
  const activeItems = items.filter(
    (item) => !["Cancelled", "Rejected"].includes(item.status)
  );

  if (activeItems.length === 0) return "Closed";

  const totalRequested = activeItems.reduce(
    (sum, item) => sum + item.requestedQty,
    0
  );

  const totalApproved = activeItems.reduce(
    (sum, item) => sum + item.approvedQty,
    0
  );

  const totalProduction = activeItems.reduce(
    (sum, item) => sum + item.productionQty,
    0
  );

  if (totalApproved === 0 && totalProduction === 0) {
    return "Submitted";
  }

  if (totalApproved === totalRequested && totalProduction === 0) {
    return "Fully Available";
  }

  if (totalApproved > 0 && totalProduction > 0) {
    return "Partially Available";
  }

  if (totalApproved === 0 && totalProduction > 0) {
    return "Waiting for Production";
  }

  return "In Progress";
}

function groupAdminOrders(rows) {
  const map = new Map();

  for (const row of rows) {
    const cartId = row.cartId;

    if (!map.has(cartId)) {
      map.set(cartId, {
        cartId,
        userId: row.userId,
        dealerId: row.dealerId,

        orderedBy: row.orderedBy,
        dealer: row.dealer,
        mobile: row.mobile,
        mapTo: row.mapTo,

        createdOn: row.createdOn,
        modifiedOn: row.modifiedOn,

        totalDesigns: 0,
        totalRequestedQty: 0,
        totalApprovedQty: 0,
        totalProductionQty: 0,

        submittedItems: 0,
        approvedItems: 0,
        rejectedItems: 0,
        waitlistItems: 0,

        orderStatus: "Submitted",
        items: [],
      });
    }

    const order = map.get(cartId);

    const requestedQty = Number(row.requestedQty || 0);
    const approvedQty = Number(row.approvedQty || 0);
    const productionQty = Number(row.productionQty || 0);

    order.totalDesigns += 1;
    order.totalRequestedQty += requestedQty;
    order.totalApprovedQty += approvedQty;
    order.totalProductionQty += productionQty;

    if (row.status === "Submitted") order.submittedItems += 1;
    if (row.status === "Approved") order.approvedItems += 1;
    if (row.status === "Rejected") order.rejectedItems += 1;
    if (productionQty > 0) order.waitlistItems += 1;

    if (
      row.modifiedOn &&
      (!order.modifiedOn || new Date(row.modifiedOn) > new Date(order.modifiedOn))
    ) {
      order.modifiedOn = row.modifiedOn;
    }

    order.items.push({
      id: row.id,
      serialId: row.serialId,
      productId: row.productId,

      design: row.design,
      name: row.name,
      description: row.description,
      size: row.size,
      tags: row.tags,
      media: row.media,
      designType: row.designType,
      isActive: row.isActive,

      stockType: row.stockType,

      requestedQty,
      approvedQty,
      productionQty,

      prm: Number(row.prm || 0),
      std: Number(row.std || 0),

      status: row.status,
      waitlistPosition: row.waitlistPosition,

      availabilityPercent:
        requestedQty > 0
          ? Math.round((approvedQty / requestedQty) * 100)
          : 0,

      createdOn: row.createdOn,
      approvedOn: row.approvedOn,
      modifiedOn: row.modifiedOn,
    });
  }

  for (const order of map.values()) {
    order.orderStatus = getAdminBasketStatus(order);
  }

  return Array.from(map.values());
}

function getAdminBasketStatus(order) {
  const totalDesigns = Number(order.totalDesigns || 0);
  const submittedItems = Number(order.submittedItems || 0);
  const rejectedItems = Number(order.rejectedItems || 0);

  const totalRequestedQty = Number(order.totalRequestedQty || 0);
  const totalApprovedQty = Number(order.totalApprovedQty || 0);
  const totalProductionQty = Number(order.totalProductionQty || 0);

  if (totalDesigns === 0) {
    return "No Items";
  }

  if (rejectedItems === totalDesigns) {
    return "Rejected";
  }

  if (submittedItems === totalDesigns) {
    return "Submitted";
  }

  if (submittedItems > 0) {
    return "Action Required";
  }

  if (totalRequestedQty > 0 && totalApprovedQty === totalRequestedQty && totalProductionQty === 0) {
    return "Fully Approved";
  }

  if (totalApprovedQty > 0 && totalProductionQty > 0) {
    return "Partially Approved";
  }

  if (totalApprovedQty === 0 && totalProductionQty > 0) {
    return "Production Pending";
  }

  return "In Progress";
}

function getStockColumn(stockType) {
  if (stockType === "prm") return "prm";
  if (stockType === "std") return "std";

  throw new Error("Invalid stockType");
}
