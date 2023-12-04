const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  LaneIn : Number,
  LaneOut : Number,
  LicensePlateIn: String,
  LicensePlateOut: String,
  FordCardIDIn: String,
  FordCardIDOut: String,
  MatchingCodeIn: String,
  MatchingCodeOut: String,
  DateTimeIn: {
    type: Date,
  },
  DateTimeOut: {
    type: Date,
  },
  Status: String,
  ImageUrlIn:String,
  ImageUrlOut:String,
  IsEdit:Number,
  RootCause:String,
  ActionNote:String,
});

module.exports = mongoose.model('Data', dataSchema, 'data');
