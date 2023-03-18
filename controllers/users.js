const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs/promises');
const path = require('path');
const Jimp = require('jimp');
const gravatar = require('gravatar');
const { nanoid } = require('nanoid');

const service = require('../service/users');
const User = require('../service/schemas/users');
const { RequestError, sendEmailUser } = require('../helpers');
const { registerValidator, loginValidator, verifyEmailValidator } = require('../utils/validator');

const { SECRET_KEY, BASE_URL } = process.env;

const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');

const register = async (req, res) => {
  const { error } = registerValidator(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, email, password, subscription } = req.body;

  const user = await service.getUser({ email });

  if (user) {
    throw RequestError(409, 'Email in use');
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarURL = gravatar.url(email);
  const verificationToken = nanoid();
  const result = await User.create({
    name,
    email,
    password: hashPassword,
    subscription,
    avatarURL,
    verificationToken,
  });

  const mail = {
    to: email,
    subject: 'Verify email',
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verificationToken}">Click to verify you email</a>`,
  };

  await sendEmailUser(mail);

  res.status(201).json({
    name: result.name,
    email: result.email,
  });
};

const verify = async (req, res) => {
  const { verificationToken } = req.params;
  const user = await User.findOne({ verificationToken });
  if (!user) {
    throw RequestError(404);
  }
  await User.findByIdAndUpdate(user._id, { verify: true, verificationToken: null });

  res.json({
    message: 'Email verify success',
  });
};

const resendEmail = async (req, res) => {
  const { error } = verifyEmailValidator(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user || user.verify) {
    throw RequestError(404);
  }

  const mail = {
    to: email,
    subject: 'Verify email',
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}">Click to verify you email</a>`,
  };
  await sendEmailUser(mail);

  res.json({
    message: 'Email send success',
  });
};

const login = async (req, res) => {
  const { error } = loginValidator(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { email, password } = req.body;

  const user = await service.getUser({ email });
  if (!user || !user.verify) {
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

const updateAvatar = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  const extention = originalname.split('.').pop();
  const filename = `${_id}.${extention}`;
  const resultUpload = path.join(avatarsDir, filename);
  const image = await Jimp.read(tempUpload);

  await image.resize(250, 250).write(tempUpload);
  await fs.rename(tempUpload, resultUpload);

  const avatarURL = path.join('avatars', filename);

  await User.findByIdAndUpdate(_id, { avatarURL });

  res.json({
    avatarURL,
  });
};

module.exports = { register, login, logout, getCurrent, updateAvatar, resendEmail, verify };
