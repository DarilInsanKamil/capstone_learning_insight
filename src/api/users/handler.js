class UsersHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator
        this.postUserHandler = this.postUserHandler.bind(this);
        this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    }
    async postUserHandler(request, h) {
        try {
            this._validator.validateUserPayload(request.payload);
            const { email, username, password, image } = request.payload;
            const userId = await this._service.addUser({ email, username, password, image });

            const response = h.response({
                status: 'success',
                message: 'User berhasil ditambahkan',
                data: {
                    userId
                }
            })
            response.code(201);
            return response;
        } catch (err) {
            console.log('error: ', err)
            throw err;
        }
    }
    async getUserByIdHandler(request, h) {
        try {
            const { id } = request.params;
            const user = await this._service.getUserById(id);
            const response = h.response({
                status: 'success',
                data: {
                    user
                }
            })

            response.code(201)
            return response
        } catch (err) {
            console.log('error: ', err)
            throw err;
        }
    }
}

module.exports = UsersHandler