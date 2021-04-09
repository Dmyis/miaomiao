// miniprogram/pages/index/childPages/groupChat/create.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    member: 0,
    userPhotos:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.userPhotos.push(app.userInfo.userPhoto)
    /**
     * 创建群聊分析
     *  1.创建群聊,区分单聊还是群聊
     *    chat_group
     *      type: 1单聊 2群聊
     *      chat_members [选中好友的openid数组]
     *  2.创建成功后,会像聊天中发送一条系统聊天信息（谁 发起群聊）
     *    chat_msg
     *      msgType:'sys'
     *      creatorName: 发起群聊用户的昵称
     *  3.消息列表中添加群聊消息
     *     sys_msg
     *      type: 2群聊消息
     *      content：'发起群聊'  
     *      creator：当前发起群聊的用户
     *      childType：'chat_sys' 判断系统聊天信息(暂时只有创建群聊时才有）
     *   4.跳转聊天页面时传递参数 chatType 1.单聊，2.群聊
     *    detail.js   chatType=1
     *     message.js
     *       点击消息列表中消息条目
     *          根据msg.type  获取聊天消息类型
     *          chatType=msg.type
     *       title 群聊(群聊成员的数量)
     *     create.js
     *        chatType=2
     *    5.接收参数
     *      room.js
     *      chatRoom.js
     *      
     */
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
  handleSelect(e) {
    var member = this.data.member
    var userPhotos =  this.data.userPhotos
    let friendCpn = this.selectComponent('.friendList')
    let list = friendCpn.data.friendList
    let { item, index, subindex } = e.detail.item
    let subItem = list[index].subItems[subindex]
    if (item.checked) {
      subItem.checked = false
      member -= 1
      //取消头像
      userPhotos = userPhotos.filter(i=>{
        return i!=subItem.userPhoto
      })
    } else {
      subItem.checked = true
      member += 1
      //保存头像
      userPhotos.push(subItem.userPhoto)
    }
    //最多9个头像
    if(userPhotos.length>9){
      userPhotos = userPhotos.slice(0,10)
    }
    this.setData({ member })
    this.data.userPhotos = userPhotos
    friendCpn.initList(list)
  },
  confirm() {
    let ids = []
    ids.push(app.userInfo._openid)
    var title = app.userInfo.nickName + '`'
    let friendCpn = this.selectComponent('.friendList')
    friendCpn.data.friendList.forEach(e => {
      e.subItems.forEach(item => {
        if (item.checked) {
          ids.push(item.openid)
          title = title + item.name + '`'
        }
      })
    });
    title = title.substring(0, title.length - 1)
    //1.创建群聊 
    db.collection('chat_group').add({
      data: {
        type: 2,
        chat_member: ids
      }
    }).then(res => {
      let groupId = res._id
      //  *  2.创建成功后,会像聊天中发送一条系统聊天信息（谁 发起群聊）
      let time = new Date()
      let timeTs = Date.now()
      const doc = {
        _id: `${Math.random()}_${timeTs}`,
        groupId: groupId,
        msgType: 'sys',
        textContent: '发起群聊',
        sendTime: time,
        sendTimeTS: timeTs, // fallback
        creatorName: app.userInfo.nickName
      }
      db.collection('chat_msg').add({
        data: doc
      }).then(res => {
        this.addSysMsg('发起群聊', time, timeTs, groupId, ids, title)
      })
    })
  },
  addSysMsg(text, time, timeTs, groupId, ids, title) {
    db.collection('sys_msg').add({
      data: {
        type: 2,
        groupId: groupId,
        userIds: ids,
        icon:this.data.userPhotos,
        title: title,
        content: text,
        time: time,
        sendTimeTS: timeTs,
        unreadNumber: 1,
        creator: app.userInfo,
        childType: 'chat_sys'
      }
    }).then(res => {
      console.log('add msg success', res);
      wx.navigateTo({
        url: '../../../im/room/room?nickName' + title +
          '&groupId=' +groupId + '&chatType=2'
      })
    })
  },
})