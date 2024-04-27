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

const customerSchema = Joi.object({
  userId: Joi.string().email().required(),
  name: Joi.string().required(),
  phone: Joi.string().required(), // You might want to add regex for phone validation
  address: Joi.string().required(),
  address2: Joi.string().allow('', null), // Optional field
  city: Joi.string().required(),
  state: Joi.string().length(2).required(), // Assuming 2-letter abbreviation
  zipcode: Joi.string().required(), // You might want to add regex for specific zipcode formats
});

module.exports = { customerSchema, bookSchema};