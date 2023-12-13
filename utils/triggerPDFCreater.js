const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const Data = require('../models/Data');
const moment = require('moment-timezone');
const ip_server = 'http://' + process.env.IPSERVER + ":" + process.env.PORT_SERVER + '/images/';
const fs = require('fs');
const csv = require('fast-csv');
const idPath = process.env.PATH_ID.replace(/\\\\/g, '/');
const {formatDateTime } = require('../utils/caculator');
// Tạo transporter cho nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ngodan2409@gmail.com',
        pass: 'viagzjgyuhrtzkkm',
    },
});

// Hàm để tạo và gửi email
async function sendEmailWithPDF(pdfBuffer) {
    const mailOptions = {
        from: 'ngodan2409@gmail.com',
        to: ['ngodan2208@gmail.com', 'minhthien97hy@gmail.com'],
        subject: 'Daily PDF Report',
        text: 'Attached is the daily report in PDF format.',
        attachments: [
            {
                filename: 'daily_report.pdf',
                content: pdfBuffer,
            },
        ],
    };

    await transporter.sendMail(mailOptions);
}
async function getData(number) {
    let query = {};
   
    const specificDate = moment.utc(new Date());
    let startDateTime = null;
    let endDateTime = null;
    if (number == 1) {
        startDateTime = specificDate.clone().startOf('day').hour(7);
        endDateTime = specificDate.clone().startOf('day').hour(19);
    }
    else {
        startDateTime = specificDate.clone().subtract(1, 'day').startOf('day').hour(19);
        endDateTime = specificDate.clone().startOf('day').hour(7);
    }
    query.$or = [{ Check: 1 }, { Check: 2 }];
    if (!query.$and) {
        query.$and = [];
    }
    query.$and.push({
	  $and: [
	    {
	      DateTimeIn: { 
		$gte: new Date(startDateTime), 
		$lte: new Date(endDateTime), 
		$ne: null 
	      },
	    },
	    {
	      $or: [
		{ DateTimeOut: null },
		{ 
		  $and: [
		    { DateTimeOut: { $gte: new Date(startDateTime) } },
		    { DateTimeOut: { $lte: new Date(endDateTime) } },
		  ],
		},
	      ],
	    },
	  ],
	});
    var result = await Data.find(query);
    const data = {
        data : result,
        startTime: formatDateTime(startDateTime.format()),
        endTime: formatDateTime(endDateTime.format())
    }
    return data
}
// Hàm để tạo PDF từ dữ liệu trong MongoDB
async function generatePDF(number,dataInput) {
    try{
        let data = []
        let htmlContent = '';
        if(number != 3 ){
            data = await getData(number);
            if (data.data != null && data.data.length > 0) {
    
                htmlContent = `<!DOCTYPE html>
                <html lang="en">
                
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                    <style>
                    .layout-title {
                        text-align: center;
                        padding: 0px 0px 30px 0px;
                        font-size: 21px;
                        font-weight: 600;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        flex-wrap: wrap;
            
                    }
            
                    .layout-title h2 {
                        padding: 0px;
                        margin: 0px;
                        margin-bottom: 10px;
                    }
            
                    .layout-area.p-20 {
                        padding: 20px;
                    }
            
                    table.table.table-bordered.table-main {
                        margin: 0 auto;
                        border: 1px solid #bfbfbf;
                        font-size: 12px;
                        border-spacing: 0px;
                        border-bottom: none;
                        margin-top:15px
                    }
            
                    table.table.table-bordered.table-main thead {
                        background: #c7c7c7;
                        font-size: 14px;
                        font-weight: 600;
                    }
            
                    ul {
                        padding: 0px;
                        margin: 0px;
                    }
            
                    ul li {
                        list-style: none;
                        margin-bottom: 10px;
                    }
            
                    .data-bottom {
                        width: 100%;
                        display: flex;
                        height: 100px;
                    }
            
                    .data-bottom img {
                        width: 100%;
                        margin: 0 auto;
                        background-position: center;
                        background-size: cover;
                        object-fit: cover;
                    }
            
                    tbody tr {
                        border-bottom: 1px solid #bfbfbf;
                    }
            
                    tbody tr td {
                        border-left: 1px solid #bfbfbf;
                        padding: 10px;
                        border-bottom: 1px solid #bfbfbf;
                        vertical-align: top;
                    }
            
                    thead tr th {
                        border-left: 1px solid #bfbfbf;
                        padding: 0px;
                        margin: 0px;
                        border-spacing: 0px !important;
                        background: antiquewhite;
                        border-bottom: 1px solid #bfbfbf;
                        /* border-top: 1px solid #bfbfbf; */
                    }
            
                    .data-top {
                        display: flex;
                        justify-content: space-around;
                    }
            
                    tbody tr>td:first-child {
                        border-left: none;
                    }
            
                    .layout-logo {
                        position: absolute;
                        width: 70px;
                    }
            
                    .layout-logo img {
                        width: 100%;
                        height: 100%;
                        background-position: center;
                        background-size: cover;
                    }
            
                    tbody tr td:last-child {
                        vertical-align: middle;
                    }
            
                    @media print {
                        table {
                            page-break-inside: auto;
                        }
            
                        table,
                        tr,
                        td {
                            border-collapse: collapse;
                        }
            
                        td {
                            padding: 10px;
                            border: 1px solid #bfbfbf;
                        }
            
                        .page-break {
                            page-break-inside: avoid;
                            page-break-after: always;
                        }
                    }
        
                    </style>
                </head>
                
                <body>
                    <div class="layout-area p-20">
                        <div class="layout-logo"><img src="http://localhost:3500/default/logo.png" alt=""></div>
                        <div class="layout-title">
                            <h2 style="width: 100%;">CHI TIẾT DỮ LIỆU HỆ THỐNG QUẢN LÝ XE TỰ ĐỘNG</h2> 
                            <span>Từ ${data.startTime} đến ${data.endTime}</span> 
                        </div>
                        <div class="layout-content">
                            <table class="table table-bordered table-main">
                                <thead class="thead-light">
                                    <tr>
                                        <th colspan="1" rowspan="2" style="width: 3%">STT</th>
                                        <th colspan="1" rowspan="2" style="width: 7%">Loại</th>
                                        <th colspan="1" rowspan="2" style="width: 17%">
                                            Thông tin nhân viên
                                        </th>
                                        <th colspan="2" rowspan="1" style="width: 22%">Thông tin vào</th>
                                        <th colspan="2" rowspan="1" style="width: 22%">Thông tin ra</th>
                                        <th colspan="1" rowspan="2" style="width: 12%">Nguyên nhân</th>
                                        <th colspan="1" rowspan="2" style="width: 12%">Hành động</th>
                                        <th colspan="1" rowspan="2" style="width: 12%">Trạng thái</th>
                                    </tr>
                                    <tr>
                                        <th scope="col" style="width: 130px">Ngày</th>
                                        <th scope="col" style="width: 130px">Giờ</th>
                                        <th scope="col" style="width: 130px">Ngày</th>
                                        <th scope="col" style="width: 130px">Giờ</th>
                                    </tr>
                                </thead>
                
                                <tbody>
                `
        
                for (const [index, value] of data.data.entries()) {
                    let CdsidIn = '';
                    let FullNameIn = '';
                    let DepartmentIn = '';
                    const infoIn = await searchCSVByColumnIndex(value.FordCardIDIn, 0);
                    if (infoIn.length > 0) {
                        const data = Object.values(infoIn[0]);
                        CdsidIn = data[1]
                        FullNameIn = data[2]
                        DepartmentIn = data[3]
                    }
                    htmlContent += ` <tr class="${(index !== 0 && index % 4 === 0) ? 'page-break':'' }">
                    <td scope="row" style="vertical-align: middle; text-align: center; width: 3%">
                        ${index + 1}
                    </td>
                    <td style="width: 7%"></td>
                    <td style="vertical-align: middle; width: 15%">
                        <ul>
                            <li>
                                FordCardID: <strong>${value.FordCardIDIn}</strong>
                            </li>
                            <li>
                                CDSID: <strong>${CdsidIn}</strong>
                            </li>
                            <li>
                                Fullname: <strong>${FullNameIn}</strong>
                            </li>
                            <li>
                                Department: <strong>${DepartmentIn}</strong>
                            </li>
                        </ul>
                    </td>
                    <td colspan="2" style="width: 23%">
                        <div class="data-top">
                            <div class="data-top__item">
                                ${getDatetime(value.DateTimeIn, "date")}
                                <!-- Ngày vào -->
                            </div>
                            <div class="data-top__item">
                                ${getDatetime(value.DateTimeIn, "time")}
                                <!-- Giờ vào -->
                            </div>
                        </div>
                        <div class="data-bottom">
                            <img src="${(value.ImageIn == '' || value.ImageIn == null) ? '' : ip_server + value.ImageIn + '.jpg'}" alt="" />
                            <!-- <div>Không có</div> -->
                        </div>
                    </td>
                    <td colspan="2" style="width: 23%">
                        <div class="data-top">
                            <div class="data-top__item">
                                ${getDatetime(value.DateTimeOut, "date")}
        
                                <!-- Ngày ra -->
                            </div>
                            <div class="data-top__item">
                                ${getDatetime(value.DateTimeOut, "time")}
                                <!-- Giờ ra -->
                            </div>
                        </div>
                        <div class="data-bottom">
                        <img src="${(value.ImageOut == '' || value.ImageOut == null) ? '' : ip_server + value.ImageOut + '.jpg'}" alt="" />
                            <!-- <div>Không có</div> -->
                        </div>
                    </td>
                    <td style="width: 12%">
                        ${value.Rootcause}
                        <!-- Rootcause -->
                    </td>
                    <td style="width: 12%">
                        ${value.Action}
                        <!-- Action -->
                    </td>
                    <td style="width: 12%">
                        ${(value.Check == 1) ? "Đã kiểm" : "Hậu kiểm"}
                        <!-- Action -->
                    </td>
                </tr>`
                }
                htmlContent += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </body>
                
                </html>`;
            }
        }
        else{
            data = dataInput
            if (data.data != null && data.data.length > 0) {
    
                htmlContent = `<!DOCTYPE html>
                <html lang="en">
                
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Document</title>
                    <style>
                    .layout-title {
                        text-align: center;
                        padding: 0px 0px 30px 0px;
                        font-size: 21px;
                        font-weight: 600;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        flex-wrap: wrap;
            
                    }
            
                    .layout-title h2 {
                        padding: 0px;
                        margin: 0px;
                        margin-bottom: 10px;
                    }
            
                    .layout-area.p-20 {
                        padding: 20px;
                    }
            
                    table.table.table-bordered.table-main {
                        margin: 0 auto;
                        border: 1px solid #bfbfbf;
                        font-size: 12px;
                        border-spacing: 0px;
                        border-bottom: none;
                        margin-top:15px
                    }
            
                    table.table.table-bordered.table-main thead {
                        background: #c7c7c7;
                        font-size: 14px;
                        font-weight: 600;
                    }
            
                    ul {
                        padding: 0px;
                        margin: 0px;
                    }
            
                    ul li {
                        list-style: none;
                        margin-bottom: 10px;
                    }
            
                    .data-bottom {
                        width: 100%;
                        display: flex;
                        height: 100px;
                    }
            
                    .data-bottom img {
                        width: 100%;
                        margin: 0 auto;
                        background-position: center;
                        background-size: cover;
                        object-fit: cover;
                    }
            
                    tbody tr {
                        border-bottom: 1px solid #bfbfbf;
                    }
            
                    tbody tr td {
                        border-left: 1px solid #bfbfbf;
                        padding: 10px;
                        border-bottom: 1px solid #bfbfbf;
                        vertical-align: top;
                    }
            
                    thead tr th {
                        border-left: 1px solid #bfbfbf;
                        padding: 0px;
                        margin: 0px;
                        border-spacing: 0px !important;
                        background: antiquewhite;
                        border-bottom: 1px solid #bfbfbf;
                        /* border-top: 1px solid #bfbfbf; */
                    }
            
                    .data-top {
                        display: flex;
                        justify-content: space-around;
                    }
            
                    tbody tr>td:first-child {
                        border-left: none;
                    }
            
                    .layout-logo {
                        position: absolute;
                        width: 70px;
                    }
            
                    .layout-logo img {
                        width: 100%;
                        height: 100%;
                        background-position: center;
                        background-size: cover;
                    }
            
                    tbody tr td:last-child {
                        vertical-align: middle;
                    }
            
                    @media print {
                        table {
                            page-break-inside: auto;
                        }
            
                        table,
                        tr,
                        td {
                            border-collapse: collapse;
                        }
            
                        td {
                            padding: 10px;
                            border: 1px solid #bfbfbf;
                        }
            
                        .page-break {
                            page-break-inside: avoid;
                            page-break-after: always;
                        }
                    }
        
                    </style>
                </head>
                
                <body>
                    <div class="layout-area p-20">
                        <div class="layout-logo"><img src="http://localhost:3500/default/logo.png" alt=""></div>
                        <div class="layout-title">
                            <h2 style="width: 100%;">CHI TIẾT DỮ LIỆU HỆ THỐNG QUẢN LÝ XE TỰ ĐỘNG</h2> 
                            <span>Từ ${data.startTime} đến ${data.endTime}</span> 
                        </div>
                        <div class="layout-content">
                            <table class="table table-bordered table-main">
                                <thead class="thead-light">
                                    <tr>
                                        <th colspan="1" rowspan="2" style="width: 3%">STT</th>
                                        <th colspan="1" rowspan="2" style="width: 7%">Loại</th>
                                        <th colspan="1" rowspan="2" style="width: 17%">
                                            Thông tin nhân viên
                                        </th>
                                        <th colspan="2" rowspan="1" style="width: 22%">Thông tin vào</th>
                                        <th colspan="2" rowspan="1" style="width: 22%">Thông tin ra</th>
                                        <th colspan="1" rowspan="2" style="width: 12%">Nguyên nhân</th>
                                        <th colspan="1" rowspan="2" style="width: 12%">Hành động</th>
                                        <th colspan="1" rowspan="2" style="width: 12%">Trạng thái</th>
                                    </tr>
                                    <tr>
                                        <th scope="col" style="width: 130px">Ngày</th>
                                        <th scope="col" style="width: 130px">Giờ</th>
                                        <th scope="col" style="width: 130px">Ngày</th>
                                        <th scope="col" style="width: 130px">Giờ</th>
                                    </tr>
                                </thead>
                
                                <tbody>
                `
        
                for (const [index, value] of data.data.entries()) {
                    let CdsidIn = '';
                    let FullNameIn = '';
                    let DepartmentIn = '';
                    const infoIn = await searchCSVByColumnIndex(value._doc.FordCardIDIn, 0);
                    if (infoIn.length > 0) {
                        const data = Object.values(infoIn[0]);
                        CdsidIn = data[1]
                        FullNameIn = data[2]
                        DepartmentIn = data[3]
                    }
                    htmlContent += ` <tr class="${(index !== 0 && index % 4 === 0) ? 'page-break':'' }">
                    <td scope="row" style="vertical-align: middle; text-align: center; width: 3%">
                        ${index + 1}
                    </td>
                    <td style="width: 7%"></td>
                    <td style="vertical-align: middle; width: 15%">
                        <ul>
                            <li>
                                FordCardID: <strong>${value._doc.FordCardIDIn}</strong>
                            </li>
                            <li>
                                CDSID: <strong>${CdsidIn}</strong>
                            </li>
                            <li>
                                Fullname: <strong>${FullNameIn}</strong>
                            </li>
                            <li>
                                Department: <strong>${DepartmentIn}</strong>
                            </li>
                        </ul>
                    </td>
                    <td colspan="2" style="width: 23%">
                        <div class="data-top">
                            <div class="data-top__item">
                                ${getDatetime(value._doc.DateTimeIn, "date")}
                                <!-- Ngày vào -->
                            </div>
                            <div class="data-top__item">
                                ${getDatetime(value._doc.DateTimeIn, "time")}
                                <!-- Giờ vào -->
                            </div>
                        </div>
                        <div class="data-bottom">
                            <img src="${(value._doc.ImageIn == '' || value._doc.ImageIn == null) ? '' : value._doc.ImageIn }" alt="" />
                            <!-- <div>Không có</div> -->
                        </div>
                    </td>
                    <td colspan="2" style="width: 23%">
                        <div class="data-top">
                            <div class="data-top__item">
                                ${getDatetime(value._doc.DateTimeOut, "date")}
        
                                <!-- Ngày ra -->
                            </div>
                            <div class="data-top__item">
                                ${getDatetime(value._doc.DateTimeOut, "time")}
                                <!-- Giờ ra -->
                            </div>
                        </div>
                        <div class="data-bottom">
                        <img src="${(value._doc.ImageOut == '' || value._doc.ImageOut == null) ? '': value._doc.ImageOut}" alt="" />
                            <!-- <div>Không có</div> -->
                        </div>
                    </td>
                    <td style="width: 12%">
                        ${value._doc.Rootcause}
                        <!-- Rootcause -->
                    </td>
                    <td style="width: 12%">
                        ${value._doc.Action}
                        <!-- Action -->
                    </td>
                    <td style="width: 12%">
                        ${(value._doc.Check == 1) ? "Đã kiểm" : "Hậu kiểm"}
                        <!-- Action -->
                    </td>
                </tr>`
                }
                htmlContent += `
                                </tbody>
                            </table>
                        </div>
                    </div>
                </body>
                
                </html>`;
            }
        }
        const browser = await puppeteer.launch({
            headless: "new",
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1920, height: 1200 });
        await page.setContent(htmlContent);
        const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
        });
        await sendEmailWithPDF(pdfBuffer);
        await browser.close();
        return "sent"
    }
    catch{
        return "unsent"
    }
    
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
function getDatetime(dateTimeString, type) {
    const date = new Date(dateTimeString);
    if (dateTimeString == null) {
        return "Không có";
    }
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    if (type == "date") {
        return `${year}-${month}-${day}`;
    } else if (type == "time") {
        return `${hours}:${minutes}:${seconds}`;
    } else if (type == "file") {
        return `${hours}_${minutes}_${seconds}_${year}_${month}_${day}`;
    } else {
        return `'${hours}:${minutes}:${seconds} ${year}/${month}/${day}`;
    }
}
// Gọi hàm tạo PDF và gửi email vào lúc 8 giờ sáng hàng ngày
module.exports = {
    generatePDF,
};
