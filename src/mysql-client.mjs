import mysql from 'mysql2/promise';

import { DatabaseClient } from './database-client.mjs';
import { DateUtility } from './date-utility.js';
import { StringUtility } from "./string-utility.mjs";
import { getCurrentTimestamp } from './utils.mjs';

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
            throw new Error('Missing connection pool.');
        }

        try {
            await connectionPool.execute('SELECT 1 + 1');
        } catch (error) {
            throw new Error('Unable to establish MySQL connection.', { cause: error });
        }
    }

    static async queryMostRecentTiles(limit = 100) {
        if (connectionPool) {
            const [rows] = await connectionPool.query(
                'SELECT * FROM tiles ORDER BY submissionTime DESC LIMIT ?',
                [limit]
            );
            return rows.map(row => row.colorHex);
        }

        return [];
    }

    static async queryTilesByDate(date) {
        if (connectionPool && DateUtility.isValidDate(date)) {
            const [rows] = await connectionPool.execute(
                'SELECT colorHex FROM tiles WHERE DATE(submissionTime) = ? ORDER BY submissionTime DESC',
                [date]
            );

            return rows.map(row => row.colorHex);
        }

        return [];
    }

    static async insertTile(colorHex) {
        if (!StringUtility.isHexColor(colorHex)) {
            return {
                status: 400,
                message: 'Invalid colorHex format.'
            };
        }

        if (connectionPool) {
            const [result] = await connectionPool.execute(
                'INSERT INTO tiles(colorHex, submissionTime) VALUES (?, ?)',
                [colorHex, getCurrentTimestamp()]
            );

            if (result.affectedRows > 0) {
                return {
                    status: 200,
                    message: `Tile ${colorHex} inserted successfully.`
                };
            }
        }

        return {
            status: 500,
            message: 'Tile insert failed.'
        };
    }
}
