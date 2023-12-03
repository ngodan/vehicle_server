const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Tuỳ chỉnh để phù hợp với cơ sở dữ liệu của bạn
const bcrypt = require('bcrypt');
require('dotenv').config();
// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let role = null
    // Tạo đối tượng người dùng mặc định (user và admin)
    const defaultUsers = {
      user: { email: 'user', password: '$2b$10$pJ.JO7oKdX1x.bnL62pyIuS1.ca79kOCyYkFffSubVbc6m94Zv1GK',role:"user" },
      admin: { email: 'admin', password: '$2b$10$ucyuVqkTybEX8xt5mkGMY.95QVOSpxD6riOg6HoNSvDja8t8u1rBC',role:"admin" },
    };
    // Kiểm tra xem có người dùng với email được cung cấp không
    const selectedUser = defaultUsers[email];
    if (!selectedUser) {
      return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, selectedUser.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Mật khẩu không đúng' });
    }
    role = selectedUser.role
    // Tạo và gửi token
    const token = jwt.sign({ userId: email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { email,role } });
  } catch (error) {
    console.error('Lỗi đăng nhập:', error);
    res.status(500).json({ message: 'Đăng nhập thất bại' });
  }
};
exports.servertest = async (req, res) => {
  return"hello"
}

// Đăng ký
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Kiểm tra xem email đã tồn tại hay chưa
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });
    if (existingEmail && !existingUsername) {
      return res.status(400).json({ message: 'Email đã tồn tại' ,status:false });
    }
    else if(!existingEmail && existingUsername){
      return res.status(400).json({ message: 'Username đã tồn tại',status:false });
    }
    else if(existingUsername && existingEmail) {
      return res.status(400).json({ message: 'Username và email đã tồn tại',status:false });
    }

    // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo người dùng mới
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role, // Lưu trữ quyền của người dùng
    });

    // Lưu người dùng vào cơ sở dữ liệu
    await newUser.save();

    res.status(201).json({ message: 'Đăng ký thành công' });
  } catch (error) {
    console.error('Lỗi đăng ký:', error);
    res.status(500).json({ message: 'Đăng ký thất bại' });
  }
};
// Đăng xuất
exports.logout = async (req, res) => {
  try {
    // Thu hồi phiên làm việc (nếu bạn sử dụng phiên làm việc)

    // Xóa token khỏi máy khách (nếu bạn sử dụng JWT)
    // Ví dụ sử dụng cookies:
    res.clearCookie('token'); // Xóa cookie chứa token

    // Cài đặt lại trạng thái người dùng (tuỳ chọn)

    res.json({ message: 'Đăng xuất thành công' , status : true });
  } catch (error) {
    console.error('Lỗi đăng xuất:', error);
    res.status(500).json({ message: 'Đăng xuất thất bại' , status : false });
  }
};
