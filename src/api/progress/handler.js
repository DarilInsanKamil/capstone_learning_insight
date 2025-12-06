class ProgressHandler {
    constructor(service) {
        this._service = service;

        this.getUserProgressHandler = this.getUserProgressHandler.bind(this);
    }

    async getUserProgressHandler(request, h) {
        try {
            const userId = request.auth.credentials.id;
            const data = await this._service.getUserProgress(userId);

            return {
                status: 'success',
                message: 'User progress data retrieved successfully',
                data: data
            };
        } catch (error) {
            console.error(error);
            const response = h.response({
                status: 'error',
                message: 'Maaf, terjadi kesalahan saat mengambil data progress.',
            });
            response.code(500);
            return response;
        }
    }
}

module.exports = ProgressHandler