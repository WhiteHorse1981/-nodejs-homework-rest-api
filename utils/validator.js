const joi = require('joi');

const emailRegexp = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/;

const contactSchema = joi.object({
  name: joi.string().min(3),
  email: joi.string().email(),
  phone: joi.string().min(5),
  favorite: joi.boolean(),
});

const validator = schema => body => {
  return schema.validate(body);
};

const contactValidator = validator(contactSchema);

const contactUpdateSchema = joi
  .object({
    name: joi.string().min(3),
    email: joi.string().email(),
    phone: joi.string().min(5),
  })
  .min(1);

const contactUpdateValidatar = validator(contactUpdateSchema);

const updateFavoriteSchema = joi.object({
  favorite: joi.boolean().required(),
});

const updateFavoriteValidator = validator(updateFavoriteSchema);

const registerSchema = joi.object({
  name: joi.string().required(),
  email: joi.string().pattern(emailRegexp).required(),
  password: joi.string().required(),
});

const registerValidator = validator(registerSchema);

const loginSchema = joi.object({
  email: joi.string().pattern(emailRegexp).required(),
  password: joi.string().required(),
});

const loginValidator = validator(loginSchema);

const verifyEmailSchema = joi.object({
  email: joi.string().pattern(emailRegexp).required(),
});

const verifyEmailValidator = validator(verifyEmailSchema);

module.exports = {
  contactValidator,
  registerValidator,
  loginValidator,
  contactUpdateValidatar,
  updateFavoriteValidator,
  verifyEmailValidator,
};
