require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const users = require('./api/users');
const UsersService = require('./service/UsersService');
const UserValidator = require('./validator/users');

const authentications = require('./api/authentications')
const AuthenticationsService = require('./service/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications')

const init = async () => {
    const usersService = new UsersService();
    const authenticationsService = new AuthenticationsService();
    const server = Hapi.server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            cors: {
                origin: ['*']
            }
        }
    })

    await server.register([
        {
            plugin: Jwt
        }
    ])

    server.auth.strategy('learninginsight_jwt', 'jwt', {
        keys: process.env.ACCESS_TOKEN_KEY,
        verify: {
            aud: false,
            iss: false,
            sub: false,
            maxAgeSec: process.env.ACCESS_TOKEN_AGE
        },
        validate: (artifacts) => ({
            isValid: true,
            credentials: {
                id: artifacts.decoded.payload.id
            }
        })
    })

    await server.register([
        {
            plugin: users,
            options: {
                service: usersService,
                validator: UserValidator
            }
        },
        {
            plugin: authentications,
            options: {
                authenticationsService,
                usersService,
                tokenManager: TokenManager,
                validator: AuthenticationsValidator,
            },
        },
    ])

    await server.start();
    console.log(`Server berjalan pada ${server.info.uri}`)
}

init();