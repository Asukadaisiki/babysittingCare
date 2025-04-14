// pages/home/home.js
const wxCharts = require('../../utils/wxcharts.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    children: [],
    heightComparison: '',
    weightComparison: '',
    headComparison: '',
    ec: {
      lazyLoad: true
    },
    whoStandards: {
      height: [50.5, 56.5, 62.0, 67.5, 72.0, 76.5, 80.5, 85.0],
      weight: [3.3, 4.7, 6.4, 7.9, 8.9, 9.9, 10.8, 11.8],
      headCircumference: [34.5, 38.1, 40.9, 43.3, 45.0, 46.3, 47.5, 48.5]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 从本地存储获取宝宝信息
    const childInfo = wx.getStorageSync('childInfo')
    if (childInfo) {
      this.setData({
        children: childInfo
      })
      this.compareWithWHOStandards();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    this.initChart();
  },

  /**
   * 初始化生长曲线图表
   */
  initChart() {
    const { children, whoStandards } = this.data;
    if (children.length === 0) return;
    
    const chart = wxCharts.init({
      canvasId: 'growth-chart',
      type: 'line',
      categories: ['出生', '1月', '3月', '6月', '9月', '12月', '18月', '24月'],
      series: [{
        name: '体重',
        data: children[0].weightData || [],
        format: function (val) {
          return val.toFixed(1) + 'kg';
        },
        color: '#1AAD19'
      }, {
        name: '身高',
        data: children[0].heightData || [],
        format: function (val) {
          return val.toFixed(1) + 'cm';
        },
        color: '#1AAD19'
      }, {
        name: 'WHO体重标准',
        data: whoStandards.weight,
        format: function (val) {
          return val.toFixed(1) + 'kg';
        },
        color: '#FC8251'
      }, {
        name: 'WHO身高标准',
        data: whoStandards.height,
        format: function (val) {
          return val.toFixed(1) + 'cm';
        },
        color: '#FC8251'
      }],
      yAxis: {
        title: '测量值',
        format: function (val) {
          return val.toFixed(1);
        }
      },
      width: wx.getWindowInfo().windowWidth,
      height: 300
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  compareWithWHOStandards() {
    const { children, whoStandards } = this.data;
    if (children.length === 0) return;
    
    const child = children[0];
    const ageIndex = this.getAgeIndex(child.age);
    
    if (ageIndex >= 0) {
      const heightDiff = child.height - whoStandards.height[ageIndex];
      const weightDiff = child.weight - whoStandards.weight[ageIndex];
      const headDiff = child.headCircumference - whoStandards.headCircumference[ageIndex];
      
      this.setData({
        heightComparison: heightDiff >= 0 ? `+${heightDiff.toFixed(1)}cm` : `${heightDiff.toFixed(1)}cm`,
        weightComparison: weightDiff >= 0 ? `+${weightDiff.toFixed(1)}kg` : `${weightDiff.toFixed(1)}kg`,
        headComparison: headDiff >= 0 ? `+${headDiff.toFixed(1)}cm` : `${headDiff.toFixed(1)}cm`
      });
    }
  },
  
  getAgeIndex(age) {
    const ageMap = {
      '出生': 0,
      '1月': 1,
      '3月': 2,
      '6月': 3,
      '9月': 4,
      '12月': 5,
      '18月': 6,
      '24月': 7
    };
    return ageMap[age] || -1;
  },
  
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})