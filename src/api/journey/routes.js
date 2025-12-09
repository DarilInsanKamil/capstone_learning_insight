const routes = (handler) => [
    {
        method: 'GET',
        path: '/journey',
        handler: handler.getJourneyHandler,
        options: {
            auth: 'learninginsight_jwt'
        }
    }
]

module.exports = routes;