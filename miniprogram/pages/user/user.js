// miniprogram/pages/user/user.js
const app = getApp()
const db = wx.cloud.database();
let watcher = null
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userPhoto: "../../images/user/user-unlogin.png",
    nickName: "小喵喵",
    logged: false,
    maskIsShow: false,
    disabled: true,
    id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getMessage()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  //刷新自动登录
  onReady: function () {
    this.autoLogin()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.autoLogin()
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
    if (watcher !== null) {
      watcher.close()
    }
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
  //保存用户信息
  bindGetUserInfo(ev) {
    const { userInfo } = ev.detail
    if (!this.data.logged && userInfo) {
      // 连接云数据库users表add添加数据
      db.collection('users').add({
        data: {
          userPhoto: userInfo.avatarUrl,
          nickName: userInfo.nickName,
          signature: '',
          phoneNumber: '',
          weixinNumber: '',
          isLocation: true,
          isNewUser: true,
          links: 0,
          time: new Date(),
          friendList: [],
          handleMessage: [],
          age: '0',
          sex: '男',
          birthday: '0000-0-0',
          detailBgc: 'cloud://miaomiao-4g7cakpsb385f98d.6d69-miaomiao-4g7cakpsb385f98d-1304687795/defBgc/def1.jpeg',
          constellation: '',
          region: ['北京市', '北京市', '东城区'],
          latitude: '',
          longitude: '',
          mailbox: ''
        }
      }).then(res => {
        // 查询数据库
        db.collection('users').doc(res._id).get().then(res => {
          //把数据存到userInfo里面
          app.userInfo = Object.assign(app.userInfo, res.data)
          //更新数据         
          this.setData({
            userPhoto: app.userInfo.userPhoto,
            nickName: app.userInfo.nickName,
            maskIsShow: app.userInfo.isNewUser,
            logged: true,
            id: app.userInfo._id
          })
        })
      })
    }
  },
  autoLogin() {
    //调用登录(login  )云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {}
    }).then(res => {
      //根据_openid查询数据库
      db.collection('users').where({
        _openid: res.result.openid
      }).get().then(res => {
        if (res.data.length) {
          app.userInfo = Object.assign(app.userInfo, res.data[0])
          this.setData({
            userPhoto: app.userInfo.userPhoto,
            nickName: app.userInfo.nickName,
            logged: true,
            maskIsShow: app.userInfo.isNewUser,
            id: app.userInfo._id,
          })
        } else {
          this.setData({
            disabled: false
          })
        }
      })
    })
  },
  getMessage() {
    //实时监听数据库改变添加好友信息
    watcher = db.collection('message').where({
      userId: app.userInfo._id
    }).watch({
      onChange: snapshot => {
        if (snapshot.docs.length && snapshot.docChanges[0].doc.list.length) {
          let list = snapshot.docChanges[0].doc.list
          wx.showTabBarRedDot({
            index: 2,
          })
          app.globalData.newFriends = list
        } else {
          wx.hideTabBarRedDot({
            index: 2,
          })
          app.globalData.newFriends = []
        }
      },
      onError(err) {
        console.log(err);
      }
    })
  },
})