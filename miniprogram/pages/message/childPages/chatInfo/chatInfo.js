// miniprogram/pages/message/childPages/chatInfo/chatInfi.js
const db = wx.cloud.database()
const app = getApp()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    groupInfo: null,
    membersMap: {},
    chatType: 1,
    keepMail: false,
    showUserName: false,

    disturb: false,
    top: false,
    remind: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      chatType: options.chatType
    })
    this.getUserInfo(options.groupId)
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
  getUserInfo(id) {
    db.collection("chat_group").where({
      _id: id
    }).get().then(res => {
      this.setData({
        groupInfo: res.data[0]
      })
      //判断单聊还是群聊
      if (this.data.chatType == 1) {
        let chat_members = res.data[0].chat_members.filter(e => e != app.userInfo._openid)
        this.getMemberInfo(chat_members)
      } else if (this.data.chatType == 2) {
        this.getMemberInfo(res.data[0].chat_members)
      }
    })
  },
  getMemberInfo(ids) {
    db.collection('users').where({
      _openid: _.in(ids)
    }).field({
      userPhoto: true,
      nickName: true,
      _openid: true
    }).get().then(res => {
      //使用_.in()来获取数据会将数据颠倒，下面使用reverse方法恢复
      this.setData({
        membersMap: res.data.reverse(),
        loading: false
      })
    })
  },
  navDetail(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '../../../detail/detail?userid=' + id,
    })
  },
  setGroupName(name) {
    this.data.groupInfo.name = name
    this.setData({
      groupInfo: this.data.groupInfo
    })
  },
  //修改群名
  changeGroupInfo() {
    let groupMaster = this.data.groupInfo._openid
    let userOpenId = app.userInfo._openid
    if (groupMaster != userOpenId) {
      wx.showModal({
        confirmText: '知道了',
        content: '只有群主或管理员才能修改群名。',
        showCancel: false,
        title: '提示',
      })
      return
    }
    let value = ''
    if (this.data.groupInfo.name) {
      value = this.data.groupInfo.name
    } else {
      value = ""
    }
    let photos = []
    this.data.membersMap.map(e => {
      photos.push(e.userPhoto)
    })
    wx.navigateTo({
      url: '../editGroup/editGroup?value=' + value + '&groupid=' + this.data.groupInfo._id +
        '&title=修改群聊名称&describe=修改群聊名称后，将在群内通知其他成员。&photo=' + photos,
    })
    /**
     * 1.修改群名
     *    chat_group
     *     where groupid
     *     update name
     * 2.修改成功后,发送一条系统信息 '谁修改了群名'name
     *     let time = new Date()
            let timeTs = Date.now()
            const doc = {
              _id: `${Math.random()}_${timeTs}`,
              groupId: groupId,
              msgType: 'sys',
              textContent: '谁修改群名为name',
              sendTime: time,
              sendTimeTS: timeTs, // fallback
              creatorName: app.userInfo.nickName
        }
        db.collection('chat_msg').add({
          data: doc
        })
        
        3.发送系统信息成功后,显示到消息列表上
          sys_msg 
          where groupid type
          update
           updateSysMsg(text,time,timeTs){
            db.collection('sys_msg').where({
              type: this.data.chatType,
              groupId: this.data.groupId
            }).update({
              data: {
                content: text,
                time: time,
                creator:getApp().userInfo,
                sendTimeTS: timeTs,
                unreadNumber:1,
                unreadCount: this.data.userId,
                childType:''
              }
            })
     */
  },
  //添加群成员
  clickMemberAdd() {
    let memberIds = this.data.membersMap.map(e => e._openid)
    memberIds = JSON.stringify(memberIds)
    wx.navigateTo({
      url: '../../../index/childPages/groupChat/create?type=1&groupId=' +
        this.data.groupInfo._id + '&memberIds=' + encodeURIComponent(memberIds),
    })
  },
  //删除群成员
  clickMemberDelete() {
    let memberIds = this.data.membersMap.map(e => e._openid)
    wx.navigateTo({
      url: '../../../index/childPages/groupChat/create?type=2&groupId=' +
      this.data.groupInfo._id + '&memberIds=' + memberIds,
    })
  }
  /**
   * 群成员的添加，删除，删除并退出
   * 只能群主才能删除，所有用户都能添加
   * 1.添加成员
   *   聊天信息(消息列表中消息内容一致)：
   *      邀请人显示   您    邀请   被邀请人 加入群聊
   *      被邀请人显示 邀请人 邀请   您      加入群聊
   *      其他人显示   邀请人 邀请  被邀请人  加入群聊
   *   修改群聊人数
   *      chat_group
   *      where groupid 
   *      update chat_members
   *      
   *      发送系统聊天信息
   *      修改系统信息列表消息
   *  
   *    邀请多人的时候，系统聊天消息，显示 邀请人 邀请 多人昵称组合加入群聊
   * 
   * 2.删除成员
   *  注：只有群主才能删除成员
   *   聊天信息(消息列表中消息内容一致)：
   *      群主显示   您  将  被删除人 移除群聊
   *      被删除人显示 群主 将  您    移除群聊
   *   修改群聊人数
   *      chat_group
   *      where groupid 
   *      update chat_members
   *      
   *      发送系统聊天信息
   *      修改系统信息列表消息
   *  
   *    移除多人的时候，系统聊天消息，显示 群主 将 多人昵称组合移除群聊
   *    消息列表同上（其他人显示被删除之前的消息）
   *    
   * 3.删除并退出
   *   聊天信息
   *      群主显示  退出人 退出群聊
   *      其他人不显示
   *   修改群聊人数
   *      chat_group
   *      where groupid
   *       update chat_members
   *   发送系统聊天信息
   *   除群主外不发送
   *   
   *   群主消息列表  
   * 
   */
})