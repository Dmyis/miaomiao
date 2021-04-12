// miniprogram/pages/detail/detail.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {},
    bgc: '',
    //是否为好友
    isFriend: false,
    isUSer: false,
    isLoad: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const { userid } = options
    wx.showLoading({ icon: 'none' })
    db.collection('users').doc(userid).get().then(res => {
      this.setData({
        detail: res.data,
      }, () => {
        this.setData({
          bgc: this.data.detail.detailBgc
        })
        //判断是否为自己
        if (app.userInfo._id == this.data.detail._id) {
          this.setData({ isUSer: true })
        } else {
          this.setData({ isUSer: false })
          //判断是否为好友
          let friendList = this.data.detail.friendList
          if (friendList.includes(app.userInfo._id)) {
            this.setData({
              isFriend: true
            })
          }
        }
      })
    })

  },
  imgLoad(e) {
    this.setData({ isLoad: true }, _ => {
      wx.hideLoading()
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // if (!app.userInfo._id) {
    //   app.login()
    // }
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
    wx.stopPullDownRefresh();
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
  //查看背景
  handleBrowse(e) {
    const vm = this
    if (this.data.detail._id == app.userInfo._id) {
      wx.showActionSheet({
        itemList: ['查看封面', '自定义封面', '使用默认封面'],
        success(res) {
          let index = res.tapIndex
          if (index == 0) {
            wx.previewImage({
              urls: [vm.data.bgc],
            })
          } else if (index == 1) {
            wx.navigateTo({
              url: './childPages/customBgc/customBgc',
            })
          } else if (index == 2) {
            wx.navigateTo({
              url: './childPages/defaultBgc/defaultBgc',
            })
          }
        }
      })
    } else {
      wx.previewImage({
        urls: [vm.data.bgc]
      })
    }
  },
  // 查看头像
  handleBrowsePPhoto(e) {
    wx.previewImage({
      urls: [this.data.detail.userPhoto],
    })
  },

  //复制微信号
  copyWxNumber(e) {
    const { number } = e.currentTarget.dataset
    wx.setClipboardData({
      data: number
    })
  },
  //查看详细信息
  intoDetailInfo() {
    const vm = this
    wx.navigateTo({
      url: './childPages/seeInfo/seeInfo',
      success(res) {
        res.eventChannel.emit('toData', { data: vm.data.detail })
      }
    })
  },
  //点击手机号事件
  callPhone(e) {
    const { phone } = e.currentTarget.dataset
    wx.showActionSheet({
      alertText: phone + "可能是一个电话号码,你可以:",
      itemList: ['呼叫', '复制号码', '添加到通讯录'],
    }).then(res => {
      const { tapIndex } = res
      switch (tapIndex) {
        case 0:
          wx.makePhoneCall({
            phoneNumber: phone,
          })
          break;
        case 1:
          wx.setClipboardData({
            data: phone
          })
          break;
        case 2:
          wx.addPhoneContact({
            firstName: this.data.detail.nickName
          })
        default:
          break;
      }
    })
  },
  //添加好友
  addFriend() {
    //判断是否登录
    if (app.userInfo._id) {
      db.collection('message').where({
        userId: this.data.detail._id
      }).get().then(res => {
        if (res.data.length) {//更新
          //判断是否申请过
          if (res.data[0].list.includes(app.userInfo._id)) {
            wx.showToast({
              title: '等待对方通过!',
              icon: 'none'
            })
          } else {
            //更新数据库
            wx.cloud.callFunction({
              name: 'update',
              data: {
                collection: 'message',
                where: {
                  userId: this.data.detail._id
                },
                // data: `{list:_.unshift({
                //   friendId:${app.userInfo._id},
                //   isRead:false
                // })}`
                data: `{list:_.unshift('${app.userInfo._id}')}`
              }
            }).then(res => {
              wx.showToast({
                title: '申请成功~',
              })
            })
          }
        } else {//添加
          db.collection('message').add({
            data: {
              userId: this.data.detail._id,
              // list: [{
              //   friendId:app.userInfo._id,
              //   isRead:false
              // }]
              list: [app.userInfo._id]
            }
          }).then(res => {
            wx.showToast({
              title: '申请成功~'
            })
          })
        }
      })
    } else {
      app.login()
    }
  },
  //发送消息
  handleSendNews() {
    let currentId = app.userInfo._openid
    let friendId = this.data.detail._openid
    //查询和好友聊天是否存在,如果存在自接进入聊天，如果不存在就创建
    //type 1单聊 2群聊
    db.collection('chat_group').where({
      type: 1,
      chat_members: _.all([currentId, friendId])
    }).get().then(res => {
      if (res.data.length == 0) {
        //不存在
        db.collection('chat_group').add({
          data: {
            type: 1,
            chat_members: [currentId, friendId],
            time: new Date()
          }
        }).then(res => {
          wx.navigateTo({
            url: '../im/room/room?nickName=' + this.data.detail.nickName +
              '&groupId=' + res._id + '&userId=' + friendId +
               "&userPhoto=" + this.data.detail.userPhoto + '&chatType=1'
          })
        }).catch(err => {

        })
      } else {
        //存在
        wx.navigateTo({
          url: '../im/room/room?nickName=' + this.data.detail.nickName +
            '&groupId=' + res.data[0]._id + '&userId=' + friendId +
            "&userPhoto=" + this.data.detail.userPhoto+ '&chatType=1'
        })
      }
    }).catch(err => {

    })
  }
})