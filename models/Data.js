const mongoose = require('mongoose');
const collection = process.env.MONGODB_DATA_TABLE || data
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
  ImageIn:String,
  ImageOut:String,
  Check:Number,
  Rootcause:String,
  Action:String,
  TypeOfError:String,
});

module.exports = mongoose.model('Data', dataSchema,collection );
