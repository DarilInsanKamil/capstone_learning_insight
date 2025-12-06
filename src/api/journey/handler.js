class JourneyHandler {
    constructor(service) {
        this._service = service;
        this.getJourneyHandler = this.getJourneyHandler.bind(this);
    }

    async getJourneyHandler(request, h) {
        const result = await this._service.getJourneys()
        const response = h.response({
            status: 'success',
            message: 'Berhasil mengambil data',
            result
        })
        response.code(200);
        return response
    }
}

module.exports = JourneyHandler