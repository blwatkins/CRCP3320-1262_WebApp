import mysql from 'mysql2/promise';

import { DatabaseClient } from './database-client.mjs';

const connectionPool = await mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number.parseInt(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USERNAME,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD
});

export class MySQLClient extends DatabaseClient {
    static init() {
        if (!connectionPool) {
            throw new Error('Missing connection pool');
        }
    }

    // TODO - utilize limit in prepared statement
    static async queryMostRecentTiles(limit = 100) {
        if (connectionPool) {
            const [rows] = await connectionPool.execute('SELECT * FROM tiles ORDER BY submissionTime DESC');
            return rows.map(row => row.colorHex);
        }

        return [];
    }
}
