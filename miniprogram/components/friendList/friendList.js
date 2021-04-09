// components/friendList/friendList.js
const db = wx.cloud.database()
const app = getApp()
import p from 'wl-pinyin'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showSelect:{
      type:Boolean,
      value:false
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    friendList: []
  },

  /**
   * 组件的方法列表
   */
  lifetimes: {
    attached() {
      this.getFriendList()
    }
  },
  methods: {
    getFriendList() {
      db.collection('users').where({
        friendList: app.userInfo._id
      }).field({
        userPhoto: true,
        nickName: true,
        _openid:true
      }).get().then(res => {
        let result = res.data
        //得到好友名的大写首字母
        result.map(item => {
          item.alpha = p.getFirstLetter(item.nickName).substring(0, 1)
        })
        //排序
        result.sort((a, b) => {
          let ap = a.alpha
          let bp = b.alpha
          return ap.localeCompare(bp)
        })
        const map = new Map()
        for (const item of result) {
          let alpha = item.alpha
          if (!map.has(alpha)) map.set(alpha, [])
          map.get(alpha).push({
            name: item.nickName,
            userPhoto: item.userPhoto,
            _id: item._id,
            openid:item._openid,
            checked: false
          })
        }
        const keys = []
        for (const key of map.keys()) {
          keys.push(key)
        }
        keys.sort()

        const list = []
        for (const key of keys) {
          list.push({
            alpha: key,
            subItems: map.get(key)
          })
        }
        this.setData({
          friendList: list
        })
        return
      })
    },
    initList(list){
      this.setData({
          friendList:list
      })
  },
    onChoose(e){
      let {item} = e.detail
      this.triggerEvent('chooes',{item:item});
    }
  }
})
