import { DataTypes, Sequelize, Model } from 'sequelize';
import { DatabaseClient } from './database-client.mjs';

const sequelize = new Sequelize({
    dialect: 'mysql',
    logging: false,
    host: process.env.MYSQL_HOST,
    port: Number.parseInt(process.env.MYSQL_PORT),
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
            allowNull: false
        }
    },
    { sequelize, modelName: 'tile', createdAt: false, updatedAt: false }
);

export class SequelizeClient extends DatabaseClient {
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
}
