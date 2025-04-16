// pages/home/home.js
Page({
  data: {
    userName: '家长',
    currentDate: '',
    hasChild: false,
    childInfo: null,
    childAge: 0
  },

  onLoad: function() {
    this.setCurrentDate();
    this.loadChildInfo();
  },

  onShow: function() {
    // 每次页面显示时重新加载儿童信息，以便在添加儿童后更新页面
    this.loadChildInfo();
    
    // 设置底部导航栏选中状态
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        active: 0
      });
    }
  },

  // 设置当前日期
  setCurrentDate: function() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];
    
    this.setData({
      currentDate: `${year}年${month}月${day}日 ${weekday}`
    });
  },

  // 加载儿童信息
  loadChildInfo: function() {
    const childInfo = wx.getStorageSync('childInfo') || [];
    
    if (childInfo.length > 0) {
      // 计算宝宝月龄
      const firstChild = childInfo[0];
      const birthDate = new Date(firstChild.birthDate);
      const today = new Date();
      
      // 计算月龄
      const monthDiff = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
      const childAge = monthDiff + (today.getDate() >= birthDate.getDate() ? 0 : -1);
      
      this.setData({
        hasChild: true,
        childInfo: firstChild,
        childAge: childAge
      });
    } else {
      this.setData({
        hasChild: false,
        childInfo: null,
        childAge: 0
      });
    }
  },

  // 导航到生长监测页面
  navigateToGrowthMonitor: function() {
    wx.navigateTo({
      url: '/pages/growth-monitor/growth-monitor'
    });
  },

  // 导航到信息收集页面
  navigateToInfoCollection: function() {
    wx.navigateTo({
      url: '/pages/info-collection/info-collection'
    });
  }
});