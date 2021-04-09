// miniprogram/pages/detail/childPages/customBgc/customBgc.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
  album() {
    this.chImg('album')
  },
  takePhoto() {
    this.chImg('camera')
  },
  chImg(mode) {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: [mode],
      success(res) {
        wx.showLoading()
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePath = res.tempFilePaths[0]
        let cloudPath = "customBgc/" + app.userInfo._openid + Date.now() + ".jpg";
        wx.cloud.uploadFile({
          cloudPath,
          filePath: tempFilePath
        }).then(res => {
          //保存到数据库
          db.collection('users').doc(app.userInfo._id).update({
            data: {
              detailBgc: res.fileID
            }
          }).then(_=> {
            //然后上一级并改变背景
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2]
            prevPage.setData({
              bgc: tempFilePath
            }, _ => {
              wx.navigateBack({
                delta: 0,
              })
              wx.hideLoading()
            })

          })
        })
      }
    })
  }
})