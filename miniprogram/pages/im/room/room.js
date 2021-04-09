const app = getApp()

Page({
  data: {
    userInfo: null,
    logged: false,
    userPhoto:'',
    nickName:'',
    userId:'',
    chatType:'',
    takeSession: false,
    // chatRoomEnvId: 'release-f8415a',
    chatRoomCollection: 'chat_msg',
    chatRoomGroupId: '',

    // functions for used in chatroom components
    onGetUserInfo: null,
    getOpenID: null,
  },

  onLoad: function (options) {
    // 获取用户信息
    this.setData({
      nickName:options.nickName,
      chatRoomGroupId:options.groupId,
      onGetUserInfo: this.onGetUserInfo,
      getOpenID: this.getOpenID,
      userInfo: app.userInfo,
      userId:options.userId,
      userPhoto:options.userPhoto,
      chatType:options.chatType,
    },()=>{
      wx.setNavigationBarTitle({
        title: this.data.nickName,
      })
    })

  },

  getOpenID: async function() {
    if (this.openid) {
      return this.openid
    }

    const { result } = await wx.cloud.callFunction({
      name: 'login',
    })

    return result.openid
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },


})
