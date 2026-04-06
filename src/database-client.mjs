export class DatabaseClient {
    static init() {
        throw new Error('Operation not supported: init() must be implemented by subclass');
    }

    static queryMostRecentTiles(limit = 100) {
        throw new Error('Operation not supported: init() must be implemented by subclass');
    }
}
