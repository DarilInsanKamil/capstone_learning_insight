const Joi = require('joi');
 
const UserPayloadSchema = Joi.object({
  email: Joi.string().required(),
  username: Joi.string().required(),
  password: Joi.string().required(),
  image: Joi.string().optional(),
});


module.exports = { UserPayloadSchema };