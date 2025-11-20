const { Pool } = require("pg")

class UsersService {
    constructor() {
        this._pool = new Pool();
    }

    async getUserById(id) {
        const query = {
            text: 'SELECT * from users WHERE id = $1',
            values: [id]
        }

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFounderror('User tidak ditemukan');
        }

        return result.rows[0];
    }
}

module.exports = UsersService