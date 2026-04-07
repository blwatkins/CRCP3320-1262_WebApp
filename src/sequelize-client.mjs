import { DataTypes, Sequelize, Model } from 'sequelize';

import { DatabaseClient } from './database-client.mjs';
import { StringValidator } from './string-validator.mjs';

const sequelize = new Sequelize({
    dialect: 'mysql',
    logging: false,
    host: process.env.MYSQL_HOST,
    port: Number.parseInt(process.env.MYSQL_PORT, 10),
    username: process.env.MYSQL_USERNAME,
    database: process.env.MYSQL_DATABASE,
    password: process.env.MYSQL_PASSWORD
});

class Tile extends Model {}

Tile.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        submissionTime: {
            type: DataTypes.DATE(3),
            allowNull: false
        },
        colorHex: {
            type: DataTypes.STRING(9),
            allowNull: false,
            validate: {
                is: /^(#[0-9a-f-A-F]{6}|#[0-9a-f-A-F]{8})$/
            }
        }
    },
    { sequelize, modelName: 'tile', createdAt: false, updatedAt: false }
);

export class SequelizeClient extends DatabaseClient {
    /**
     * @returns {Promise<void>}
     */
    static async init() {
        await sequelize.authenticate();
    }

    /**
     * @param limit {number}
     * @returns {Promise<string[]>}
     * @throws {Error} if the limit is not a valid number between 1 and 1000.
     */
    static async queryMostRecentTiles(limit = 100) {
        if (typeof limit !== 'number' || limit < 1 || limit > 1_000) {
            throw new Error(`Invalid limit: ${limit}. Limit must be a number between 1 and 1000.`);
        }

        const tiles = await Tile.findAll({
            order: [['submissionTime', 'DESC']],
            limit
        });

        return tiles.map(tile => tile.colorHex);
    }

    /**
     * @param colorHex {string}
     * @returns {Promise<{status: 200|400|500, message: string}>}
     */
    static async insertTile(colorHex) {
        if (!StringValidator.isHexColor(colorHex)) {
            return {
                status: 400,
                message: 'Invalid colorHex format.'
            };
        }

        const tile = await Tile.create(
            {
                colorHex,
                submissionTime: '2026-04-07 17:37:47.000'
            }
        );

        if (tile.id) {
            return {
                status: 200,
                message: `Tile ${colorHex} inserted successfully.`
            };
        }

        return {
            status: 500,
            message: 'Tile insert failed.'
        };
    }
}
