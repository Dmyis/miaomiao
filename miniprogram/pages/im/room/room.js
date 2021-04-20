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
    statusHeight:0,
    // functions for used in chatroom components
    onGetUserInfo: null,
    getOpenID: null,
  },

  onLoad: function (options) {
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    let  navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight+10;
    // 获取用户信息
    this.setData({
      statusHeight:navBarHeight,
      nickName:options.nickName,
      chatRoomGroupId:options.groupId,
      onGetUserInfo: this.onGetUserInfo,
      getOpenID: this.getOpenID,
      userInfo: app.userInfo,
      userId:options.userId || '',
      userPhoto:options.userPhoto || '',
      chatType:options.chatType,
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
  handleBack(){
    wx.navigateBack({
      delta: 0,
    })
  },
  setNavTitle(name){
    this.data.nickName = name;
    this.setData({
      nickName:this.data.nickName
    })
  },
  handleMore(){
    let {chatRoomGroupId,chatType} = this.data
    wx.navigateTo({
      url: '../../message/childPages/chatInfo/chatInfo?groupId='+
      chatRoomGroupId+'&chatType='+chatType
    })
  }


})
