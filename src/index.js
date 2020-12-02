const node_constellation = require('node-constellation');
const chineseLunar = require('chinese-lunar');
const dataAddress = require('./data/data.json');
//
const reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
// 字典
const dict = {
  week: function(year, month, date) {
    const i = new Date(year, month - 1, date).getUTCDay();
    const day = {
      0: '星期一',
      1: '星期二',
      2: '星期三',
      3: '星期四',
      4: '星期五',
      5: '星期六',
      6: '星期天'
    }
    return day[i]
  },
  zodiac_zh: function(year) {
    const arr = '鼠牛虎兔龙蛇马羊猴鸡狗猪';
    year = year % 12 - 4
    if (year < 0) year += 12
    return arr[year]
  },
  zodiac: function(month, date) {
    try {
      // eslint-disable-next-line eqeqeq
      if (month !== undefined && date !== undefined) return node_constellation(month, date, 'zh-cn')
      if (date === undefined && month !== undefined) {
        if (month.length === 4) return node_constellation(month.substr(0, 2), month.substr(2, 2), 'zh-cn')
        month = month.split(/[\/\\\-]/)
        return node_constellation(month[0], month[1], 'zh-cn')
      }
    } catch (err) {
      return '出错' + month + date
    }
  }
};
// 计算最后一位应该是多少
function idCardEndNum(idCard) {
  idCard = idCard.toString()
  var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
  var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
  var sum = 0;
  var ai = 0;
  var wi = 0;
  for (var i = 0; i < 17; i++) {
    ai = idCard[i];
    wi = factor[i];
    sum += ai * wi;
  }
  return parity[sum % 11];
}
// 农历转换
function Nong(birday) {
  const bir = birday.split(/[\/\\\-]/)
  const birthday = bir.slice(0, 4) + '/' + bir.slice(4, 6) + '/' + bir.slice(6, 8)
  const nong = new Date(birthday)
  try {
    const lunar = chineseLunar.solarToLunar(nong)
    return lunar.year + '/' + lunar.month + '/' + lunar.day
  } catch (err) {
    return '时间错误'
  }
}
// 解析生日信息
function birthDay(idCard) {
  idCard = idCard.toString()
  // let birthday, month, day, nong, year, nongyear;
  const year = idCard.substr(6, 4);
  const month = idCard.substr(10, 2);
  const day = idCard.substr(12, 2);
  const birthday = year + '/' + month + '/' + day;
  const nong = Nong(birthday);
  const nongyear = nong.substr(0, 4)
  return {
    date: birthday,
    nong: nong,
    year: year,
    month: month,
    day: day,
    week: dict.week(year, month, day), // 星期几
    zodiac: dict.zodiac(month, day), // 星座
    zodiac_zh: dict.zodiac_zh(nongyear) // 生肖
  };
}
// 验证身份证号是否正确
function checkIdCard(idCard) {
  // /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  // /// 15 位
  // let reg15 = /^[1-9]\d{5}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}$/;
  const idcard = idCard.toString();
  let ereg = reg;
  switch (idcard.length) {
    case 15:
      if ((parseInt(idcard.substr(6, 2)) + 1900) % 4 === 0 || ((parseInt(idcard.substr(6, 2)) + 1900) % 100 === 0 && (parseInt(idcard.substr(6, 2)) + 1900) % 4 === 0)) {
        ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}$/;// 测试出生日期的合法性
      } else {
        ereg = /^[1-9][0-9]{5}[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}$/;// 测试出生日期的合法性
      }
      break;
    case 18:
      // 18位身份号码检测
      // 出生日期的合法性检查
      // 闰年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))
      // 平年月日:((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))
      if (parseInt(idcard.substr(6, 4)) % 4 === 0 || (parseInt(idcard.substr(6, 4)) % 100 === 0 && parseInt(idcard.substr(6, 4)) % 4 === 0)) {
        ereg = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|[1-2][0-9]))[0-9]{3}[0-9Xx]$/;// 闰年出生日期的合法性正则表达式
      } else {
        ereg = /^[1-9][0-9]{5}(19|20)[0-9]{2}((01|03|05|07|08|10|12)(0[1-9]|[1-2][0-9]|3[0-1])|(04|06|09|11)(0[1-9]|[1-2][0-9]|30)|02(0[1-9]|1[0-9]|2[0-8]))[0-9]{3}[0-9Xx]$/;// 平年出生日期的合法性正则表达式
      }
      break;
  }
  console.log(ereg.test(idcard), idcard[17]);
  console.log(idCardEndNum(idcard));
  return ereg.test(idcard) && String(idCardEndNum(idcard)) === idcard[17].toUpperCase().toString();
}
// 补全身份证号
function repairIdCard(idCard) {
  idCard = idCard.toString()
  if (/(^\d{17}$)/.test(idCard)) return idCard + idCardEndNum(idCard)
  if (reg.test(idCard)) return idCard.slice(0, 17) + idCardEndNum(idCard)
}
// 15位转换18位
function num15to18(idCard) {
  idCard = idCard.toString()
  if (/(^\d{15}$)/.test(idCard)) return repairIdCard(idCard.slice(0, 6) + '19' + idCard.slice(6, 15))
}
// 地址信息解析
function address(idCard) {
  idCard = idCard.toString()
  var addressId = idCard.slice(0, 6)
  var data = dataAddress[addressId]
  if (data === undefined) {
    console.log(idCard)
    return '未找到'
  }
  data.all = (data.provinces + '-' + data.citiy + '-' + data.areas).replace('无', '')
  return data
}
/**
 * 地址信息返回格式
 * {
 *    "address": "地址",
 *    "provinces": "省/直辖市",
 *    "citiy": "市",
 *    "areas": "县/区",
 *    "all": "省-市-县"
 * }
 ***/
// 性别解析
function sex(idCard) {
  idCard = idCard.toString()
  if (idCard.length === 15) {
    idCard = num15to18(idCard)
  }
  if (idCard[16] % 2) return '男';
  return '女'
}
module.exports = {
  endNum: idCardEndNum,
  birthDay: birthDay,
  checkIdCard: checkIdCard,
  repairIdCard: repairIdCard,
  num15to18: num15to18,
  sex: sex,
  address: address,
  nong: Nong,
  all: (idCard) => {
    return {
      endNum: idCardEndNum(idCard),
      birthDay: birthDay(idCard),
      checkIdCard: checkIdCard(idCard),
      address: address(idCard),
      sex: sex(idCard)
    }
  }
}
