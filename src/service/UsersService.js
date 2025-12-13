const { nanoid } = require("nanoid");
const { Pool } = require("pg");
const NotFounderror = require('../exception/NotFoundError')
const AuthenticationError = require('../exception/AuthenticationError')
const InvariantError = require('../exception/InvariantError')
const bcrypt = require('bcrypt');

class UsersService {
    constructor() {
        this._pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            family: 4,
        });
    }

    async getUserById(id) {
        const query = {
            text: 'SELECT id, display_name, email, image_path FROM users WHERE id = $1',
            values: [id]
        }

        const result = await this._pool.query(query);
        if (!result.rows.length) {
            throw new NotFounderror('User tidak ditemukan');
        }

        return result.rows[0];
    }
    async addUser({ email, username, password, image }) {
        await this.verifyUsername(username);
        await this.verifyEmail(email);

        const id = nanoid(16);
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = {
            text: 'INSERT INTO users (id, email, display_name, password, image_path) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            values: [id, email, username, hashedPassword, image]
        }

        const result = await this._pool.query(query)

        if (!result.rows.length) {
            throw new InvariantError('User gagal ditambahkan')
        }

        return result.rows[0].id;
    }
    async verifyUsername(username) {
        const query = {
            text: 'SELECT display_name FROM users WHERE display_name = $1',
            values: [username]
        }
        const result = await this._pool.query(query);
        if (result.rows.length > 0) {
            throw new InvariantError('Gagal menambahkan user, Username sudah digunakan')
        }
    }
    async verifyEmail(email) {
        const query = {
            text: 'SELECT email FROM users WHERE email = $1',
            values: [email]
        }
        const result = await this._pool.query(query);
        if (result.rows.length > 0) {
            throw new InvariantError('Gagal menambahkan user, Email sudah digunakan')
        }
    }

    async verifyUserCredential(email, password) {
        const query = {
            text: 'SELECT id, password FROM users WHERE email = $1',
            values: [email],
        };

        const result = await this._pool.query(query);

        if (!result.rows.length) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }

        const { id, password: hashedPassword } = result.rows[0];

        const match = await bcrypt.compare(password, hashedPassword);

        if (!match) {
            throw new AuthenticationError('Kredensial yang Anda berikan salah');
        }

        return id;
    }
}

module.exports = UsersService;
