const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}
const formatTime = (z, date = new Date()) => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    return z ?
        `${year}年${formatNumber(month)}月${formatNumber(day)}日 ${formatNumber(hour)}:${formatNumber(minute)}` :
        `${year}-${formatNumber(month)}-${formatNumber(day)} ${formatNumber(hour)}:${formatNumber(minute)}:${formatNumber(second)}`
}
module.exports = {
    formatTime
}