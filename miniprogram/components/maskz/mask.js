// components/mask/mask.js
const app = getApp()
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isShow: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    //关闭模态框
    handleClose() {
      this.setData({
        isShow: false
      })
      //关闭过后就不再显示
      db.collection('users').doc(app.userInfo._id).update({
        data:{
          isNewUser: false
        }
      })
    }
  }
})
