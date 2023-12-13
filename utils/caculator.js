function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
const moment = require('moment-timezone');

function formatDateTime(dateTimeString) {
    // Tạo đối tượng moment từ chuỗi thời gian với múi giờ 'UTC'
    const momentDate = moment.utc(dateTimeString);

    // Chuyển đổi về múi giờ 'Asia/Ho_Chi_Minh'
    //momentDate.tz('Asia/Ho_Chi_Minh');

    // Định dạng ngày và giờ theo yêu cầu
    const formattedDateTime = momentDate.format('HH:mm DD/MM/YYYY');

    return formattedDateTime;
}


module.exports = { getRndInteger,formatDateTime };