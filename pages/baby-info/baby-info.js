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

  onLoad: function (options) {
    // 初始化图表
    this.initChart();
  },

  onShow: function () {
    // 加载宝宝信息
    this.loadChildInfo();
    // 加载生长记录
    this.loadGrowthRecords();
  },

  // 加载儿童信息
  loadChildInfo: function () {
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
  loadGrowthRecords: function () {
    if (this.data.currentChild && (this.data.currentChild.id || this.data.currentChild.name)) {
      const currentChild = this.data.currentChild;
      const storageKey = currentChild.id ? `growthRecords_${currentChild.id}` : `growthRecords_${currentChild.name}`;
      let growthRecords = wx.getStorageSync(storageKey) || [];

      // 数据迁移：如果使用ID作为键但没有数据，尝试从旧的姓名键加载
      if (growthRecords.length === 0 && currentChild.id && currentChild.name) {
        const oldStorageKey = `growthRecords_${currentChild.name}`;
        const oldGrowthRecords = wx.getStorageSync(oldStorageKey) || [];
        if (oldGrowthRecords.length > 0) {
          wx.setStorageSync(storageKey, oldGrowthRecords);
          wx.removeStorageSync(oldStorageKey);
          growthRecords = oldGrowthRecords;
        }
      }

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

      // 如果有网络连接，尝试从服务器获取最新数据
      const { API } = require('../../utils/api.js');
      API.child.getChildInfo()
        .then(res => {
          if (res.success && res.childinfo && res.childinfo.length > 0) {
            // 找到对应的儿童
            const currentChild = this.data.currentChild;
            const targetChild = res.childinfo.find(child =>
              (currentChild.id && child.id === currentChild.id) ||
              (child.name === currentChild.name)
            );
            if (targetChild && targetChild.growthRecords) {
              // 更新本地缓存
              const storageKey = currentChild.id ? `growthRecords_${currentChild.id}` : `growthRecords_${currentChild.name}`;
              wx.setStorageSync(storageKey, targetChild.growthRecords);

              // 按日期排序，最新的记录在前
              const serverGrowthRecords = [...targetChild.growthRecords];
              serverGrowthRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

              // 获取最新的记录
              const serverLatestRecord = serverGrowthRecords.length > 0 ? serverGrowthRecords[0] : {};

              // 更新页面数据
              this.setData({
                growthRecords: serverGrowthRecords,
                latestRecord: serverLatestRecord
              });

              // 重新更新图表数据
              this.updateChartData();
            }
          }
        })
        .catch(err => {
          console.error('从服务器获取生长记录失败:', err);
          // 网络错误时继续使用本地数据
        });
    }
  },

  // 计算实际月龄和矫正胎龄
  calculateAges: function (birthDateStr, expectedDateStr, gestationalWeeks) {
    const birthDate = new Date(birthDateStr);
    const today = new Date();

    // 计算实际月龄（月）
    const monthDiff = (today.getFullYear() - birthDate.getFullYear()) * 12 + today.getMonth() - birthDate.getMonth();
    const actualAge = monthDiff + (today.getDate() >= birthDate.getDate() ? 0 : -1);

    // 计算矫正胎龄
    let correctedAge = actualAge;
    if (gestationalWeeks) {
      // 计算出生后的实际周龄
      const actualWeeks = Math.floor((today - birthDate) / (7 * 24 * 60 * 60 * 1000));

      // 计算需要矫正的周数（以40周为标准）
      const weeksToCorrect = 40 - gestationalWeeks;

      // 计算矫正后的周龄
      const correctedWeeks = actualWeeks + weeksToCorrect;

      // 将周转换为月（约4.348周等于1个月）
      correctedAge = Math.floor(correctedWeeks / 4.348);
    }

    return { actualAge, correctedAge };
  },

  // 切换选中的宝宝
  switchChild: function (e) {
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
  navigateToInfoCollection: function () {
    wx.navigateTo({
      url: '/pages/info-collection/info-collection'
    });
  },

  // 切换图表类型
  switchChart: function (e) {
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
  updateChartData: function () {
    if (!this.chartInstance || !this.data.growthRecords.length) return;

    const records = this.data.growthRecords;
    let data = [];
    let field = '';

    // 根据当前选中的图表类型获取对应的数据
    switch (this.data.activeChart) {
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