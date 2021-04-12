// miniprogram/pages/message/message.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
var watcher = null
import msgTime from "../../utils/msgTime";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    logged: false,
    slideButtons: [{
      text: '标为已读',
      extClass: 'msgUnread'
    }, {
      text: '不显示',
      extClass: 'noDisplay'
    }, {
      type: 'warn',
      text: '删除',
      extClass: 'delete'
    }],
    messageList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //监听新的朋友数据

    /**
     * 消息列表
     * 1.首先要建立一个数据集合，sys_msg
     *    type:(0.系统消息，1.聊天消息)
     *    icon:(单聊时这个icon就是好友的头像)
     *    title:(单聊时好友的昵称)
     *    content:(单聊时,和好友聊天的最后一条消息)
     *    time
     *    sendTimeTs
     *    userId(这条信息属于哪个用户)
     *    groupId:(聊天消息的群组id,如果是聊天信息，存在)
     *    unreadCount:(未读消息数,暂时不做)
     * 
     * 2.插入消息集合
     *    发送聊天消息成功后
     *        先查询消息是否存在，查询条件
     *          type：1
     *          groupId 
     *          userId(单聊时 好友的id)
     *          如果能查询到，去更新
     *              content 聊天内容
     *              time 
     *              sendTimeTs
     *          如果查询不到，去添加
     *              type:1
     *              groupId
     *              userId
     *              icon:(单聊时这个icon就是好友的头像)
     *              title:(单聊时好友的昵称)
     *              content:(单聊时,和好友聊天的最后一条消息)
     * 
     * 
     * 3.获取消息列表 
     *    并且监听消息列表的更新， 监听条件 userId是自己
     *      监听到返回结果，去对比，添加，替换等等 刷新列表
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
    if (app.userInfo._id) {
      this.setData({
        logged: true,
      })
    }
    if (!this.data.messageList.length) {
      this.getMessageList()
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
    if (watcher != null) {
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
  handleLogin() {
    wx.switchTab({
      url: '../user/user',
    })
  },
  navNewFriend() {
    wx.navigateTo({
      url: './childPages/newFriend/newFriend'
    })
  },
  handleNavMsg(e) {
    let { index } = e.currentTarget.dataset
    let msg = this.data.messageList[index]
    let chatType = ''
    if (msg.type == 1 || msg.type == 2) {
      chatType = "&chatType=" + msg.type
    }
    let title = msg.title
    wx.navigateTo({
      url: '../im/room/room?nickName=' + title +
        '&groupId=' + msg.groupId + '&userId=' +
        msg.userIds[0] + "&userPhoto=" +
        msg.icon + chatType
    })
    if (app.userInfo._openid != msg.unreadCount) {
      console.log('未读');
    } else {
      //已读信息
      db.collection('sys_msg').where({
        userIds: _.all([app.userInfo._openid])
      }).update({
        data: {
          unreadNumber: 0,
          unreadCount: ''
        }
      })
    }

  },
  //获取消息列表
  getMessageList() {
    db.collection('sys_msg').where({
      userIds: _.all([app.userInfo._openid])
    })
      .orderBy('sendTimeTs', 'desc')
      .get().then(res => {
        res.data.forEach((item, i) => {
          item.time = msgTime(item.time)
          let msg = res.data[i]
          if (msg.type == 1) {
            //如果是聊天信息
            let icon = ''
            let title = ''
            if (msg.users[0]._openid == app.userInfo._openid) {
              icon = msg.users[1].userPhoto
              title = msg.users[1].userNickName
            } else {
              icon = msg.users[0].userPhoto
              title = msg.users[0].userNickName
            }
            msg.icon = icon
            msg.title = title
          }
          if (msg.type == 2) {
            //如果是群聊
            let content = msg.content
            if (msg.creator._openid == app.userInfo._openid) {
              //如果发起群聊的是自己
              if (msg.childType == 'chat_sys') {
                //如果信息为系统信息
                content = "您" + content
              }
            } else {
              let str = msg.creator.nickName + ':'
              if (msg.childType == 'chat_sys') {
                str = msg.creator.nickName + " "
              }
              content = str + content
            }
            msg.content = content
          }
        });
        this.setData({
          loading: false,
          messageList: res.data
        })
        //开始监听消息
        this.initWatch()
      })
  },
  initWatch() {
    let timeTS = Date.now()
    if (this.data.messageList.length > 0) {
      timeTS = this.data.messageList[0].sendTimeTS
    }
    console.log('启动消息列表监听', timeTS);
    watcher = db.collection('sys_msg')
      .where({
        userIds: _.all([app.userInfo._openid]),
        sendTimeTS: _.gt(timeTS)
      })
      .watch({
        onChange: snapshot => {
          console.log(snapshot);
          const msgs = [...this.data.messageList]
          for (const docChange of snapshot.docChanges) {
            switch (docChange.dataType) {
              case 'add':
              case 'update': {
                const ind = msgs.findIndex(msg => msg._id === docChange.doc._id)
                docChange.doc.time = msgTime(docChange.doc.time)
                let msg = docChange.doc
                if (msg.type == 1) {
                  //如果是聊天信息
                  let icon = ''
                  let title = ''
                  if (msg.users[0]._openid == app.userInfo._openid) {
                    icon = msg.users[1].userPhoto
                    title = msg.users[1].userNickName
                  } else {
                    icon = msg.users[0].userPhoto
                    title = msg.users[0].userNickName
                  }
                  msg.icon = icon
                  msg.title = title
                }
                if (msg.type == 2) {
                  //如果时群聊
                  let content = msg.content
                  if (msg.creator._openid == app.userInfo._openid) {
                    //如果发起群聊的是自己
                    if (msg.childType == 'chat_sys') {
                      //如果信息为系统信息
                      content = "您" + content
                    }
                  } else {
                    let str = msg.creator.nickName + ':'
                    if (msg.childType == 'chat_sys') {
                      str = msg.creator.nickName + " "
                    }
                    content = str + content
                  }
                  msg.content = content
                }
                if (ind > -1) {
                  msgs.splice(ind, 1, docChange.doc)
                } else {
                  msgs.push(docChange.doc)
                }
                break
              }
            }
          }
          this.setData({
            messageList: msgs.sort((x, y) => y.sendTimeTS - x.sendTimeTS),
          })
        },
        onError: function (err) {
          console.log(err);
        }
      })
  }
})