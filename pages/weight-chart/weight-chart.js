// pages/weight-chart/weight-chart.js
const app = getApp();

Page({
  data: {
    childId: '',
    childInfo: {},
    // Direct initialization of sample data
    whoStandard: [
      { age: 0, value: 3.5, type: 'WHO标准' },
      { age: 3, value: 6, type: 'WHO标准' },
      { age: 6, value: 8, type: 'WHO标准' },
      { age: 9, value: 9, type: 'WHO标准' },
      { age: 12, value: 10, type: 'WHO标准' },
      { age: 18, value: 11, type: 'WHO标准' },
      { age: 24, value: 12, type: 'WHO标准' },
      { age: 36, value: 14, type: 'WHO标准' }
    ],
    growthRecords: [], // 生长记录数据
    newRecord: {
      date: '',
      weight: ''
    },
    showAddForm: false
  },

  onLoad: function (options) {
    console.log('体重图表页面加载中...');

    // Get passed parameters
    const childId = options.childId || 'default';
    this.setData({ childId });

    // Get child information
    const childInfo = wx.getStorageSync('childInfo') || [];
    let currentChild = {};

    if (childId !== 'default') {
      // Find the corresponding child info
      for (let child of childInfo) {
        if (encodeURIComponent(child.name) === childId) {
          currentChild = child;
          break;
        }
      }
    } else if (childInfo.length > 0) {
      // If no child is specified, use the first child
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
    // Initialize chart after page rendering is complete
    this.drawSimpleChart();
  },

  // Draw a simple chart using canvas
  drawSimpleChart: function () {
    // 获取系统信息以适应不同屏幕
    const systemInfo = wx.getSystemInfoSync();
    const screenWidth = systemInfo.windowWidth;

    // 创建画布上下文
    const ctx = wx.createCanvasContext('weight-chart');
    const whoData = this.data.whoStandard;

    // 设置图表尺寸 - 使用屏幕宽度
    const width = screenWidth - 20; // 左右各留10px边距
    const height = 300; // 增加高度
    const padding = { top: 60, right: 30, bottom: 40, left: 50 }; // 增加左边距，给Y轴刻度留更多空间

    // 计算图表区域
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // 找出最大值和最小值
    const maxAge = 36; // 根据实际数据设置最大月龄
    const minAge = 0;
    // 为体重数据设置合理的值范围
    const maxValue = 20; // 设置一个合理的最大体重值
    const minValue = 2; // 设置一个合理的最小体重值
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

    // 准备用户数据
    let userGrowthData = [];
    if (this.data.growthRecords && this.data.growthRecords.length > 0) {
      // 从生长记录中提取体重数据
      userGrowthData = this.data.growthRecords
        .filter(record => record.weight !== null && record.weight !== undefined)
        .map(record => {
          // 计算月龄 - 假设有出生日期信息
          let ageInMonths = 0;
          if (this.data.childInfo && this.data.childInfo.birthdate) {
            const birthDate = new Date(this.data.childInfo.birthdate);
            const recordDate = new Date(record.date);
            const diffTime = Math.abs(recordDate - birthDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            ageInMonths = Math.floor(diffDays / 30.44); // 平均每月天数
          }
          
          return {
            age: ageInMonths,
            value: record.weight,
            date: record.date
          };
        });
    }
    
    // 绘制X轴刻度和网格线
    const xStep = chartWidth / 6; // 6 segments
    for (let i = 0; i <= 6; i++) {
      const x = padding.left + i * xStep;
      const age = Math.round(minAge + (maxAge - minAge) * (i / 6));

      // 刻度线
      ctx.beginPath();
      ctx.moveTo(x, height - padding.bottom);
      ctx.lineTo(x, height - padding.bottom + 5);
      ctx.stroke();

      // 刻度值
      ctx.setFontSize(10);
      ctx.setTextAlign('center');
      ctx.setFillStyle('#000000'); // 明确设置文字颜色为黑色
      ctx.fillText(`${age}`, x, height - padding.bottom + 15);

      // 网格线
      if (i > 0) {
        ctx.beginPath();
        ctx.setLineWidth(0.5);
        ctx.setStrokeStyle('#e8e8e8');
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
      }
    }

    // 绘制Y轴刻度和网格线
    const yStep = chartHeight / 4; // 4 segments
    for (let i = 0; i <= 4; i++) {
      const y = height - padding.bottom - i * yStep;
      const value = minValue + valueRange * (i / 4);

      // 刻度线
      ctx.beginPath();
      ctx.setLineWidth(1);
      ctx.setStrokeStyle('#333333');
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left - 5, y);
      ctx.stroke();

      // 刻度值
      ctx.setFontSize(10);
      ctx.setTextAlign('right');
      ctx.setFillStyle('#000000'); // 明确设置文字颜色为黑色
      ctx.fillText(value.toFixed(1), padding.left - 8, y + 3);

      // 网格线
      if (i > 0) {
        ctx.beginPath();
        ctx.setLineWidth(0.5);
        ctx.setStrokeStyle('#e8e8e8');
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }
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
    ctx.fillText('体重(kg)', 0, 0); // 向左偏移，避免与刻度重叠
    ctx.restore();

    // 绘制WHO标准曲线
    ctx.beginPath();
    ctx.setLineWidth(2);
    ctx.setStrokeStyle('#1890FF'); // 蓝色

    for (let i = 0; i < whoData.length; i++) {
      const item = whoData[i];
      const x = padding.left + (item.age / maxAge) * chartWidth;
      const y = padding.top + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    ctx.stroke();

    // 绘制用户数据曲线
    if (userGrowthData && userGrowthData.length > 0) {
      ctx.beginPath();
      ctx.setLineWidth(2);
      ctx.setStrokeStyle('#FF4500'); // 红色

      for (let i = 0; i < userGrowthData.length; i++) {
        const item = userGrowthData[i];
        const x = padding.left + (item.age / maxAge) * chartWidth;
        const y = padding.top + chartHeight - ((item.value - minValue) / valueRange) * chartHeight;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        // 绘制数据点
        ctx.setFillStyle('#FF4500');
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // 绘制数据点边框
        ctx.beginPath();
        ctx.setLineWidth(1);
        ctx.setStrokeStyle('#ffffff');
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.stroke();
    }

    // 绘制图例
    // WHO标准图例
    ctx.beginPath();
    ctx.setFillStyle('#1890FF');
    ctx.rect(padding.left, padding.top - 25, 15, 10);
    ctx.fill();

    ctx.setFontSize(12);
    ctx.setTextAlign('left');
    ctx.setFillStyle('#333333');
    ctx.fillText('WHO标准', padding.left + 20, padding.top - 17);

    // 用户数据图例
    if (userGrowthData && userGrowthData.length > 0) {
      ctx.beginPath();
      ctx.setFillStyle('#FF4500');
      ctx.rect(padding.left + 100, padding.top - 25, 15, 10);
      ctx.fill();

      ctx.setFontSize(12);
      ctx.setTextAlign('left');
      ctx.setFillStyle('#333333');
      ctx.fillText('宝宝数据', padding.left + 120, padding.top - 17);
    }

    // 执行绘制并添加回调函数
    ctx.draw(false, () => {
      console.log('体重图表绘制完成');
    });
  },

  // Return to previous page
  navigateBack: function () {
    wx.navigateBack();
  },

  // 显示/隐藏添加记录表单
  toggleAddForm: function () {
    this.setData({
      showAddForm: !this.data.showAddForm
    });
  },

  // 日期选择器变化
  onDateChange: function (e) {
    this.setData({
      'newRecord.date': e.detail.value
    });
  },

  // 输入框事件处理
  onWeightInput: function (e) {
    this.setData({
      'newRecord.weight': e.detail.value
    });
  },

  // 添加生长记录
  addGrowthRecord: function () {
    const { newRecord, childInfo, growthRecords } = this.data;

    // 验证输入
    if (!newRecord.date) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return;
    }

    if (!newRecord.weight) {
      wx.showToast({
        title: '请输入体重数据',
        icon: 'none'
      });
      return;
    }

    // 创建新记录
    const record = {
      date: newRecord.date,
      weight: parseFloat(newRecord.weight),
      height: null,
      headCircumference: null
    };

    // 添加到记录列表
    const updatedRecords = [...growthRecords, record];

    // 按日期排序
    updatedRecords.sort((a, b) => new Date(a.date) - new Date(b.date));

    // 保存到本地存储
    if (childInfo && childInfo.name) {
      const storageKey = `growthRecords_${childInfo.name}`;
      wx.setStorageSync(storageKey, updatedRecords);
    }

    // 更新状态
    this.setData({
      growthRecords: updatedRecords,
      newRecord: {
        date: newRecord.date,
        weight: ''
      },
      showAddForm: false
    }, () => {
      // 重新绘制图表
      this.drawSimpleChart();

      // 显示成功提示
      wx.showToast({
        title: '记录添加成功',
        icon: 'success',
        duration: 1500
      });
    });
  },

  // 删除生长记录
  deleteRecord: function (e) {
    const index = e.currentTarget.dataset.index;
    const { growthRecords, childInfo } = this.data;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 更新记录列表
          const updatedRecords = [...growthRecords];
          updatedRecords.splice(index, 1);

          // 保存到本地存储
          if (childInfo && childInfo.name) {
            const storageKey = `growthRecords_${childInfo.name}`;
            wx.setStorageSync(storageKey, updatedRecords);
          }

          // 更新状态
          this.setData({
            growthRecords: updatedRecords
          }, () => {
            // 重新绘制图表
            this.drawSimpleChart();

            // 显示成功提示
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          });
        }
      }
    });
  }
});