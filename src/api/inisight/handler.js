class InsightsHandler {
    constructor(service) {
        this._service = service;

        this.postInsightHandler = this.postInsightHandler.bind(this)
        this.getInsightHandler = this.getInsightHandler.bind(this)
    }

    async postInsightHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;
            const result = await this._service.generateInsight(credentialId)

            const response = h.response({
                status: 'success',
                message: 'insight berhasil dibuat',
                data: result
            })
            response.code(200)
            return response
        } catch (err) {
            console.error('Error generating insight:', err);
            throw err;
        }
    }

    async getInsightHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials
            const result = await this._service.getInsightByUserId(credentialId)

            const response = h.response({
                status: 'success',
                message: 'Berhasil mengambil data learning insight',
                data: result
            })
            response.code(200)
            return response
        } catch (err) {
            console.log('error cuy: ', err)
            throw err;
        }
    }
}

module.exports = InsightsHandler