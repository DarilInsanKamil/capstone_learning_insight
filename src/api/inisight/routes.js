const routes = (handler) => [
    {
        method: 'POST',
        path: '/insight/generate',
        handler: handler.postInsightHandler,
        options: {
            auth: 'learninginsight_jwt'
        }
    },
    {
        method: 'GET',
        path: '/insight/generate',
        handler: handler.getInsightHandler,
        options: {
            auth: 'learninginsight_jwt'
        }
    },
]

module.exports = routes