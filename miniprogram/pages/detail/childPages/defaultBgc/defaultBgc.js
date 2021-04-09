// miniprogram/pages/detail/childPages/defaultBgc/defaultBgc.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    defaultBgc: [
      'cloud://miaomiao-4g7cakpsb385f98d.6d69-miaomiao-4g7cakpsb385f98d-1304687795/defBgc/def1.jpeg',
      'cloud://miaomiao-4g7cakpsb385f98d.6d69-miaomiao-4g7cakpsb385f98d-1304687795/defBgc/def2.jpeg',
      'cloud://miaomiao-4g7cakpsb385f98d.6d69-miaomiao-4g7cakpsb385f98d-1304687795/defBgc/def3.jpeg',
      'cloud://miaomiao-4g7cakpsb385f98d.6d69-miaomiao-4g7cakpsb385f98d-1304687795/defBgc/def4.jpeg',
      'cloud://miaomiao-4g7cakpsb385f98d.6d69-miaomiao-4g7cakpsb385f98d-1304687795/defBgc/def5.jpeg',
      'cloud://miaomiao-4g7cakpsb385f98d.6d69-miaomiao-4g7cakpsb385f98d-1304687795/defBgc/def6.jpeg',
    ],
    currentImage: '',
    isShow: false
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
  editBgc(e) {
    let { imgurl } = e.currentTarget.dataset
    this.setData({
      currentImage: imgurl,
      isShow: true
    })
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#000000'
    })
  },
  exitModel() {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#937bf5'
    })
    this.setData({
      isShow: false
    })
  },
  confirm() {
    //保存到数据库
    db.collection('users').doc(app.userInfo._id).update({
      data: {
        detailBgc: this.data.currentImage
      }
    }).then(res => {
      //然后上一级并改变背景
      let pages = getCurrentPages();
      let prevPage = pages[pages.length - 2]
      prevPage.setData({
        bgc: this.data.currentImage
      }, _ => {
        wx.navigateBack({
          delta: 0,
        })
      })
    })
  }
})