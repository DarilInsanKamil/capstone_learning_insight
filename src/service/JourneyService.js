const { Pool } = require("pg");
const InvariantError = require("../exception/InvariantError");

class JourneyService {
    constructor() {
        this._pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            family: 4,
        });
    }

    async getJourneys(userId) {
        const query = {
            text: `
        SELECT 
            dj.id, 
            dj.name,
            dj.summary,
            dj.status,
            dj.difficulty,
            dj.hours_to_study,
            c.study_duration,
            c.created_at as completed_at
        FROM developer_journeys dj
        JOIN developer_journey_completions c ON dj.id = c.journey_id 
        WHERE c.user_id = $1
      `,
            values: [userId],
        };

        const result = await this._pool.query(query);

        return result.rows;
    }

}


module.exports = JourneyService;
