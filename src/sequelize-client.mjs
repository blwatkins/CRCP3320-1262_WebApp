import { DataTypes, Sequelize, Model, Op } from 'sequelize';

import { DatabaseClient } from './database-client.mjs';
import { DateUtility } from './date-utility.mjs';
import { StringUtility } from './string-utility.mjs';

const sequelize = new Sequelize({
    dialect: 'mysql',
    logging: console.debug,
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
            defaultValue: DataTypes.NOW(),
            allowNull: false
        },
        colorHex: {
            type: DataTypes.STRING(9),
            allowNull: false,
            validate: {
                is: StringUtility.hexColorExpression
            }
        }
    },
    { sequelize, modelName: 'tile', createdAt: false, updatedAt: false }
);

export class SequelizeClient extends DatabaseClient {
    /**
     * @returns {Promise<void>}
     * @throws {Error} If sequelize authentication fails.
     */
    static async init() {
        await sequelize.authenticate();
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

        try {
            const tiles = await Tile.findAll({
                attributes: ['colorHex'],
                order: [['submissionTime', 'DESC']],
                limit
            });

            return {
                status: 200,
                data: SequelizeClient.filterTiles(tiles.map(tile => tile.colorHex))
            };
        } catch (error) {
            console.error(error);
            return {
                status: 500,
                message: 'Error querying tiles by date.'
            };
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

        try {
            const tiles = await Tile.findAll({
                attributes: ['colorHex'],
                where: sequelize.where(sequelize.fn('DATE', sequelize.col('submissionTime')), Op.eq, date),
                order: ['submissionTime']
            });

            return {
                status: 200,
                data: SequelizeClient.filterTiles(tiles.map(tile => tile.colorHex))
            };
        } catch (error) {
            console.error(error);
            return {
                status: 500,
                message: 'Error querying tiles by date.'
            };
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

        try {
            const tile = await Tile.create(
                {
                    colorHex
                }
            );

            if (tile.id) {
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

        return {
            status: 500,
            message: 'Tile insert failed.'
        };
    }
}
