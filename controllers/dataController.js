
const bcrypt = require('bcrypt');
const { getRndInteger, formatDateTime } = require('../utils/caculator');
require('dotenv').config();
const Data = require('../models/Data');
const ip_server = 'http://' + process.env.IPSERVER + ":" + process.env.PORT_SERVER + '/images/';
const idPath = process.env.PATH_ID.replace(/\\\\/g, '/');
const fs = require('fs');
const csv = require('fast-csv');
const moment = require('moment-timezone');
const { generatePDF } = require('../utils/triggerPDFCreater');
let globalDataReport = [];
exports.getDataStream = async (req, res) => {
  try {
    let dataLane = [];

    if (req.operationType == 'insert' && (Number(req.document.LaneOut) == null || Number(req.document.LaneOut) == '')) {
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
        LaneID: (req.document.LaneIn == null || req.document.LaneIn == '') ? 0 : Number(req.document.LaneIn),
        LaneIn: {
          ImageIn: ip_server + req.document.ImageIn + '.jpg',
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
        LaneID: (req.document.LaneOut == null || req.document.LaneOut == '') ? 0 : Number(req.document.LaneOut),
        LaneOut: {
          pkid: req.document._id,
          ImageIn: ip_server + req.document.ImageIn + '.jpg',
          ImageOut: ip_server + req.document.ImageOut + '.jpg',
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
          Check: req.document.Check,
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
        $sort: { DateTimeOut: -1 }, // Sắp xếp theo DateTimeIn giảm dần
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
        LaneID: (dataIn.data.LaneIn == '' || dataIn.data.LaneIn == null) ? 0 : Number(dataIn.data.LaneIn),
        LaneIn: {
          ImageIn: (dataIn.data.ImageIn == null || dataIn.data.ImageIn == '') ? null : ip_server + dataIn.data.ImageIn + '.jpg',
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
        LaneID: (dataOut.data.LaneOut == '' || dataOut.data.LaneOut == null) ? 0 : Number(dataOut.data.LaneOut),
        LaneOut: {
          pkid: dataOut.data._id,
          ImageIn: (dataOut.data.ImageIn == null || dataOut.data.ImageIn == '') ? null : ip_server + dataOut.data.ImageIn + '.jpg',
          ImageOut: (dataOut.data.ImageOut == null || dataOut.data.ImageOut == '') ? null : ip_server + dataOut.data.ImageOut + '.jpg',
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
          Check: dataOut.data.Check,
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
    const { fordCardID, fullName, cdsid, department, startDateTime, endDateTime, status, check } = req.body;
    globalDataReport = []
    let fordCard = []
    const resultArray = await searchAndGetCardIdByColumns(fullName, cdsid, department);
    if (resultArray.length > 0) fordCard = resultArray;
    if (fordCardID) {
      fordCard = []
      fordCard[0] = fordCardID;
    }
    let query = {}
    //Query Status
    if (status == "NOK") {
      query.$or = [{ Status: 'NOK' }, { Status: null }];
    }
    else if (status == "OK") {
      query.Status = "OK";
    }
    //Query Check
    if (check != 0) query.Check = `${Number(check)}`

    //Query Fordcard ID
    if (fordCard.length > 0) {
      query.FordCardIDIn = { $in: fordCard };
    }
    //Query Datetime
    if (startDateTime && endDateTime) {
      var startDate = moment.utc(startDateTime)
      var endDate =  moment.utc(endDateTime)
      if (!query.$and) {
        query.$and = [];
      }


      query.$and.push({
        $and: [
          {
            DateTimeIn: {
              $gte: startDate,
              $lte: endDate,
              $ne: null
            },
          },
          {
            $or: [
              { DateTimeOut: null },
              {
                $and: [
                  { DateTimeOut: { $gte: startDate } },
                  { DateTimeOut: { $lte: endDate } },
                ],
              },
            ],
          },
        ],
      });
    }
    let result = await Data.find(query).sort({ DateTimeOut: -1, DateTimeIn: -1 });
    if ((cdsid || fullName) && resultArray.length == 0) {
      result = []
    }
    const updatedResult = result.map(async (item) => {
      if (item.ImageIn != null) {
        item.ImageIn = ip_server + item.ImageIn + '.jpg';
      }

      if (item.ImageOut != null) {
        item.ImageOut = ip_server + item.ImageOut + '.jpg';
      }
      const infoIn = (item.FordCardIDIn != '' && item.FordCardIDIn != null) ? await searchCSVByColumnIndex(item.FordCardIDIn, 0) : [];
      const infoOut = (item.FordCardIDOut != '' && item.FordCardIDOut != null) ? await searchCSVByColumnIndex(item.FordCardIDOut, 0) : [];

      if (infoIn.length > 0 || infoOut.length > 0) {
        const updatedItem = {
          ...item,
          _doc: {
            ...(item._doc),
            CdsidIn: undefined,
            FullNameIn: undefined,
            DepartmentIn: undefined,
            CdsidOut: undefined,
            FullNameOut: undefined,
            DepartmentOut: undefined,
          },
        };

        if (infoIn.length > 0) {
          const dataIn = Object.values(infoIn[0]);
          updatedItem._doc.CdsidIn = dataIn[1];
          updatedItem._doc.FullNameIn = dataIn[2];
          updatedItem._doc.DepartmentIn = dataIn[3];
        }

        if (infoOut.length > 0) {
          const dataOut = Object.values(infoOut[0]);
          updatedItem._doc.CdsidOut = dataOut[1];
          updatedItem._doc.FullNameOut = dataOut[2];
          updatedItem._doc.DepartmentOut = dataOut[3];
        }

        return updatedItem;
      }

      return { ...item };
    });

    const resolvedUpdatedResult = await Promise.all(updatedResult);
    globalDataReport = {
      data: resolvedUpdatedResult,
      startTime: formatDateTime(startDateTime),
      endTime: formatDateTime(endDateTime)
    };
    res.status(200).json({ message: 'Dữ liệu lấy thành công', data: resolvedUpdatedResult });
  } catch (error) {
    console.error('Lỗi khi tìm kiếm hoặc xử lý dữ liệu:', error.message);
    res.status(500).json({ message: 'Đã xảy ra lỗi' });
  }
}
exports.createData = async (req, res) => { // TEST
  const specificDateUtc = moment.utc();
  const specificDateHCM = specificDateUtc.tz('Asia/Ho_Chi_Minh');
  
  const datetime = new Date((specificDateHCM.format().replace("+07:00","")));
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
      DateTimeIn: datetime,
      DateTimeOut: null,
      Status: null,
      ImageIn: `${getRndInteger(1, 21)}`,
      ImageOut: null,
      Check: "2",
      Rootcause: '',
      Action: '',
      TypeOfError: '',
    });

    await newData.save();

    res.status(201).json({ message: 'Thêm mới thành công' });
  } catch (error) {
    console.error('Lỗi thêm dữ liệu:', error);
    res.status(500).json({ message: 'Thêm mới thất bại' });
  }
};
exports.setStatusData = async (req, res) => {
  try {
    const pkid = req.body.pkid
    if (pkid != null && pkid != '') {
      const setStatusData = await Data.findByIdAndUpdate(
        { _id: pkid },
        { Status: 'OK', Check: "1" },
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
    const { pkid, note, confirm, status, typeError } = req.body;
    if (pkid != null && pkid != '') {
      const setStatusData = await Data.findByIdAndUpdate(
        { _id: pkid },
        {
          Rootcause: confirm,
          Action: note,
          Status: status,
          TypeOfError: typeError,
        },
        { new: true }
      );
    }
    res.status(200).json({ message: 'Thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật dữ liệu:', error);
    res.status(500).json({ message: 'Lỗi cập nhật', Error: error });
  }
};
exports.sendMail = async (req, res) => {
  try {
    //const result = await generatePDF(3, globalDataReport);
    const result = await generatePDF(1);
    if (result == "sent") {
      res.status(200).json({ message: 'Gửi mail thành công', data: result });
    }
    else {
      res.status(500).json({ message: 'Lỗi khi gửi email', error: result.message });
    }
  } catch (error) {
    console.error('Lỗi khi gửi email:', error);
    res.status(500).json({ message: 'Lỗi khi gửi email', error: error.message });
  }
  //await generatePDF(1);
}
exports.setEditData = async (req, res) => {
  try {
    const pkid = req.body.pkid
    if (pkid != null && pkid != '') {
      const setStatusData = await Data.findByIdAndUpdate(
        { _id: pkid },
        { Check: "2" },
        { new: true }
      );
    }
    res.status(200).json({ message: 'Thành công' });
  } catch (error) {
    console.error('Lỗi cập nhật dữ liệu:', error);
    res.status(500).json({ message: 'Lỗi cập nhật người dùng' });
  }
};
exports.getDepartmentData = async (req, res) => {
  try {
    const uniqueValues = await filterUniqueValues('Phòng ban');
    res.status(200).json({ message: 'Thành công', data: uniqueValues });
  } catch (error) {
    res.status(500).json({ message: 'Thất bại', error: error });
  }
};
async function filterUniqueValues(columnName) {
  const uniqueValues = new Set();

  return new Promise((resolve, reject) => {
    fs.createReadStream(idPath)
      .pipe(csv.parse({ headers: true }))
      .on('data', (data) => {
        const value = data[columnName];
        if (!uniqueValues.has(value) && value != '') {
          uniqueValues.add(value);
        }
      })
      .on('end', () => {
        resolve(Array.from(uniqueValues));
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}
function searchAndGetCardIdByColumns(fullName, cdsid, department) {
  return new Promise((resolve, reject) => {
    const cardIds = [];
    const stream = fs.createReadStream(idPath);

    // Kiểm tra xem cả ba trường đều rỗng hoặc null
    if ((fullName === null || fullName === '') && (cdsid === null || cdsid === '') && (department === null || department === '')) {
      resolve([]);
    } else {
      stream
        .pipe(csv.parse({ headers: true }))
        .on('data', (row) => {
          // Kiểm tra giá trị của cột tương ứng với các đầu vào không rỗng
          if (
            (!fullName || row['Tên nhân viên'].toUpperCase().includes(fullName.toUpperCase())) &&
            (!cdsid || row['Mã CDSID'].toUpperCase().includes(cdsid.toUpperCase())) &&
            (!department || row['Phòng ban'].includes(department))
          ) {
            if (row['Mã thẻ']) {
              cardIds.push(row['Mã thẻ']);
            }
          }
        })
        .on('end', () => {
          resolve(cardIds);
        })
        .on('error', (error) => {
          reject(error);
        });
    }
  });
}
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
exports.getCountData = async (type,req, res) => {
  try {
    let query = {};
    const specificDate = moment(new Date());
    const specificDateUtc = moment.utc(new Date());
    let startDateTime = null;
    let endDateTime = null;
    let number = 1
    if(type == 1){
      if (specificDate.hour() >= 5 && specificDate.hour() < 17) {
        startDateTime = new Date(specificDateUtc.clone().startOf('day').hour(5));
        endDateTime = new Date(specificDateUtc.clone().startOf('day').hour(17));
        number = 1
      } else if (specificDate.hour() >= 17) {
        startDateTime = new Date(specificDateUtc.clone().startOf('day').hour(17));
        endDateTime = new Date(specificDateUtc.clone().add(1, 'day').startOf('day').hour(5));
        number = 2
      } else {
        startDateTime = new Date(specificDateUtc.clone().subtract(1, 'day').startOf('day').hour(17));
        endDateTime = new Date(specificDateUtc.clone().startOf('day').hour(5));
        number = 2
      }
    }
    else{
      if (specificDate.hour() == 20) {
        startDateTime = new Date(specificDateUtc.clone().startOf('day').hour(5));
        endDateTime = new Date(specificDateUtc.clone().startOf('day').hour(17));
        number = 1
      } else {
        startDateTime = new Date(specificDateUtc.clone().subtract(1, 'day').startOf('day').hour(17));
        endDateTime = new Date(specificDateUtc.clone().startOf('day').hour(5));
        number = 2
      }
    }
    // console.log(startDateTime)
    // console.log(endDateTime)
    // Kiểm tra thời gian hiện tại để xác định khoảng thời gian
    
    query = {
      $or: [
        {
          $and: [
            {
              DateTimeIn: {
                $gte: startDateTime,
                $lte: endDateTime,
                $ne: null,
              },
            },
          ],
        },
        {
          $and: [
            {
              DateTimeIn: {
                $gte: startDateTime,
                $lte: endDateTime,
              },
              DateTimeOut: {
                $gte: startDateTime,
                $lte: endDateTime,
                $ne: null,
              },
            },
          ],
        },
      ],
    };
    const result = await Data.find(query);

    var data = {
      countVehicleWithNullOut: result.filter(item => item.DateTimeIn != null).length,
      countVehicleWithNotNullOut: result.filter(item => item.DateTimeOut != null).length,
      shift: number,
    };
    return data
  }
  catch (error) {
    console.log(error)
    return null;
  }


}
exports.getCountDataFunc = async (type,req, res) => {
  try {
    let query = {};
    const specificDate = moment(new Date());
    const specificDateUtc = moment.utc(new Date());
    let startDateTime = null;
    let endDateTime = null;
    let number = 1
    if(type == 1){
      if (specificDate.hour() >= 5 && specificDate.hour() < 17) {
        startDateTime = new Date(specificDateUtc.clone().startOf('day').hour(5));
        endDateTime = new Date(specificDateUtc.clone().startOf('day').hour(17));
        number = 1
      } else if (specificDate.hour() >= 17) {
        startDateTime = new Date(specificDateUtc.clone().startOf('day').hour(17));
        endDateTime = new Date(specificDateUtc.clone().add(1, 'day').startOf('day').hour(5));
        number = 2
      } else {
        startDateTime = new Date(specificDateUtc.clone().subtract(1, 'day').startOf('day').hour(17));
        endDateTime = new Date(specificDateUtc.clone().startOf('day').hour(5));
        number = 2
      }
    }
    else{
      if (specificDate.hour() == 20) {
        startDateTime = new Date(specificDateUtc.clone().startOf('day').hour(5));
        endDateTime = new Date(specificDateUtc.clone().startOf('day').hour(17));
        number = 1
      } else {
        startDateTime = new Date(specificDateUtc.clone().subtract(1, 'day').startOf('day').hour(17));
        endDateTime = new Date(specificDateUtc.clone().startOf('day').hour(5));
        number = 2
      }
    }
    // Kiểm tra thời gian hiện tại để xác định khoảng thời gian
    
    query = {
      $or: [
        {
          $and: [
            {
              DateTimeIn: {
                $gte: startDateTime,
                $lte: endDateTime,
                $ne: null,
              },
            },
          ],
        },
        {
          $and: [
            {
              DateTimeIn: {
                $gte: startDateTime,
                $lte: endDateTime,
              },
              DateTimeOut: {
                $gte: startDateTime,
                $lte: endDateTime,
                $ne: null,
              },
            },
          ],
        },
      ],
    };
    const result = await Data.find(query);

    var data = {
      countVehicleWithNullOut: result.filter(item => item.DateTimeIn != null).length,
      countVehicleWithNotNullOut: result.filter(item => item.DateTimeOut != null).length,
      shift: number,
    };
    return data
  }
  catch (error) {
    console.log(error)
    return null;
  }


}
