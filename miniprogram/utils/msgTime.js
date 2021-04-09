module.exports = (time) => {
  const newTime = new Date()
  let newYear = newTime.getFullYear()
  let newMonth = newTime.getMonth() + 1
  let newDay = newTime.getDate()

  let year = time.getFullYear()
  let month = time.getMonth() + 1
  let day = time.getDate()
  let week = time.getDay()
  let s = `0${time.getHours()}`.substr(-2)
  let f =  `0${time.getMinutes()}`.substr(-2)
  let ti = `${s}:${f}`
  //消息大于七天
  if (newYear > year || newYear == year && newMonth > month || newYear == year && newMonth == month && newDay - day > 7) {
    return `${year}/${month}/${day}`
  }else if (newYear == year && newMonth == month && newDay == day) {
    //消息等于今天,显示时间
    return ti
  } else if (newYear == year && newMonth == month && newDay - day <= 7) {
    //消息小于七天，显示星期
    return `星期${week}`
  }
}