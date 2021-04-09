//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        // env: 'my-env-id',
        traceUser: true,
      })
    }
    
    this.globalData = {
      newFriends:[]
    }
    //全局用户信息
    this.userInfo = {}
  },
  login() {
    wx.showToast({
      title: '请先登录',
      icon: "none",
      duration: 1000,
      success() {
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/user/user',
          })
        }, 1300);
      }
    })
  },
  updateStorageInfo(param) {
    var key = param.key
    var title = param.title
    var newData = param.newData
    wx.getStorage({
      key,
      success(res) {
        var storage = res.data
        storage[title] = newData
        var tempData = Object.assign({}, storage)
        wx.setStorage({
          key: key,
          data: tempData,
          success(res) {
            param.success(res)
          },
          fail(res) {
            param.fail(res)
          }
        })
      }
    })
  }
})
