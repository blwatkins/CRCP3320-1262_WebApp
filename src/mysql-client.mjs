import mysql from 'mysql2/promise';

import { DatabaseClient } from './database-client.mjs';
import { DateUtility } from './date-utility.mjs';
import { StringUtility } from './string-utility.mjs';

const connectionPool = await mysql.createPool({
    host: process.env.MYSQL_HOST,
    port: Number.parseInt(process.env.MYSQL_PORT, 10),
    user: process.env.MYSQL_USERNAME,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD
});

export class MySQLClient extends DatabaseClient {
    /**
     * @returns {Promise<void>}
     * @throws {Error} If mysql2 authentication fails.
     */
    static async init() {
        if (!connectionPool) {
            throw new Error('Missing connection pool.');
        }

        try {
            await connectionPool.execute('SELECT 1 + 1');
        } catch (error) {
            throw new Error('Unable to establish MySQL connection.');
        }
    }

    /**
     * @param limit {number}
     * @returns {Promise<{ status: 200, data: string[] }|{ status: 400|500, message: string }>}
     */
    static async queryMostRecentTiles(limit = 100) {
        if (typeof limit !== 'number' || limit < 1 || limit > 1_000) {
            return {
                status: 400,
                message: `Invalid limit: ${limit}. Limit must be a number between 1 and 1000.`
            };
        }

        if (connectionPool) {
            try {
                const [rows] = await connectionPool.query(
                    'SELECT colorHex FROM tiles ORDER BY submissionTime DESC LIMIT ?',
                    [limit]
                );

                return {
                    status: 200,
                    data: MySQLClient.filterTiles(rows.map(row => row.colorHex))
                };
            } catch (error) {
                console.error(error);
                return {
                    status: 500,
                    message: 'Error querying tiles by date.'
                }
            }
        }

        return {
            status: 500,
            message: 'Error querying tiles by date.'
        }
    }

    /**
     * @param date {string}
     * @returns {Promise<{ status: 200, data: string[] }|{ status: 400|500, message: string }>}
     */
    static async queryTilesByDate(date) {
        if (!DateUtility.isValidDate(date)) {
            return {
                status: 400,
                message: 'Invalid date format.'
            };
        }

        if (connectionPool) {
            try {
                const [rows] = await connectionPool.execute(
                    'SELECT colorHex FROM tiles WHERE DATE(submissionTime) = ? ORDER BY submissionTime DESC',
                    [date]
                );

                return {
                    status: 200,
                    data: MySQLClient.filterTiles(rows.map(row => row.colorHex))
                };
            } catch (error) {
                console.error(error);
                return {
                    status: 500,
                    message: 'Error querying tiles by date.'
                }
            }
        }

        return {
            status: 500,
            message: 'Error querying tiles by date.'
        }
    }

    /**
     * @param colorHex {string}
     * @returns {Promise<{ status: 200|400|500, message: string }>}
     */
    static async insertTile(colorHex) {
        if (!StringUtility.isHexColor(colorHex)) {
            return {
                status: 400,
                message: 'Invalid colorHex format.'
            };
        }

        if (connectionPool) {
            try {
                const [result] = await connectionPool.execute(
                    'INSERT INTO tiles(colorHex, submissionTime) VALUES (?, ?)',
                    [colorHex, DateUtility.getCurrentTimestamp()]
                );

                if (result.affectedRows > 0) {
                    return {
                        status: 200,
                        message: `Tile ${colorHex} inserted successfully.`
                    };
                }
            } catch (error) {
                console.error(error);
                return {
                    status: 500,
                    message: 'Tile insert failed.'
                };
            }
        }

        return {
            status: 500,
            message: 'Tile insert failed.'
        };
    }
}
