import mysql from 'mysql2/promise'

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.MYSQL_DB,
    waitForConnections: true,
    connectionLimit: 50,
    maxIdle: 20,
    idleTimeout: 60000,
    queueLimit: 0,

    timezone: '+05:30', // Tells the driver how to parse incoming dates
    afterConnect: (conn, finalize) => {
        // Forces the MySQL server session to run in +05:30 offset
        conn.query("SET time_zone = '+05:30';", (err) => {
            if (err) {
                console.error("⚠️ Failed to set session timezone:", err);
            }
            finalize();
        });
    }
});

export default pool;