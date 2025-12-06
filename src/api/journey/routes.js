const routes = (handler) => [
    {
        method: 'GET',
        path: '/journey',
        handler: handler.getJourneyHandler
    }
]

module.exports = routes;