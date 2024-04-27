const Joi = require('joi');

const bookSchema = Joi.object({
  ISBN: Joi.string().required(),
  title: Joi.string().required(),
  Author: Joi.string().required(),
  description: Joi.string().required(),
  genre: Joi.string().required(),
  price: Joi.number().greater(0).required(), 
  quantity: Joi.number().integer().required(),
});

module.exports = { bookSchema};