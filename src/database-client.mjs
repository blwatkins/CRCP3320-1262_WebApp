export class DatabaseClient {
    static init() {
        throw new Error('Operation not supported: init() must be implemented by subclass');
    }

    static queryMostRecentTiles(limit = 100) {
        throw new Error('Operation not supported: queryMostRecentTiles() must be implemented by subclass');
    }

    static insertTile(colorHex) {
        throw new Error('Operation not supported: insertTile() must be implemented by subclass');
    }
}
