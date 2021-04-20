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
    isChangs:true,
  },
  /**
   * 组件的方法列表
   */
  methods: {
    isChangsVal(e){
      let val = e.detail.value
      if(val==this.data.value || val.trim() == ''){
        this.setData({
          isChangs:true
        })
      }else{
        this.setData({
          isChangs:false
        })
      }
    },
    //这里有个问题只要失去焦点就会更新值
    updateVal(e){
      this.setData({
        value:e.detail.value
      })
    },
    handleChangs(){
      //updateVal里面的setData异步
      setTimeout(() => {
        this.triggerEvent('changs',{value:this.data.value})
      }, 100);
    }
  }
})
