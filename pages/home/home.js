// pages/home/home.js
const F2 = require('../../miniprogram_npm/@antv/f2/index');

Page({
  data: {
    userName: '家长',
    currentDate: '',
    hasChild: false,
    childInfo: [],
    currentChildIndex: 0,
    currentChild: {},
    childAge: 0,
    correctedAge: 0, // 矫正胎龄（月）
    actualAge: 0, // 实际月龄（月）
    growthRecords: [], // 生长记录数据
    newRecord: {
      date: '',
      height: '',
      weight: '',
      headCircumference: ''
    },
    showAddForm: false,
    showDeleteModal: false, // 删除宝宝确认对话框
    chartData: {
      height: [],
      weight: [],
      headCircumference: []
    },
    whoStandard: {
      height: [],
      weight: [],
      headCircumference: []
    },
    activeTab: 'height', // 当前激活的图表标签：height, weight, headCircumference
    chartRendered: false
  },

  onLoad: function() {
    this.setCurrentDate();
    this.loadChildInfo();
    
    // 获取儿童信息
    const childInfo = wx.getStorageSync('childInfo') || [];
    if (childInfo.length > 0) {
      // 设置当前选中的儿童
      const currentChild = childInfo[0];
      
      // 计算实际月龄和矫正胎龄
      const ageData = this.calculateAges(currentChild.birthDate, currentChild.expectedDate);
      
      // 获取生长记录
      const storageKey = `growthRecords_${currentChild.name}`;
      const growthRecords = wx.getStorageSync(storageKey) || [];
      
      // 设置今天的日期作为默认录入日期
      const today = new Date();
      const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      this.setData({
        childInfo,
        currentChild,
        actualAge: ageData.actualAge,
        correctedAge: ageData.correctedAge,
        growthRecords,
        'newRecord.date': dateStr
      });
      
      // 准备图表数据
      this.prepareChartData();
      
      // 加载WHO标准数据
      this.loadWHOStandards();
    }
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
    
    // 重新加载生长记录数据
    if (this.data.currentChild && this.data.currentChild.name) {
      const storageKey = `growthRecords_${this.data.currentChild.name}`;
      const growthRecords = wx.getStorageSync(storageKey) || [];
      
      this.setData({
        growthRecords,
        chartRendered: false
      });
      
      // 重新准备图表数据
      this.prepareChartData();
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
      
      // 计算实际月龄和矫正胎龄
      const ageData = this.calculateAges(firstChild.birthDate, firstChild.expectedDate);
      
      this.setData({
        hasChild: true,
        childInfo: childInfo,
        currentChild: firstChild,
        childAge: childAge,
        actualAge: ageData.actualAge,
        correctedAge: ageData.correctedAge
      });
    } else {
      this.setData({
        hasChild: false,
        childInfo: [],
        currentChild: {},
        childAge: 0,
        actualAge: 0,
        correctedAge: 0
      });
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
    
    // 矫正胎龄 = 实际月龄 + (预产期 - 出生日期)
    const correctedAge = actualAge + correctionMonths;
    
    return { actualAge, correctedAge };
  },
  
  // 切换当前儿童
  switchChild: function(e) {
    const index = e.currentTarget.dataset.index;
    const currentChild = this.data.childInfo[index];
    
    // 计算实际月龄和矫正胎龄
    const ageData = this.calculateAges(currentChild.birthDate, currentChild.expectedDate);
    
    // 获取生长记录
    const storageKey = `growthRecords_${currentChild.name}`;
    const growthRecords = wx.getStorageSync(storageKey) || [];
    
    this.setData({
      currentChildIndex: index,
      currentChild,
      actualAge: ageData.actualAge,
      correctedAge: ageData.correctedAge,
      growthRecords,
      chartRendered: false
    });
    
    // 重新准备图表数据
    this.prepareChartData();
  },
  
  // 显示删除宝宝确认对话框
  showDeleteChildModal: function() {
    this.setData({
      showDeleteModal: true
    });
  },
  
  // 隐藏删除宝宝确认对话框
  hideDeleteChildModal: function() {
    this.setData({
      showDeleteModal: false
    });
  },
  
  // 删除宝宝信息
  deleteChild: function() {
    const childInfo = this.data.childInfo;
    const index = this.data.currentChildIndex;
    const childName = childInfo[index].name;
    
    // 删除生长记录
    const storageKey = `growthRecords_${childName}`;
    wx.removeStorageSync(storageKey);
    
    // 从数组中删除该宝宝
    childInfo.splice(index, 1);
    
    // 更新存储
    wx.setStorageSync('childInfo', childInfo);
    
    // 更新页面数据
    if (childInfo.length > 0) {
      // 如果还有其他宝宝，选择第一个
      const newIndex = 0;
      const newChild = childInfo[newIndex];
      const ageData = this.calculateAges(newChild.birthDate, newChild.expectedDate);
      const newStorageKey = `growthRecords_${newChild.name}`;
      const newGrowthRecords = wx.getStorageSync(newStorageKey) || [];
      
      this.setData({
        childInfo,
        hasChild: true,
        currentChildIndex: newIndex,
        currentChild: newChild,
        actualAge: ageData.actualAge,
        correctedAge: ageData.correctedAge,
        growthRecords: newGrowthRecords,
        showDeleteModal: false,
        chartRendered: false
      });
      
      // 重新准备图表数据
      this.prepareChartData();
    } else {
      // 如果没有宝宝了
      this.setData({
        childInfo: [],
        hasChild: false,
        currentChildIndex: 0,
        currentChild: {},
        actualAge: 0,
        correctedAge: 0,
        growthRecords: [],
        showDeleteModal: false
      });
    }
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    });
  },
  
  // 显示/隐藏添加记录表单
  toggleAddForm: function() {
    this.setData({
      showAddForm: !this.data.showAddForm
    });
  },
  
  // 日期选择器变化
  onDateChange: function(e) {
    this.setData({
      'newRecord.date': e.detail.value
    });
  },
  
  // 输入框事件处理
  onHeightInput: function(e) {
    this.setData({
      'newRecord.height': e.detail.value
    });
  },
  
  onWeightInput: function(e) {
    this.setData({
      'newRecord.weight': e.detail.value
    });
  },
  
  onHeadCircumferenceInput: function(e) {
    this.setData({
      'newRecord.headCircumference': e.detail.value
    });
  },
  
  // 添加生长记录
  addGrowthRecord: function() {
    const { newRecord, currentChild, growthRecords } = this.data;
    
    // 验证输入
    if (!newRecord.date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return;
    }
    
    if (!newRecord.height && !newRecord.weight && !newRecord.headCircumference) {
      wx.showToast({
        title: '请至少输入一项生长数据',
        icon: 'none'
      });
      return;
    }
    
    // 创建新记录
    const record = {
      date: newRecord.date,
      height: newRecord.height ? parseFloat(newRecord.height) : null,
      weight: newRecord.weight ? parseFloat(newRecord.weight) : null,
      headCircumference: newRecord.headCircumference ? parseFloat(newRecord.headCircumference) : null
    };
    
    // 添加到记录列表
    const updatedRecords = [...growthRecords, record];
    
    // 按日期排序
    updatedRecords.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // 保存到本地存储
    const storageKey = `growthRecords_${currentChild.name}`;
    wx.setStorageSync(storageKey, updatedRecords);
    
    // 更新状态
    this.setData({
      growthRecords: updatedRecords,
      newRecord: {
        date: newRecord.date,
        height: '',
        weight: '',
        headCircumference: ''
      },
      showAddForm: false,
      chartRendered: false
    });
    
    wx.showToast({
      title: '记录添加成功',
      icon: 'success'
    });
    
    // 重新准备图表数据
    this.prepareChartData();
  },
  
  // 删除生长记录
  deleteRecord: function(e) {
    const index = e.currentTarget.dataset.index;
    const { growthRecords, currentChild } = this.data;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          const updatedRecords = [...growthRecords];
          updatedRecords.splice(index, 1);
          
          // 保存到本地存储
          const storageKey = `growthRecords_${currentChild.name}`;
          wx.setStorageSync(storageKey, updatedRecords);
          
          // 更新状态
          this.setData({
            growthRecords: updatedRecords,
            chartRendered: false
          });
          
          // 重新准备图表数据
          this.prepareChartData();
        }
      }
    });
  },
  
  // 切换图表标签
  switchTab: function(e) {
    const tab = e.currentTarget.dataset.tab;
    
    this.setData({
      activeTab: tab,
      chartRendered: false
    });
    
    // 重新渲染图表
    this.prepareChartData();
  },

  // 导航到信息收集页面
  navigateToInfoCollection: function() {
    wx.navigateTo({
      url: '/pages/info-collection/info-collection?mode=add'
    });
  },
  
  // 准备图表数据
  prepareChartData: function() {
    const { growthRecords, currentChild } = this.data;
    
    if (!currentChild || !currentChild.birthDate) return;
    
    // 将生长记录转换为图表数据格式
    const chartData = {
      height: [],
      weight: [],
      headCircumference: []
    };
    
    // 计算每条记录对应的月龄
    growthRecords.forEach(record => {
      const recordDate = new Date(record.date);
      const birthDate = new Date(currentChild.birthDate);
      
      // 计算月龄
      const monthDiff = (recordDate.getFullYear() - birthDate.getFullYear()) * 12 + 
                        recordDate.getMonth() - birthDate.getMonth();
      const age = monthDiff + (recordDate.getDate() >= birthDate.getDate() ? 0 : -1);
      
      // 添加到对应的数据集
      if (record.height !== null) {
        chartData.height.push({
          age: age,
          value: record.height
        });
      }
      
      if (record.weight !== null) {
        chartData.weight.push({
          age: age,
          value: record.weight
        });
      }
      
      if (record.headCircumference !== null) {
        chartData.headCircumference.push({
          age: age,
          value: record.headCircumference
        });
      }
    });
    
    // 按月龄排序
    ['height', 'weight', 'headCircumference'].forEach(type => {
      chartData[type].sort((a, b) => a.age - b.age);
    });
    
    this.setData({ chartData });
  },
  
  // 加载WHO标准数据
  loadWHOStandards: function() {
    // 这里应该从本地或服务器加载WHO标准数据
    // 简化示例：使用模拟数据
    const gender = this.data.currentChild.gender === '男' ? 'boys' : 'girls';
    
    // 模拟WHO标准数据（0-24个月）
    const whoStandard = {
      height: [],
      weight: [],
      headCircumference: []
    };
    
    // 身高标准（cm）
    if (gender === 'boys') {
      // 男孩WHO身高标准（简化）
      for (let i = 0; i <= 24; i++) {
        whoStandard.height.push({
          age: i,
          value: 50 + i * 2.5 // 简化公式
        });
      }
    } else {
      // 女孩WHO身高标准（简化）
      for (let i = 0; i <= 24; i++) {
        whoStandard.height.push({
          age: i,
          value: 49 + i * 2.4 // 简化公式
        });
      }
    }
    
    // 体重标准（kg）
    if (gender === 'boys') {
      // 男孩WHO体重标准（简化）
      for (let i = 0; i <= 24; i++) {
        whoStandard.weight.push({
          age: i,
          value: 3.5 + i * 0.5 // 简化公式
        });
      }
    } else {
      // 女孩WHO体重标准（简化）
      for (let i = 0; i <= 24; i++) {
        whoStandard.weight.push({
          age: i,
          value: 3.3 + i * 0.45 // 简化公式
        });
      }
    }
    
    // 头围标准（cm）
    if (gender === 'boys') {
      // 男孩WHO头围标准（简化）
      for (let i = 0; i <= 24; i++) {
        whoStandard.headCircumference.push({
          age: i,
          value: 35 + i * 0.5 // 简化公式
        });
      }
    } else {
      // 女孩WHO头围标准（简化）
      for (let i = 0; i <= 24; i++) {
        whoStandard.headCircumference.push({
          age: i,
          value: 34 + i * 0.5 // 简化公式
        });
      }
    }
    
    this.setData({ whoStandard });
  },
  
  // 初始化图表
  initChart: function(F2, config) {
    const { activeTab, chartData, whoStandard, currentChild } = this.data;
    const chart = new F2.Chart(config);
  
    // 合并用户数据和WHO标准数据
    const userData = chartData[activeTab].map(item => ({
      age: item.age, // 使用 age 字段
      value: item.value,
      type: currentChild.name || '用户数据' // 使用当前儿童名字或默认值
    }));

    const standardData = whoStandard[activeTab].map(item => ({
      age: item.age, // 使用 age 字段
      value: item.value,
      type: 'WHO标准'
    }));

    // 保证即使没有用户数据也能显示WHO标准曲线
    let source = [];
    if (userData.length === 0 && standardData.length > 0) {
      source = [...standardData];
    } else {
      source = [...userData, ...standardData];
    }
  
    if (source.length === 0) {
      // 显示空状态提示
      chart.guide().text({
        position: ['50%', '50%'],
        content: '暂无数据，请添加记录',
        style: {
          fill: '#999',
          fontSize: 14,
          textAlign: 'center'
        }
      });
      chart.render();
      return { chart };
    }
  
    chart.source(source, {
      age: {
        min: 0,
        max: 24, // 假设最大24个月
        tickCount: 7,
        formatter: (val) => `${val}月` // 添加单位
      },
      value: {
        nice: true
      }
    });
  
    // 配置坐标轴
    chart.axis('age', {
      label: function label(text, index, total) {
        const cfg = {
          textAlign: 'center'
        };
        return cfg;
      }
    });
  
    chart.axis('value', {
      label: function label(text) {
        const cfg = {};
        // 根据不同的图表类型添加不同的单位
        if (activeTab === 'height' || activeTab === 'headCircumference') {
          cfg.text = text + ' cm';
        } else if (activeTab === 'weight') {
          cfg.text = text + ' kg';
        }
        return cfg;
      }
    });
  
    // 配置图例
    chart.legend({
      position: 'top',
      align: 'center'
    });
  
    // 配置提示信息
    chart.tooltip({
      showCrosshairs: true,
      showItemMarker: false,
      onShow: function onShow(ev) {
        const items = ev.items;
        items.forEach(function(item) {
          if (activeTab === 'height' || activeTab === 'headCircumference') {
            item.value = item.value + ' cm';
          } else if (activeTab === 'weight') {
            item.value = item.value + ' kg';
          }
        });
      }
    });
  
    // 绘制线条
    chart.line().position('age*value').color('type', (val) => {
      if (val === 'WHO标准') return '#AAAAAA';
      return '#FF6B6B'; // 用户数据颜色
    }).shape('smooth').size((val) => {
      if (val === 'WHO标准') return 2;
      return 3; // 用户数据线条粗一些
    });
  
    // 绘制点
    chart.point().position('age*value').color('type', (val) => {
      if (val === 'WHO标准') return '#AAAAAA';
      return '#FF6B6B'; // 用户数据颜色
    }).size((val) => {
      if (val === 'WHO标准') return 3;
      return 5; // 用户数据点大一些
    }).style('type', (val) => {
      if (val === 'WHO标准') {
        return {
          fill: '#AAAAAA',
          stroke: '#AAAAAA'
        };
      }
      return {
        fill: '#FFFFFF',
        stroke: '#FF6B6B',
        lineWidth: 2
      };
    });
  
    chart.render();
    return { chart };
  }
});