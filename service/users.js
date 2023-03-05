const User = require('./schemas/users');

const getUser = async body => User.findOne(body);
const getUserLogout = async body => User.findByIdAndUpdate(body);

module.exports = { getUser, getUserLogout };
