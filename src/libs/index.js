'use strict';

const NodeConstellation = require('node-constellation');
const chineseLunar = require('chinese-lunar');
//
const dataAddress = require('../static/address.json');
//
const { weekDay } = require('./week');
// 身份证正则
const { eReg, eReg15_0, eReg15_1, eReg18_0, eReg18_1 } = require('./regs');
//
class JsIdCardFull {
  /**
   * @param {String|Number} idCard 身份证号
   * **/
  constructor(idCard) {
    if (idCard) {
      return this.all(idCard);
    }
  }
  //
  formatDate(idCard) {
    const y = this.checkIdCard(idCard);
    if(!y){
      const d = new Date();
      return `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}`
    }
    const IdCard = idCard.toString();
    const _year = IdCard.substr(6, 4);
    const _month = IdCard.substr(10, 2);
    const _day = IdCard.substr(12, 2);
    return `${_year}-${_month}-${_day}`
  }
  // 星期
  week_zh(year, month, day) {
    return weekDay(year, month, day)
  }
  // 生肖
  zodiac_zh(year) {
    const arr = '鼠牛虎兔龙蛇马羊猴鸡狗猪';
    let Year = year % 12 - 4;
    if (Year < 0) {Year += 12;}
    return arr[Year]
  }
  // 星座
  zodiac(month, day) {
    try {
      if (month !== undefined && day !== undefined) {return NodeConstellation(month, day, 'zh-cn')}
      if (day === undefined && month !== undefined) {
        if (month.length === 4) {return NodeConstellation(month.substr(0, 2), month.substr(2, 2), 'zh-cn');}
        const _month = month.split(/[/\\-]/);
        return NodeConstellation(_month[0], _month[1], 'zh-cn')
      }
    } catch (err) {
      return '出错 => ' + month + day
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
  lunarCalendar(idCard) {
    const IdCard = idCard.toString();
    const _year = IdCard.substr(6, 4);
    const _month = IdCard.substr(10, 2);
    const _day = IdCard.substr(12, 2);
    // 公历
    const _gregorian = _year + '/' + _month + '/' + _day;
    const _dateTime = new Date(_gregorian);
    try {
      const _lunar = chineseLunar.solarToLunar(_dateTime);
      return _lunar.year + '/' + _lunar.month + '/' + _lunar.day;
    } catch (err) {
      console.error('error => ', err, '时间错误')
      return null
    }
  }
  // 解析生日信息
  birthday(idCard) {
    const IdCard = idCard.toString();
    const _year = IdCard.substr(6, 4);
    const _month = IdCard.substr(10, 2);
    const _day = IdCard.substr(12, 2);
    // 公历
    const _gregorian = _year + '/' + _month + '/' + _day;
    // 农历
    const _lunar = this.lunarCalendar(idCard);
    // 农历年
    const _lunarYear = _lunar.substr(0, 4);
    return {
      gregorian: _gregorian,
      lunar: _lunar,
      year: _year,
      month: _month,
      day: _day,
      week_zh: this.week_zh(_year, _month, _day), // 星期几
      zodiac: this.zodiac(_month, _day), // 星座
      zodiac_zh: this.zodiac_zh(_lunarYear) // 生肖
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
    const IdCard = idCard.toString();
    if (/(^\d{17}$)/.test(IdCard)) {return IdCard + this.idCardEndNum(IdCard);}
    if (eReg.test(IdCard)) {return IdCard.slice(0, 17) + this.idCardEndNum(IdCard);}
  }
  // 15位转换18位
  num15to18(idCard) {
    const IdCard = idCard.toString();
    if (/(^\d{15}$)/.test(IdCard)) {return this.repairIdCard(IdCard.slice(0, 6) + '19' + IdCard.slice(6, 15));} else {return null}
  }
  /**
   * 地址信息解析
   * 地址信息返回格式
   * @return {object} {"address": "地址","provinces": "省/直辖市","citiy": "市","areas": "县/区","all": "省-市-县"}
   **/
  address_zh(idCard) {
    try {
      const IdCard = idCard.toString();
      const _addressId = IdCard.slice(0, 6);
      const _addressItem = dataAddress[_addressId];
      const { provinces, city, areas } = _addressItem;
      if (!_addressItem) {
        console.warn('warning => ', '未找到匹配数据');
        return null
      }
      const _all = (provinces + '-' + city + '-' + areas).replace('无-', '');
      return { ..._addressItem, all: _all }
    } catch (e) {
      console.warn(e);
      return null
    }
  }
  // 性别解析
  sex(idCard) {
    let IdCard = idCard.toString();
    if (IdCard.length === 15) {
      IdCard = this.num15to18(IdCard);
    }
    if (IdCard[16] % 2) {return '男';}
    return '女';
  }
  //
  getAddress_zh(idCard){
    try {
      const IdCard = idCard.toString();
      const _addressId = IdCard.slice(0, 6);
      const _addressItem = dataAddress[_addressId];
      const { provinces, city, areas } = _addressItem;
      if (!_addressItem) {
        console.warn('warning => ', '未找到匹配数据');
        return null
      }
      const _all = (provinces + '-' + city + '-' + areas).replace('无-', '');
      return { ..._addressItem, all: _all }
    } catch (e) {
      console.warn(e);
      return null
    }
  }
  // 性别解析
  getSex(idCard) {
    let IdCard = idCard.toString();
    if (IdCard.length === 15) {
      IdCard = this.num15to18(IdCard);
    }
    if (IdCard[16] % 2) {return '男';}
    return '女';
  }
  // 年龄
  getAge(idCard) {
    let returnAge
    const IdCard = idCard.toString();
    const _year = Number(IdCard.substr(6, 4));
    const _month = Number(IdCard.substr(10, 2));
    const _day = Number(IdCard.substr(12, 2));
    const d = new Date();
    const nowYear = d.getFullYear();
    const nowMonth = d.getMonth() + 1;
    const nowDay = d.getDate();
    if (nowYear === _year) {
      returnAge = 0;//同年 则为0岁
    } else {
      const ageDiff = nowYear - _year  // 年之差
      if (ageDiff > 0) {
        if (nowMonth === _month) {
          const dayDiff = nowDay - _day // 日之差
          if (dayDiff < 0) {
            returnAge = ageDiff - 1;
          } else {
            returnAge = ageDiff;
          }
        } else {
          const monthDiff = nowMonth - _month // 月之差
          if (monthDiff < 0) {
            returnAge = ageDiff - 1;
          } else {
            returnAge = ageDiff;
          }
        }
      } else {
        returnAge = -1; // 返回-1 表示出生日期输入错误 晚于今天
      }
    }
    return returnAge; // 返回周岁年龄
  }
  // 全部
  all(idCard) {
    return {
      endNum: this.idCardEndNum(idCard),
      birthDay: this.birthday(idCard),
      checked: this.checkIdCard(idCard),
      repairIdCard: this.repairIdCard(idCard),
      num15to18: this.num15to18(idCard),
      sex: this.getSex(idCard),
      age: this.getAge(idCard),
      address_zh: this.getAddress_zh(idCard),
      lunar: this.lunarCalendar(idCard)
    }
  }
}
module.exports = JsIdCardFull
