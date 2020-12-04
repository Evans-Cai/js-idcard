const chineseLunar = require('chinese-lunar');
function Lunar(birthday) {
  const _bir = birthday.split(/[/\\-]/);
  const _birthday = _bir.slice(0, 4) + '/' + _bir.slice(4, 6) + '/' + _bir.slice(6, 8)
  const _date = new Date(_birthday)
  let lunar
  try {
    lunar = chineseLunar.solarToLunar(_date)
    return lunar.year + '/' + lunar.month + '/' + lunar.day
  } catch (err) {
    console.error('error => ', err, '时间错误')
    return null
  }
}

module.exports = {
  Lunar: Lunar
}
