import mysql from 'mysql2/promise';

export class DatabaseClient {
    static #CONNECTION_POOL = undefined;

    static async init() {
        if (!DatabaseClient.#CONNECTION_POOL) {
            DatabaseClient.#CONNECTION_POOL = await mysql.createPool({
                host: process.env.MYSQL_HOST,
                port: Number.parseInt(process.env.MYSQL_PORT),
                user: process.env.MYSQL_USERNAME,
                database: process.env.MYSQL_DATABASE,
                // password: process.env.MYSQL_PASSWORD
            });
        }
    }

    static async queryAllTiles() {
        if (DatabaseClient.#CONNECTION_POOL) {
            const [rows] = await DatabaseClient.#CONNECTION_POOL.execute('SELECT * FROM tiles ORDER BY submissionTime');
            return rows.map(row => row.colorHex);
        }

        return [];
    }
}
