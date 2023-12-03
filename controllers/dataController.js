
const bcrypt = require('bcrypt');
const { getRndInteger, formatDateTime } = require('../utils/caculator');
require('dotenv').config();
const Data = require('../models/Data');
const port = process.env.PORT || 5000;
const ip_server = process.env.IPSERVER || 'http://localhost';
const idPath = process.env.PATH_ID.replace(/\\\\/g, '/');
const fs = require('fs');
const csv = require('fast-csv');
exports.getDataStream = async (req, res) => {
  try {
    let dataLane = [];
    const ipResult = 'http://' + ip_server + ':' + port
    if (req.operationType == 'insert' && (req.document.LaneOut == null || req.document.LaneOut == '')) {
      let csidIn = ''
      let fullNameIn = ''
      let departmentIn = ''

      const infoIn = await searchCSVByColumnIndex(req.document.FordCardIDIn, 0);
      if (infoIn.length > 0) {
        const data = Object.values(infoIn[0]);
        csidIn = data[1]
        fullNameIn = data[2]
        departmentIn = data[3]
      }
      dataLane = {
        laneID: req.document.LaneIn,
        laneIn: {
          imageUrl: ipResult + '/images/' + req.document.ImageUrlIn,
          dateTime: formatDateTime(req.document.DateTimeIn),
          licensePlate: req.document.LicensePlateIn,
          csid: csidIn,
          fullName: fullNameIn,
          department: departmentIn,
        }
      }
    }
    else {
      let csidIn = ''
      let fullNameIn = ''
      let departmentIn = ''
      let csidOut = ''
      let fullNameOut = ''
      let departmentOut = ''
      const infoIn = await searchCSVByColumnIndex(req.document.FordCardIDIn, 0);
      const infoOut = await searchCSVByColumnIndex(req.document.FordCardIDOut, 0);
      if (infoIn.length > 0) {
        const data = Object.values(infoIn[0]);
        csidIn = data[1]
        fullNameIn = data[2]
        departmentIn = data[3]
      }
      if (infoOut.length > 0) {
        const data = Object.values(infoOut[0]);
        csidOut = data[1]
        fullNameOut = data[2]
        departmentOut = data[3]
      }
      if (infoOut.length > 0) {
        const data = Object.values(infoOut[0]);
        csidOut = data[1]
        fullNameOut = data[2]
        departmentOut = data[3]
      }
      dataLane = {
        laneID: req.document.LaneOut,
        laneOut: {
          pkid: req.document._id,
          imageUrlIn: ipResult + '/images/' + req.document.ImageUrlIn,
          imageUrlOut: ipResult + '/images/' + req.document.ImageUrlOut,
          licensePlateIn: req.document.LicensePlateIn,
          licensePlateOut: req.document.LicensePlateOut,
          dateTimeIn: formatDateTime(req.document.DateTimeIn),
          dateTimeOut: formatDateTime(req.document.DateTimeOut),
          csidIn: csidIn,
          fullNameIn: fullNameIn,
          departmentIn: departmentIn,
          csidOut: csidOut,
          fullNameOut: fullNameOut,
          departmentOut: departmentOut,
          status: req.document.Status,
          isEdit: req.document.IsEdit,
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
    const ipResult = 'http://' + ip_server + ':' + port;
    const resultIn = await Data.aggregate([
      {
        $match: {
          LaneIn: { $ne: null }, // LaneIn có dữ liệu
          LaneOut: null, // LaneOut bằng null
        },
      },
      {
        $sort: { DateTimeIn: -1 }, // Sắp xếp theo dateTimeIn giảm dần
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
        $sort: { dateTimeIn: -1 }, // Sắp xếp theo dateTimeIn giảm dần
      },
      {
        $group: {
          _id: '$LaneOut',
          data: { $first: '$$ROOT' }, // Lấy dòng đầu tiên cho mỗi LaneIn
        },
      },
    ]);
    for (const dataIn of resultIn) {
      let cdsidIn = ''
      let fullNameIn = ''
      let departmentIn = ''
      const infoIn = await searchCSVByColumnIndex(dataIn.data.FordCardIDIn, 0);
      if (infoIn.length > 0) {
        const data = Object.values(infoIn[0]);
        cdsidIn = data[1]
        fullNameIn = data[2]
        departmentIn = data[3]
      }

      dataResult.push({
        laneID: dataIn.data.LaneIn,
        laneIn: {
          imageUrl: ipResult + '/images/' + dataIn.data.ImageUrlIn,
          dateTime: formatDateTime(dataIn.data.DateTimeIn),
          licensePlate: dataIn.data.LicensePlateIn,
          csid: cdsidIn,
          fullName: fullNameIn,
          department: departmentIn
        },
      })

    }
    for (const dataOut of resultOut) {
      let cdsidIn = ''
      let fullNameIn = ''
      let departmentIn = ''
      let cdsidOut = ''
      let fullNameOut = ''
      let departmentOut = ''
      const infoIn = await searchCSVByColumnIndex(dataOut.data.FordCardIDIn, 0);
      const infoOut = await searchCSVByColumnIndex(dataOut.data.FordCardIDOut, 0);

      if (infoOut.length > 0) {
        const data = Object.values(infoOut[0]);
        cdsidOut = data[1]
        fullNameOut = data[2]
        departmentOut = data[3]
      }
      if (infoIn.length > 0) {
        const data = Object.values(infoIn[0]);
        cdsidIn = data[1]
        fullNameIn = data[2]
        departmentIn = data[3]
      }
      dataResult.push({
        laneID: dataOut.data.LaneIn,
        laneOut: {
          pkid: dataOut.data._id,
          imageUrlIn: ipResult + '/images/' + dataOut.data.ImageUrlIn,
          imageUrlOut: ipResult + '/images/' + dataOut.data.ImageUrlOut,
          licensePlateIn: dataOut.data.LicensePlateIn,
          licensePlateOut: dataOut.data.LicensePlateOut,
          dateTimeIn: formatDateTime(dataOut.data.DateTimeIn),
          dateTimeOut: formatDateTime(dataOut.data.DateTimeOut),
          cdsidIn: cdsidIn,
          fullNameIn: fullNameIn,
          departmentIn: departmentIn,
          cdsidOut: cdsidOut,
          fullNameOut: fullNameOut,
          departmentOut: departmentOut,
          status: dataOut.data.Status,
          isEdit: dataOut.data.isEdit,
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
    const ipResult = 'http://' + ip_server + ':' + port + '/images/'

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
    result.forEach((item, index) => {
      if (item.ImageUrlIn != null) {
        item.ImageUrlIn = ipResult + item.ImageUrlIn
      }
      if (item.ImageUrlOut != null) {
        item.ImageUrlOut = ipResult + item.ImageUrlOut
      }
    })

    res.status(200).json({ message: 'Dữ liệu lấy thành công', data: result });
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
      IsEdit: 0
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
exports.setEditData = async (req, res) => {
  try {
    console.log('set')
    const pkid = req.body.pkid
    if (pkid != null && pkid != '') {
      const setStatusData = await Data.findByIdAndUpdate(
        { _id: pkid },
        { isEdit: 2 },
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