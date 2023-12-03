// bcryptUtils.js
const bcrypt = require('bcrypt');

// Hàm để hash mật khẩu
const hashPassword = async (password) => {
  const saltRounds = 10;
  try {
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw error;
  }
};

// Hàm để so sánh mật khẩu
const comparePassword = async (password, hashedPassword) => {
  try {
    const isPasswordValid = await bcrypt.compare(password, hashedPassword);
    return isPasswordValid;
  } catch (error) {
    throw error;
  }
};

module.exports = { hashPassword, comparePassword };
