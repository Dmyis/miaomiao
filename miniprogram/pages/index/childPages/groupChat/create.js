// miniprogram/pages/index/childPages/groupChat/create.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    member: 0,
    userPhotos: [],
    title: "",
    groupId: '',
    type: 9, //0:默认值 发起群聊  1:添加群成员  2:删除群成员
    memberIds: [], //添加群成员时,从群聊页传过来的群成员id
    invitees: []   //被邀请者信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let { type, memberIds, groupId } = options
    if (type == 0) {
      this.setData({
        type: 0,
        title: '发起群聊'
      })
    } else if (type == 1) {
      this.setData({
        type: 1,
        title: '选择联系人',
        groupId,
        memberIds: JSON.parse(decodeURIComponent(memberIds))
      })
    } else if (type == 2) {
      this.setData({
        type: 2,
        title: '删除成员',
        groupId,
        memberIds: JSON.parse(decodeURIComponent(memberIds))
      })
    }
    wx.setNavigationBarTitle({
      title: this.data.title,
    })
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
    var { member, userPhotos, invitees } = this.data
    let friendCpn = this.selectComponent('.friendList')
    let list = friendCpn.data.friendList
    let { item, index, subindex } = e.detail.item
    let subItem = list[index].subItems[subindex]
    if (item.checked) {
      subItem.checked = false
      member -= 1
      //取消头像
      userPhotos = userPhotos.filter(i => {
        return i != subItem.userPhoto
      })
      //昵称
      invitees = invitees.filter(i => i != subItem.name)
    } else {
      subItem.checked = true
      member += 1
      //保存头像
      userPhotos.push(subItem.userPhoto)
      invitees.push(subItem.name)
    }
    //最多9个头像
    if (userPhotos.length > 9) {
      userPhotos = userPhotos.slice(0, 10)
    }
    this.setData({ member })
    this.data.userPhotos = userPhotos
    this.data.invitees = invitees
    friendCpn.initList(list)
  },
  //点击完成按钮
  confirm() {
    let type = this.data.type
    if (type == 0) {
      this.createGroup()
    } else if (type == 1) {
      this.addGroupMember()
    } else if (type == 2) {
      this.deleteGroupMember()
    }
  },

  //创建群聊方法
  createGroup() {
    let ids = []
    //加上自己
    ids.unshift(app.userInfo._openid)
    this.data.userPhotos.unshift(app.userInfo.userPhoto)
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
        chat_members: ids
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
  //添加群成员方法
  addGroupMember() {
    let ids = this.data.memberIds
    let friendCpn = this.selectComponent('.friendList')
    friendCpn.data.friendList.forEach(e => {
      e.subItems.forEach(item => {
        if (!ids.includes(item.openid)) {
          if(item.checked){
            ids.push(item.openid)
          }
        }
      })
    });
    db.collection('chat_group').doc(this.data.groupId).update({
      data: {
        chat_members: ids
      }
    })
    let time = new Date()
    let timeTs = Date.now()
    const doc = {
      _id: `${Math.random()}_${timeTs}`,
      groupId: this.data.groupId,
      msgType: 'sys',
      textContent: '邀请' + this.data.invitees.toString() + '加入该群',
      sendTime: time,
      sendTimeTS: timeTs, // fallback
      creatorName: app.userInfo.nickName
    }
    db.collection('chat_msg').add({
      data: doc
    }).then(res => {
      db.collection('sys_msg').where({
        groupId: this.data.groupId
      }).update({
        data: {
          icon: this.data.userPhoto,
          content: '邀请' + this.data.invitees.toString() + '加入该群',
          creator: app.userInfo,
          userIds: ids,
          time: time,
          sendTimeTS: timeTs,
          childType: 'chat_sys'
        }
      }).then(res => {
        wx.navigateBack({
          delta: 2,
        })
      })
    })

  },
  //删除群成员方法
  deleteGroupMember() { },
  addSysMsg(text, time, timeTs, groupId, ids, title) {
    db.collection('sys_msg').add({
      data: {
        type: 2,
        groupId: groupId,
        userIds: ids,
        icon: this.data.userPhotos,
        title: title,
        content: text,
        time: time,
        sendTimeTS: timeTs,
        unreadNumber: 1,
        creator: app.userInfo,
        childType: 'chat_sys'
      }
    }).then(res => {
      wx.navigateTo({
        url: '../../../im/room/room?nickName=' + title +
          '&groupId=' + groupId + '&chatType=2'
      })
    })
  },
})