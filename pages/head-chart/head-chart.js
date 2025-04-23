// pages/head-chart/head-chart.js
const app = getApp();

Page({
  data: {
    childId: '',
    childInfo: {},
    // 直接初始化示例数据
    whoStandard: [
      { age: 0, value: 35, type: 'WHO标准' },
      { age: 3, value: 40, type: 'WHO标准' },
      { age: 6, value: 43, type: 'WHO标准' },
      { age: 9, value: 45, type: 'WHO标准' },
      { age: 12, value: 47, type: 'WHO标准' }
    ],
    growthRecords: [], // 生长记录数据
    newRecord: {
      date: '',
      headCircumference: ''
    },
    showAddForm: false
  },

  onLoad: function (options) {
    console.log('头围图表页面加载中...');

    // 获取传递的参数
    const childId = options.childId || 'default';
    this.setData({ childId });

    // 获取宝宝信息
    const childInfo = wx.getStorageSync('childInfo') || [];
    let currentChild = {};

    if (childId !== 'default') {
      // 查找对应的宝宝信息
      for (let child of childInfo) {
        if (encodeURIComponent(child.name) === childId) {
          currentChild = child;
          break;
        }
      }
    } else if (childInfo.length > 0) {
      // 如果没有指定宝宝，使用第一个宝宝
      currentChild = childInfo[0];
    }

    // 设置今天的日期作为默认录入日期
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // 获取生长记录
    let growthRecords = [];
    if (currentChild && currentChild.name) {
      const storageKey = `growthRecords_${currentChild.name}`;
      growthRecords = wx.getStorageSync(storageKey) || [];
    }

    this.setData({
      childInfo: currentChild,
      growthRecords: growthRecords,
      'newRecord.date': dateStr
    });
  },

  onReady: function () {
    // 添加延时确保页面已完全渲染
    setTimeout(() => {
      this.drawSimpleChart();
    }, 300);
  },

  // 切换添加记录表单的显示状态
  toggleAddForm: function() {
    this.setData({
      showAddForm: !this.data.showAddForm
    });
  },

  // 处理日期选择变化
  onDateChange: function(e) {
    this.setData({
      'newRecord.date': e.detail.value
    });
  },

  // 处理头围输入变化
  onHeadCircumferenceInput: function(e) {
    this.setData({
      'newRecord.headCircumference': e.detail.value
    });
  },

  // 添加生长记录
  addGrowthRecord: function() {
    // 验证输入
    if (!this.data.newRecord.date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return;
    }

    if (!this.data.newRecord.headCircumference) {
      wx.showToast({
        title: '请输入头围',
        icon: 'none'
      });
      return;
    }

    // 创建新记录
    const newRecord = {
      date: this.data.newRecord.date,
      height: null,
      weight: null,
      headCircumference: parseFloat(this.data.newRecord.headCircumference)
    };

    // 添加到记录列表
    const updatedRecords = [...this.data.growthRecords, newRecord];
    
    // 按日期排序
    updatedRecords.sort((a, b) => {
      return new Date(a.date) - new Date(b.date);
    });

    // 保存到本地存储
    if (this.data.childInfo && this.data.childInfo.name) {
      const storageKey = `growthRecords_${this.data.childInfo.name}`;
      wx.setStorageSync(storageKey, updatedRecords);
    }

    // 更新页面数据
    this.setData({
      growthRecords: updatedRecords,
      showAddForm: false,
      newRecord: {
        date: this.data.newRecord.date, // 保留当前日期
        headCircumference: ''
      }
    });

    // 提示成功并返回首页
    wx.showToast({
      title: '记录已添加',
      icon: 'success',
      duration: 1500,
      success: () => {
        // 如果是从首页跳转来的（hideRecords为true），则添加成功后返回首页
        if (this.data.hideRecords) {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          // 重新绘制图表
          this.drawSimpleChart();
        }
      }
    });
  },

  // 删除记录
  deleteRecord: function(e) {
    const index = e.currentTarget.dataset.index;
    const records = [...this.data.growthRecords];
    
    // 从数组中移除该记录
    records.splice(index, 1);

    // 保存到本地存储
    if (this.data.childInfo && this.data.childInfo.name) {
      const storageKey = `growthRecords_${this.data.childInfo.name}`;
      wx.setStorageSync(storageKey, records);
    }

    // 更新页面数据
    this.setData({
      growthRecords: records
    });

    // 提示成功
    wx.showToast({
      title: '记录已删除',
      icon: 'success'
    });

    // 重新绘制图表
    this.drawSimpleChart();
  },

  // 返回上一页
  navigateBack: function() {
    wx.navigateBack();
  },

  // 使用canvas绘制简单图表
  drawSimpleChart: function () {
    // 获取系统信息以适应不同屏幕
    const systemInfo = wx.getSystemInfoSync();
    const screenWidth = systemInfo.windowWidth;

    // 创建画布上下文
    const ctx = wx.createCanvasContext('head-chart');
    const data = this.data.whoStandard;

    // 设置图表尺寸 - 使用屏幕宽度
    const width = screenWidth - 20; // 左右各留10px边距
    const height = 300; // 增加高度
    const padding = { top: 60, right: 30, bottom: 40, left: 50 }; // 增加左边距，给Y轴刻度留更多空间

    // 计算图表区域
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 找出最大值和最小值
    const maxAge = 12; // 根据实际数据设置最大月龄
    const minAge = 0;
    // 为头围数据设置合理的值范围
    const maxValue = 50; // 设置一个合理的最大头围值
    const minValue = 30; // 设置一个合理的最小头围值
    const valueRange = maxValue - minValue;

    // 清空画布并设置背景
    ctx.clearRect(0, 0, width, height);
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, width, height);

    // 绘制坐标轴
    ctx.beginPath();
    ctx.setLineWidth(1);
    ctx.setStrokeStyle('#333333');
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // 绘制X轴刻度和网格线 - 确保文字颜色设置正确
    const xStep = chartWidth / 6;
    for (let i = 0; i <= 6; i++) {
      const x = padding.left + i * xStep;
      const age = Math.round(minAge + (maxAge - minAge) * (i / 6));

      // 刻度线
      ctx.beginPath();
      ctx.moveTo(x, height - padding.bottom);
      ctx.lineTo(x, height - padding.bottom + 5);
      ctx.stroke();

      // 刻度值 - 确保设置了文字颜色
      ctx.setFontSize(10);
      ctx.setTextAlign('center');
      ctx.setFillStyle('#000000'); // 明确设置文字颜色为黑色
      ctx.fillText(`${age}`, x, height - padding.bottom + 15);
    }

    // 绘制Y轴刻度和网格线
    const yStep = chartHeight / 5;
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + i * yStep;
      const value = maxValue - (valueRange * (i / 5));
      
      // 刻度线
      ctx.beginPath();
      ctx.setLineWidth(0.5);
      ctx.setStrokeStyle('#cccccc');
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      // 刻度文字
      ctx.setFontSize(10);
      ctx.setFillStyle('#333333');
      ctx.fillText(`${value.toFixed(0)}cm`, padding.left - 30, y + 5);
    }

    // 绘制X轴标签
    ctx.setFontSize(12); // 增大字体
    ctx.setTextAlign('center');
    ctx.setFillStyle('#333333'); // 确保文字颜色明显
    ctx.fillText('月龄(月)', width / 2, height - 15); // 调整位置

    // 绘制Y轴标签
    ctx.save();
    ctx.setFontSize(14); // 增大字体
    ctx.setFillStyle('#333333'); // 确保文字颜色明显
    // 调整位置，使标签更靠近Y轴但不重叠
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.setTextAlign('center');
    ctx.fillText('头围(cm)', 0, 0); // 向左偏移，避免与刻度重叠
    ctx.restore();

    // 绘制数据线
    if (data.length > 0) {
      ctx.beginPath();
      ctx.setLineWidth(2);
      ctx.setStrokeStyle('#2FC25B');

      // 计算第一个点的位置
      const firstPoint = data[0];
      const firstX = padding.left + (firstPoint.age - minAge) / (maxAge - minAge) * chartWidth;
      const firstY = height - padding.bottom - (firstPoint.value - minValue) / valueRange * chartHeight;

      ctx.moveTo(firstX, firstY);

      // 绘制其余点并连线
      for (let i = 1; i < data.length; i++) {
        const point = data[i];
        const x = padding.left + (point.age - minAge) / (maxAge - minAge) * chartWidth;
        const y = height - padding.bottom - (point.value - minValue) / valueRange * chartHeight;

        ctx.lineTo(x, y);
      }

      ctx.stroke();

      // 绘制数据点
      for (let i = 0; i < data.length; i++) {
        const point = data[i];
        const x = padding.left + (point.age - minAge) / (maxAge - minAge) * chartWidth;
        const y = height - padding.bottom - (point.value - minValue) / valueRange * chartHeight;

        ctx.beginPath();
        ctx.setFillStyle('#2FC25B');
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.setLineWidth(1);
        ctx.setStrokeStyle('#ffffff');
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 绘制图例
    ctx.beginPath();
    ctx.setFillStyle('#2FC25B');
    ctx.rect(padding.left, padding.top - 25, 15, 10);
    ctx.fill();

    ctx.setFontSize(12);
    ctx.setTextAlign('left');
    ctx.setFillStyle('#333333');
    ctx.fillText('WHO标准', padding.left + 20, padding.top - 17);

    // 删除这一行，因为下面已经有一个draw调用
    // ctx.draw(true); // 使用true参数，保留之前的绘制内容

    // 执行绘制并添加回调函数
    ctx.draw(false, () => {
      console.log('头围图表绘制完成');
    });
  },

  // 返回上一页
  navigateBack: function () {
    wx.navigateBack();
  }
});