// components/editChatGroup/editChatGroup.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value:String,
    title:String,
    describe:String,
    photo:Array
  },

  /**
   * 组件的初始数据
   */
  data: {
    isChangs:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    isChangsVal(e){
      let val = e.detail.value
      if(val==this.data.value && val != ''){
        this.setData({
          isChangs:false
        })
      }else{
        this.setData({
          isChangs:true
        })
      }
    },
    updateVal(e){
      this.setData({
        value:e.detail.value
      })
    },
    handleChangss(){
      //updateVal里面的setData异步
      setTimeout(() => {
        this.triggerEvent('changs',{value:this.data.value})
      }, 100);
    }
  }
})
