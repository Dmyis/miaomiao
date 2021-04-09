// miniprogram/pages/user/childPages/editUserInfo/editUserInfo.js
const app = getApp()
const db = wx.cloud.database()
var QQMapWX = require('../../../../libs/qqmap-wx-jssdk1.2/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userPhoto: '',  //头像
    nickName: '',   //姓名
    phoneNumber: '',   //手机号
    signature: '',     //个性签名
    weixinNumber: '',  //微信号
    modelIsShow: false,    //修改框是否显示
    editCurrentInfo: '',     //修改框顶部信息
    disabled: true,         //未修改就不能确定
    oldVal: '',                 //旧值
    iptVal: '',               //新值
    sex: '男',        //性别
    age: '',       //年龄
    birthday: '',  //生日
    newDate: new Date().getUTCFullYear() + "-" + Number(new Date().getMonth() + 1) + '-' + new Date().getDate(),
    detailBgc: '',  //背景图片
    constellation: '',    //星座
    date: '',
    region: ['北京市', '北京市', '东城区'], //所在地
    regionIsLoding: false,       //定位过程加载
    mailbox: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 实例化腾讯地图定位API
    qqmapsdk = new QQMapWX({
      key: 'CCQBZ-TPPWK-5BLJ5-A75TJ-6JVST-NGB2J'
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let userInfo = app.userInfo
    let { userPhoto, nickName, phoneNumber, signature,
      weixinNumber, sex, age, birthday,
      detailBgc, constellation, region, mailbox } = userInfo
    this.setData({
      userPhoto, nickName, phoneNumber, signature, weixinNumber
      , sex, age, birthday, detailBgc, constellation, region, mailbox
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },
  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //查看头像
  handleBrowse(e) {
    const { url } = e.target.dataset
    wx.previewImage({
      urls: [url]
    })
  },
  // 修改头像
  changePhoto() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera']
    }).then(res => {
      this.setData({
        userPhoto: res.tempFilePaths[0]
      }, () => {
        wx.showLoading({ title: '上传中···' })
        let cloudPath = "userPhoto/" + app.userInfo._openid + Date.now() + ".jpg";
        wx.cloud.uploadFile({
          cloudPath,
          filePath: this.data.userPhoto
        }).then(res => {
          if (res.fileID) {
            db.collection('users').doc(app.userInfo._id).update({
              data: { 
                userPhoto: res.fileID
              }
            }).then(res => {
              wx.hideLoading()
              wx.showToast({
                title: '上传成功',
              })
            })
          }
        })
      })

    })

  },
  //修改性别
  bindPickerChange(e) {
    let { value } = e.detail
    if (value == 0) {
      this.setData({
        sex: '男'
      }, _ => { this.updateDB(this.data.sex) })
    } else {
      this.setData({
        sex: '女'
      }, _ => { this.updateDB(this.data.sex) })
    }

  },
  //修改生日
  bindDateChange(e) {
    this.setData({
      birthday: e.detail.value
    }, _ => {
      this.updateDB(this.data.birthday)
      let age = Number(this.data.newDate.substring(0, 4) - this.data.birthday.substring(0, 4))
      let date = Number(e.detail.value.substring(5).replace('-', ''))
      let constellation = this.constellation(date)
      this.setData({ age, constellation, date }, _ => {
        this.updateDB(this.data.age)
        this.updateDB(this.data.constellation)
      })
    })
  },
  //修改所在地
  bindRegionChange(e) {
    let { value } = e.detail
    this.setData({
      region: value,
      disabled: false
    })
  },
  //获取定位
  handleLocation() {
    let _that = this
    wx.getSetting().then(res => {
      let userLocation = res.authSetting['scope.userLocation']
      if (userLocation != undefined && userLocation != true) {
        wx.showModal({
          title: '请求授权当前位置',
          content: '需要获取您的地理位置，请确认授权',
          success(res) {
            if (res.cancel) {
              wx.showToast({
                title: '拒绝授权',
                icon: 'none',
                duration: 1000
              })
            } else if (res.confirm) {
              wx.openSetting({
                success(dataAu) {
                  if (dataAu.authSetting["scope.userLocation"] == true) {
                    wx.showToast({
                      title: '授权成功',
                      icon: 'success',
                      duration: 1000
                    })
                    //再次授权，调用wx.getLocation的API
                    _that.getToLocation()
                  } else {
                    wx.showToast({
                      title: '授权失败',
                      icon: 'none',
                      duration: 1000
                    })
                  }
                }
              })
            }
          }
        })
      } else if (userLocation == undefined) {
        _that.getToLocation()
      }
      else {
        //调用wx.getLocation的API
        _that.getToLocation()
      }
    })
  },
  //获取经纬度
  getToLocation() {
    this.setData({
      regionIsLoding: true
    })
    let _that = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        _that.getLocal(res.latitude, res.longitude)
        //保存经纬度
        db.collection('users').doc(app.userInfo._id).update({
          data:{
            latitude:res.latitude,
            longitude:res.longitude
          }
        })
      },
      fail(res) {
        console.log('fail' + JSON.stringify(res))
      }
    })
  },
  //获取当前地理位置
  getLocal(latitude, longitude) {
    let vm = this
    qqmapsdk.reverseGeocoder({
      location: {
        latitude, longitude
      },
      success(res) {
        let address = res.result['address_component']
        let region = [address.province, address.city, address.district]
        vm.setData({
          region,
          disabled: false,
          regionIsLoding: false
        })
      },
      fail(err) {
        console.log(err);
      }
    })
  },
  //弹出修改框
  editInfo(e) {
    const { name, ipt } = e.currentTarget.dataset
    this.setData({
      modelIsShow: true,
      editCurrentInfo: name,
      iptVal: ipt
    })
  },
  //关闭修改窗
  exitModel() {
    this.setData({
      modelIsShow: false,
      disabled: true
    })
  },
  //确定修改
  confirmInfo() {
    const current = this.data.editCurrentInfo
    const iptVal = this.data.iptVal
    if (current == '名字') {
      if (iptVal.length > 6) {
        return wx.showToast({ icon: 'none', duration: 2000, title: '不能超出六个字' })
      }
      this.setData({ nickName: iptVal })
    } else if (current == '个性签名') {
      this.setData({ signature: iptVal })
    } else if (current == '电话号码') {
      if (iptVal.length !== 11) {
        return wx.showToast({ icon: 'none', duration: 2000, title: '请输入合法电话' })
      }
      this.setData({ phoneNumber: iptVal })
    } else if (current == '微信号') {
      var reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
      if (reg.test(iptVal)) {
        return wx.showToast({ icon: 'none', duration: 2000, title: '不能含有汉字' })
      }
      if (iptVal.length > 15) {
        return wx.showToast({ icon: 'none', duration: 2000, title: '最长十五个字符' })
      }
      this.setData({ weixinNumber: iptVal })
    } else if (current == '所在区') {
    } else if (current == '邮箱') {
      let re = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/;
      if (!re.test(iptVal)) {
        return wx.showToast({
          title: '请输入合法邮箱',
          icon: 'none'
        })
      }
      this.setData({ mailbox: iptVal })
    }
    this.updateDB(current)
  },
  //保存旧值
  iptFocus(e) {
    this.setData({
      oldVal: e.detail.value
    })
  },
  //监听文本框修改
  changeIpt(e) {
    const val = e.detail.value
    //判断是否修改值
    if (this.data.oldVal !== val) {
      this.setData({ disabled: false, iptVal: val })
    } else {
      this.setData({ disabled: true, iptVal: val })
    }
  },
  //判断星座
  constellation(number) {
    if (number >= 321 && number <= 419) {
      return '白羊座'
    } else if (number >= 420 && number <= 520) {
      return '金牛座'
    } else if (number >= 521 && number <= 621) {
      return '双子座'
    } else if (number >= 622 && number <= 722) {
      return '巨蟹座'
    } else if (number >= 723 && number <= 822) {
      return '狮子座'
    } else if (number >= 823 && number <= 922) {
      return '处女座'
    } else if (number >= 923 && number <= 1023) {
      return '天秤座'
    } else if (number >= 1024 && number <= 1122) {
      return '天蝎座'
    } else if (number >= 1123 && number <= 1221) {
      return '射手座'
    } else if (number >= 1222 && number <= 1231 || number >= 101 && number <= 119) {
      return '摩羯座'
    } else if (number >= 120 && number <= 218) {
      return '水平座'
    } else if (number >= 219 && number <= 320) {
      return '双鱼座'
    }
  },
  // 更新数据库
  updateDB(current) {
    var data = ''
    wx.showLoading({
      title: '更新中',
    })
    if (current == '名字') {
      data = 'nickName'
    } else if (current == '个性签名') {
      data = 'signature'
    } else if (current == '电话号码') {
      data = 'phoneNumber'
    } else if (current == '男' || current == '女') {
      data = 'sex'
    } else if (current == '微信号') {
      data = 'weixinNumber'
    } else if (/^[0-9]{4}-[0-1]?[0-9]{1}-[0-3]?[0-9]{1}$/.test(current)) {
      data = 'birthday'
    } else if (typeof (current) == 'number') {
      data = "age"
    } else if (current == this.constellation(this.data.date)) {
      data = 'constellation'
    } else if (current == '所在地') {
      data = 'region'
    } else if (current == '邮箱') {
      data = 'mailbox'
    }

    db.collection('users').doc(app.userInfo._id).update({
      data: {
        [data]: this.data[data]
      }
    }).then(res => {
      wx.hideLoading()
      wx.showToast({
        title: '更新成功',
      })
      this.exitModel()
    })

  },
})