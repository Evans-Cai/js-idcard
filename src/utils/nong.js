const chineseLunar = require('chinese-lunar');
function Nong(ba) {
  const new_ba = ba.slice(0, 4) + '/' + ba.slice(4, 6) + '/' + ba.slice(6, 8)
  const date = new Date(new_ba)
  let lunar
  try {
    lunar = chineseLunar.solarToLunar(date)
  } catch (err) {
    return '时间错误'
  }
  return lunar.year + '/' + lunar.month + '/' + lunar.day
}

module.exports = Nong
