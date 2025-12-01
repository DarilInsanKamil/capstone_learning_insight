class InsightsHandler {
  constructor(service) {
    this._service = service;

    this.postInsightHandler = this.postInsightHandler.bind(this);
    this.getInsightHandler = this.getInsightHandler.bind(this);
  }

  async postInsightHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const result = await this._service.generateInsight(credentialId);

      const response = h.response({
        status: "success",
        message: "insight berhasil dibuat",
        data: result,
      });
      response.code(200);
      return response;
    } catch (err) {
      if (err.message === "DAILY_LIMIT_REACHED") {
        const response = h.response({
          status: "fail",
          message:
            "Kamu sudah melakukan analisis hari ini. Silakan coba lagi besok!",
        });
        response.code(429);
        return response;
      }
      const response = h.response({
        status: "error",
        message: "Maaf, terjadi kesalahan pada server kami.",
      });
      response.code(500);
      return response;
    }
  }

  async getInsightHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;
      const result = await this._service.getInsightByUserId(credentialId);

      const response = h.response({
        status: "success",
        message: "Berhasil mengambil data learning insight",
        data: result,
      });
      response.code(200);
      return response;
    } catch (err) {
      console.log("error cuy: ", err);
      throw err;
    }
  }
}

module.exports = InsightsHandler;
