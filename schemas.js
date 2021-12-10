const Joi = require("joi");

module.exports.picnicSchema = Joi.object({
    picnic: Joi.object({
        title: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
        image: Joi.string().required(),
    }).required()
});