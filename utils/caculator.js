function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);

    // Tạo một đối tượng định dạng ngày và giờ với múi giờ là 'Asia/Ho_Chi_Minh'
    const formatter = new Intl.DateTimeFormat('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'Asia/Ho_Chi_Minh',
    });

    // Sử dụng formatter để định dạng ngày và giờ
    const formattedDateTime = formatter.format(date);
    console.log(formattedDateTime)
    return formattedDateTime;
}
module.exports = { getRndInteger,formatDateTime };