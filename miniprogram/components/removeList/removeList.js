const app = getApp()
const db = wx.cloud.database();
const _ = db.command
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    messageId: String
  },

  /**
   * 组件的初始数据
   */
  data: {
    userMessage: {},
    isFriend: false
  },
  /**
   * 组件的方法列表
   */
  methods: {
    //删除信息
    handleDelete() {
      wx.showModal({
        title: '提示信息',
        content: '删除消息',
        confirmText: '删除',
        success: res => {
          if (res.confirm) {
            db.collection('message').where({
              userId: app.userInfo._id
            }).get().then(res => {
              let list = res.data[0].list
              //删除本条消息
              list = list.filter(val => val != this.data.messageId)
              //更新数据
              wx.cloud.callFunction({
                name: 'update',
                data: {
                  collection: 'message',
                  where: { userId: app.userInfo._id },
                  data: { list }
                }
              }).then(res => {
                //更新完过后把更新完的数据传过去
                this.triggerEvent('myevent', list)
              })
            })

            //删除申请记录
            db.collection('users').doc(app.userInfo._id).field({
              handleMessage: true
            }).get().then(res => {
              let { handleMessage } = res.data
              handleMessage = handleMessage.filter(val => {
                return val != this.data.messageId
              })
              wx.cloud.callFunction({
                name: 'update',
                data: {
                  collection: 'users',
                  where: { _id: app.userInfo._id },
                  data: { handleMessage }
                }
              }).then(res => { })
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },
    //同意好友申请
    handleAddFriend() {
      db.collection('users').doc(app.userInfo._id).update({
        data: {
          //_.unshift意思是追加数组
          friendList: _.unshift(this.data.messageId),
          handleMessage: _.unshift(this.data.messageId)
        }
      }).then(res => {
        this.setData({
          isFriend: true
        })
        wx.showToast({
          title: '已成功添加',
        })
      })

      //好友列表是相互的，甲账号添加乙账号为好友，乙账号同意后双方都应该有好友
      wx.cloud.callFunction({
        name: "update",
        data: {
          collection: 'users',
          doc: this.data.messageId,
          data: `{friendList:_.unshift('${app.userInfo._id}')}`
        }
      }).then(res => { })
    }
  },
  lifetimes: {
    attached: function () {
      //保存添加好友的记录
      db.collection('users').doc(app.userInfo._id).field({
        handleMessage: true
      }).get().then(res => {
        if (res.data.handleMessage.includes(this.data.messageId)) {
          this.setData({ isFriend: true })
        }
      })
      //获取消息
      db.collection('users').doc(this.data.messageId).field({
        nickName: true,
        userPhoto: true
      }).get().then(res => {
        this.setData({
          userMessage: res.data
        })
      })
    }
  },
})
