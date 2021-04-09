// components/search/search.js
const app = getApp()
const db = wx.cloud.database()
Component({
  /**
   * 组件的属性列表
   */
  properties: {
  },
  pageLifetimes: {
    hide() {
      // this.setData({
      //   isSearch: false
      // })
    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    isSearch: false,
    iptVal: '',
    searchHistory: [],
    searchList: [],
    noUser: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleSearch() {
      this.setData({
        isSearch: true
      })
      wx.getStorage({
        key: 'searchHistory',
      }).then(res => {
        this.setData({
          searchHistory: res.data
        })
      }).catch(err => {
        console.log(err);
      })
    },
    handleCancel() {
      this.setData({
        isSearch: false,
        iptVal: ''
      })
    },
    handleIpt(e) {
      let { value } = e.detail
      if (value) {
        this.setData({ iptVal: value })
      } else if (value == '') {
        this.setData({
          iptVal: ''
        })
      }
    },
    exIptVal() {
      this.setData({
        iptVal: ''
      })
    },
    deletehistory() {
      const _that = this
      wx.showModal({
        title: '提示',
        content: '删除历史记录',
        success(res) {
          if (res.confirm) {
            _that.setData({
              searchHistory: []
            })
            wx.setStorage({
              data: [],
              key: 'searchHistory',
            })
          }
        }
      })
    },
    handleHistorySearch(e) {
      let { val } = e.currentTarget.dataset
      this.setData({
        iptVal: val
      })
      this.changeSearchList(val)
    },
    handleConfirm(e) {
      let { value } = e.detail
      if (!value) return
      this.data.searchHistory.unshift(value)
      let arr = this.data.searchHistory
      this.setData({
        searchHistory: [...new Set(arr)]
      }, _ => {
        wx.setStorage({
          data: this.data.searchHistory,
          key: 'searchHistory',
        })
      })
      this.changeSearchList(value)
    },
    changeSearchList(value) {
      wx.showLoading()
      db.collection('users').where({
        nickName: db.RegExp({
          regexp: value,
          options: 'i'
        })
      }).field({
        userPhoto: true,
        nickName: true
      }).get().then(res => {
        if (!res.data.length) {
          this.setData({ noUser: true })
        } else (
          this.setData({
            searchList: res.data,
            noUser: false
          })
        )
        wx.hideLoading()
      })
    }
  }
})
