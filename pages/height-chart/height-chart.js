// pages/height-chart/height-chart.js
const app = getApp();

Page({
  data: {
    childId: '',
    childInfo: {},
    // 直接初始化示例数据
    whoStandard: [
      { age: 0, value: 50, type: 'WHO标准' },
      { age: 3, value: 60, type: 'WHO标准' },
      { age: 6, value: 67, type: 'WHO标准' },
      { age: 9, value: 72, type: 'WHO标准' },
      { age: 12, value: 76, type: 'WHO标准' }
    ],
    growthRecords: [], // 生长记录数据
    newRecord: {
      date: '',
      height: ''
    },
    showAddForm: false
  },

  onLoad: function (options) {
    console.log('身高图表页面加载中...');

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

  // 处理身高输入变化
  onHeightInput: function(e) {
    this.setData({
      'newRecord.height': e.detail.value
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

    if (!this.data.newRecord.height) {
      wx.showToast({
        title: '请输入身高',
        icon: 'none'
      });
      return;
    }

    // 创建新记录
    const newRecord = {
      date: this.data.newRecord.date,
      height: parseFloat(this.data.newRecord.height),
      weight: null,
      headCircumference: null
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
        height: ''
      }
    });

    // 提示成功
    wx.showToast({
      title: '记录已添加',
      icon: 'success'
    });

    // 重新绘制图表
    this.drawSimpleChart();
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
    const ctx = wx.createCanvasContext('height-chart');
    const whoData = this.data.whoStandard;

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
    // 为身高数据设置合理的值范围
    const maxValue = 100; // 设置一个合理的最大身高值
    const minValue = 45; // 设置一个合理的最小身高值
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
      // 从生长记录中提取身高数据
      userGrowthData = this.data.growthRecords
        .filter(record => record.height !== null && record.height !== undefined)
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
            value: record.height,
            date: record.date
          };
        });
    }
    
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

    // 绘制Y轴刻度和网格线 - 确保文字颜色设置正确
    const yStep = chartHeight / 4;
    for (let i = 0; i <= 4; i++) {
      const y = height - padding.bottom - i * yStep;
      const value = minValue + valueRange * (i / 4);

      // 刻度线
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left - 5, y);
      ctx.stroke();

      // 刻度值 - 确保设置了文字颜色
      ctx.setFontSize(10);
      ctx.setTextAlign('right');
      ctx.setFillStyle('#000000'); // 明确设置文字颜色为黑色
      ctx.fillText(Math.round(value), padding.left - 8, y + 3);
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
    ctx.fillText('身高(cm)', 0, 0); // 向左偏移，避免与刻度重叠
    ctx.restore();

    // 绘制WHO标准曲线
    ctx.beginPath();
    ctx.setLineWidth(2);
    ctx.setStrokeStyle('#FFA500'); // 橙色

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
      ctx.setStrokeStyle('#1890FF'); // 蓝色

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
        ctx.setFillStyle('#1890FF');
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.stroke();
    }

    // 绘制图例
    ctx.beginPath();
    ctx.setFillStyle('#FF9800');
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
      console.log('身高图表绘制完成');
    });
  },

  // 返回上一页
  navigateBack: function () {
    wx.navigateBack();
  }
});