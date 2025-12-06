const JourneyHandler = require('./handler');
const routes = require('./routes');
 
module.exports = {
  name: 'journey',
  version: '1.0.0',
  register: async (server, { service }) => {
    const journeyHandler = new JourneyHandler(service);
    server.route(routes(journeyHandler));
  },
};