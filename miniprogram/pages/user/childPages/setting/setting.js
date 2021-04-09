// miniprogram/pages/user/childPages/setting/setting.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLocation: true,    //是否定位
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
  //是否开启位置共享
  switchChange(e) {
    if (!e.detail.value) {
      wx.showModal({
        content: '取消共享位置将无法在地图上查找到您,您确定要取消吗'
      }).then(res => {
        if (res.confirm) {
          const { value } = e.detail
          this.setData({
            isLocation: value
          })
          db.collection('users').doc(app.userInfo._id).update({
            data: {
              isLocation: value
            }
          })
        } else {
          this.setData({
            isLocation: true
          })
        }
      })
    } else {
      const { value } = e.detail
      this.setData({
        isLocation: value
      })
      db.collection('users').doc(app.userInfo._id).update({
        data: {
          isLocation: value
        }
      })
    }
  },
})