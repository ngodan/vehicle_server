const mongoose = require('mongoose');
const timestamp = require('mongoose-timestamp');
const moment = require('moment-timezone');
const collection = process.env.MONGODB_DATA_TABLE || 'data';

moment.tz.setDefault('Asia/Ho_Chi_Minh');
const dataSchema = new mongoose.Schema({
  LaneIn: Number,
  LaneOut: Number,
  LicensePlateIn: String,
  LicensePlateOut: String,
  FordCardIDIn: String,
  FordCardIDOut: String,
  MatchingCodeIn: String,
  MatchingCodeOut: String,
  DateTimeIn: {
    type: Date,
    default: null, // Giữ nguyên giá trị mặc định là null nếu không có thời gian đầu vào
  },
  DateTimeOut: {
    type: Date,
    default: null, // Giữ nguyên giá trị mặc định là null nếu không có thời gian đầu ra
  },
  Status: String,
  ImageIn: String,
  ImageOut: String,
  Check: String,
  Rootcause: String,
  Action: String,
  TypeOfError: String,
});

// Thêm plugin mongoose-timestamp vào schema
dataSchema.plugin(timestamp);

module.exports = mongoose.model('Data', dataSchema, collection);