# IdCard - 身份证的工具库
----

## 安装
###### yarn
`yarn add js-idcard-full -S`
###### npm
`npm install js-idcard-full -S`

## 使用
```
# require
const IdCard = require('js-idcard-full') 
# import
import JsIdCardFull = require('js-idcard-full')
```

####方法列表

----

### IdCard.EndNum(IdCard)
返回根据前17位数算出来的第18位

##### 参数说明
- @param {String} IdCard 身份证号码

##### 返回数据
`{Number}`

----

### IdCard.birthday(IdCard)
返回计算出来的星期几,星座,生肖

##### 参数说明
- @param {String} IdCard 身份证号码

##### 返回数据
```
{
  gregorian: '2014/2/2', // 公历日期
  lunar: '2013/3/3', // 对应的农历日期
  year: 2001, // 公历年
  month: '01', // 公历月
  day: '01', // 公历日
  week: '星期一', // 星期几
  zodiac: '天秤座',  // 星座
  zodiac_zh: '龙'  // 农历生肖
}
```
----

### IdCard.checkIdCard(IdCard)
返回验证身份证号是否正确

##### 参数说明
- @param {String} IdCard 身份证号码

##### 返回数据
```
{Boolean}
```

---

### IdCard.repairIdCard(IdCard)
返回补全身份证号

##### 参数说明
- @param {String} IdCard 身份证号码 18位活着残缺的17位

##### 返回数据
`{Number}`

---

### IdCard.num15to18(IdCard)
返回15位转换18位后的身份证号码


##### 参数说明
- @param {String} IdCard 身份证号码 15位

##### 返回数据
`{Number}`

---

### IdCard.sex(IdCard)
返回性别 男或女
##### 参数说明
- @param {String} IdCard 身份证号码
##### 返回数据
`{String}男或女`

---

### IdCard.nong(date)
返回性别 农历日期
##### 参数说明
- @param {String} date 日期 2016/01/01
##### 返回数据
`{String}农历日期`

---

### IdCard.address(IdCard)
返回 地址信息
##### 参数说明
- @param {String} IdCard 身份证号码
##### 返回数据
```json
{
  "address": "地址",
  "provinces": "省/直辖市",
  "city": "市",
  "areas": "县/区",
  "all": "省-市-县"
}
```

---

### IdCard.all(IdCard)
返回 全部解析的数据
##### 参数说明
- @param {String} IdCard 身份证号码
##### 返回数据
```js
return {
  endNum: 6,
  birthDay: {
    gregorian: '2014/2/2', // 公历日期
    lunar: '2013/3/3', // 对应的农历日期
    year: 2001, // 公历年
    month: '01', // 公历月
    day: '01', // 公历日
    week: '星期一', // 星期几
    zodiac: '天秤座',  // 星座
    zodiac_zh: '龙'  // 农历生肖
  },
  checked: true,
  address: {
    address: '北京市平谷县',
    provinces: '北京市',
    citiy: '无',
    areas: '平谷县',
    all: '北京市-平谷县'
  },
  sex: '男'
}
```
