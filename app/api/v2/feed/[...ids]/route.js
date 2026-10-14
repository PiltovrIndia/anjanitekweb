import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
import { send_notification } from '../../../send_notification';
import dayjs from 'dayjs'

const ADMIN_ROLES = new Set(['GlobalAdmin', 'SuperAdmin']);
const LIKE_TYPE = 1;
const DEFAULT_PAGE_SIZE = 15;
const MAX_ATTACHMENTS = 5;
const MAX_ATTACHMENT_BYTES = 25 * 1024 * 1024;
const ATTACHMENT_TYPES = {
    jpg: { contentType: 'image/jpeg', kind: 'image' },
    jpeg: { contentType: 'image/jpeg', kind: 'image' },
    png: { contentType: 'image/png', kind: 'image' },
    webp: { contentType: 'image/webp', kind: 'image' },
    gif: { contentType: 'image/gif', kind: 'image' },
    mp4: { contentType: 'video/mp4', kind: 'video' },
    pdf: { contentType: 'application/pdf', kind: 'document' },
    doc: { contentType: 'application/msword', kind: 'document' },
    docx: { contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', kind: 'document' },
    xls: { contentType: 'application/vnd.ms-excel', kind: 'document' },
    xlsx: { contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', kind: 'document' },
    ppt: { contentType: 'application/vnd.ms-powerpoint', kind: 'document' },
    pptx: { contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', kind: 'document' },
};

function json(data, status = 200) {
    return Response.json(data, { status });
}

async function getActiveActor(connection, actorId) {
    const [rows] = await connection.execute(
        'SELECT id, name, role, isActive FROM user WHERE id = ? LIMIT 1',
        [String(actorId || '').trim()]
    );

    const actor = rows[0];
    if (!actor || Number(actor.isActive) !== 1) {
        const error = new Error('An active user is required');
        error.statusCode = 403;
        throw error;
    }

    return actor;
}

function canPublish(actor) {
    return ADMIN_ROLES.has(actor.role);
}

function canManagePost(actor, post) {
    return canPublish(actor) || String(actor.id) === String(post.sender);
}

function getFeedMediaValue(value) {
    const media = String(value || '').trim();
    return media && media !== '-' ? media : '-';
}

function getAttachmentExtension(value) {
    const fileName = String(value || '').trim().toLowerCase();
    const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
    return ATTACHMENT_TYPES[extension] ? extension : null;
}

function getLegacyAttachment(row) {
    const media = getFeedMediaValue(row.media);
    if (media === '-') return null;

    return {
        id: `legacy-${row.id}`,
        storagePath: `${media}.webp`,
        fileName: 'Image attachment',
        contentType: 'image/webp',
        fileSize: null,
        kind: 'image',
        sortOrder: -1,
        legacy: true,
    };
}

function createAttachmentError(message) {
    const error = new Error(message);
    error.statusCode = 400;
    return error;
}

function validateNewAttachment(value) {
    const fileName = String(value?.fileName || '').trim();
    const storagePath = String(value?.storagePath || '').trim();
    const extension = getAttachmentExtension(fileName);
    const expected = extension ? ATTACHMENT_TYPES[extension] : null;
    const fileSize = Number(value?.fileSize);

    if (!fileName || fileName.length > 255 || /[\x00-\x1F]/.test(fileName) || !expected) {
        throw createAttachmentError('Use a supported attachment file type');
    }
    if (!Number.isInteger(fileSize) || fileSize < 1 || fileSize > MAX_ATTACHMENT_BYTES) {
        throw createAttachmentError('Each attachment must be smaller than 25 MB');
    }
    if (String(value?.contentType || '').toLowerCase() !== expected.contentType) {
        throw createAttachmentError('Attachment type does not match its file extension');
    }

    const safePath = new RegExp(`^feed/[A-Za-z0-9_-]{8,128}/[A-Za-z0-9_-]{8,128}\\.${extension}$`);
    if (!safePath.test(storagePath)) {
        throw createAttachmentError('Attachment storage path is invalid');
    }

    return {
        storagePath,
        fileName,
        contentType: expected.contentType,
        fileSize,
        kind: expected.kind,
    };
}

function getAttachmentPayload(value) {
    if (!Array.isArray(value)) return null;
    if (value.length > MAX_ATTACHMENTS) {
        throw createAttachmentError('A Feed post can have up to five attachments');
    }
    return value;
}

async function insertFeedAttachments(connection, feedId, attachments) {
    for (let index = 0; index < attachments.length; index += 1) {
        const attachment = attachments[index];
        await connection.execute(
            `INSERT INTO feed_attachments
                (feedId, storagePath, fileName, contentType, fileSize, attachmentKind, sortOrder)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [feedId, attachment.storagePath, attachment.fileName, attachment.contentType, attachment.fileSize, attachment.kind, attachment.sortOrder ?? index]
        );
    }
}

function getFeedCursor(value) {
    if (!value) return null;

    try {
        const decoded = JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
        if (!decoded?.sentAt || !Number.isInteger(Number(decoded.id))) return null;
        return { sentAt: decoded.sentAt, id: Number(decoded.id) };
    } catch {
        return null;
    }
}

function createFeedCursor(post) {
    if (!post?.sentAt || !post?.id) return null;
    return Buffer.from(JSON.stringify({ sentAt: post.sentAt, id: Number(post.id) })).toString('base64url');
}

function isValidDate(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value || '');
}

async function buildFeedItems(connection, rows) {
    if (rows.length === 0) return [];

    const ids = rows.map((row) => row.id);
    const placeholders = ids.map(() => '?').join(',');
    const [likeRows] = await connection.query(
        `SELECT fr.feedId, fr.sender, u.name
         FROM feed_reactions fr
         LEFT JOIN user u ON u.id = fr.sender
         WHERE fr.feedId IN (${placeholders}) AND fr.type = ?
         ORDER BY fr.sentAt DESC, fr.id DESC`,
        [...ids, LIKE_TYPE]
    );
    const [attachmentRows] = await connection.query(
        `SELECT id, feedId, storagePath, fileName, contentType, fileSize, attachmentKind, sortOrder
         FROM feed_attachments
         WHERE feedId IN (${placeholders})
         ORDER BY sortOrder ASC, id ASC`,
        ids
    );

    const likersByPost = new Map();
    likeRows.forEach((like) => {
        const key = String(like.feedId);
        if (!likersByPost.has(key)) likersByPost.set(key, []);
        likersByPost.get(key).push({ id: like.sender, name: like.name || like.sender });
    });

    const attachmentsByPost = new Map();
    attachmentRows.forEach((attachment) => {
        const key = String(attachment.feedId);
        if (!attachmentsByPost.has(key)) attachmentsByPost.set(key, []);
        attachmentsByPost.get(key).push({
            id: attachment.id,
            storagePath: attachment.storagePath,
            fileName: attachment.fileName,
            contentType: attachment.contentType,
            fileSize: Number(attachment.fileSize),
            kind: attachment.attachmentKind,
            sortOrder: Number(attachment.sortOrder),
            legacy: false,
        });
    });

    return rows.map((row) => {
        const legacyAttachment = getLegacyAttachment(row);
        return {
            ...row,
            likeCount: Number(row.likeCount || 0),
            likedByCurrentUser: Boolean(Number(row.likedByCurrentUser || 0)),
            likerPreview: (likersByPost.get(String(row.id)) || []).slice(0, 3),
            attachments: [legacyAttachment, ...(attachmentsByPost.get(String(row.id)) || [])].filter(Boolean),
        };
    });
}

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

            // U7: cursor-paginated feed browsing with server-side discovery filters.
            if (params.ids[1] === 'U7') {
                const requestUrl = new URL(request.url);
                const actor = await getActiveActor(connection, params.ids[2]);
                const search = (requestUrl.searchParams.get('search') || '').trim().slice(0, 160);
                const authorId = (requestUrl.searchParams.get('authorId') || '').trim().slice(0, 100);
                const fromDate = (requestUrl.searchParams.get('fromDate') || '').trim();
                const toDate = (requestUrl.searchParams.get('toDate') || '').trim();
                const media = (requestUrl.searchParams.get('media') || 'all').trim().toLowerCase();
                const limitValue = Number(requestUrl.searchParams.get('limit') || DEFAULT_PAGE_SIZE);
                const limit = Math.min(Math.max(Number.isInteger(limitValue) ? limitValue : DEFAULT_PAGE_SIZE, 1), 30);
                const cursor = getFeedCursor(requestUrl.searchParams.get('cursor'));

                if ((fromDate && !isValidDate(fromDate)) || (toDate && !isValidDate(toDate)) || (fromDate && toDate && fromDate > toDate)) {
                    connection.release();
                    return json({ status: 400, success: false, message: 'Choose a valid date range' }, 400);
                }

                if (!['all', 'with-media', 'text-only'].includes(media)) {
                    connection.release();
                    return json({ status: 400, success: false, message: 'Invalid media filter' }, 400);
                }

                const where = [];
                const values = [actor.id];

                if (search) {
                    where.push('(f.message LIKE ? OR u.name LIKE ?)');
                    values.push(`%${search}%`, `%${search}%`);
                }
                if (authorId) {
                    where.push('f.sender = ?');
                    values.push(authorId);
                }
                if (fromDate) {
                    where.push('DATE(f.sentAt) >= ?');
                    values.push(fromDate);
                }
                if (toDate) {
                    where.push('DATE(f.sentAt) <= ?');
                    values.push(toDate);
                }
                const hasAttachmentsSql = "(f.media IS NOT NULL AND f.media <> '' AND f.media <> '-' OR EXISTS (SELECT 1 FROM feed_attachments fa WHERE fa.feedId = f.id))";
                if (media === 'with-media') where.push(hasAttachmentsSql);
                if (media === 'text-only') where.push(`NOT ${hasAttachmentsSql}`);
                if (cursor) {
                    where.push('(f.sentAt < ? OR (f.sentAt = ? AND f.id < ?))');
                    values.push(cursor.sentAt, cursor.sentAt, cursor.id);
                }

                const [rows] = await connection.execute(
                    `SELECT
                        f.id, f.sender, f.sentAt, f.modifiedOn, f.message, f.media, f.category,
                        u.name, u.role, u.isActive AS authorIsActive,
                        COUNT(DISTINCT CASE WHEN fr.type = ${LIKE_TYPE} THEN fr.id END) AS likeCount,
                        MAX(CASE WHEN fr.type = ${LIKE_TYPE} AND fr.sender = ? THEN 1 ELSE 0 END) AS likedByCurrentUser
                     FROM feed f
                     INNER JOIN user u ON u.id = f.sender
                     LEFT JOIN feed_reactions fr ON fr.feedId = f.id AND fr.type = ${LIKE_TYPE}
                     ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
                     GROUP BY f.id, f.sender, f.sentAt, f.modifiedOn, f.message, f.media, f.category, u.name, u.role, u.isActive
                     ORDER BY f.sentAt DESC, f.id DESC
                     LIMIT ${limit + 1}`,
                    values
                );

                const hasMore = rows.length > limit;
                const pageRows = hasMore ? rows.slice(0, limit) : rows;
                const data = await buildFeedItems(connection, pageRows);
                const lastItem = data[data.length - 1];

                connection.release();
                return json({
                    status: 200,
                    success: true,
                    data,
                    hasMore,
                    nextCursor: hasMore ? createFeedCursor(lastItem) : null,
                    message: 'Feed posts fetched successfully',
                });
            }

            // U8: available post authors for the Feed author filter.
            if (params.ids[1] === 'U8') {
                const requestUrl = new URL(request.url);
                await getActiveActor(connection, params.ids[2]);
                const search = (requestUrl.searchParams.get('search') || '').trim().slice(0, 100);
                const values = [];
                let searchSql = '';
                if (search) {
                    searchSql = 'WHERE u.name LIKE ? OR f.sender LIKE ?';
                    values.push(`%${search}%`, `%${search}%`);
                }

                const [rows] = await connection.execute(
                    `SELECT f.sender AS id, MAX(u.name) AS name, MAX(u.role) AS role, MAX(u.isActive) AS isActive,
                            COUNT(*) AS postCount
                     FROM feed f
                     INNER JOIN user u ON u.id = f.sender
                     ${searchSql}
                     GROUP BY f.sender
                     ORDER BY name ASC
                     LIMIT 100`,
                    values
                );
                connection.release();
                return json({ status: 200, success: true, data: rows, message: 'Feed authors fetched successfully' });
            }

            if(params.ids[1] == 0){ // create notification
                try {
                    // create query for insert
                    const q = 'INSERT INTO feed (sender, message, media, category,reactions) VALUES ( ?, ?, ?, ?, ?)';
                    // create new notification
                    const [rows, fields] = await connection.execute(q, [ params.ids[2], decodeURIComponent(params.ids[3]), params.ids[4], params.ids[5], 0 ]);
                    

                    // send notification to notification specific dealers

                    // get the gcm_regIds of Students to notify
                        // Split the branches string into an array
                        var conditionsString = '';
                        // var query = '';
                        // if(params.ids[3]!='All'){ // check for the student type
                        //     // conditionsString = conditionsString + ' userId="'+params.ids[3]+'" ';
                        //     query = 'SELECT gcm_regId FROM users where userId="'+params.ids[3]+'" AND CHAR_LENGTH(gcm_regId) > 3';
                        // }
                        // else {
                        //     // conditionsString = conditionsString + ' role="dealer" ';
                        //     query = 'SELECT u.gcm_regId from users u JOIN dealers d where d.userId=u.userId AND d.state="'+params.ids[6]+'" AND CHAR_LENGTH(u.gcm_regId) > 3'
                        // }
                        
                        // // const [nrows, nfields] = await connection.execute('SELECT gcm_regId FROM `user` where role IN ("SuperAdmin") or (role="Admin" AND branch = ?)', [ rows1[0].branch ],);
                        const [nrows, nfields] = await connection.execute(`SELECT gcm_regId FROM user where isActive = 1`);
                        connection.release();
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
                        const notificationResult = gcmIds.length > 0 ? await send_notification(decodeURIComponent(params.ids[3]), gcmIds, 'Multiple') : null;
                            
                        // return successful update
                        // return Response.json({status: 200, message:'Posted to feed!', id: rows.insertId}, {status: 200})
                        return Response.json({status: 200, message:'Posted to feed!', id: rows.insertId, notification: notificationResult}, {status: 200})


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
                const [rows, fields] = await connection.execute('SELECT f.*,u.name,u.email,u.mobile,u.role from feed f JOIN user u ON f.sender=u.id ORDER BY sentAt DESC LIMIT 10 OFFSET '+params.ids[2]);
                // get the reactions for each feed item from feed_reactions table
                const [reactionRows, reactionFields] = await connection.execute('SELECT * from feed_reactions where feedId IN ('+rows.map(r => r.id).join(',')+')');
                connection.release();
            
                // check if user is found
                if(rows.length > 0){
                    // return the requests data
                    return Response.json({status: 200, message:'Data found!', data: rows, reactions: reactionRows}, {status: 200})

                }
                else {
                    // user doesn't exist in the system
                    return Response.json({status: 404, message:'No data!'}, {status: 200})
                }
            }
            else if(params.ids[1] == 1.5){ // update the reactions count for a feed item
                try {
                    // need to increment the reactions count
                    const q = 'UPDATE feed SET reactions = reactions + 1 WHERE id = ?';
                    const [rows, fields] = await connection.execute(q, [ params.ids[2] ]);

                    // update the feed_reactions table to add a new reaction by the user
                    const q1 = 'INSERT INTO feed_reactions (feedId, sender, message, type) VALUES ( ?, ?, ?, ?)';
                    const [rows1, fields1] = await connection.execute(q1, [ params.ids[2], params.ids[3], params.ids[4], params.ids[5] ]);
                    
                    connection.release();
                    
                    // return successful update
                    return Response.json({status: 200, message:'Updated!', reactionId: rows1.insertId}, {status: 200})
                } catch (error) {
                    // user doesn't exist in the system
                    return Response.json({status: 404, message:'Error updating reactions. Please try again later!'+error.message}, {status: 200})
                }
            }
            else if(params.ids[1] == 2){ // fetch data for specific dealer
                
                var q = 'SELECT * from notifications WHERE sentAt < "'+params.ids[3]+'" AND (receiver="'+params.ids[2]+'" OR receiver="All" OR sender="'+params.ids[2]+'") ORDER BY sentAt DESC LIMIT 50 OFFSET '+params.ids[4];
                
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
              const [rows, fields] = await connection.execute('SELECT DISTINCT(n.receiver),u.name FROM `notifications` n JOIN users u ON n.receiver=u.userId where n.sender="'+params.ids[2]+'"');
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
              if(params.ids[3] == "All"){
                query = 'SELECT * FROM notifications WHERE sender ="'+params.ids[2]+'" AND receiver = "'+params.ids[3]+'" ORDER BY sentAt ASC';
              }
              else {
                query = 'SELECT n.*,u.name as receiverName FROM notifications n JOIN users u ON n.receiver=u.userId WHERE (n.sender IN ("'+params.ids[2]+'", "'+params.ids[3]+'") AND n.receiver = "'+params.ids[3]+'") OR (n.receiver IN ("'+params.ids[2]+'", "'+params.ids[3]+'") AND n.sender = "'+params.ids[3]+'") ORDER BY n.sentAt ASC';
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
          else if(params.ids[1] == 6){ // update the notification as SEEN by the dealer
                
            var q = 'UPDATE notifications set seen=1 WHERE notificationId = '+params.ids[2];
            
            const [rows, fields] = await connection.execute(q);
            // const [rows, fields] = await connection.execute('SELECT * from notification WHERE universityId="'+params.ids[2]+'" AND campusId="'+params.ids[3]+'" AND branch = "All" or FIND_IN_SET("'+params.ids[4]+'", branch)>0 ORDER BY createdOn DESC');
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
        connection.release();
        const status = err.statusCode || 500;
        return Response.json({status, success: false, message:err.message || 'Facing issues. Please try again!'}, {status})
    }
    
    
  }

export async function POST(request, { params }) {
    const connection = await pool.getConnection();
    let transactionStarted = false;

    try {
        if (!await Keyverify(params.ids[0])) {
            return json({ status: 401, success: false, message: 'Unauthorized' }, 401);
        }
        if (params.ids[1] !== 'U9') {
            return json({ status: 404, success: false, message: 'Unsupported Feed operation' }, 404);
        }

        const body = await request.json();
        const actor = await getActiveActor(connection, body.actorId);
        if (!canPublish(actor)) {
            return json({ status: 403, success: false, message: 'Only GlobalAdmin and SuperAdmin can publish Feed posts' }, 403);
        }

        const message = String(body.message || '').trim();
        if (!message || message.length > 2000) {
            return json({ status: 400, success: false, message: 'Enter a post message up to 2,000 characters' }, 400);
        }

        const attachmentPayload = getAttachmentPayload(body.attachments);
        const attachments = attachmentPayload ? attachmentPayload.map(validateNewAttachment) : [];
        const media = attachmentPayload ? '-' : getFeedMediaValue(body.media);

        await connection.beginTransaction();
        transactionStarted = true;
        const [result] = await connection.execute(
            'INSERT INTO feed (sender, message, media, category, reactions) VALUES (?, ?, ?, ?, 0)',
            [actor.id, message, media, 'update']
        );
        await insertFeedAttachments(connection, result.insertId, attachments);
        await connection.commit();
        transactionStarted = false;

        const [rows] = await connection.execute(
            'SELECT id, sender, sentAt, modifiedOn, message, media, category FROM feed WHERE id = ? LIMIT 1',
            [result.insertId]
        );

        const [notificationRows] = await connection.execute('SELECT gcm_regId FROM user WHERE isActive = 1');
        const gcmIds = notificationRows
            .map((row) => String(row.gcm_regId || ''))
            .filter((id) => id.length > 3);
        const notification = gcmIds.length > 0
            ? await send_notification(message, gcmIds, 'Multiple')
            : null;
        const [post] = await buildFeedItems(connection, [{
            ...rows[0],
            name: actor.name,
            role: actor.role,
            authorIsActive: 1,
            likeCount: 0,
            likedByCurrentUser: false,
        }]);

        return json({
            status: 200,
            success: true,
            data: post,
            notification,
            message: 'Feed post published successfully',
        });
    } catch (error) {
        if (transactionStarted) await connection.rollback();
        console.error('Feed create error:', error);
        return json({ status: error.statusCode || 500, success: false, message: error.message || 'Unable to publish Feed post' }, error.statusCode || 500);
    } finally {
        connection.release();
    }
}

export async function PATCH(request, { params }) {
    const connection = await pool.getConnection();
    let transactionStarted = false;

    try {
        if (!await Keyverify(params.ids[0])) {
            return json({ status: 401, success: false, message: 'Unauthorized' }, 401);
        }
        if (params.ids[1] !== 'U10') {
            return json({ status: 404, success: false, message: 'Unsupported Feed operation' }, 404);
        }

        const postId = Number(params.ids[2]);
        if (!Number.isInteger(postId) || postId < 1) {
            return json({ status: 400, success: false, message: 'Invalid Feed post' }, 400);
        }
        const body = await request.json();
        await connection.beginTransaction();
        transactionStarted = true;
        const actor = await getActiveActor(connection, body.actorId);
        const [existingRows] = await connection.execute('SELECT id, sender, media FROM feed WHERE id = ? LIMIT 1 FOR UPDATE', [postId]);
        const existing = existingRows[0];
        if (!existing) {
            await connection.rollback();
            transactionStarted = false;
            return json({ status: 404, success: false, message: 'Feed post not found' }, 404);
        }
        if (!canManagePost(actor, existing)) {
            await connection.rollback();
            transactionStarted = false;
            return json({ status: 403, success: false, message: 'You cannot edit this Feed post' }, 403);
        }

        const message = String(body.message || '').trim();
        if (!message || message.length > 2000) {
            await connection.rollback();
            transactionStarted = false;
            return json({ status: 400, success: false, message: 'Enter a post message up to 2,000 characters' }, 400);
        }

        const attachmentPayload = getAttachmentPayload(body.attachments);
        const cleanupStoragePaths = [];
        let media = getFeedMediaValue(body.media);

        if (attachmentPayload) {
            const [storedAttachments] = await connection.execute(
                `SELECT id, storagePath
                 FROM feed_attachments
                 WHERE feedId = ?
                 FOR UPDATE`,
                [postId]
            );
            const storedById = new Map(storedAttachments.map((attachment) => [String(attachment.id), attachment]));
            const keptAttachmentIds = new Set();
            const newAttachments = [];

            attachmentPayload.forEach((attachment, index) => {
                const attachmentId = Number(attachment?.id);
                const hasAttachmentId = attachment?.id !== undefined && attachment?.id !== null;
                if (hasAttachmentId && (!Number.isInteger(attachmentId) || !storedById.has(String(attachmentId)))) {
                    throw createAttachmentError('An attachment does not belong to this Feed post');
                }
                if (hasAttachmentId) {
                    if (keptAttachmentIds.has(String(attachmentId))) {
                        throw createAttachmentError('An attachment cannot be added twice');
                    }
                    keptAttachmentIds.add(String(attachmentId));
                    return;
                }
                newAttachments.push({ ...validateNewAttachment(attachment), sortOrder: index });
            });

            const keepLegacyMedia = !body.removeLegacyMedia;
            const legacyCount = getFeedMediaValue(existing.media) === '-' || !keepLegacyMedia ? 0 : 1;
            if (attachmentPayload.length + legacyCount > MAX_ATTACHMENTS) {
                throw createAttachmentError('A Feed post can have up to five attachments');
            }

            const removedAttachments = storedAttachments.filter((attachment) => !keptAttachmentIds.has(String(attachment.id)));
            cleanupStoragePaths.push(...removedAttachments.map((attachment) => attachment.storagePath));
            if (removedAttachments.length > 0) {
                await connection.execute(
                    `DELETE FROM feed_attachments
                     WHERE feedId = ? AND id IN (${removedAttachments.map(() => '?').join(',')})`,
                    [postId, ...removedAttachments.map((attachment) => attachment.id)]
                );
            }

            for (let index = 0; index < attachmentPayload.length; index += 1) {
                const attachmentId = Number(attachmentPayload[index]?.id);
                if (Number.isInteger(attachmentId) && keptAttachmentIds.has(String(attachmentId))) {
                    await connection.execute('UPDATE feed_attachments SET sortOrder = ? WHERE id = ? AND feedId = ?', [index, attachmentId, postId]);
                }
            }
            await insertFeedAttachments(connection, postId, newAttachments);

            if (getFeedMediaValue(existing.media) !== '-' && !keepLegacyMedia) {
                cleanupStoragePaths.push(`${existing.media}.webp`);
                media = '-';
            } else {
                media = getFeedMediaValue(existing.media);
            }
        }

        await connection.execute(
            'UPDATE feed SET message = ?, media = ?, modifiedOn = NOW() WHERE id = ?',
            [message, media, postId]
        );
        await connection.commit();
        transactionStarted = false;
        const [rows] = await connection.execute(
            `SELECT f.id, f.sender, f.sentAt, f.modifiedOn, f.message, f.media, f.category,
                    u.name, u.role, u.isActive AS authorIsActive,
                    COUNT(CASE WHEN fr.type = ${LIKE_TYPE} THEN fr.id END) AS likeCount,
                    MAX(CASE WHEN fr.type = ${LIKE_TYPE} AND fr.sender = ? THEN 1 ELSE 0 END) AS likedByCurrentUser
             FROM feed f
             INNER JOIN user u ON u.id = f.sender
             LEFT JOIN feed_reactions fr ON fr.feedId = f.id AND fr.type = ${LIKE_TYPE}
             WHERE f.id = ?
             GROUP BY f.id, f.sender, f.sentAt, f.modifiedOn, f.message, f.media, f.category, u.name, u.role, u.isActive`,
            [actor.id, postId]
        );
        const [post] = await buildFeedItems(connection, rows);

        return json({ status: 200, success: true, data: { ...post, cleanupStoragePaths }, message: 'Feed post updated successfully' });
    } catch (error) {
        if (transactionStarted) await connection.rollback();
        console.error('Feed update error:', error);
        return json({ status: error.statusCode || 500, success: false, message: error.message || 'Unable to update Feed post' }, error.statusCode || 500);
    } finally {
        connection.release();
    }
}

export async function DELETE(request, { params }) {
    const connection = await pool.getConnection();

    try {
        if (!await Keyverify(params.ids[0])) {
            return json({ status: 401, success: false, message: 'Unauthorized' }, 401);
        }
        if (params.ids[1] !== 'U11') {
            return json({ status: 404, success: false, message: 'Unsupported Feed operation' }, 404);
        }

        const postId = Number(params.ids[2]);
        const body = await request.json();
        await connection.beginTransaction();

        const actor = await getActiveActor(connection, body.actorId);
        const [postRows] = await connection.execute('SELECT id, sender, media FROM feed WHERE id = ? FOR UPDATE', [postId]);
        const post = postRows[0];
        if (!post) {
            await connection.rollback();
            return json({ status: 404, success: false, message: 'Feed post not found' }, 404);
        }
        if (!canManagePost(actor, post)) {
            await connection.rollback();
            return json({ status: 403, success: false, message: 'You cannot delete this Feed post' }, 403);
        }

        const [attachmentRows] = await connection.execute(
            'SELECT storagePath FROM feed_attachments WHERE feedId = ? FOR UPDATE',
            [postId]
        );
        const storagePaths = [
            ...attachmentRows.map((attachment) => attachment.storagePath),
            ...(getFeedMediaValue(post.media) === '-' ? [] : [`${post.media}.webp`]),
        ];

        await connection.execute('DELETE FROM feed_reactions WHERE feedId = ?', [postId]);
        await connection.execute('DELETE FROM feed WHERE id = ?', [postId]);
        await connection.commit();

        return json({ status: 200, success: true, data: { id: postId, storagePaths }, message: 'Feed post deleted successfully' });
    } catch (error) {
        await connection.rollback();
        console.error('Feed delete error:', error);
        return json({ status: error.statusCode || 500, success: false, message: error.message || 'Unable to delete Feed post' }, error.statusCode || 500);
    } finally {
        connection.release();
    }
}

export async function PUT(request, { params }) {
    const connection = await pool.getConnection();

    try {
        if (!await Keyverify(params.ids[0])) {
            return json({ status: 401, success: false, message: 'Unauthorized' }, 401);
        }
        if (params.ids[1] !== 'U12') {
            return json({ status: 404, success: false, message: 'Unsupported Feed operation' }, 404);
        }

        const postId = Number(params.ids[2]);
        const body = await request.json();
        await connection.beginTransaction();
        const actor = await getActiveActor(connection, body.actorId);
        const [postRows] = await connection.execute('SELECT id FROM feed WHERE id = ? FOR UPDATE', [postId]);
        if (!postRows[0]) {
            await connection.rollback();
            return json({ status: 404, success: false, message: 'Feed post not found' }, 404);
        }

        const [existingLikes] = await connection.execute(
            'SELECT id FROM feed_reactions WHERE feedId = ? AND sender = ? AND type = ? LIMIT 1 FOR UPDATE',
            [postId, actor.id, LIKE_TYPE]
        );
        const liked = existingLikes.length === 0;
        if (liked) {
            await connection.execute(
                'INSERT INTO feed_reactions (feedId, sender, message, type) VALUES (?, ?, ?, ?)',
                [postId, actor.id, null, LIKE_TYPE]
            );
        } else {
            await connection.execute('DELETE FROM feed_reactions WHERE id = ?', [existingLikes[0].id]);
        }

        const [countRows] = await connection.execute(
            'SELECT COUNT(*) AS likeCount FROM feed_reactions WHERE feedId = ? AND type = ?',
            [postId, LIKE_TYPE]
        );
        const likeCount = Number(countRows[0]?.likeCount || 0);
        await connection.execute('UPDATE feed SET reactions = ? WHERE id = ?', [likeCount, postId]);
        await connection.commit();

        return json({ status: 200, success: true, data: { id: postId, liked, likeCount }, message: liked ? 'Post liked' : 'Like removed' });
    } catch (error) {
        await connection.rollback();
        console.error('Feed reaction error:', error);
        return json({ status: error.statusCode || 500, success: false, message: error.message || 'Unable to update Like' }, error.statusCode || 500);
    } finally {
        connection.release();
    }
}
