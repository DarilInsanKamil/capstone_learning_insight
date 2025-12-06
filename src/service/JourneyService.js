const { Pool } = require("pg");
const InvariantError = require("../exception/InvariantError");

class JourneyService {
    constructor() {
        this._pool = new Pool();
    }

    async getJourneys() {
        const query = {
            text: 'SELECT * FROM developer_journeys',
        }

        const result = await this._pool.query(query);
        if (!result.length < 0) {
            throw new InvariantError('data tidak ada');
        }

        return result.rows;
    }

}


module.exports = JourneyService;