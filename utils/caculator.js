function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
const moment = require('moment-timezone');

function formatDateTime(dateTimeString) {
    const momentDate = moment.utc(dateTimeString);
    const formattedDateTime = momentDate.format('HH:mm DD/MM/YYYY');

    return formattedDateTime;
}


module.exports = { getRndInteger,formatDateTime };