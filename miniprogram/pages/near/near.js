const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude: '',
    longitude: '',
    markers: [],
    users:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (!app.userInfo._id) {
      app.login()
    } else {
      this.getLocathon()
    }
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
  getLocathon() {
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
                    _that._getLocathon()
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
        _that._getLocathon()
      }
      else {
        //调用wx.getLocation的API
        _that._getLocathon()
      }
    })
  },
  _getLocathon() {
    wx.getLocation({
      isHighAccuracy: 'true'
    }).then(res => {
      this.setData({
        latitude: res.latitude,
        longitude: res.longitude
      }, _ => {
        db.collection('users').doc(app.userInfo._id).update({
          data: {
            latitude: res.latitude,
            longitude: res.longitude,
            location: db.Geo.Point(res.longitude, res.latitude),
          }
        }).then(res => {
          this.getNearUsers()
        })
      })
    })
  },
  getNearUsers() {
    db.collection('users').where({
      location: _.geoNear({
        geometry: db.Geo.Point(this.data.longitude, this.data.latitude),
        minDistance: 0,
        maxDistance: 5000000000000,
      }),
      isLocation: true
    }).field({
      longitude: true,
      latitude: true,
      userPhoto: true,
    }).get().then(res => {
      let resData = res.data
      let markers = []
      if (resData.length) {
        resData.forEach((item,i) => {
          markers.push({
            latitude: item.latitude,
            longitude: item.longitude,
            iconPath: item.userPhoto,
            width: 40,
            height: 40, 
            id: i
          })
        })
        this.setData({
          markers,
          users:resData
        })
      }
    })
  },
  //返回定位
  clickcontrol(e) {
    let mpCtx = wx.createMapContext("map");
    mpCtx.moveToLocation();
  },
  markertap(e){
    let url = this.data.users[e.detail.markerId]._id
    wx.navigateTo({
      url: '/pages/detail/detail?userid='+url,
    })
  }
})