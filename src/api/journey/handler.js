class JourneyHandler {
    constructor(service) {
        this._service = service;
        this.getJourneyHandler = this.getJourneyHandler.bind(this);
    }

    async getJourneyHandler(request, h) {
        try {
            const { id: credentialId } = request.auth.credentials;

            const result = await this._service.getJourneys(credentialId)
            const response = h.response({
                status: 'success',
                message: 'Berhasil mengambil data',
                result
            })
            response.code(200);
            return response
        } catch (err) {
            console.log('err: ', err)
        }
    }
}

module.exports = JourneyHandler