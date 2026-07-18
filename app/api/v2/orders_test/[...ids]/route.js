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
            
            // get listing for admins on web
            // /U0/$selectedStatus/$offset/$role/$id/$sortBy
            if (params.ids[1] == "U0.1") {
                try {
                    const status = params.ids[2];      // All / Submitted / Approved / etc.
                    // const offset = params.ids[3];        // GlobalAdmin
                    const role = params.ids[4];        // GlobalAdmin
                    const userId = params.ids[5];      // Test002
                    const sortBy = params.ids[6] || "createdOn";

                    const search = "";
                    // const page = 1;
                    const page = params.ids[3];
                    const limit = 20;

                    const pageNo = Math.max(Number(page), 1);
                    // const pageLimit = Math.min(Math.max(Number(limit), 1), 100);
                    // const offset = (pageNo - 1) * pageLimit;
                    const pageLimit = 20;
                    // offset value to be integer
                    const offset = parseInt(params.ids[3]);
                    

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
                        ? "createdOn DESC"
                        : "createdOn DESC";

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
                    LIMIT ? OFFSET ?`;

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
                        p.productId,
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
                                    COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) < COALESCE(o.modifiedOn, o.approvedOn, o.createdOn)
                                    OR (
                                    COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) = COALESCE(o.modifiedOn, o.approvedOn, o.createdOn)
                                    AND x.id < o.id
                                    )
                                )
                            )
                            ELSE NULL
                            END AS waitlistPosition

                    FROM orders o
                    LEFT JOIN products p 
                        ON o.design = p.design
                    LEFT JOIN user u 
                        ON o.userId = u.id
                    LEFT JOIN user u_dealer 
                        ON o.dealerId = u_dealer.id

                    WHERE o.cartId IN (${placeholders})
                        AND o.isDeleted = 0

                    ORDER BY o.createdOn DESC, o.cartId DESC, o.serialId ASC, o.id ASC

                    
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
            // get listing for admin group by designs
            else if (params.ids[1] == "U00.1") {
                try {
                    // const status = params.ids[2]; // All / Submitted / Approved / Rejected
                    // const search = params.ids[3] || "-";
                    // const page = Number(params.ids[4] || 1);
                    // const limit = Number(params.ids[5] || 20);

                    const status = params.ids[2];          // All / Submitted / Approved
                    const requestedPage = Number(params.ids[3]) || 1;
                    const role = params.ids[4];            // GlobalAdmin
                    const userId = params.ids[5];          // Test002
                    const sortBy = params.ids[6] || "createdOn";
                    const search = params.ids[7] || "";

                    const pageNo = Math.max(requestedPage, 1);
                    const pageLimit = 20;
                    const offset = (pageNo - 1) * pageLimit;

                    const where = ["o.isDeleted = 0"];
                    const values = [];

                    if (status && status !== "All") {
                        where.push("o.status = ?");
                        values.push(status);
                    }

                    // GlobalAdmin sees all.
                    // Non-global admins see mapped users/dealers.
                    if ((role !== "GlobalAdmin" && role !== "SuperAdmin") && userId) {
                        where.push("(u.relatedTo LIKE ? OR u.id = ? OR o.userId = ? OR o.dealerId = ?)");
                        values.push(`%${userId}%`, userId, userId, userId);
                    }

                    if (search && search !== "All" && search !== "0") {
                        where.push("(o.design LIKE ? OR p.name LIKE ?)");
                        values.push(`%${search}%`, `%${search}%`);
                    }

                    const whereSql = `WHERE ${where.join(" AND ")}`;

                    const query = `
                    SELECT
                        o.design,

                        MAX(o.createdOn) AS latestCreatedOn,
                        MIN(o.createdOn) AS firstCreatedOn,

                        COUNT(*) AS totalOrders,
                        COUNT(DISTINCT o.cartId) AS totalBaskets,
                        COUNT(DISTINCT o.dealerId) AS totalDealers,

                        SUM(o.requestedQty) AS totalRequestedQty,
                        SUM(o.approvedQty) AS totalApprovedQty,
                        SUM(o.productionQty) AS totalProductionQty,

                        SUM(CASE WHEN o.status IN ('Submitted', 'InReview') THEN 1 ELSE 0 END) AS submittedItems,
                        SUM(CASE WHEN o.status = 'Approved' THEN 1 ELSE 0 END) AS approvedItems,
                        SUM(CASE WHEN o.status = 'Rejected' THEN 1 ELSE 0 END) AS rejectedItems,
                        SUM(CASE WHEN o.productionQty > 0 THEN 1 ELSE 0 END) AS waitlistItems,

                        p.productId,
                        p.name,
                        p.description,
                        p.size,
                        p.tags,
                        p.media,
                        p.prm,
                        p.std,
                        p.isActive,
                        p.designType

                    FROM orders o

                    LEFT JOIN products p
                        ON o.design = p.design

                    LEFT JOIN user u
                        ON o.userId = u.id

                    ${whereSql}

                    GROUP BY
                        o.design,
                        p.productId,
                        p.name,
                        p.description,
                        p.size,
                        p.tags,
                        p.media,
                        p.prm,
                        p.std,
                        p.isActive,
                        p.designType

                    ORDER BY latestCreatedOn DESC

                    LIMIT ${pageLimit} OFFSET ${offset}
                    `;

                    const [rows] = await connection.execute(query, values);

                    const countQuery = `
                    SELECT COUNT(*) AS total
                    FROM (
                        SELECT o.design
                        FROM orders o
                        LEFT JOIN products p
                        ON o.design = p.design
                        LEFT JOIN user u ON o.userId = u.id
                        ${whereSql}
                        GROUP BY o.design
                    ) t
                    `;

                    const [countRows] = await connection.execute(countQuery, values);
                    const totalDesigns = Number(countRows[0]?.total || 0);

                    const data = rows.map((row) => {
                    const totalRequestedQty = Number(row.totalRequestedQty || 0);
                    const totalApprovedQty = Number(row.totalApprovedQty || 0);
                    const totalProductionQty = Number(row.totalProductionQty || 0);

                    return {
                        design: row.design,

                        productId: row.productId,
                        name: row.name,
                        description: row.description,
                        size: row.size,
                        tags: row.tags,
                        media: row.media,
                        prm: Number(row.prm || 0),
                        std: Number(row.std || 0),
                        isActive: row.isActive,
                        designType: row.designType,

                        latestCreatedOn: row.latestCreatedOn,
                        firstCreatedOn: row.firstCreatedOn,

                        totalOrders: Number(row.totalOrders || 0),
                        totalBaskets: Number(row.totalBaskets || 0),
                        totalDealers: Number(row.totalDealers || 0),

                        totalRequestedQty,
                        totalApprovedQty,
                        totalProductionQty,

                        submittedItems: Number(row.submittedItems || 0),
                        approvedItems: Number(row.approvedItems || 0),
                        rejectedItems: Number(row.rejectedItems || 0),
                        waitlistItems: Number(row.waitlistItems || 0),

                        availabilityPercent:
                        totalRequestedQty > 0
                            ? Math.round((totalApprovedQty / totalRequestedQty) * 100)
                            : 0,

                        designOrderStatus: getDesignOrderStatus({
                            totalRequestedQty,
                            totalApprovedQty,
                            totalProductionQty,
                            submittedItems: Number(row.submittedItems || 0),
                            rejectedItems: Number(row.rejectedItems || 0),
                            totalOrders: Number(row.totalOrders || 0),
                        }),
                    };
                    });

                    return Response.json(
                    {
                        status: 200,
                        success: true,
                        message: "Design-wise orders fetched successfully",
                        page: pageNo,
                        limit: pageLimit,
                        totalDesigns,
                        totalPages: Math.ceil(totalDesigns / pageLimit),
                        data,
                    },
                    { status: 200 }
                    );
                } catch (error) {
                    return Response.json(
                    {
                        status: 500,
                        success: false,
                        message: "Failed to fetch design-wise orders " + error.message,
                    },
                    { status: 200 }
                    );
                } finally {
                    connection.release();
                }
            }
            // get list of order of single group of design
            else if (params.ids[1] == "U00.2") {
                try {
                    const design = params.ids[2];
                    const stockType = params.ids[3]; // All / prm / std

                    const where = ["r.design = ?", "r.isDeleted = 0"];
                    const values = [design];

                    if (stockType && stockType !== "All") {
                    where.push("r.stockType = ?");
                    values.push(stockType);
                    }

                    const whereSql = `WHERE ${where.join(" AND ")}`;

                    const [rows] = await connection.execute(
                    `
                    SELECT
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

                        u.name AS orderedBy,
                        u.mobile,
                        u.mapTo,

                        u_dealer.name AS dealer,

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
                                
                                COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) < COALESCE(r.modifiedOn, r.approvedOn, r.createdOn)
                                OR (
                                COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) = COALESCE(r.modifiedOn, r.approvedOn, r.createdOn)
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

                    LEFT JOIN products p
                        ON r.design = p.design

                    LEFT JOIN user u
                        ON r.userId = u.id

                    LEFT JOIN user u_dealer
                        ON r.dealerId = u_dealer.id

                    ${whereSql}

                    ORDER BY
                        r.createdOn DESC,
                        r.id DESC
                    `,
                    values
                    );

                    if (rows.length > 0) {
                    return Response.json(
                        {
                        status: 200,
                        success: true,
                        message: "Design order items fetched successfully",
                        data: rows,
                        },
                        { status: 200 }
                    );
                    }

                    return Response.json(
                    {
                        status: 201,
                        success: true,
                        message: "No data found!",
                        data: [],
                    },
                    { status: 200 }
                    );
                } catch (error) {
                    return Response.json(
                    {
                        status: 404,
                        success: false,
                        message: "No Order found! " + error.message,
                    },
                    { status: 200 }
                    );
                } finally {
                    connection.release();
                }
                }
            // Approve by admin for an order item
            else if(params.ids[1] == 'U0.2'){
                // 1. Fail fast: Parse body and validate orderId before hitting the database
                
                // var adminId = params.ids[2];
                var orderId = params.ids[2];
                var toBeApprovedQty = params.ids[3];
                var adminId = params.ids[4];
                var actionDate = params.ids[5];

                // optional admin-chosen batch allocation order (?batchSeq=id1,id2,...)
                var batchSequence = [];
                try {
                    const batchSeqParam = new URL(request.url).searchParams.get('batchSeq');
                    if (batchSeqParam) batchSequence = batchSeqParam.split(',').map((s) => s.trim()).filter(Boolean);
                } catch (e) {}
                
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
                    connection.query(`SELECT id, status, stockType, requestedQty, approvedQty, productionQty, design, dealerId, modifiedOn, waitlistSequence FROM orders WHERE id = ? AND isDeleted = 0 FOR UPDATE`, [orderId]).then(([rows]) => rows),
                    
                    connection.query(`SELECT productId, design, prm, std FROM products WHERE design = (SELECT design FROM orders WHERE id = ? AND isDeleted = 0) FOR UPDATE`, [orderId]).then(([rows]) => rows)]);

                    // 4. Validate Order existence and state
                    if (!order) {
                    await connection.rollback();
                    return Response.json({ status: 404, success: false, message: "Order item not found" });
                    }

                    // if (order.status === "Approved") {
                    // await connection.rollback();
                    // return Response.json({ status: 409, success: false, message: "Order item is already approved" });
                    // }

                    if (["Rejected", "Cancelled"].includes(order.status)) {
                    await connection.rollback();
                    return Response.json({ status: 409, success: false, message: `Cannot approve ${order.status} item` });
                    }

                    // 5. Validate Product existence
                    if (!product) {
                    await connection.rollback();
                    return Response.json({ status: 404, success: false, message: "Product not found" });
                    }

                    if (order.status === "Approved" && order.stockType === 'prm') {

                        const oldRequestedQty = Number(order.requestedQty || 0);
                        const newRequestedQty = Number(toBeApprovedQty || 0);
                        const oldApprovedQty = Number(order.approvedQty || 0);

                        // return the previous allocation to the batches it came from (via the ledger)
                        const releaseResult = await releasePrmToBatches(connection, {
                            orderId,
                            design: order.design,
                            qty: oldApprovedQty,
                            adminId,
                        });

                        // batches are the source of truth for prm availability
                        const batches = await lockPrmBatches(connection, order.design);
                        // when the admin manually picked batches, only their stock counts toward
                        // approvedQty — the rest of the design's stock is off-limits and any
                        // shortfall goes to production instead of being silently backfilled
                        const availableStock = batchSequence.length > 0
                            ? batches.filter((b) => batchSequence.map(String).includes(String(b.id))).reduce((sum, b) => sum + b.availableQty, 0)
                            : batches.reduce((sum, b) => sum + b.availableQty, 0);

                        const newApprovedQty = Math.min(newRequestedQty, availableStock);
                        const newProductionQty = Math.max(0, newRequestedQty - newApprovedQty);

                        // compare the new requestedQty to oldRequestedQty, if decrease and productionQty > 0, then avoid modifiedOn update.
                        const shouldUpdateModifiedOn = newRequestedQty >= oldRequestedQty || newProductionQty === 0;
                        await connection.query(`UPDATE orders SET requestedQty = ?, approvedQty = ?, productionQty = ?, modifiedOn = ? WHERE id = ?`, [newRequestedQty, newApprovedQty, newProductionQty, shouldUpdateModifiedOn ? actionDate : order.modifiedOn, orderId]);

                        const batchAllocations = drainPrmBatches(batches, newApprovedQty, batchSequence);
                        await recordBatchLedger(connection, { orderId, design: order.design, entries: batchAllocations, allocationType: 'ManualAdjustment', adminId });

                        const { allocations, totalAllocatedQty, remainingStock: stockAfterAllocation } = await allocatePrmWaitlistFromBatches(connection, order.design, batches, adminId, orderId);

                        await persistPrmBatchDrain(connection, batches, adminId);
                        await connection.query(`UPDATE products SET prm = ? WHERE design = ?`, [stockAfterAllocation, order.design]);

                        await connection.commit();

                        // send notification
                        const [nrows1] = await pool.query(`SELECT id, name, relatedTo FROM user where mapTo ='${order.dealerId}'`);

                        var gcmIds = [];
                        // nrows1 has 2 columns one is id which we can add to the gcmIds directly the other is relatedTo which will be comma separated string, lets split and add into gcmIds
                        if(nrows1.length > 0){
                            for (let index = 0; index < nrows1.length; index++) {
                                const element = nrows1[index];
                                gcmIds.push(element.id);
                                if(element.relatedTo){
                                    const relatedIds = element.relatedTo.split(',');
                                    for (let index = 0; index < relatedIds.length; index++) {
                                        const relatedId = relatedIds[index];
                                        gcmIds.push(relatedId);
                                    }
                                }
                            }
                        }

                        // send the notification
                        gcmIds.length > 0 ? await send_notification(`Order is Approved for ${nrows1[0].name}`, gcmIds, 'Multiple') : null;

                        return Response.json({
                            status: 200,
                            success: true,
                            message: "Order item updated successfully",
                            data: {
                                orderId, design: order.design, stockType: order.stockType,
                                newRequestedQty, newApprovedQty, newProductionQty,
                                previousStock: availableStock,
                                batchAllocations: batchAllocations.map((e) => ({ batch: e.batchId, qty: e.qty })),
                                releasedToBatches: releaseResult,
                                waitlistAllocations: allocations,
                                totalAllocatedQty,
                                stockAfterAllocation,
                            },
                        });
                    }
                    else if (order.status === "Approved") {

                        const oldRequestedQty = Number(order.requestedQty || 0); // requestedQty – old requestedQty = 30
                        const newRequestedQty = Number(toBeApprovedQty || 0); // toBeApprovedQty – new requestedQty = 28
                        const oldApprovedQty = Number(order.approvedQty || 0); // approvedQty – old approvedQty = 10
                        const stockWeGetBack = oldApprovedQty; // If we reduce approved qty, we get back that stock to the available pool
                        
                        let availableStock = Number(product[getStockColumn(order.stockType)] || 0) + stockWeGetBack;

                        const newApprovedQty = Math.min(newRequestedQty, availableStock); // approvedQty – new approvedQty = min(28, 20 + 2) = 22
                        const newProductionQty = Math.max(0, (newRequestedQty - newApprovedQty));
                        const newAvailableStock = availableStock - newApprovedQty;
                        
                        const stockColumn = getStockColumn(order.stockType);

                        // compare the new requestedQty to oldRequestedQty, if decrease and productionQty > 0, then avoid modifiedOn update.
                        const shouldUpdateModifiedOn = newRequestedQty >= oldRequestedQty || newProductionQty === 0;
                        await connection.query(`UPDATE orders SET requestedQty = ?, approvedQty = ?, productionQty = ?, modifiedOn = ? WHERE id = ?`, [newRequestedQty, newApprovedQty, newProductionQty, shouldUpdateModifiedOn ? actionDate : order.modifiedOn, orderId]);

                        const { allocations, totalAllocatedQty, remainingStock: stockAfterAllocation } = await allocateStockToWaitlist(connection, order.design, order.stockType, newAvailableStock);

                        await connection.query(`UPDATE products SET ${stockColumn} = ? WHERE design = ?`, [stockAfterAllocation, order.design]);

                        await connection.commit();

                        
                        // send notification
                        const [nrows1] = await connection.execute(`SELECT id, name, relatedTo FROM user where mapTo ='${order.dealerId}'`);
                        connection.release();

                        var gcmIds = [];
                        // nrows1 has 2 columns one is id which we can add to the gcmIds directly the other is relatedTo which will be comma separated string, lets split and add into gcmIds
                        if(nrows1.length > 0){
                            for (let index = 0; index < nrows1.length; index++) {
                                const element = nrows1[index];
                                gcmIds.push(element.id);
                                if(element.relatedTo){
                                    const relatedIds = element.relatedTo.split(',');
                                    for (let index = 0; index < relatedIds.length; index++) {
                                        const relatedId = relatedIds[index];
                                        gcmIds.push(relatedId);
                                    }
                                }
                            }
                        }
                        
                        // send the notification
                        gcmIds.length > 0 ? await send_notification(`Order is Approved for ${nrows1[0].name}`, gcmIds, 'Multiple') : null;


                        return Response.json({
                            status: 200,
                            success: true,
                            message: "Order item updated successfully",
                            data: {
                                orderId, design: order.design, stockType: order.stockType,
                                newRequestedQty, newApprovedQty, newProductionQty,
                                previousStock: availableStock, newAvailableStock,
                                waitlistAllocations: allocations,
                                totalAllocatedQty,
                                stockAfterAllocation,
                            },
                        });
                    }
                    else if (order.stockType === 'prm') {
                        // batches are the source of truth for prm availability
                        const batches = await lockPrmBatches(connection, order.design);
                        // when the admin manually picked batches, only their stock counts toward
                        // approvedQty — the rest of the design's stock is off-limits and any
                        // shortfall goes to production instead of being silently backfilled
                        const availableStock = batchSequence.length > 0
                            ? batches.filter((b) => batchSequence.map(String).includes(String(b.id))).reduce((sum, b) => sum + b.availableQty, 0)
                            : batches.reduce((sum, b) => sum + b.availableQty, 0);
                        const requestedQty = Number(order.requestedQty || 0);

                        const approvedQty = Math.min(Number(toBeApprovedQty), availableStock);
                        const productionQty = Math.max(0, Number(toBeApprovedQty) - approvedQty);

                        await connection.query(`UPDATE orders SET approvedQty = ?, productionQty = ?, status = 'Approved', approvedOn = ?, modifiedOn = ? WHERE id = ?`,
                            [approvedQty, productionQty, actionDate, actionDate, orderId]
                        );

                        const batchAllocations = drainPrmBatches(batches, approvedQty, batchSequence);
                        await recordBatchLedger(connection, { orderId, design: order.design, entries: batchAllocations, allocationType: 'InitialApproval', adminId });

                        const { allocations, totalAllocatedQty, remainingStock: stockAfterAllocation } = await allocatePrmWaitlistFromBatches(connection, order.design, batches, adminId, orderId);

                        await persistPrmBatchDrain(connection, batches, adminId);
                        await connection.query(`UPDATE products SET prm = ? WHERE design = ?`, [stockAfterAllocation, order.design]);

                        await connection.commit();

                        return Response.json({
                            status: 200,
                            success: true,
                            message: "Order item approved successfully",
                            data: {
                                orderId, design: order.design, stockType: order.stockType,
                                requestedQty, approvedQty, productionQty,
                                previousStock: availableStock, remainingStock: stockAfterAllocation,
                                batchAllocations: batchAllocations.map((e) => ({ batch: e.batchId, qty: e.qty })),
                                waitlistAllocations: allocations,
                                totalAllocatedQty,
                                stockAfterAllocation,
                            },
                        });
                    }
                    else {
                        // 6. Memory Math Calculations
                        const stockColumn = getStockColumn(order.stockType);
                        const availableStock = Number(product[stockColumn] || 0);
                        const requestedQty = Number(order.requestedQty || 0);

                        const approvedQty = Math.min(toBeApprovedQty, availableStock);
                        const productionQty = (approvedQty - availableStock) >= 0 ? (toBeApprovedQty - availableStock) : 0;
                        const remainingStock = approvedQty - availableStock >= 0 ? 0 : availableStock - toBeApprovedQty;

                        // compare the new requestedQty to oldRequestedQty, if decrease and productionQty > 0, then avoid modifiedOn update.
                        await connection.query(`UPDATE orders SET approvedQty = ?, productionQty = ?, status = 'Approved', approvedOn = ?, modifiedOn = ? WHERE id = ?`,
                            [approvedQty, productionQty, actionDate, actionDate, orderId]
                        );

                        const { allocations, totalAllocatedQty, remainingStock: stockAfterAllocation } = await allocateStockToWaitlist(connection, order.design, order.stockType, remainingStock);

                        await connection.query(`UPDATE products SET ${stockColumn} = ? WHERE design = ?`, [stockAfterAllocation, order.design]
                        );

                        await connection.commit();

                        return Response.json({
                            status: 200,
                            success: true,
                            message: "Order item approved successfully",
                            data: {
                                orderId, design: order.design, stockType: order.stockType,
                                requestedQty, approvedQty, productionQty,
                                previousStock: availableStock, remainingStock,
                                waitlistAllocations: allocations,
                                totalAllocatedQty,
                                stockAfterAllocation,
                            },
                        });
                    }


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
                var orderId = params.ids[2];
                var adminId = params.ids[4];
                var actionDate = params.ids[5];

                if (!orderId) {
                return Response.json({
                    status: 400,
                    success: false,
                    message: "orderId is required",
                });
                }

                const rejectConnection = await pool.getConnection();
                try {
                    await rejectConnection.beginTransaction();

                    // if existing status is Approved or Cancelled or Rejected, then update modifiedOn column else update approvedOn column
                    const [existingRows] = await rejectConnection.query(`SELECT * FROM orders WHERE id = ? AND isDeleted = 0 FOR UPDATE`, [orderId]);

                    if (existingRows.length === 0) {
                    await rejectConnection.rollback();
                    return Response.json({
                        status: 404,
                        success: false,
                        message: "Order item not found",
                    });
                    }

                    const existingOrder = existingRows[0];
                    const currentStatus = existingOrder.status;
                    let waitlistAllocations = [];

                    if (["Approved"].includes(currentStatus)) {

                        await rejectConnection.query(`UPDATE orders SET status = 'Rejected', productionQty = 0, modifiedOn = ? WHERE id = ? AND isDeleted = 0`, [actionDate, orderId]);

                        // if approvedQty > 0, return that stock and hand it to the waitlist
                        const releasedQty = Number(existingOrder.approvedQty || 0);
                        if (releasedQty > 0) {
                            if (existingOrder.stockType === 'prm') {
                                // return the reserved qty to the batches it came from, then re-allocate
                                await releasePrmToBatches(rejectConnection, { orderId, design: existingOrder.design, qty: releasedQty, adminId });
                                const batches = await lockPrmBatches(rejectConnection, existingOrder.design);
                                const result = await allocatePrmWaitlistFromBatches(rejectConnection, existingOrder.design, batches, adminId);
                                await persistPrmBatchDrain(rejectConnection, batches, adminId);
                                await rejectConnection.query(`UPDATE products SET prm = ? WHERE design = ?`, [result.remainingStock, existingOrder.design]);
                                waitlistAllocations = result.allocations;
                            }
                            else {
                                const result = await allocateStockToWaitlist(rejectConnection, existingOrder.design, existingOrder.stockType, releasedQty);
                                const stockColumn = getStockColumn(existingOrder.stockType);
                                await rejectConnection.query(`UPDATE products SET ${stockColumn} = ${stockColumn} + ? WHERE design = ?`, [result.remainingStock, existingOrder.design]);
                                waitlistAllocations = result.allocations;
                            }
                        }
                    }
                    else {
                        await rejectConnection.query(`UPDATE orders SET status = 'Rejected', productionQty = 0, approvedOn = ?, modifiedOn = ? WHERE id = ? AND isDeleted = 0`, [actionDate, actionDate, orderId]);
                    }

                    await rejectConnection.commit();

                    // send notification
                        const [nrows1] = await pool.query(`SELECT id, name, relatedTo FROM user where mapTo ='${existingOrder.dealerId}'`);

                        var gcmIds = [];
                        // nrows1 has 2 columns one is id which we can add to the gcmIds directly the other is relatedTo which will be comma separated string, lets split and add into gcmIds
                        if(nrows1.length > 0){
                            for (let index = 0; index < nrows1.length; index++) {
                                const element = nrows1[index];
                                gcmIds.push(element.id);
                                if(element.relatedTo){
                                    const relatedIds = element.relatedTo.split(',');
                                    for (let index = 0; index < relatedIds.length; index++) {
                                        const relatedId = relatedIds[index];
                                        gcmIds.push(relatedId);
                                    }
                                }
                            }
                        }

                        // send the notification
                        gcmIds.length > 0 ? await send_notification(`Order is Rejected for ${nrows1[0].name}`, gcmIds, 'Multiple') : null;

                    return Response.json({
                        status: 200,
                        success: true,
                        message: "Order item rejected successfully",
                        data: {
                            orderId,
                            design: existingOrder.design,
                            approvedQty: Number(existingOrder.approvedQty || 0),
                            productionQty: 0,
                            waitlistAllocations,
                        },
                    });
                } catch (error) {
                    await rejectConnection.rollback();
                    return Response.json({
                        status: 500,
                        success: false,
                        message: "Failed to reject order item"+error.message,
                        error: error.message,
                    });
                } finally {
                    rejectConnection.release();
                }
            }
            // Mark as Out of Stock by Admin
            else if (params.ids[1] === "U0.31") {
                var orderId = params.ids[2];
                var adminId = params.ids[4];
                var actionDate = params.ids[5];

                if (!orderId) {
                return Response.json({
                    status: 400,
                    success: false,
                    message: "orderId is required",
                });
                }

                const oosConnection = await pool.getConnection();
                try {
                    await oosConnection.beginTransaction();

                    // if existing status is Approved or Cancelled or Rejected, then update modifiedOn column else update approvedOn column
                    const [existingRows] = await oosConnection.query(`SELECT * FROM orders WHERE id = ? AND isDeleted = 0 FOR UPDATE`, [orderId]);

                    if (existingRows.length === 0) {
                    await oosConnection.rollback();
                    return Response.json({
                        status: 404,
                        success: false,
                        message: "Order item not found",
                    });
                    }

                    const existingOrder = existingRows[0];
                    const currentStatus = existingOrder.status;
                    let waitlistAllocations = [];

                    if (["Approved"].includes(currentStatus)) {

                        await oosConnection.query(`UPDATE orders SET status = 'OutOfStock', approvedQty = 0, productionQty = 0, modifiedOn = ? WHERE id = ? AND isDeleted = 0`, [actionDate, orderId]);

                        // if approvedQty > 0, return that stock and hand it to the waitlist
                        const releasedQty = Number(existingOrder.approvedQty || 0);
                        if (releasedQty > 0) {
                            if (existingOrder.stockType === 'prm') {
                                // return the reserved qty to the batches it came from, then re-allocate
                                await releasePrmToBatches(oosConnection, { orderId, design: existingOrder.design, qty: releasedQty, adminId });
                                const batches = await lockPrmBatches(oosConnection, existingOrder.design);
                                const result = await allocatePrmWaitlistFromBatches(oosConnection, existingOrder.design, batches, adminId);
                                await persistPrmBatchDrain(oosConnection, batches, adminId);
                                await oosConnection.query(`UPDATE products SET prm = ? WHERE design = ?`, [result.remainingStock, existingOrder.design]);
                                waitlistAllocations = result.allocations;
                            }
                            else {
                                const result = await allocateStockToWaitlist(oosConnection, existingOrder.design, existingOrder.stockType, releasedQty);
                                const stockColumn = getStockColumn(existingOrder.stockType);
                                await oosConnection.query(`UPDATE products SET ${stockColumn} = ${stockColumn} + ? WHERE design = ?`, [result.remainingStock, existingOrder.design]);
                                waitlistAllocations = result.allocations;
                            }
                        }
                    }
                    else {
                        await oosConnection.query(`UPDATE orders SET status = 'OutOfStock', productionQty = 0, approvedQty = 0, approvedOn = ?, modifiedOn = ? WHERE id = ? AND isDeleted = 0`, [actionDate, actionDate, orderId]);
                    }

                    await oosConnection.commit();

                    return Response.json({
                        status: 200,
                        success: true,
                        message: "Order item is Out of Stock",
                        data: {
                            orderId,
                            design: existingOrder.design,
                            approvedQty: 0,
                            productionQty: 0,
                            waitlistAllocations,
                        },
                    });
                } catch (error) {
                    await oosConnection.rollback();
                    return Response.json({
                        status: 500,
                        success: false,
                        message: "Failed to mark order item"+error.message,
                        error: error.message,
                    });
                } finally {
                    oosConnection.release();
                }
            }
            // soft delete
            else if (params.ids[1] === "U0.4") {
                try {
                    var orderId = params.ids[2];
                    var actionDate = params.ids[3];

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
                        modifiedOn = ? 
                    WHERE id = ?
                        AND isDeleted = 0
                        AND status NOT IN ('Approved', 'Deleted', 'Rejected', 'Cancelled')
                    `,
                    [actionDate, orderId]
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
            // Mark all order items of a cart as Sale Order
            // /U0.5/$cartId/$adminId/$actionDate
            else if (params.ids[1] === "U0.5") {
                var cartId = decodeURIComponent(params.ids[2] || '');
                var adminId = params.ids[3];
                var actionDate = params.ids[4];

                if (!cartId) {
                return Response.json({
                    status: 400,
                    success: false,
                    message: "cartId is required",
                });
                }

                const saleOrderConnection = await pool.getConnection();
                try {
                    await saleOrderConnection.beginTransaction();

                    const [items] = await saleOrderConnection.query(
                        `SELECT id, dealerId, status, productionQty FROM orders WHERE cartId = ? AND isDeleted = 0 FOR UPDATE`,
                        [cartId]
                    );

                    if (items.length === 0) {
                        await saleOrderConnection.rollback();
                        return Response.json({
                            status: 404,
                            success: false,
                            message: "No order items found for this cart",
                        });
                    }

                    // a cart qualifies only when at least one item is Approved
                    // and no item is still awaiting review (Submitted)
                    if (!items.some((item) => item.status === 'Approved')) {
                        await saleOrderConnection.rollback();
                        return Response.json({
                            status: 409,
                            success: false,
                            message: "Cart has no approved items to mark as Sale Order",
                        });
                    }

                    if (items.some((item) => item.status === 'Submitted' || item.status === 'InReview')) {
                        await saleOrderConnection.rollback();
                        return Response.json({
                            status: 409,
                            success: false,
                            message: "Cart still has pending items awaiting review",
                        });
                    }

                    // flip every live item to SaleOrder and clear pending production;
                    // Cancelled/Rejected items keep their status but any leftover
                    // productionQty is still cleared
                    const [result] = await saleOrderConnection.query(
                        `UPDATE orders SET status = 'SaleOrder', productionQty = 0, modifiedOn = ? WHERE cartId = ? AND isDeleted = 0 AND status NOT IN ('Cancelled', 'Rejected')`,
                        [actionDate, cartId]
                    );

                    await saleOrderConnection.query(
                        `UPDATE orders SET productionQty = 0, modifiedOn = ? WHERE cartId = ? AND isDeleted = 0 AND productionQty > 0`,
                        [actionDate, cartId]
                    );

                    await saleOrderConnection.commit();

                    // send notification
                    const [nrows1] = await pool.query(`SELECT id, name, relatedTo FROM user where mapTo ='${items[0].dealerId}'`);

                    var gcmIds = [];
                    // nrows1 has 2 columns one is id which we can add to the gcmIds directly the other is relatedTo which will be comma separated string, lets split and add into gcmIds
                    if(nrows1.length > 0){
                        for (let index = 0; index < nrows1.length; index++) {
                            const element = nrows1[index];
                            gcmIds.push(element.id);
                            if(element.relatedTo){
                                const relatedIds = element.relatedTo.split(',');
                                for (let index = 0; index < relatedIds.length; index++) {
                                    const relatedId = relatedIds[index];
                                    gcmIds.push(relatedId);
                                }
                            }
                        }
                    }

                    // send the notification
                    gcmIds.length > 0 ? await send_notification(`Order is marked as Sale Order for ${nrows1[0].name}`, gcmIds, 'Multiple') : null;

                    return Response.json({
                        status: 200,
                        success: true,
                        message: "Cart marked as Sale Order",
                        data: {
                            cartId,
                            totalItems: items.length,
                            updatedItems: result.affectedRows,
                        },
                    });
                } catch (error) {
                    await saleOrderConnection.rollback();
                    return Response.json({
                        status: 500,
                        success: false,
                        message: "Failed to mark cart as Sale Order "+error.message,
                        error: error.message,
                    });
                } finally {
                    saleOrderConnection.release();
                }
            }
            // get the prm batch allocations currently held by an order
            // /U0.6/$orderId
            else if (params.ids[1] === "U0.6") {
                try {
                    const [rows] = await connection.query(
                        `
                        SELECT psb.batchId, SUM(oba.allocatedQty) AS allocatedQty
                        FROM order_batch_allocations oba
                        JOIN product_stock_batches psb ON psb.id = oba.stockBatchId
                        WHERE oba.orderId = ?
                        AND oba.stockType = 'prm'
                        GROUP BY psb.batchId
                        HAVING allocatedQty > 0
                        ORDER BY MIN(oba.id) ASC
                        `,
                        [params.ids[2]]
                    );
                    connection.release();

                    return Response.json({status: 200, data: rows, message:'Data found!'}, {status: 200})
                } catch (error) {
                    return Response.json({status: 404, message:'No allocations found!'+error}, {status: 200})
                }
            }
            // mark a Submitted order item as InReview when an admin opens it for review
            // /U0.7/$orderId
            else if (params.ids[1] === "U0.7") {
                try {
                    var orderId = params.ids[2];

                    if (!orderId) {
                        return Response.json({
                            status: 400,
                            success: false,
                            message: "orderId is required",
                        });
                    }

                    // only a Submitted item moves to InReview; anything else is left untouched
                    const [result] = await pool.query(
                        `UPDATE orders SET status = 'InReview' WHERE id = ? AND isDeleted = 0 AND status = 'Submitted'`,
                        [orderId]
                    );

                    return Response.json({
                        status: 200,
                        success: true,
                        message: result.affectedRows > 0 ? "Order item marked as InReview" : "Order item not in Submitted status",
                        data: { orderId, updated: result.affectedRows > 0 },
                    });
                } catch (error) {
                    return Response.json({
                        status: 500,
                        success: false,
                        message: "Failed to mark order item as InReview",
                        error: error.message,
                    });
                }
            }
            // get listing for mobile by userId for dealer
            // /U0.1/$selectedStatus/$offset/$role/$id/$sortBy - lets follow this for admins and dealers
            // /U0/$id/$sortBy - currently used for dealers 2-id = 5, 3-soryBy = 6
            else if(params.ids[1] == 'U0'){
                const status = params.ids[2];      // All / Submitted / Approved / etc.
                const offset = params.ids[3];        // GlobalAdmin
                const role = params.ids[4];        // GlobalAdmin
                const userId = params.ids[5];      // Test002
                const sortBy = params.ids[6] || "createdOn";

                var statusCond = '';
                // based on the role, manage the join condition to filter orders by userId or dealerId
                var joinCond = '', nameCond = '';
                if(role == 'dealer' || role == 'Dealer'){
                    nameCond += ` u_dealer.name as orderedBy, u.name as dealer, `
                    joinCond += ` LEFT JOIN user u ON o.dealerId = u.id `
                    joinCond += ` LEFT JOIN user u_dealer ON o.userId=u_dealer.id `
                    
                    if(status != 'All'){
                        statusCond = ` o.status = '`+status+`' AND `
                    }
                    statusCond += ` (u.relatedTo LIKE ? OR u.id LIKE ?) AND `
                }
                else if(role == 'globaladmin' || role == 'GlobalAdmin'){
                    nameCond += ` u_dealer.name as orderedBy, u.name as dealer, `
                    joinCond += ` LEFT JOIN user u ON o.dealerId = u.id `
                    joinCond += ` LEFT JOIN user u_dealer ON o.userId=u_dealer.id `
                    if(status != 'All'){
                        statusCond = ` o.status = '`+status+`' AND `
                    }
                }
                else {
                    nameCond += ` u.name as orderedBy, u_dealer.name as dealer, `
                    joinCond += ` LEFT JOIN user u ON o.userId = u.id `
                    joinCond += ` LEFT JOIN user u_dealer ON o.dealerId=u_dealer.id `

                    if(status != 'All'){
                        statusCond = ` o.status = '`+status+`' AND `
                    }
                    statusCond += ` ((u.relatedTo LIKE ? OR u.id LIKE ?) `

                    // get the relatedTo of the userId and split it into an array and then add it to the where condition to filter the orders by userId or relatedTo
                    // this is to make sure, if anyone in the hirerchy above has placed order for their dealers.
                    const [userRows] = await pool.query('SELECT relatedTo FROM user WHERE id = ?', [userId]);
                    if(userRows.length > 0){
                        const relatedTo = userRows[0].relatedTo;
                        if(relatedTo){
                            const relatedToArray = relatedTo.split(',');
                            if(relatedToArray.length > 0 && relatedToArray[0] != '-'){
                                var relatedToCond = '';
                                for (let index = 0; index < relatedToArray.length; index++) {
                                    const element = relatedToArray[index];
                                    if(index == 0){
                                        relatedToCond += ` u.id LIKE "%`+element+`%" `
                                    }
                                    else {
                                        relatedToCond += ` OR u.id LIKE "%`+element+`%" `
                                    }
                                }
                                statusCond += ` OR (`+relatedToCond+` OR u.id LIKE "%`+userId+`%")) AND `
                            }
                            else {
                                statusCond += ` AND `
                            }
                        }
                    }
                }
                

                try {
                    var queryCount = 'SELECT count(*) as count from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE (u.relatedTo LIKE "%'+userId+'%" OR u.id LIKE "%'+userId+'%") AND r.isDeleted = 0';
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
                                p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType, ${nameCond} u.mobile, u.mapTo,

                                CASE
                                    WHEN o.productionQty > 0 THEN (
                                    SELECT COUNT(*) + 1
                                    FROM orders x
                                    WHERE x.design = o.design
                                        AND x.stockType = o.stockType
                                        AND x.productionQty > 0
                                        AND x.isDeleted = 0
                                        AND x.status IN ('${status}')
                                        AND (
                                        COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) < COALESCE(o.modifiedOn, o.approvedOn, o.createdOn)
                                            OR (
                                            COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) = COALESCE(o.modifiedOn, o.approvedOn, o.createdOn)
                                            AND x.id < o.id
                                            )
                                        )
                                    )
                                    ELSE NULL
                                END AS waitlistPosition

                            FROM orders o
                            LEFT JOIN products p ON o.design = p.design 
                            
                            ${joinCond}
                            
                            WHERE 
                            ${statusCond}
                                o.isDeleted = 0
                            ORDER BY o.`+sortBy+` DESC, o.cartId DESC, o.serialId ASC 
                            LIMIT 20 OFFSET `+offset+`
                            `;
                            // console.log(query);
                            

                            const [rows] = await pool.query(query, [`%${userId}%`, `%${userId}%`]);

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

                            //     query = 'SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType, u.name as orderedBy, u_dealer.name as dealer, u.mobile, u.mapTo from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id LEFT JOIN user u_dealer ON r.dealerId=u_dealer.id WHERE r.isDeleted = 0 AND r.status="'+params.ids[2]+'" AND (u.relatedTo LIKE "%'+params.ids[5]+'%" OR u.id LIKE "%'+params.ids[5]+'%") ORDER BY r.'+params.ids[6]+' DESC LIMIT 20 OFFSET '+params.ids[3];
                            //     queryCount = 'SELECT count(*) as count from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.isDeleted = 0 AND r.status="'+params.ids[2]+'" AND (u.relatedTo LIKE "%'+params.ids[5]+'%" OR u.id LIKE "%'+params.ids[5]+'%")';
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
            // get listing for mobile by userId for dealer
            // /U0.1/$selectedStatus/$offset/$role/$id/$sortBy - lets follow this for admins and dealers
            // /U0/$id/$sortBy - currently used for dealers 2-id = 5, 3-soryBy = 6
            else if(params.ids[1] == '0U0'){
                const status = params.ids[2];      // All / Submitted / Approved / etc.
                const offset = params.ids[3];        // GlobalAdmin
                const role = params.ids[4];        // GlobalAdmin
                const userId = params.ids[5];      // Test002
                const sortBy = params.ids[6] || "createdOn";

                var statusCond = '';
                if(status != 'All'){
                    statusCond = ` AND o.status = '`+status+`' `
                }

                // based on the role, manage the join condition to filter orders by userId or dealerId
                var joinCond = '';
                if(role == 'dealer' || role == 'Dealer'){
                    joinCond += ` LEFT JOIN user u ON o.userId = u.id `
                    joinCond += ` LEFT JOIN user u_dealer ON o.dealerId=u_dealer.id `
                    
                    statusCond += ` (u.relatedTo LIKE ? OR u.id LIKE ?) AND `
                }
                else if(role == 'globaladmin' || role == 'GlobalAdmin'){
                    joinCond += ` LEFT JOIN user u ON o.userId = u.id `
                    joinCond += ` LEFT JOIN user u_dealer ON o.dealerId=u_dealer.id `
                }
                else {
                    joinCond += ` LEFT JOIN user u ON o.userId = u.id `
                    joinCond += ` LEFT JOIN user u_dealer ON o.dealerId=u_dealer.id `
                    statusCond += ` (u.relatedTo LIKE ? OR u.id LIKE ?) `

                    // get the relatedTo of the userId and split it into an array and then add it to the where condition to filter the orders by userId or relatedTo
                    const [userRows] = await pool.query('SELECT relatedTo FROM user WHERE id = ?', [userId]);
                    if(userRows.length > 0){
                        const relatedTo = userRows[0].relatedTo;
                        if(relatedTo){
                            const relatedToArray = relatedTo.split(',');
                            if(relatedToArray.length > 0){
                                var relatedToCond = '';
                                for (let index = 0; index < relatedToArray.length; index++) {
                                    const element = relatedToArray[index];
                                    if(index == 0){
                                        relatedToCond += ` u.id LIKE "%`+element+`%" `
                                    }
                                    else {
                                        relatedToCond += ` OR u.id LIKE "%`+element+`%" `
                                    }
                                }
                                statusCond += ` OR (`+relatedToCond+` OR u.id LIKE "%`+userId+`%") AND `
                            }
                        }
                    }
                }

                try {
                    var queryCount = 'SELECT count(*) as count from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE (u.relatedTo LIKE "%'+userId+'%" OR u.id LIKE "%'+userId+'%") AND r.isDeleted = 0';
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
                                        COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) < COALESCE(o.modifiedOn, o.approvedOn, o.createdOn)
                                            OR (
                                            COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) = COALESCE(o.modifiedOn, o.approvedOn, o.createdOn)
                                            AND x.id < o.id
                                            )
                                        )
                                    )
                                    ELSE NULL
                                END AS waitlistPosition

                            FROM orders o
                            LEFT JOIN products p ON o.design = p.design 
                            
                            ${joinCond}
                            
                            WHERE 
                            ${statusCond}
                                o.isDeleted = 0
                            ORDER BY o.`+sortBy+` DESC, o.cartId DESC, o.serialId ASC 
                            LIMIT 20 OFFSET `+offset+`
                            `;
console.log(query);

                            const [rows] = await pool.query(query, [`%${userId}%`, `%${userId}%`]);

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

                            //     query = 'SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType, u.name as orderedBy, u_dealer.name as dealer, u.mobile, u.mapTo from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id LEFT JOIN user u_dealer ON r.dealerId=u_dealer.id WHERE r.isDeleted = 0 AND r.status="'+params.ids[2]+'" AND (u.relatedTo LIKE "%'+params.ids[5]+'%" OR u.id LIKE "%'+params.ids[5]+'%") ORDER BY r.'+params.ids[6]+' DESC LIMIT 20 OFFSET '+params.ids[3];
                            //     queryCount = 'SELECT count(*) as count from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.isDeleted = 0 AND r.status="'+params.ids[2]+'" AND (u.relatedTo LIKE "%'+params.ids[5]+'%" OR u.id LIKE "%'+params.ids[5]+'%")';
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
                    const [rows, fields] = await connection.execute('SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType from orders r LEFT JOIN products p ON r.design = p.design WHERE r.isDeleted = 0 AND (r.userId LIKE "%'+params.ids[2]+'%" OR r.dealerId LIKE "%'+params.ids[2]+'%") ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3]);
                    const [countRows, countFields] = await connection.execute('SELECT count(*) as count from orders r LEFT JOIN products p ON r.design = p.design WHERE r.isDeleted = 0 AND (r.userId LIKE "%'+params.ids[2]+'%" OR r.dealerId LIKE "%'+params.ids[2]+'%")');
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
                    const [rows, fields] = await connection.execute('SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN dealer d ON r.dealerId=d.dealerId WHERE d.accountName LIKE "%'+params.ids[2]+'%" ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3]);
                    const [countRows, countFields] = await connection.execute('SELECT count(*) as count from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN dealer d ON r.dealerId=d.dealerId WHERE d.accountName LIKE "%'+params.ids[2]+'%"');
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
                                COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) < COALESCE(o.modifiedOn, o.approvedOn, o.createdOn)
                                    OR (
                                    COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) = COALESCE(o.modifiedOn, o.approvedOn, o.createdOn)
                                    AND x.id < o.id
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

                    LEFT JOIN products p
                        ON r.design = p.design

                    WHERE r.design LIKE ?
                        AND r.isDeleted = 0

                    ORDER BY
                        CASE WHEN r.productionQty > 0 THEN 0 ELSE 1 END,
                        COALESCE(r.modifiedOn, r.approvedOn, r.createdOn) DESC,
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
                            query = `SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType, 
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
                                                COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) < COALESCE(r.modifiedOn, r.approvedOn, r.createdOn)
                                                    OR (
                                                    COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) = COALESCE(r.modifiedOn, r.approvedOn, r.createdOn)
                                                    AND x.id < r.id
                                                    )
                                            )
                                        )
                                        ELSE NULL
                                        END AS waitlistSequence,
                                        u.name as orderedBy, u_dealer.name as dealer, u.mobile, u.mapTo from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id LEFT JOIN user u_dealer ON r.dealerId=u_dealer.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) ORDER BY r.createdOn DESC`;
                            queryCount = 'SELECT count(*) as count from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?))';
                        }
                        else {

                            // lets update the query to add user table as well to get user details based on the createdOn and modifiedOn fields using the provided date range in params.ids[3]
                            query = `SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType, 
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
                                                COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) < COALESCE(r.modifiedOn, r.approvedOn, r.createdOn)
                                                    OR (
                                                    COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) = COALESCE(r.modifiedOn, r.approvedOn, r.createdOn)
                                                    AND x.id < r.id
                                                    )
                                            )
                                        )
                                        ELSE NULL
                                        END AS waitlistSequence,
                                        u.name as orderedBy, u_dealer.name as dealer, u.mobile, u.mapTo from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id LEFT JOIN user u_dealer ON r.dealerId=u_dealer.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) AND r.isProduction="'+params.ids[4]+'" ORDER BY r.createdOn DESC`;
                            queryCount = 'SELECT count(*) as count from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) AND r.isProduction="'+params.ids[4]+'"';
                        }

                        // if status is provided then filter by status as well
                        if(params.ids[2] != 'All'){

                            // expiryDate field is used to store the modified timestamp for the order. So we can filter the orders modified after a particular timestamp using this field.
                            // if(params.ids[2] == 'Modified'){
                            //     query = 'SELECT r.*, p.*, u.name as dealer, u.mobile, u.mapTo from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE r.expiryDate > r.createdOn ORDER BY r.createdOn DESC LIMIT 20 OFFSET '+params.ids[3];
                            // }
                            // else

                                if(params.ids[4] == 'All'){
                                    query = `SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType, 
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
                                                        COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) < COALESCE(r.modifiedOn, r.approvedOn, r.createdOn)
                                                            OR (
                                                            COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) = COALESCE(r.modifiedOn, r.approvedOn, r.createdOn)
                                                            AND x.id < r.id
                                                            )
                                                    )
                                                )
                                                ELSE NULL
                                                END AS waitlistSequence,
                                                u.name as orderedBy, u_dealer.name as dealer, u.mobile, u.mapTo from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id LEFT JOIN user u_dealer ON r.dealerId=u_dealer.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) AND r.status='${params.ids[2]}' ORDER BY r.createdOn DESC`;
                                    queryCount = `SELECT count(*) as count from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) AND r.status='${params.ids[2]}'`;
                                }
                                else {
                                    query = `SELECT r.*, p.name, p.productId, p.description, p.size, p.tags, p.media, p.prm, p.std, p.isActive, p.designType, 
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
                                                COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) < COALESCE(r.modifiedOn, r.approvedOn, r.createdOn)
                                                    OR (
                                                    COALESCE(x.modifiedOn, x.approvedOn, x.createdOn) = COALESCE(r.modifiedOn, r.approvedOn, r.createdOn)
                                                    AND x.id < r.id
                                                    )
                                            )
                                        )
                                        ELSE NULL
                                        END AS waitlistSequence,
                                        u.name as orderedBy, u_dealer.name as dealer, u.mobile, u.mapTo from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id LEFT JOIN user u_dealer ON r.dealerId=u_dealer.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) AND r.status='${params.ids[2]}' AND r.isProduction='${params.ids[4]}' ORDER BY r.createdOn DESC`;
                                    queryCount = `SELECT count(*) as count from orders r LEFT JOIN products p ON r.design = p.design LEFT JOIN user u ON r.userId = u.id WHERE ((DATE(r.createdOn) BETWEEN ? AND ?) OR (DATE(r.modifiedOn) BETWEEN ? AND ?)) AND r.status='${params.ids[2]}' AND r.isProduction='${params.ids[4]}'`;
                                }
                        }

                    const [rows, fields] = await connection.execute(query, [params.ids[3].split(',')[0], params.ids[3].split(',')[1], params.ids[3].split(',')[0], params.ids[3].split(',')[1]]);
                    const [countRows, countFields] = await connection.execute(queryCount, [params.ids[3].split(',')[0], params.ids[3].split(',')[1], params.ids[3].split(',')[0], params.ids[3].split(',')[1]]);

                    // attach the prm batch allocations for every order in the report:
                    // net quantity currently held per (order, batch) from the ledger
                    if (rows.length > 0) {
                        const orderIds = rows.map((r) => r.id);
                        const placeholders = orderIds.map(() => '?').join(',');

                        const [allocRows] = await connection.query(
                            `
                            SELECT oba.orderId, psb.batchId, SUM(oba.allocatedQty) AS allocatedQty
                            FROM order_batch_allocations oba
                            JOIN product_stock_batches psb ON psb.id = oba.stockBatchId
                            WHERE oba.orderId IN (${placeholders})
                            AND oba.stockType = 'prm'
                            GROUP BY oba.orderId, psb.batchId
                            HAVING allocatedQty > 0
                            ORDER BY oba.orderId ASC, MIN(oba.id) ASC
                            `,
                            orderIds
                        );

                        const allocMap = new Map();
                        for (const alloc of allocRows) {
                            const key = String(alloc.orderId);
                            if (!allocMap.has(key)) allocMap.set(key, []);
                            allocMap.get(key).push({ batchId: alloc.batchId, qty: Number(alloc.allocatedQty || 0) });
                        }

                        rows.forEach((r) => {
                            r.batchAllocations = allocMap.get(String(r.id)) || [];
                        });
                    }

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
                            `INSERT INTO orders (userId, dealerId, design, requestedQty, status, approvedQty, stockType, createdOn, approvedOn, modifiedOn, serialId, cartId) VALUES (?, ?, ?, ?, "Submitted", 0, ?, ?, NULL, NULL, ?, ?)`,
                            [userId, dealerId, design, quantity, stockType, createdOn, serialId, cartId || nextCartId]
                        );
                        insertedCount++;
                    }

                    await connection.commit();

                    const [nrows] = await connection.execute(`SELECT gcm_regId FROM user where role='SuperAdmin'`);
                    const [nrows1] = await connection.execute(`SELECT id, relatedTo FROM user where mapTo ='${params.ids[5]}'`);
                    connection.release();

                    var gcmIds = nrows.map(r => r.gcm_regId).filter(id => id && id.length > 3);
                    // nrows1 has 2 columns one is id which we can add to the gcmIds directly the other is relatedTo which will be comma separated string, lets split and add into gcmIds
                    if(nrows1.length > 0){
                        for (let index = 0; index < nrows1.length; index++) {
                            const element = nrows1[index];
                            gcmIds.push(element.id);
                            if(element.relatedTo){
                                const relatedIds = element.relatedTo.split(',');
                                for (let index = 0; index < relatedIds.length; index++) {
                                    const relatedId = relatedIds[index];
                                    gcmIds.push(relatedId);
                                }
                            }
                        }
                    }
                    
                    // send the notification
                    const notificationResult = gcmIds.length > 0 ? await send_notification(`Stock request received`, gcmIds, 'Multiple') : null;


                    // return Response.json({ status: 200, message: 'Success!', data: insertedCount }, { status: 200 });
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
    (item) => !["Cancelled", "Rejected","OutOfStock"].includes(item.status)
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
        id: row.id,
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

    if (row.status === "Submitted" || row.status === "InReview") order.submittedItems += 1;
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

  if(order.status === "SaleOrder"){
    return "Sale Order";
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

  if (totalRequestedQty > 0 && totalApprovedQty <= totalRequestedQty && totalProductionQty === 0) {
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


/**
 * Lock pending order rows in waitlist order and allocate available stock.
 * Returns the allocations made, total allocated qty, and remaining stock after allocation.
 */
async function allocateStockToWaitlist(connection, design, stockType, remainingStock) {
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

    return { allocations, totalAllocatedQty, remainingStock };
}

// ---------------------------------------------------------------------------
// PRM batch helpers — product_stock_batches is the source of truth for prm
// stock; every order-batch movement is recorded in order_batch_allocations.
// ---------------------------------------------------------------------------

/**
 * Lock this design's active prm batch rows in allocation order (oldest first).
 * Returns an in-memory model that drainPrmBatches/persistPrmBatchDrain operate on.
 */
async function lockPrmBatches(connection, design) {
    const [rows] = await connection.query(
        `
        SELECT id, batchId, availableQty
        FROM product_stock_batches
        WHERE design = ?
        AND stockType = 'prm'
        AND status = 'Active'
        AND availableQty > 0
        ORDER BY receivedOn ASC, id ASC
        FOR UPDATE
        `,
        [design]
    );

    return rows.map((b) => ({
        id: b.id,
        batchId: b.batchId,
        availableQty: Number(b.availableQty || 0),
        consumedQty: 0,
    }));
}

// drain qty from the locked batches (in memory); returns the per-batch
// breakdown of what was taken.
//
// Selection order:
// 1. when sequenceIds is a non-empty array (admin manually picked batches),
//    drain only those batches, in that order; any qty left over once they're
//    exhausted is NOT pulled from other batches — it's left as production.
// 2. otherwise (auto mode), best fit: the smallest batch that can cover the
//    remaining qty on its own; when none can, drain the smallest available
//    batch and repeat (ties go to the oldest batch)
function drainPrmBatches(batches, qty, sequenceIds) {
    let remaining = Number(qty || 0);
    const entries = [];

    const takeFrom = (batch, wanted) => {
        const takeQty = Math.min(batch.availableQty, wanted);
        batch.availableQty -= takeQty;
        batch.consumedQty += takeQty;
        remaining -= takeQty;
        entries.push({ stockBatchId: batch.id, batchId: batch.batchId, qty: takeQty });
    };

    if (Array.isArray(sequenceIds) && sequenceIds.length > 0) {
        for (const id of sequenceIds) {
            if (remaining <= 0) break;
            const batch = batches.find((b) => String(b.id) === String(id));
            if (batch && batch.availableQty > 0) takeFrom(batch, remaining);
        }
        return entries;
    }

    while (remaining > 0) {
        const candidates = batches.filter((b) => b.availableQty > 0);
        if (candidates.length === 0) break;

        const fitting = candidates
            .filter((b) => b.availableQty >= remaining)
            .sort((a, b) => a.availableQty - b.availableQty);
        const pick = fitting[0] || candidates.sort((a, b) => a.availableQty - b.availableQty)[0];

        takeFrom(pick, remaining);
    }

    return entries;
}

// write drained quantities back; fully consumed batches are marked Empty
async function persistPrmBatchDrain(connection, batches, adminId) {
    for (const batch of batches) {
        if (batch.consumedQty > 0) {
            await connection.query(
                `UPDATE product_stock_batches SET availableQty = ?, status = ?, modifiedOn = NOW(), modifiedBy = ? WHERE id = ?`,
                [batch.availableQty, batch.availableQty > 0 ? 'Active' : 'Empty', adminId, batch.id]
            );
        }
    }
}

async function recordBatchLedger(connection, { orderId, design, entries, allocationType, adminId }) {
    for (const entry of entries) {
        await connection.query(
            `
            INSERT INTO order_batch_allocations
                (orderId, stockBatchId, design, stockType, allocatedQty, allocationType, createdBy)
            VALUES (?, ?, ?, 'prm', ?, ?, ?)
            `,
            [orderId, entry.stockBatchId, design, entry.qty, allocationType, adminId]
        );
    }
}

/**
 * Return released prm stock to the batches it was originally allocated from,
 * using the order_batch_allocations ledger (newest batches refunded first).
 * Stock reserved before the batch system has no ledger rows and cannot be
 * attributed to a batch — it is added back to a per-design 'LEGACY' batch so
 * it still returns to batch inventory instead of disappearing.
 */
async function releasePrmToBatches(connection, { orderId, design, qty, adminId }) {
    let remaining = Number(qty || 0);
    const released = [];

    if (remaining <= 0) {
        return { releasedQty: 0, unattributedQty: 0, released };
    }

    const [ledgerRows] = await connection.query(
        `
        SELECT id, stockBatchId, allocatedQty
        FROM order_batch_allocations
        WHERE orderId = ? AND stockType = 'prm'
        ORDER BY id ASC
        `,
        [orderId]
    );

    /**
     * Replay the ledger into open allocation lots: a positive row opens a lot
     * for its batch, a negative row (an earlier refund) consumes the newest
     * open lots first. What survives is the stock the order currently holds,
     * batch by batch, in allocation order.
     */
    const openLots = [];
    for (const ledgerRow of ledgerRows) {
        const rowQty = Number(ledgerRow.allocatedQty || 0);

        if (rowQty > 0) {
            openLots.push({ stockBatchId: ledgerRow.stockBatchId, qty: rowQty });
        }
        else if (rowQty < 0) {
            let refund = -rowQty;
            while (refund > 0 && openLots.length > 0) {
                const lot = openLots[openLots.length - 1];
                const take = Math.min(lot.qty, refund);
                lot.qty -= take;
                refund -= take;
                if (lot.qty === 0) openLots.pop();
            }
        }
    }

    /**
     * Refund the newest open lots first so the release mirrors the batches of
     * the approval being undone — each batch gets back exactly what the most
     * recent allocations took from it, even if older ledger history for the
     * order is inconsistent.
     */
    const refundsByBatch = new Map();
    while (remaining > 0 && openLots.length > 0) {
        const lot = openLots[openLots.length - 1];
        const take = Math.min(lot.qty, remaining);
        lot.qty -= take;
        remaining -= take;
        refundsByBatch.set(lot.stockBatchId, (refundsByBatch.get(lot.stockBatchId) || 0) + take);
        if (lot.qty === 0) openLots.pop();
    }

    for (const [stockBatchId, giveBackQty] of refundsByBatch) {
        await connection.query(
            `UPDATE product_stock_batches SET availableQty = availableQty + ?, status = 'Active', modifiedOn = NOW(), modifiedBy = ? WHERE id = ?`,
            [giveBackQty, adminId, stockBatchId]
        );

        await connection.query(
            `
            INSERT INTO order_batch_allocations
                (orderId, stockBatchId, design, stockType, allocatedQty, allocationType, createdBy)
            VALUES (?, ?, ?, 'prm', ?, 'ManualAdjustment', ?)
            `,
            [orderId, stockBatchId, design, -giveBackQty, adminId]
        );

        released.push({ stockBatchId, qty: giveBackQty });
    }

    /**
     * Stock allocated before the batch ledger existed: park it in the design's
     * 'LEGACY' batch. No ledger row is written for this refund — the order
     * never drew this stock from a batch, and a negative entry would corrupt
     * the order's net holdings for future releases.
     */
    if (remaining > 0) {
        const [productRows] = await connection.query(
            `SELECT productId FROM products WHERE design = ? LIMIT 1`,
            [design]
        );

        await connection.query(
            `
            INSERT INTO product_stock_batches
                (productId, design, batchId, stockType, initialQty, availableQty, status, receivedOn, createdBy)
            VALUES (?, ?, 'LEGACY', 'prm', ?, ?, 'Active', NOW(), ?)
            ON DUPLICATE KEY UPDATE
                initialQty = initialQty + VALUES(initialQty),
                availableQty = availableQty + VALUES(availableQty),
                status = 'Active',
                modifiedOn = NOW(),
                modifiedBy = VALUES(createdBy)
            `,
            [productRows[0]?.productId ?? null, design, remaining, remaining, adminId]
        );

        released.push({ stockBatchId: null, batchId: 'LEGACY', qty: remaining });
        remaining = 0;
    }

    return { releasedQty: Number(qty || 0), unattributedQty: 0, released };
}

/**
 * Allocate remaining prm batch stock to the waitlist. Mirrors
 * allocateStockToWaitlist, but drains the locked batches oldest-first and
 * records every order-batch pair in the ledger.
 */
// excludeOrderId keeps this from immediately re-absorbing leftover batch stock
// back into the order that was just approved in the same transaction — its
// productionQty (e.g. a shortfall left on purpose by a manual batch pick)
// should only be filled by a later, separate action, not this one.
async function allocatePrmWaitlistFromBatches(connection, design, batches, adminId, excludeOrderId) {
    let remainingStock = batches.reduce((sum, b) => sum + b.availableQty, 0);

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
        AND stockType = 'prm'
        AND productionQty > 0
        AND isDeleted = 0
        AND status NOT IN ('Cancelled', 'Rejected')
        ${excludeOrderId ? 'AND id != ?' : ''}
        ORDER BY
        COALESCE(modifiedOn, approvedOn, createdOn) ASC,
        id ASC
        FOR UPDATE
        `,
        excludeOrderId ? [design, excludeOrderId] : [design]
    );

    const allocations = [];
    let totalAllocatedQty = 0;

    for (const order of pendingRows) {
        if (remainingStock <= 0) break;

        const pendingQty = Number(order.productionQty || 0);

        if (pendingQty <= 0) continue;

        const allocateQty = Math.min(remainingStock, pendingQty);
        const entries = drainPrmBatches(batches, allocateQty);

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

        await recordBatchLedger(connection, { orderId: order.id, design, entries, allocationType: 'AutoStockAllocation', adminId });

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
            batches: entries.map((e) => ({ batch: e.batchId, qty: e.qty })),
        });
    }

    return { allocations, totalAllocatedQty, remainingStock };
}

function getDesignOrderStatus({
  totalRequestedQty,
  totalApprovedQty,
  totalProductionQty,
  submittedItems,
  rejectedItems,
  totalOrders,
}) {
  if (totalOrders === 0) {
    return "No Orders";
  }

  if (rejectedItems === totalOrders) {
    return "Rejected";
  }

  if (submittedItems > 0) {
    return "Action Required";
  }

  if (totalRequestedQty > 0 && totalApprovedQty <= totalRequestedQty && totalProductionQty === 0) {
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