// miniprogram/pages/index/index.js
const app = getApp()
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    swiperImg: ['../../images/1.jpg', '../../images/lb3.jpg'],
    indicatorDots: true,
    listData: [],
    isOpenOperationPanel: false,
    operationList: [],
    current: 'links',
    statusHeight: 120
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    const systemInfo = wx.getSystemInfoSync();
    const menuButtonInfo = wx.getMenuButtonBoundingClientRect();
    let navBarHeight = (menuButtonInfo.top - systemInfo.statusBarHeight) * 2 + menuButtonInfo.height + systemInfo.statusBarHeight;
    this.setData({
      statusHeight: navBarHeight
    })
    this.initOperationList()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getUsers()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getUsers()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.hidOperationPanel()
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
  getUsers() {
    //获取数据库用户列表，field为过滤掉不需要的属性 
    db.collection('users').field({
      userPhoto: true,
      links: true,
      nickName: true,
    })
      //通过orderBy来进行排序
      //（https://developers.weixin.qq.com/miniprogram/dev/wxcloud/reference-sdk-api/database/collection/Collection.orderBy.html）
      .orderBy(this.data.current, 'desc')
      .get().then(res => {
        this.setData({
          listData: res.data,
          loading: false
        })
      })
  },
  openOperationPanel() {
    if (this.data.isOpenOperationPanel) {
      this.setData({
        isOpenOperationPanel: false
      })
    } else {
      this.setData({
        isOpenOperationPanel: true
      })
    }
  },
  initOperationList() {
    var list = []
    for (let i = 0; i < 2; i++) {
      let item = {}
      if (i == 0) {
        item.icon = 'icon-liaotian',
          item.text = '发起群聊'
      }
      if (i == 1) {
        item.icon = 'icon-icon_tianjiahaoyou',
          item.text = '添加好友'
      }
      list.push(item)
    }
    this.setData({
      operationList: list
    })
  },
  hidOperationPanel() {
    this.setData({
      isOpenOperationPanel: false
    })
  },
  clickOperationItem(e) {

    let openid = app.userInfo._openid
    if (!openid) {
      app.login()
      return
    }
    let { index } = e.currentTarget.dataset
    if (index == 0) {
      //发起群聊
      wx.navigateTo({
        url: './childPages/groupChat/create',
      })
    } else if (index == 1) {
      wx.navigateTo({
        url: '../../components/searchS/search',
      })
    }
    this.setData({
      isOpenOperationPanel: false
    })
  },
  //点击tab切换
  handleCurrent(e) {
    const { current } = e.target.dataset
    if (this.data.current == current) return
    this.setData({
      current
    }, () => {
      this.getUsers()
    })
  },
  //点击喜欢递增，因为客户端改变不了别人数据库的数据，所有使用云函数来改变
  handleLinks(e) {
    wx.vibrateShort({
      type: 'light'
    })
    let id = e.currentTarget.dataset.id
    wx.cloud.callFunction({
      name: 'update',
      data: {
        collection: 'users',
        doc: id,
        //_.inc(1)为云函数递增或递减函数
        data: '{links:_.inc(1)}'
      }
    }).then(res => {
      let { updated } = res.result.stats
      if (updated) {
        let listData = [...this.data.listData]
        listData.forEach(e => {
          if (e._id == id) {
            e.links++
          }
        });
        this.setData({ listData })
      }

    })
  },
  //跳转到详情页
  handleDetail(e) {
    const { id } = e.target.dataset
    wx.navigateTo({
      url: '../detail/detail?userid=' + id,
    })

  }
})