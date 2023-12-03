// // controllers/userController.js
// const User = require('../models/User');
// const bcrypt = require('bcrypt');
// require('dotenv').config();

// // Hành động để lấy danh sách tất cả người dùng
// exports.getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find();
//     res.json(users);
//   } catch (error) {
//     console.error('Lỗi lấy danh sách người dùng:', error);
//     res.status(500).json({ message: 'Lỗi lấy danh sách người dùng' });
//   }
// };

// // Hành động để thêm mới một người dùng
// exports.createUser = async (req, res) => {
//     try {
//         const { username, email, password, role } = req.body;
    
//         // Kiểm tra xem email đã tồn tại hay chưa
//         const existingEmail = await User.findOne({ email });
//         const existingUsername = await User.findOne({ username });
//         if (existingEmail && !existingUsername) {
//           return res.status(400).json({ message: 'Email đã tồn tại' ,status:false });
//         }
//         else if(!existingEmail && existingUsername){
//           return res.status(400).json({ message: 'Username đã tồn tại',status:false });
//         }
//         else if(existingUsername && existingEmail) {
//           return res.status(400).json({ message: 'Username và email đã tồn tại',status:false });
//         }
    
//         // Mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(password, salt);
    
//         // Tạo người dùng mới
//         const newUser = new User({
//           username,
//           email,
//           password: hashedPassword,
//           role, // Lưu trữ quyền của người dùng
//         });
    
//         // Lưu người dùng vào cơ sở dữ liệu
//         await newUser.save();
    
//         res.status(201).json({ message: 'Thêm mới thành công' });
//       } catch (error) {
//         console.error('Lỗi đăng ký:', error);
//         res.status(500).json({ message: 'Thêm mới thất bại' });
//       }
// };

// // Hành động để cập nhật thông tin người dùng
// exports.updateUser = async (req, res) => {
//   try {
//     const userId = req.params.id;
//     const { username, email, password, role } = req.body;

//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       {
//         username,
//         email,
//         password,
//         role,
//       },
//       { new: true }
//     );

//     res.json(updatedUser);
//   } catch (error) {
//     console.error('Lỗi cập nhật người dùng:', error);
//     res.status(500).json({ message: 'Lỗi cập nhật người dùng' });
//   }
// };

// // Hành động để xoá người dùng
// exports.deleteUser = async (req, res) => {
//   try {
//     const userId = req.params.id;

//     await User.findByIdAndRemove(userId);

//     res.json({ message: 'Người dùng đã được xoá' });
//   } catch (error) {
//     console.error('Lỗi xoá người dùng:', error);
//     res.status(500).json({ message: 'Lỗi xoá người dùng' });
//   }
// };
