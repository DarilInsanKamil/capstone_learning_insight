class UsersHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator
        this.postUserHandler = this.postUserHandler.bind(this);
        this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    }
    async postUserHandler(request, h) {

    }
    async getUserByIdHandler(request, h) {
        const response = h.response({
            status: 'success',
            message: 'User berhasil ditambahkan',
            data: {
                'data': 'hello world'
            }
        })

        response.code(201)
        return response
    }
}

module.exports = UsersHandler