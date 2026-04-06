import mysql from 'mysql2/promise';

import { DatabaseClient } from './database-client.mjs';

const connectionPool = await mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number.parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USERNAME,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD
});

export class MySQLClient extends DatabaseClient {
    static async init() {
        if (!connectionPool) {
            throw new Error('Missing connection pool');
        }

        let connection;

        try {
            connection = await connectionPool.getConnection();
            await connection.ping();
        } catch (error) {
            throw new Error(`Unable to establish MySQL connection during startup: ${error.message}`);
        } finally {
            if (connection) {
                connection.release();
            }
        }
    }

    // TODO - utilize limit in prepared statement
    static async queryMostRecentTiles(limit = 100) {
        if (connectionPool) {
            const [rows] = await connectionPool.execute('SELECT * FROM tiles ORDER BY submissionTime DESC LIMIT 100');
            return rows.map(row => row.colorHex);
        }

        return [];
    }
}
