// pages/growth-monitor/growth-monitor.js
const F2 = require('../../miniprogram_npm/@antv/f2/index');

Page({
  data: {
    childInfo: [],
    currentChildIndex: 0,
    currentChild: {},
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

  onLoad() {
    // 获取儿童信息
    const childInfo = wx.getStorageSync('childInfo') || [];
    if (childInfo.length === 0) {
      wx.redirectTo({
        url: '/pages/info-collection/info-collection'
      });
      return;
    }

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
  },
  
  // 计算实际月龄和矫正胎龄
  calculateAges(birthDateStr, expectedDateStr) {
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
  switchChild(e) {
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
  
  // 显示/隐藏添加记录表单
  toggleAddForm() {
    this.setData({
      showAddForm: !this.data.showAddForm
    });
  },
  
  // 日期选择器变化
  onDateChange(e) {
    this.setData({
      'newRecord.date': e.detail.value
    });
  },
  
  // 输入框事件处理
  onHeightInput(e) {
    this.setData({
      'newRecord.height': e.detail.value
    });
  },
  
  onWeightInput(e) {
    this.setData({
      'newRecord.weight': e.detail.value
    });
  },
  
  onHeadCircumferenceInput(e) {
    this.setData({
      'newRecord.headCircumference': e.detail.value
    });
  },
  
  // 添加生长记录
  addGrowthRecord() {
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
  deleteRecord(e) {
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
  // 添加 initChart 函数，用于 wx-f2 组件初始化
  initChart(F2, config) {
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
        const cfg = {};
        if (index === 0) {
          cfg.textAlign = 'left';
        } else if (index === total - 1) {
          cfg.textAlign = 'right';
        }
        return cfg;
      }
    });
  
    chart.axis('value', {
      label: (text) => {
        const unit = this.getUnit(activeTab);
        return `${text}${unit}`;
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
      showItemMarker: true,
      background: {
        radius: 2,
        fill: '#FFF',
        padding: [6, 10]
      },
      onShow: (ev) => {
        const items = ev.items;
        const unit = this.getUnit(activeTab);
        items[0].name = items[0].title; // 通常 age 是 title
        items[0].value = `${items[0].value} ${unit}`;
      }
    });
  
    // 绘制折线图
    chart.line()
      .position('age*value')
      .color('type', ['#FF7675', '#74B9FF']) // 用户数据在前，WHO标准在后
      .shape('smooth');
  
    // 绘制点
    chart.point()
      .position('age*value')
      .color('type', ['#FF7675', '#74B9FF'])
      .style({
        lineWidth: 1,
        stroke: '#fff'
      });
  
    chart.render();
  
    // 保存图表实例，以便后续更新
    this.chart = chart;
    this.setData({ chartRendered: true }, () => {
      this.chart.repaint();
    });
  
    return { chart }; // 返回 chart 实例
  },
  
  // 切换图表标签
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      activeTab: tab,
      chartRendered: false // 切换时重置渲染状态，等待 initChart 重新渲染
    });
    // 数据已准备好，wx-f2 会自动调用 initChart
    // 如果 chart 实例已存在，可以调用 chart.changeData() 更新数据
    if (this.chart) {
      const { chartData, whoStandard, currentChild } = this.data;
      const userData = chartData[tab].map(item => ({
        age: item.age,
        value: item.value,
        type: currentChild.name || '用户数据'
      }));
      const standardData = whoStandard[tab].map(item => ({
        age: item.age,
        value: item.value,
        type: 'WHO标准'
      }));
      const source = [...userData, ...standardData];
  
      // 更新 Y 轴单位
      const unit = this.getUnit(tab);
      this.chart.axis('value', {
        label: (text) => `${text}${unit}`
      });
      // 更新 tooltip 单位
      this.chart.tooltip({
        onShow: (ev) => {
          const items = ev.items;
          items[0].name = items[0].title;
          items[0].value = `${items[0].value} ${unit}`;
        }
      });
  
      this.chart.changeData(source);
      this.setData({ chartRendered: true }, () => {
      this.chart.repaint();
    });
    } else {
      // 如果 chart 实例还未创建（首次加载或切换儿童后），
      // wx-f2 会自动调用 initChart，无需手动操作
      // 但需要确保 prepareChartData 已经完成
      console.log('Chart instance not ready, waiting for initChart.');
    }
  },
  
  // 准备图表数据
  prepareChartData() {
    const { growthRecords, correctedAge } = this.data;
    const heightData = [];
    const weightData = [];
    const headCircumferenceData = [];
  
    growthRecords.forEach(record => {
      // 使用矫正月龄作为 X 轴
      const recordDate = new Date(record.date);
      const birthDate = new Date(this.data.currentChild.birthDate);
      const expectedDate = new Date(this.data.currentChild.expectedDate);
  
      // 计算记录日期时的实际月龄
      const monthDiff = (recordDate.getFullYear() - birthDate.getFullYear()) * 12 + recordDate.getMonth() - birthDate.getMonth();
      const recordActualAge = monthDiff + (recordDate.getDate() >= birthDate.getDate() ? 0 : -1);
  
      // 计算预产期和出生日期之间的差值（月）
      const correctionMonths = (expectedDate.getFullYear() - birthDate.getFullYear()) * 12 +
                              expectedDate.getMonth() - birthDate.getMonth() +
                              (expectedDate.getDate() >= birthDate.getDate() ? 0 : -1);
  
      // 记录日期时的矫正月龄
      const recordCorrectedAge = recordActualAge + correctionMonths;
  
      if (record.height !== null) {
        heightData.push({ age: recordCorrectedAge, value: record.height });
      }
      if (record.weight !== null) {
        weightData.push({ age: recordCorrectedAge, value: record.weight });
      }
      if (record.headCircumference !== null) {
        headCircumferenceData.push({ age: recordCorrectedAge, value: record.headCircumference });
      }
    });
  
    // 按矫正月龄排序
    heightData.sort((a, b) => a.age - b.age);
    weightData.sort((a, b) => a.age - b.age);
    headCircumferenceData.sort((a, b) => a.age - b.age);
  
    this.setData({
      'chartData.height': heightData,
      'chartData.weight': weightData,
      'chartData.headCircumference': headCircumferenceData,
      chartRendered: false // 准备新数据后，重置渲染状态
    });
  
    // 如果图表已初始化，则更新数据
    if (this.chart) {
      this.switchTab({ currentTarget: { dataset: { tab: this.data.activeTab } } });
    }
  },
  
  // 加载WHO标准数据 (模拟)
  loadWHOStandards() {
    // 这里应该是从服务器或本地文件加载真实的WHO标准数据
    // 以下是模拟数据结构，你需要替换为真实数据
    // 数据格式应为 { age: 月龄, value: 标准值 }
    const standardHeight = [
      { age: 0, value: 50 }, { age: 3, value: 60 }, { age: 6, value: 68 },
      { age: 9, value: 73 }, { age: 12, value: 76 }, { age: 18, value: 82 },
      { age: 24, value: 87 }
    ];
    const standardWeight = [
      { age: 0, value: 3.3 }, { age: 3, value: 6 }, { age: 6, value: 7.9 },
      { age: 9, value: 9.2 }, { age: 12, value: 10.2 }, { age: 18, value: 11.8 },
      { age: 24, value: 13 }
    ];
    const standardHeadCircumference = [
      { age: 0, value: 34 }, { age: 3, value: 40 }, { age: 6, value: 43 },
      { age: 9, value: 45 }, { age: 12, value: 46 }, { age: 18, value: 47.5 },
      { age: 24, value: 48.5 }
    ];
  
    this.setData({
      'whoStandard.height': standardHeight,
      'whoStandard.weight': standardWeight,
      'whoStandard.headCircumference': standardHeadCircumference
    });
  
    // 标准数据加载后，如果图表已初始化，尝试更新
    if (this.chart) {
      this.switchTab({ currentTarget: { dataset: { tab: this.data.activeTab } } });
    }
  },
  
  // 获取单位
  getUnit(type) {
      switch (type) {
        case 'height': return 'cm';
        case 'weight': return 'kg';
        case 'headCircumference': return 'cm';
        default: return '';
      }
  },
  
  // 删除记录
  deleteRecord(e) {
    const index = e.currentTarget.dataset.index;
    const { growthRecords, currentChild } = this.data;
  
    wx.showModal({
      title: '确认删除',
      content: `确定要删除 ${growthRecords[index].date} 的记录吗？`,
      success: (res) => {
        if (res.confirm) {
          const updatedRecords = [...growthRecords];
          updatedRecords.splice(index, 1);
  
          const storageKey = `growthRecords_${currentChild.name}`;
          wx.setStorageSync(storageKey, updatedRecords);
  
          this.setData({ growthRecords: updatedRecords });
          this.prepareChartData(); // 删除后重新准备图表数据
        }
      }
    });
  },
  
  // 页面准备好后（移除旧的渲染逻辑）
  onReady() {
    // 不再需要在 onReady 中手动渲染图表
    // wx-f2 组件会自动调用 initChart
    // this.renderChart(); // 移除或注释掉这行
  }
  
  // 旧的 renderChart 函数，现在不再直接使用，其逻辑已移入 initChart
  /*
  renderChart() {
    // ... (保留注释掉的旧代码以供参考，或者直接删除)
    const { activeTab, chartData, whoStandard } = this.data;
    const chart = new F2.Chart({
      pixelRatio: wx.getSystemInfoSync().pixelRatio
    });
    
    // ... (旧的合并数据逻辑)
    
    chart.source(source, { ... });
    
    // ... (旧的坐标轴配置)
    
    chart.line()...;
    chart.point()...;
    
    chart.render();
    
    this.setData({ chartRendered: true }, () => {
      this.chart.repaint();
    });
    // ... (旧的 createSelectorQuery 和 createCanvasContext 逻辑)
  }
  */
});