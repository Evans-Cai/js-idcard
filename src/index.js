const NodeConstellation = require('node-constellation');
const chineseLunar = require('chinese-lunar');
//
const dataAddress = require('./data/address.json');
//
const weekDay = require('./utils/week');
// 身份证正则
const { eReg, eReg15_0, eReg15_1, eReg18_0, eReg18_1 } = require('./utils/reg');
//
export default class JsIdCard {
  constructor() {}
  // 星期
  week(year, month, date) {
    return weekDay(year, month, date)
  }
  // 生肖
  zodiac_zh(year) {
    const arr = '鼠牛虎兔龙蛇马羊猴鸡狗猪';
    let Year = year % 12 - 4;
    if (Year < 0) Year += 12;
    return arr[Year]
  }
  // 星座
  zodiac(month, date) {
    try {
      if (month !== undefined && date !== undefined) return NodeConstellation(month, date, 'zh-cn')
      if (date === undefined && month !== undefined) {
        if (month.length === 4) return NodeConstellation(month.substr(0, 2), month.substr(2, 2), 'zh-cn')
        month = month.split(/[\/\\\-]/)
        return NodeConstellation(month[0], month[1], 'zh-cn')
      }
    } catch (err) {
      return '出错' + month + date
    }
  }
  // 计算最后一位应该是多少
  idCardEndNum(idCard) {
    const IdCard = idCard.toString()
    const factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
    const parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2]
    let sum = 0
    let ai = 0
    let wi = 0
    for (let i = 0; i < 17; i++) {
      ai = IdCard[i];
      wi = factor[i];
      sum += ai * wi;
    }
    return parity[sum % 11];
  }
  // 农历转换
  Nong(birday) {
    const bir = birday.split(/[\/\\\-]/);
    const birthday = bir.slice(0, 4) + '/' + bir.slice(4, 6) + '/' + bir.slice(6, 8);
    const nong = new Date(birthday);
    try {
      const lunar = chineseLunar.solarToLunar(nong);
      return lunar.year + '/' + lunar.month + '/' + lunar.day;
    } catch (err) {
      return '时间错误';
    }
  }
  // 解析生日信息
  birthDay(idCard) {
    const IdCard = idCard.toString()
    // let birthday, month, day, nong, year, nongyear;
    const year = IdCard.substr(6, 4);
    const month = IdCard.substr(10, 2);
    const day = IdCard.substr(12, 2);
    const birthday = year + '/' + month + '/' + day;
    const nong = this.Nong(birthday);
    const nongYear = nong.substr(0, 4)
    return {
      date: birthday,
      nong: nong,
      year: year,
      month: month,
      day: day,
      week: this.week(year, month, day), // 星期几
      zodiac: this.zodiac(month, day), // 星座
      zodiac_zh: this.zodiac_zh(nongYear) // 生肖
    };
  }
  // 验证身份证号是否正确
  checkIdCard(idCard) {
    const IdCard = idCard.toString();
    let ereg = eReg;
    switch (IdCard.length) {
      case 15:
        if ((parseInt(IdCard.substr(6, 2)) + 1900) % 4 === 0 || ((parseInt(IdCard.substr(6, 2)) + 1900) % 100 === 0 && (parseInt(IdCard.substr(6, 2)) + 1900) % 4 === 0)) {
          ereg = eReg15_0
        } else {
          ereg = eReg15_1
        }
        break;
      case 18:
        if (parseInt(IdCard.substr(6, 4)) % 4 === 0 || (parseInt(IdCard.substr(6, 4)) % 100 === 0 && parseInt(IdCard.substr(6, 4)) % 4 === 0)) {
          ereg = eReg18_0
        } else {
          ereg = eReg18_1
        }
        break;
    }
    console.log(ereg.test(IdCard), IdCard[17]);
    console.log(this.idCardEndNum(IdCard));
    return ereg.test(IdCard) && String(this.idCardEndNum(IdCard)) === IdCard[17].toUpperCase().toString();
  }
  // 补全身份证号
  repairIdCard(idCard) {
    const IdCard = idCard.toString()
    if (/(^\d{17}$)/.test(IdCard)) return IdCard + this.idCardEndNum(IdCard)
    if (eReg.test(IdCard)) return IdCard.slice(0, 17) + this.idCardEndNum(IdCard)
  }
  // 15位转换18位
  num15to18(idCard) {
    const IdCard = idCard.toString()
    if (/(^\d{15}$)/.test(IdCard)) return this.repairIdCard(IdCard.slice(0, 6) + '19' + IdCard.slice(6, 15))
  }
  /**
   * 地址信息解析
   * 地址信息返回格式
   * @return {object} {"address": "地址","provinces": "省/直辖市","citiy": "市","areas": "县/区","all": "省-市-县"}
   **/
  address(idCard) {
    const IdCard = idCard.toString();
    const addressId = IdCard.slice(0, 6);
    const data = dataAddress[addressId]
    if (!data) {
      console.warn('warning => ', '未找到匹配数据');
      return null
    }
    const all = (data.provinces + '-' + data.citiy + '-' + data.areas).replace('无', '');
    return { ...data, all }
  }
  // 性别解析
  sex(idCard) {
    let IdCard = idCard.toString();
    if (IdCard.length === 15) {
      IdCard = this.num15to18(IdCard);
    }
    if (IdCard[16] % 2) return '男';
    return '女';
  }
}
