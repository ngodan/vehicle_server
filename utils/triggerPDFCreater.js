const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const Data = require('../models/Data');
const moment = require('moment-timezone');
const ip_server = 'http://' + process.env.IPSERVER + ":" + process.env.PORT_SERVER + '/images/';
const path = require('path');
const fs = require('fs');
const csv = require('fast-csv');
const idPath = process.env.PATH_ID.replace(/\\\\/g, '/');
const { formatDateTime } = require('../utils/caculator');
const sharp = require('sharp');
const imagePathLocal = process.env.PATH_IMAGE.replace(/\\\\/g, '/');
const imagePathZipLocal = process.env.PATH_IMAGE_ZIP.replace(/\\\\/g, '/');
const dataController = require('../controllers/dataController');
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
        to: ['ngodan2208@gmail.com'],
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
    query.$or = [
        { Check: 1 }
        , { Check: 2 }
        , { Check: 0, $or: [{ LicensePlateIn: { $ne: null }, LicensePlateOut: null }, { LicensePlateOut: { $ne: null }, LicensePlateIn: null }] }
    ];
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
        data: result,
        startTime: formatDateTime(startDateTime.format()),
        endTime: formatDateTime(endDateTime.format())
    }
    return data
}
async function compressImage(inputPath, outputPath) {
    try {
        await sharp(inputPath)
            .jpeg({ quality: 4 })  // Điều chỉnh chất lượng JPEG theo nhu cầu
            .toFile(outputPath);
        //console.log('Ảnh đã được nén thành công.');
    } catch (error) {
        console.error('Lỗi khi nén ảnh:', error);
    }
}
// Hàm để tạo PDF từ dữ liệu trong MongoDB
async function generatePDF(number, dataInput) {
    try {
        let data = []
        const dataVehicle = await dataController.getCountData()
        let htmlContent = '';
        if (number != 3) {
            data = await getData(number);
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
                    margin-top: 15px
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
                    display: flex;
                }
        
                td ul {
                    height: 100%;
                    display: block;
                    width: 100%;
                    padding: 0px;
                    margin: 0px;
                    display: grid;
                    grid-template-rows: repeat(4, 1fr);
                }
        
                td ul li {
                    display: flex;
                    margin-bottom: 0px;
                    align-items: center;
                    flex-wrap: wrap;
                    margin-bottom: 5px;
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
        
        
                .grid-data {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    /* 4 cột với kích thước bằng nhau */
                    grid-template-rows: repeat(4, 60px);
                    /* 3 hàng với kích thước cố định là 100px */
                }
        
                .grid-data .data-infor {
                    grid-row: span 4;
                    padding: 10px;
                }
        
                .grid-data .data-top {
                    grid-column: span 2;
                    padding: 10px;
                }
        
                .grid-data .data-bottom {
                    grid-column: span 2;
                    grid-row: span 3;
                    padding: 0px 10px 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
        
                td ul li strong {
                    width: 100%;
                }
        
                td .data-bottom img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    background-size: cover;
                    background-position: center;
                }
                .layout-description {
                    position: fixed;
                    right: 55px;
                    top: 80px;
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
        
                    .grouped-tbody {
                        page-break-inside: avoid;
                        margin-top: 30px
                    }
                }
    
                </style>
            </head>
            
            <body>
                <div class="layout-area p-20">
                    <div class="layout-logo"><img src="http://localhost:3500/default/logo.png" alt=""></div>
                    <div class="layout-description">${(dataVehicle != null ) ? `Số xe ra vào ca ${dataVehicle.shift} : <strong>${dataVehicle.countVehicle} xe</strong>` : "Số xe ra vào ca 0 : <strong>0 xe</strong>"}</div>
                    <div class="layout-title">
                        <h2 style="width: 100%;">BÁO CÁO CUỐI CA HỆ THỐNG QUẢN LÝ XE TỰ ĐỘNG</h2> 
                        <span>Từ ${data.startTime} đến ${data.endTime}</span> 
                    </div>
                    <div class="layout-content">
                        <table class="table table-bordered table-main">
                            <thead class="thead-light">
                                <tr>
                                <th colspan="1" rowspan="2" style="width: 3%">STT</th>
                                <th colspan="3" rowspan="1" style="width: 30%">Thông tin vào</th>
                                <th colspan="3" rowspan="1" style="width: 30%">Thông tin ra</th>
                                <th colspan="1" rowspan="2" style="width: 5%">Trạng thái</th>
                                <th colspan="1" rowspan="2" style="width: 9%">Loại lỗi</th>
                                <th colspan="1" rowspan="2" style="width: 13%">Mô tả cụ thể lỗi</th>
                                <th colspan="1" rowspan="2" style="width: 13%">Hành động</th>
                                
                                </tr>
                                <tr>
                                <th scope="col" style="width: 7%">Thông tin nhân viên</th>
                                <th scope="col" style="width: 9%">Ngày</th>
                                <th scope="col" style="width: 9%">Giờ</th>
                                <th scope="col" style="width: 7%">Thông tin nhân viên</th>
                                <th scope="col" style="width: 9%">Ngày</th>
                                <th scope="col" style="width: 9%">Giờ</th>
                                </tr>
                            </thead>
            
                            
            `
            var html = await generateTableBody(data.data, 1)

            htmlContent += html
            htmlContent += `
                            </table>
                        </div>
                    </div>
                </body>
                
                </html>`;
        }
        else {
            data = dataInput

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
                        margin-top: 15px
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
                        display: flex;
                    }
            
                    td ul {
                        height: 100%;
                        display: block;
                        width: 100%;
                        padding: 0px;
                        margin: 0px;
                        display: grid;
                        grid-template-rows: repeat(4, 1fr);
                    }
            
                    td ul li {
                        display: flex;
                        margin-bottom: 0px;
                        align-items: center;
                        flex-wrap: wrap;
                        margin-bottom: 5px;
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
            
                    .grid-data {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        /* 4 cột với kích thước bằng nhau */
                        grid-template-rows: repeat(4, 60px);
                        /* 3 hàng với kích thước cố định là 100px */
                    }
            
                    .grid-data .data-infor {
                        grid-row: span 4;
                        padding: 10px;
                    }
            
                    .grid-data .data-top {
                        grid-column: span 2;
                        padding: 10px;
                    }
            
                    .grid-data .data-bottom {
                        grid-column: span 2;
                        grid-row: span 3;
                        padding: 0px 10px 10px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
            
                    td ul li strong {
                        width: 100%;
                    }
            
                    td .data-bottom img {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        background-size: cover;
                        background-position: center;
                    }
                    .layout-description {
                        position: fixed;
                        right: 55px;
                        top: 80px;
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
            
                        .grouped-tbody {
                            page-break-inside: avoid;
                            margin-top: 30px
                        }
                    }
        
                    </style>
                </head>
                
                <body>
                    <div class="layout-area p-20">
                        <div class="layout-logo"><img src="http://localhost:3500/default/logo.png" alt=""></div>
                        <div class="layout-description">${(dataVehicle != null ) ? `Số xe ra vào ca ${dataVehicle.shift} : <strong>${dataVehicle.countVehicle} xe</strong>` : "Số xe ra vào ca 0 : <strong>0 xe</strong>"}</div>
                        <div class="layout-title">
                            <h2 style="width: 100%;">BÁO CÁO CUỐI CA HỆ THỐNG QUẢN LÝ XE TỰ ĐỘNG</h2> 
                            <span>Từ ${data.startTime} đến ${data.endTime}</span> 
                        </div>
                        <div class="layout-content">
                            <table class="table table-bordered table-main">
                                <thead class="thead-light">
                                    <tr>
                                    <th colspan="1" rowspan="2" style="width: 3%">STT</th>
                                    <th colspan="3" rowspan="1" style="width: 30%">Thông tin vào</th>
                                    <th colspan="3" rowspan="1" style="width: 30%">Thông tin ra</th>
                                    <th colspan="1" rowspan="2" style="width: 5%">Trạng thái</th>
                                    <th colspan="1" rowspan="2" style="width: 9%">Loại lỗi</th>
                                    <th colspan="1" rowspan="2" style="width: 13%">Mô tả cụ thể lỗi</th>
                                    <th colspan="1" rowspan="2" style="width: 13%">Hành động</th>
                                    
                                    </tr>
                                    <tr>
                                    <th scope="col" style="width: 7%">Thông tin nhân viên</th>
                                    <th scope="col" style="width: 9%">Ngày</th>
                                    <th scope="col" style="width: 9%">Giờ</th>
                                    <th scope="col" style="width: 7%">Thông tin nhân viên</th>
                                    <th scope="col" style="width: 9%">Ngày</th>
                                    <th scope="col" style="width: 9%">Giờ</th>
                                    </tr>
                                </thead>
                
                                
                `
            var html = await generateTableBody(data.data, 3)

            htmlContent += html
            htmlContent += `
                            </table>
                        </div>
                    </div>
                </body>
                
                </html>`;

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
            margin: {
                top: '32px',
            },
        });
        await sendEmailWithPDF(pdfBuffer);
        await browser.close();
        return "sent"
    }
    catch (error) {
        console.log(error)
        return error
    }

}
async function generateTableBody(data, number) {
    let htmlBody = '';
    let groupCounter = 0;
    if (number == 3) {
        if (data != null && data.length > 0) {
            htmlBody += `<tbody class="grouped-tbody">`;
            for (const [index, value] of data.entries()) {
                let compressedImagePathIn = '';
                let compressedImagePathOut = '';
                if(value._doc.ImageIn != null){
                    const imagePath = value._doc.ImageIn.split("/")
                    const imageName = imagePath[imagePath.length - 1]
                    const imageDirectory = path.join(imagePathLocal);
                    const imageDirectoryZip = path.join(imagePathZipLocal);
                    
                    
                    const inputImage = imageDirectory + "\\" + imageName;
                    const outputImage = imageDirectoryZip +  "\\" + imageName;
                    await compressImage(inputImage, outputImage);
                    compressedImagePathIn = ip_server.replace("images","zip") + imageName
                } 
                if(value._doc.ImageOut != null){
                    const imagePath = value._doc.ImageOut.split("/")
                    const imageName = imagePath[imagePath.length - 1]
                    const inputImage = imagePathLocal +  "\\" + imageName;
                    const outputImage = imagePathZipLocal +  "\\" + imageName;
                    await compressImage(inputImage, outputImage);
                    compressedImagePathOut = ip_server.replace("images","zip") + imageName
                    
                } 
               
                if (index % 2 === 0 && index != 0) {
                    // Close the current grouped-tbody
                    htmlBody += `</tbody>`;
                    // Start a new grouped-tbody
                    htmlBody += `<tbody class="grouped-tbody">`;
                }

                htmlBody += `<tr >
            <td
                scope="row"
                style="vertical-align: middle; text-align: center; width: 3%"
                >
                ${index + 1}
            </td>
            <td colspan="3" style="width: 30% ;padding:0px">
              <div class="grid-data">
                <div class="data-infor">
                  <ul>
                    <li>
                      Ford Card ID:<strong>${(value._doc.FordCardIDIn) ? value._doc.FordCardIDIn : "Không có"}</strong>
                    </li>
                    <li>
                      CDSID: <strong>${(value._doc.FordCardIDIn) ? value._doc.CdsidIn : "Không có"}</strong>
                    </li>
                    <li>
                      Full name: <strong>${(value._doc.FordCardIDIn) ? value._doc.FullNameIn : "Không có"}</strong>
                    </li>
                    <li>
                      Department: <strong>${(value._doc.FordCardIDIn) ? value._doc.DepartmentIn : "Không có"}</strong>
                    </li>
                  </ul>
                </div>
                <div class="data-top">
                  <div class="data-top__item">
                    ${getDatetime(value._doc.DateTimeIn, "date")}
                  </div>
                  <div class="data-top__item">
                    ${getDatetime(value._doc.DateTimeIn, "time")}
                  </div>
                </div>
                <div class="data-bottom">
                ${(!compressedImagePathIn) ? "Không có" : `<img src="${compressedImagePathIn}" alt="" />`}
                    
                </div>
              </div>
              
            </td>
            <td colspan="3" style="width: 30% ;padding:0px">
            <div class="grid-data">
              <div class="data-infor">
                <ul>
                  <li>
                    Ford Card ID:<strong>${(value._doc.FordCardIDOut) ? value._doc.FordCardIDOut : "Không có"}</strong>
                  </li>
                  <li>
                    CDSID: <strong>${(value._doc.FordCardIDOut) ? value._doc.CdsidOut : "Không có"}</strong>
                  </li>
                  <li>
                    Full name: <strong>${(value._doc.FordCardIDOut) ? value._doc.FullNameOut : "Không có"}</strong>
                  </li>
                  <li>
                    Department: <strong>${(value._doc.FordCardIDOut) ? value._doc.DepartmentOut : "Không có"}</strong>
                  </li>
                </ul>
              </div>
              <div class="data-top">
                <div class="data-top__item">
                  ${getDatetime(value._doc.DateTimeOut, "date")}
                </div>
                <div class="data-top__item">
                  ${getDatetime(value._doc.DateTimeOut, "time")}
                </div>
              </div>
              <div class="data-bottom">
                ${(!compressedImagePathOut) ? "Không có" : `<img src="${compressedImagePathOut}" alt="" />`}
              </div>
            </div>
            
          </td>
            
          <td style="width: 12%">
            ${(value._doc.Check == 1) ? "Đã kiểm" : "Hậu kiểm"}
            <!-- Action -->
         </td>
            <td style="width: 7%">${(value._doc.TypeOfError )?value._doc.TypeOfError : "" }</td>
            <td style="width: 13%">
                ${value._doc.Rootcause}
                <!-- Rootcause -->
            <td style="width: 13%">
                ${value._doc.Action}
                <!-- Action -->
            </td>
            
            
        </tr>`;
            }
            // Close the last grouped-tbody
            htmlBody += `</tbody>`;
        }
    }
    else {
        if (data != null && data.length > 0) {
            htmlBody += `<tbody class="grouped-tbody">`;
            for (const [index, value] of data.entries()) {
                let CdsidIn = '';
                let FullNameIn = '';
                let DepartmentIn = '';
                let CdsidOut = '';
                let FullNameOut = '';
                let DepartmentOut = '';
                const infoIn = await searchCSVByColumnIndex(value.FordCardIDIn, 0);
                const infoOut = await searchCSVByColumnIndex(value.FordCardIDOut, 0);
                if (infoIn.length > 0) {
                    const data = Object.values(infoIn[0]);
                    CdsidIn = data[1]
                    FullNameIn = data[2]
                    DepartmentIn = data[3]
                }
                if (infoOut.length > 0) {
                    const data = Object.values(infoIn[0]);
                    CdsidOut = data[1]
                    FullNameOut = data[2]
                    DepartmentOut = data[3]
                }
                if (index % 2 === 0 && index != 0) {
                    // Close the current grouped-tbody
                    htmlBody += `</tbody>`;
                    // Start a new grouped-tbody
                    htmlBody += `<tbody class="grouped-tbody">`;
                }
                htmlBody += `<tr>
                <td scope="row" style="vertical-align: middle; text-align: center; width: 3%">
                    ${index + 1}
                </td>
                <td colspan="3" style="width: 30% ;padding:0px">
                <div class="grid-data">
                  <div class="data-infor">
                    <ul>
                      <li>
                        Ford Card ID:<strong>${(value.FordCardIDIn) ? value.FordCardIDIn : "Không có"}</strong>
                      </li>
                      <li>
                        CDSID: <strong>${(value.FordCardIDIn) ? CdsidIn : "Không có"}</strong>
                      </li>
                      <li>
                        Full name: <strong>${(value.FordCardIDIn) ? FullNameIn : "Không có"}</strong>
                      </li>
                      <li>
                        Department: <strong>${(value.FordCardIDIn) ? DepartmentIn : "Không có"}</strong>
                      </li>
                    </ul>
                  </div>
                  <div class="data-top">
                    <div class="data-top__item">
                      ${getDatetime(value.DateTimeIn, "date")}
                    </div>
                    <div class="data-top__item">
                      ${getDatetime(value.DateTimeIn, "time")}
                    </div>
                  </div>
                  <div class="data-bottom">
                    ${(value.ImageIn == '' || value.ImageIn == null) ? "Không có" : `<img src="${ ip_server + value.ImageIn + '.jpg'}" alt="" />`}
                  </div>
                </div>
                
              </td>
              <td colspan="3" style="width: 30% ;padding:0px">
              <div class="grid-data">
                <div class="data-infor">
                  <ul>
                    <li>
                      Ford Card ID:<strong>${(value.FordCardIDOut) ? value.FordCardIDOut : "Không có"}</strong>
                    </li>
                    <li>
                      CDSID: <strong>${(value.FordCardIDOut) ? CdsidOut : "Không có"}</strong>
                    </li>
                    <li>
                      Full name: <strong>${(value.FordCardIDOut) ? FullNameOut : "Không có"}</strong>
                    </li>
                    <li>
                      Department: <strong>${(value.FordCardIDOut) ? DepartmentOut : "Không có"}</strong>
                    </li>
                  </ul>
                </div>
                <div class="data-top">
                  <div class="data-top__item">
                    ${getDatetime(value.DateTimeOut, "date")}
                  </div>
                  <div class="data-top__item">
                    ${getDatetime(value.DateTimeOut, "time")}
                  </div>
                </div>
                <div class="data-bottom">
                  ${(value.ImageOut == '' || value.ImageOut == null) ? "Không có" : `<img src="${ ip_server + value.ImageOut + '.jpg'}" alt="" />`}
                </div>
              </div>
              
            </td>
            <td style="width: 12%">
                    ${(value.Check == 1) ? "Đã kiểm" : "Hậu kiểm"}
                    <!-- Action -->
                </td>
                <td style="width: 7%">${(value.TypeOfError )?value.TypeOfError : "" }</td>
                <td style="width: 13%">
                    ${value.Rootcause}
                    <!-- Rootcause -->
                </td>
                <td style="width: 1%">
                    ${value.Action}
                    <!-- Action -->
                </td>
                
            </tr>`
            }
        }
    }
    return htmlBody;
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
    if (dateTimeString == null) {
      return "Không có";
    }

    // Sử dụng moment.utc thay vì moment
    const date = moment.utc(dateTimeString);

    const formattedDate = date.format("YYYY-MM-DD");
    const formattedTime = date.format("HH:mm:ss");
    const formattedFile = date.format("HH_mm_ss_YYYY_MM_DD");
    const formattedDateTime = date.format("HH:mm:ss YYYY/MM/DD");

    if (type == "date") {
      return formattedDate;
    } else if (type == "time") {
      return formattedTime;
    } else if (type == "file") {
      return formattedFile;
    } else {
      return formattedDateTime;
    }
  }
// function getDatetime(dateTimeString, type) {
//     const date = new Date(dateTimeString);
//     if (dateTimeString == null) {
//         return "Không có";
//     }
//     const year = date.getFullYear();
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const day = String(date.getDate()).padStart(2, "0");
//     const hours = String(date.getHours()).padStart(2, "0");
//     const minutes = String(date.getMinutes()).padStart(2, "0");
//     const seconds = String(date.getSeconds()).padStart(2, "0");

//     if (type == "date") {
//         return `${year}-${month}-${day}`;
//     } else if (type == "time") {
//         return `${hours}:${minutes}:${seconds}`;
//     } else if (type == "file") {
//         return `${hours}_${minutes}_${seconds}_${year}_${month}_${day}`;
//     } else {
//         return `'${hours}:${minutes}:${seconds} ${year}/${month}/${day}`;
//     }
// }
// Gọi hàm tạo PDF và gửi email vào lúc 8 giờ sáng hàng ngày
module.exports = {
    generatePDF,
};
