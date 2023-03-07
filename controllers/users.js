const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const service = require('../service/users');
const User = require('../service/schemas/users');
const { RequestError } = require('../helpers');
const { registerValidator, loginValidator } = require('../utils/validator');

const { SECRET_KEY } = process.env;

const register = async (req, res) => {
  const { error } = registerValidator(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { name, email, password, subscription } = req.body;
  const user = await service.getUser({ email });
  if (user) {
    throw RequestError(409, 'Email in use');
  }
  const hashPassword = await bcrypt.hash(password, 10);
  const result = await User.create({ name, email, password: hashPassword, subscription });
  res.status(201).json({
    name: result.name,
    email: result.email,
  });
};

const login = async (req, res) => {
  const { error } = loginValidator(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  const { email, password } = req.body;
  const user = await service.getUser({ email });
  if (!user) {
    throw RequestError(401, 'Email or password wrong');
  }
  const passwordCompare = await bcrypt.compare(password, user.password);
  if (!passwordCompare) {
    throw RequestError(401, 'Email or password wrong');
  }
  const payload = {
    id: user._id,
  };
  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '24h' });
  console.log(token);
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
  });
};

const getCurrent = async (req, res) => {
  const { email } = req.user;

  const user = await service.getUser({ email });
  if (!user) {
    throw RequestError(401);
  }

  res.json({
    email: user.email,
    subscription: user.subscription,
  });
};

const logout = async (req, res) => {
  const { _id } = req.user;

  const user = await service.getUser(_id);
  if (!user) {
    throw RequestError(401);
  }
  await User.findByIdAndUpdate(_id, { token: '' });

  res.json({
    message: 'Logout success',
  });
};

module.exports = { register, login, logout, getCurrent };
