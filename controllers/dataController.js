
const bcrypt = require('bcrypt');
const { getRndInteger, formatDateTime } = require('../utils/caculator');
require('dotenv').config();
const Data = require('../models/Data');
const ip_server = 'http://' + process.env.IPSERVER + ":" +  process.env.PORT_SERVER +  '/images/'; 
const idPath = process.env.PATH_ID.replace(/\\\\/g, '/');
const fs = require('fs');
const csv = require('fast-csv');
exports.getDataStream = async (req, res) => {
  try {
    let dataLane = [];
    
    if (req.operationType == 'insert' && (req.document.LaneOut == null || req.document.LaneOut == '')) {
      let CdsidIn = ''
      let FullNameIn = ''
      let DepartmentIn = ''

      const infoIn = await searchCSVByColumnIndex(req.document.FordCardIDIn, 0);
      if (infoIn.length > 0) {
        const data = Object.values(infoIn[0]);
        CdsidIn = data[1]
        FullNameIn = data[2]
        DepartmentIn = data[3]
      }
      dataLane = {
        LaneID: req.document.LaneIn,
        LaneIn: {
          ImageUrlIn: ip_server + req.document.ImageUrlIn,
          DateTimeIn: formatDateTime(req.document.DateTimeIn),
          LicensePlateIn: req.document.LicensePlateIn,
          CdsidIn: CdsidIn,
          FullNameIn: FullNameIn,
          DepartmentIn: DepartmentIn,
        }
      }
    }
    else {
      let CdsidIn = ''
      let FullNameIn = ''
      let DepartmentIn = ''
      let CdsidOut = ''
      let FullNameOut = ''
      let DepartmentOut = ''
      const infoIn = await searchCSVByColumnIndex(req.document.FordCardIDIn, 0);
      const infoOut = await searchCSVByColumnIndex(req.document.FordCardIDOut, 0);
      if (infoIn.length > 0) {
        const data = Object.values(infoIn[0]);
        CdsidIn = data[1]
        FullNameIn = data[2]
        DepartmentIn = data[3]
      }
      if (infoOut.length > 0) {
        const data = Object.values(infoOut[0]);
        CdsidOut = data[1]
        FullNameOut = data[2]
        DepartmentOut = data[3]
      }
      if (infoOut.length > 0) {
        const data = Object.values(infoOut[0]);
        CdsidOut = data[1]
        FullNameOut = data[2]
        DepartmentOut = data[3]
      }
      dataLane = {
        LaneID: req.document.LaneOut,
        LaneOut: {
          pkid: req.document._id,
          ImageUrlIn: ip_server + req.document.ImageUrlIn,
          ImageUrlOut: ip_server + req.document.ImageUrlOut,
          LicensePlateIn: req.document.LicensePlateIn,
          LicensePlateOut: req.document.LicensePlateOut,
          DateTimeIn: formatDateTime(req.document.DateTimeIn),
          DateTimeOut: formatDateTime(req.document.DateTimeOut),
          CdsidIn: CdsidIn,
          FullNameIn: FullNameIn,
          DepartmentIn: DepartmentIn,
          CdsidOut: CdsidOut,
          FullNameOut: FullNameOut,
          DepartmentOut: DepartmentOut,
          Status: req.document.Status,
          IsEdit: req.document.IsEdit,
        }
      }
    }
    return dataLane

  } catch (error) {
    console.error('Lỗi gửi dữ liệu:', error);
    res.status(500).json({ message: 'Lỗi gửi dữ liệu' });
  }
};
exports.getDataDefault = async (req, res) => {
  try {
    let dataResult = [];
    const resultIn = await Data.aggregate([
      {
        $match: {
          LaneIn: { $ne: null }, // LaneIn có dữ liệu
          LaneOut: null, // LaneOut bằng null
        },
      },
      {
        $sort: { DateTimeIn: -1 }, // Sắp xếp theo DateTimeIn giảm dần
      },
      {
        $group: {
          _id: '$LaneIn',
          data: { $first: '$$ROOT' }, // Lấy dòng đầu tiên cho mỗi LaneIn
        },
      },
    ]);
    const resultOut = await Data.aggregate([
      {
        $match: {
          LaneIn: { $ne: null }, // LaneIn có dữ liệu
          LaneOut: { $ne: null }, // LaneOut có dữ liệu
        },
      },
      {
        $sort: { DateTimeIn: -1 }, // Sắp xếp theo DateTimeIn giảm dần
      },
      {
        $group: {
          _id: '$LaneOut',
          data: { $first: '$$ROOT' }, // Lấy dòng đầu tiên cho mỗi LaneIn
        },
      },
    ]);
    for (const dataIn of resultIn) {
      let CdsidIn = ''
      let FullNameIn = ''
      let DepartmentIn = ''
      const infoIn = await searchCSVByColumnIndex(dataIn.data.FordCardIDIn, 0);
      if (infoIn.length > 0) {
        const data = Object.values(infoIn[0]);
        CdsidIn = data[1]
        FullNameIn = data[2]
        DepartmentIn = data[3]
      }

      dataResult.push({
        LaneID: dataIn.data.LaneIn,
        LaneIn: {
          ImageUrlIn: ip_server + dataIn.data.ImageUrlIn,
          DateTimeIn: formatDateTime(dataIn.data.DateTimeIn),
          LicensePlateIn: dataIn.data.LicensePlateIn,
          CdsidIn: CdsidIn,
          FullNameIn: FullNameIn,
          DepartmentIn: DepartmentIn
        },
      })

    }
    for (const dataOut of resultOut) {
      let CdsidIn = ''
      let FullNameIn = ''
      let DepartmentIn = ''
      let CdsidOut = ''
      let FullNameOut = ''
      let DepartmentOut = ''
      const infoIn = await searchCSVByColumnIndex(dataOut.data.FordCardIDIn, 0);
      const infoOut = await searchCSVByColumnIndex(dataOut.data.FordCardIDOut, 0);

      if (infoOut.length > 0) {
        const data = Object.values(infoOut[0]);
        CdsidOut = data[1]
        FullNameOut = data[2]
        DepartmentOut = data[3]
      }
      if (infoIn.length > 0) {
        const data = Object.values(infoIn[0]);
        CdsidIn = data[1]
        FullNameIn = data[2]
        DepartmentIn = data[3]
      }
      dataResult.push({
        LaneID: dataOut.data.LaneOut,
        LaneOut: {
          pkid: dataOut.data._id,
          ImageUrlIn: ip_server + dataOut.data.ImageUrlIn,
          ImageUrlOut: ip_server + dataOut.data.ImageUrlOut,
          LicensePlateIn: dataOut.data.LicensePlateIn,
          LicensePlateOut: dataOut.data.LicensePlateOut,
          DateTimeIn: formatDateTime(dataOut.data.DateTimeIn),
          DateTimeOut: formatDateTime(dataOut.data.DateTimeOut),
          CdsidIn: CdsidIn,
          FullNameIn: FullNameIn,
          DepartmentIn: DepartmentIn,
          CdsidOut: CdsidOut,
          FullNameOut: FullNameOut,
          DepartmentOut: DepartmentOut,
          Status: dataOut.data.Status,
          IsEdit: dataOut.data.IsEdit,
        }
      })
    }
    res.status(200).json({ message: 'Lấy thành công', data: dataResult });
  }
  catch (error) {

    res.status(500).json({ message: 'Lấy thất bại', error: error.message });
  }
}
exports.getAllDataReport = async (req, res) => {
  try {

    const { fordCardID } = req.body;
    let query = {}
    query.$or = [
      {
        Status: 'NOK',
      },
      {
        Status: null,
      },
    ];
    if (fordCardID) {
      query.FordCardIDIn = fordCardID;
    }
    const result = await Data.find(query);

    // Tạo một mảng mới chứa các bản sao với trường FullNameIn được thêm vào
    const updatedResult = result.map(async (item) => {
      if (item.ImageUrlIn != null) {
        item.ImageUrlIn = ip_server + item.ImageUrlIn;
      }
  
      if (item.ImageUrlOut != null) {
        item.ImageUrlOut = ip_server + item.ImageUrlOut;
      }
      const info = await searchCSVByColumnIndex(item.FordCardIDIn, 0);
    
      if (info.length > 0) {
        const data = Object.values(info[0]);
        const updatedItem = { ...item,
          _doc: {
          ...item._doc,
          CdsidIn: data[1],
          FullNameIn: data[2],
          DepartmentIn: data[3],
        }, };
        return updatedItem;
      }
      
      return { ...item };
    });
    const resolvedUpdatedResult = await Promise.all(updatedResult);
    console.log(resolvedUpdatedResult)
    res.status(200).json({ message: 'Dữ liệu lấy thành công', data: resolvedUpdatedResult });
  } catch (error) {
    console.error('Lỗi khi tìm kiếm hoặc xử lý dữ liệu:', error.message);
    res.status(500).json({ message: 'Đã xảy ra lỗi' });
  }
}
exports.createData = async (req, res) => { // TEST
  try {
    const newData = new Data({
      LaneIn: getRndInteger(1, 7),
      LaneOut: null,
      LicensePlateIn: `ABC-${getRndInteger(111, 999)}`,
      LicensePlateOut: null,
      FordCardIDIn: `81429086144`,
      FordCardIDOut: '',
      MatchingCodeIn: `${getRndInteger(11111, 99999)}`,
      MatchingCodeOut: '',
      DateTimeIn: new Date(),
      DateTimeOut: null,
      Status: null,
      ImageUrlIn: `${getRndInteger(1, 21)}.jpg`,
      ImageUrlOut: null,
      IsEdit: 0,
      RootCause: '',
      ActionNote: '',
    });

    await newData.save();

    res.status(201).json({ message: 'Thêm mới thành công' });
  } catch (error) {
    console.error('Lỗi thêm dữ liệu:', error);
    res.status(500).json({ message: 'Thêm mới thất bại' });
  }
};

// Hành động để cập nhật thông tin người dùng
exports.setStatusData = async (req, res) => {
  try {
    console.log('set')
    const pkid = req.body.pkid
    if (pkid != null && pkid != '') {
      const setStatusData = await Data.findByIdAndUpdate(
        { _id: pkid },
        { Status: 'OK' },
        { new: true }
      );
    }
    res.status(200).json({ message: 'Thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật dữ liệu:', error);
    res.status(500).json({ message: 'Lỗi cập nhật người dùng' });
  }
};
exports.setNote = async (req, res) => {
  try {
    const { pkid, note, confirm } = req.body;
    console.log(req.body)
    if (pkid != null && pkid != '') {
      const setStatusData = await Data.findByIdAndUpdate(
        { _id: pkid },
        { 
          RootCause: confirm,
          ActionNote:note,
        },
        { new: true }
      );
    }
    res.status(200).json({ message: 'Thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật dữ liệu:', error);
    res.status(500).json({ message: 'Lỗi cập nhật',Error:error });
  }
};
exports.setEditData = async (req, res) => {
  try {
    const pkid = req.body.pkid
    if (pkid != null && pkid != '') {
      const setStatusData = await Data.findByIdAndUpdate(
        { _id: pkid },
        { IsEdit: 2 },
        { new: true }
      );
    }
    res.status(200).json({ message: 'Thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật dữ liệu:', error);
    res.status(500).json({ message: 'Lỗi cập nhật người dùng' });
  }
};
function searchCSVByColumnIndex(searchTerm, columnIndex) {
  return new Promise((resolve, reject) => {
    const data = [];
    const stream = fs.createReadStream(idPath);

    stream
      .pipe(csv.parse({ headers: true }))
      .on('data', (row) => {
        // Kiểm tra giá trị của cột với chỉ số columnIndex trong dòng
        for (const key in row) {
          if (row[key].includes(searchTerm)) {
            data.push(row);
            break; // Nếu tìm thấy giá trị, thoát vòng lặp
          }
        }
      })
      .on('end', () => {
        resolve(data);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}