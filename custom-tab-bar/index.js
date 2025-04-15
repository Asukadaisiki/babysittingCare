// custom-tab-bar/index.js
Component({

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    active: 0,
    "list":
         [
          { "pagePath": "/pages/home/home","iconSize":48, "iconPath" :"/images/tabs/home.png" ,"text": "首页" },
          { "pagePath": "/pages/ai-qa/ai-qa","iconSize":48,"iconPath" :"/images/tabs/AI.png", "text": "AI-问答" },
          { "pagePath": "/pages/onlineClass/onlineClass","iconSize":48,"iconPath" :"/images/tabs/onlineClass.png",  "text": "在线课堂" },
          { "pagePath": "/pages/settings/settings","iconSize":48, "iconPath" :"/images/tabs/setting.png", "text": "设置" }
        ]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    onChange(event) {
        // event.detail 的值为当前选中项的索引
        this.setData({ active: event.detail })
        wx.switchTab({
          url: this.data.list[event.detail].pagePath,
        })
      },
  },
})