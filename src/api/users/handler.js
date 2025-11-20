class UsersHandler {
    constructor(service, validator) {
        this._service = service
        this._validator = validator
        // this.postUserHandler = this.postUserHandler.bind(this);
        this.getUserByIdHandler = this.getUserByIdHandler.bind(this);
    }
    // async postUserHandler(request, h) {
    //     con

    // }
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