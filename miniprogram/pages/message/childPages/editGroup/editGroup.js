// miniprogram/pages/message/childPages/editGroup/editGroup.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    value: '',
    photo: [],
    title: '',
    describe: '',
    groupid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { value, title, describe, photo, groupid } = options
    this.setData({
      value, title, describe, groupid,
      photo: photo.split(',')
    })
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
  handleChangs(e) {
    let val = e.detail.value.trim()
    this.data.value = val
    wx.showLoading({ title: 'loding···' })
    db.collection('chat_group').where({
      _id: this.data.groupid
    }).update({
      data:{
        name:val
      }
    }).then(res=>{
      if(res.stats.updated == 1){
        this.sendChatMsg(val)
      }
    }).catch(err=>{
      console.log(err);
    })
  },
  sendChatMsg(name) {
    let time = new Date()
    let timeTs = Date.now()
    const doc = {
      _id: `${Math.random()}_${timeTs}`,
      groupId: this.data.groupid,
      msgType: 'sys',
      textContent: '修改群名为' + name,
      sendTime: time,
      sendTimeTS: timeTs, // fallback
      creatorName: getApp().userInfo.nickName
    }
    db.collection('chat_msg').add({
      data: doc
    }).then(res => {
      console.log(res);
      this.updateSysMsg('修改群名为"' + this.data.value + '"', time, timeTs)
    })
  },
  updateSysMsg(text, time, timeTs) {
    db.collection('sys_msg').where({
      type: 2,
      groupId: this.data.groupid
    }).update({
      data: {
        title: this.data.value,
        content: text,
        time: time,
        sendTimeTS: timeTs,
        childType: 'chat_sys',
        creator:app.userInfo
      }
    }).then(res => {
      wx.hideLoading({})
      const pages = getCurrentPages()
      //群信息页
      let prepages = pages[pages.length - 2]
      prepages.setGroupName(this.data.value)

      //群聊天页
      let chatPages = pages[pages.length - 3]
      chatPages.setNavTitle(this.data.value)
      wx.navigateBack({
        delta: 1,
      })
    })
  }

})