const routes = (handler) => [
    {
        method: 'GET',
        path: '/insight/progress',
        handler: handler.getUserProgressHandler,
        options: {
            auth: 'learninginsight_jwt',
        },
    }
]

module.exports = routes;