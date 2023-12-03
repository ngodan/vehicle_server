function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}
function formatDateTime(dateTimeString) {
    const padZero = (number) => (number < 10 ? `0${number}` : number);
    const date = new Date(dateTimeString);
    const formattedDate = `${padZero(date.getDate())}/${padZero(date.getMonth() + 1)}/${date.getFullYear()}`;
    const formattedTime = `${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
    return `${formattedTime} ${formattedDate}`;
}
module.exports = { getRndInteger,formatDateTime };