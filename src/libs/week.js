/**
 * **/
const day = {
  0: '星期一',
  1: '星期二',
  2: '星期三',
  3: '星期四',
  4: '星期五',
  5: '星期六',
  6: '星期天'
}
//
export default {
  weekDay(year, month, date) {
    const i = new Date(year, month - 1, date).getUTCDay();
    return day[i]
  }
}
