// pages/baby-info/baby-info.js
const app = getApp();

Page({
  data: {
    hasChild: false,
    childInfo: [],
    currentChildIndex: 0,
    currentChild: {},
    actualAge: 0, // 实际月龄（月）
    correctedAge: 0, // 矫正胎龄（月）
    growthRecords: [], // 生长记录数据
    latestRecord: {}, // 最新的生长记录
    activeChart: 'height', // 当前激活的图表类型：height, weight, head
    onInitChart: null 
  },

  onLoad: function(options) {
    // 初始化图表
    this.initChart();
  },

  onShow: function() {
    // 加载宝宝信息
    this.loadChildInfo();
    // 加载生长记录
    this.loadGrowthRecords();
  },

  // 加载儿童信息
  loadChildInfo: function() {
    const childInfo = wx.getStorageSync('childInfo') || [];

    if (childInfo.length > 0) {
      const firstChild = childInfo[0];
      
      // 计算实际月龄和矫正胎龄
      const ageData = this.calculateAges(firstChild.birthDate, firstChild.expectedDate);

      this.setData({
        hasChild: true,
        childInfo: childInfo,
        currentChild: firstChild,
        actualAge: ageData.actualAge,
        correctedAge: ageData.correctedAge
      });
    } else {
      this.setData({
        hasChild: false,
        childInfo: [],
        currentChild: {},
        actualAge: 0,
        correctedAge: 0
      });
    }
  },

  // 加载生长记录
  loadGrowthRecords: function() {
    if (this.data.currentChild && this.data.currentChild.name) {
      const storageKey = `growthRecords_${this.data.currentChild.name}`;
      const growthRecords = wx.getStorageSync(storageKey) || [];
      
      // 按日期排序，最新的记录在前
      growthRecords.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      // 获取最新的记录
      const latestRecord = growthRecords.length > 0 ? growthRecords[0] : {};

      this.setData({
        growthRecords,
        latestRecord
      });
      
      // 更新图表数据
      this.updateChartData();
    }
  },

  // 计算实际月龄和矫正胎龄
  calculateAges: function(birthDateStr, expectedDateStr) {
    const birthDate = new Date(birthDateStr);
    const expectedDate = new Date(expectedDateStr);
    const today = new Date();

    // 计算实际月龄（月）
    const monthDiff = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
    const actualAge = monthDiff + (today.getDate() >= birthDate.getDate() ? 0 : -1);

    // 计算预产期和出生日期之间的差值（月）
    const correctionMonths = (expectedDate.getFullYear() - birthDate.getFullYear()) * 12 +
      expectedDate.getMonth() - birthDate.getMonth() +
      (expectedDate.getDate() >= birthDate.getDate() ? 0 : -1);

    // 矫正胎龄 = 实际月龄 - (预产期 - 出生日期)
    // 如果早产，则预产期晚于出生日期，差值为正；如果足月，则预产期约等于出生日期，差值约为0
    const correctedAge = Math.max(0, actualAge - correctionMonths);

    return { actualAge, correctedAge };
  },

  // 切换选中的宝宝
  switchChild: function(e) {
    const index = e.currentTarget.dataset.index;
    const child = this.data.childInfo[index];
    
    // 计算实际月龄和矫正胎龄
    const ageData = this.calculateAges(child.birthDate, child.expectedDate);
    
    this.setData({
      currentChildIndex: index,
      currentChild: child,
      actualAge: ageData.actualAge,
      correctedAge: ageData.correctedAge
    });
    
    // 重新加载生长记录
    this.loadGrowthRecords();
  },
  
  // 导航到信息采集页面
  navigateToInfoCollection: function() {
    wx.navigateTo({
      url: '/pages/info-collection/info-collection'
    });
  },
  
  // 切换图表类型
  switchChart: function(e) {
    const chart = e.currentTarget.dataset.chart;
    this.setData({
      activeChart: chart
    });
    
    // 更新图表数据
    this.updateChartData();
  },
  
  // 初始化图表
  // 
  
  // 更新图表数据
  updateChartData: function() {
    if (!this.chartInstance || !this.data.growthRecords.length) return;
    
    const records = this.data.growthRecords;
    let data = [];
    let field = '';
    
    // 根据当前选中的图表类型获取对应的数据
    switch(this.data.activeChart) {
      case 'height':
        field = 'height';
        break;
      case 'weight':
        field = 'weight';
        break;
      case 'head':
        field = 'headCircumference';
        break;
    }
    
    // 构建图表数据
    data = records.map(record => ({
      date: record.date,
      value: parseFloat(record[field]) || 0
    })).filter(item => item.value > 0);
    
    // 按日期排序
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 更新图表数据
    this.chartInstance.changeData(data);
  }
});