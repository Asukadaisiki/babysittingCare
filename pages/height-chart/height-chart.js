// pages/head-chart/head-chart.js
const app = getApp();

Page({
  data: {
    childId: '',
    childInfo: {},
    // 直接初始化示例数据
    whoStandard: [
      { age: 0, value: 50, type: 'WHO标准' },
      { age: 3, value: 61, type: 'WHO标准' },
      { age: 6, value: 67, type: 'WHO标准' },
      { age: 9, value: 72, type: 'WHO标准' },
      { age: 12, value: 76, type: 'WHO标准' }
    ],
    growthRecords: [], // 生长记录数据
    newRecord: {
      date: '',
      height: ''  // 修改属性名
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
  toggleAddForm: function () {
    this.setData({
      showAddForm: !this.data.showAddForm
    });
  },

  // 处理日期选择变化
  onDateChange: function (e) {
    this.setData({
      'newRecord.date': e.detail.value
    });
  },

  // 处理身高输入变化
  onHeightInput: function (e) {  // 修改函数名
    this.setData({
      'newRecord.height': e.detail.value
    });
  },

  // 使用canvas绘制简单图表
  drawSimpleChart: function () { // 修改函数名
    // 调用身高图表绘制函数
    this.drawHeightChart();
  },

  // 绘制身高曲线图
  drawHeightChart: function () { // 修改函数名
    const ctx = wx.createCanvasContext('height-chart'); // 修改canvas ID
    const records = this.data.growthRecords;

    // 使用 whoStandard 数据
    const standardData = this.data.whoStandard;

    // 设置图表边距和尺寸
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const canvasWidth = 320;
    const canvasHeight = 300;
    const chartWidth = canvasWidth - margin.left - margin.right;
    const chartHeight = canvasHeight - margin.top - margin.bottom;

    // 找出所有记录的月龄范围
    let minMonth = 0;
    let maxMonth = 12; // 根据 whoStandard 数据调整为 12 个月

    // 如果有记录，则根据记录的月龄调整范围
    if (records.length > 0) {
      // 修改：优先使用用户输入的月龄数据
      records.forEach(record => {
        // 优先使用用户输入的月龄，如果没有则根据日期计算
        let monthAge;
        if (record.ageInMonths !== null && record.ageInMonths !== undefined) {
          monthAge = parseFloat(record.ageInMonths);
        } else {
          const birthDate = new Date(this.data.childInfo.birthDate);
          const recordDate = new Date(record.date);
          monthAge = (recordDate.getFullYear() - birthDate.getFullYear()) * 12 +
            recordDate.getMonth() - birthDate.getMonth();
        }

        minMonth = Math.min(minMonth, monthAge);
        maxMonth = Math.max(maxMonth, monthAge);
      });
    }

    // 确保范围至少包含0-12个月
    minMonth = Math.max(0, Math.min(minMonth, 0));
    maxMonth = Math.max(12, maxMonth);

    // 设置X轴和Y轴的比例尺
    const xScale = chartWidth / maxMonth;
    const yMin = 50; // 身高最小值 (cm)
    const yMax = 76; // 身高最大值 (cm)
    const yScale = chartHeight / (yMax - yMin);

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制坐标轴
    ctx.beginPath();
    ctx.setLineWidth(1);
    ctx.setStrokeStyle('#333333');

    // X轴
    ctx.moveTo(margin.left, canvasHeight - margin.bottom);
    ctx.lineTo(margin.left + chartWidth, canvasHeight - margin.bottom);

    // Y轴
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, canvasHeight - margin.bottom);
    ctx.stroke();

    // 绘制X轴刻度和标签
    ctx.setFontSize(10);
    ctx.setTextAlign('center');
    ctx.setTextBaseline('top');
    ctx.setFillStyle('#333333');

    // 绘制X轴网格线和刻度
    for (let month = 0; month <= maxMonth; month += 3) {
      const x = margin.left + month * xScale;

      // 网格线
      ctx.beginPath();
      ctx.setLineWidth(0.5);
      ctx.setStrokeStyle('#eeeeee');
      ctx.moveTo(x, margin.top);
      ctx.lineTo(x, canvasHeight - margin.bottom);
      ctx.stroke();

      // 刻度线
      ctx.beginPath();
      ctx.setLineWidth(1);
      ctx.setStrokeStyle('#333333');
      ctx.moveTo(x, canvasHeight - margin.bottom);
      ctx.lineTo(x, canvasHeight - margin.bottom + 5);
      ctx.stroke();

      // 标签
      ctx.fillText(`${month}月`, x, canvasHeight - margin.bottom + 8);
    }

    // 绘制Y轴刻度和标签
    ctx.setTextAlign('right');
    ctx.setTextBaseline('middle');

    // 绘制Y轴网格线和刻度
    for (let cm = yMin; cm <= yMax; cm += 5) {
      const y = canvasHeight - margin.bottom - (cm - yMin) * yScale;

      // 网格线
      ctx.beginPath();
      ctx.setLineWidth(0.5);
      ctx.setStrokeStyle('#eeeeee');
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();

      // 刻度线
      ctx.beginPath();
      ctx.setLineWidth(1);
      ctx.setStrokeStyle('#333333');
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left - 5, y);
      ctx.stroke();

      // 标签
      ctx.fillText(`${cm}cm`, margin.left - 8, y);
    }

    // 绘制X轴和Y轴标题
    ctx.setFontSize(12);
    ctx.setTextAlign('center');
    ctx.fillText('月龄(月)', canvasWidth / 2, canvasHeight - 10);

    ctx.save();
    ctx.translate(15, canvasHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('身高(cm)', 0, 0);
    ctx.restore();

    // 绘制WHO标准曲线
    ctx.beginPath();
    ctx.setStrokeStyle('#4caf50');
    ctx.setLineWidth(2);

    standardData.forEach((point, index) => {
      const x = margin.left + point.age * xScale;
      const y = canvasHeight - margin.bottom - (point.value - yMin) * yScale;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // 绘制宝宝的实际身高数据点
    if (records.length > 0) {
      // 先绘制连接线
      ctx.beginPath();
      ctx.setStrokeStyle('#e91e63');
      ctx.setLineWidth(1.5);
    
      // 按月龄排序记录
      const sortedRecords = [...records].filter(record => record.height)
        .map(record => {
          let monthAge;
          if (record.ageInMonths !== null && record.ageInMonths !== undefined) {
            monthAge = parseFloat(record.ageInMonths);
          } else {
            const birthDate = new Date(this.data.childInfo.birthDate);
            const recordDate = new Date(record.date);
            monthAge = (recordDate.getFullYear() - birthDate.getFullYear()) * 12 +
              recordDate.getMonth() - birthDate.getMonth();
          }
          return {
            ...record,
            monthAge
          };
        })
        .sort((a, b) => a.monthAge - b.monthAge);
    
      // 绘制连接线
      sortedRecords.forEach((record, index) => {
        const x = margin.left + record.monthAge * xScale;
        const y = canvasHeight - margin.bottom - (record.height - yMin) * yScale;
    
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
    
      ctx.stroke();
    
      // 再绘制数据点和标签
      ctx.setFillStyle('#e91e63');
    
      sortedRecords.forEach(record => {
        const x = margin.left + record.monthAge * xScale;
        const y = canvasHeight - margin.bottom - (record.height - yMin) * yScale;
    
        // 绘制数据点
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    
        // 显示数值
        ctx.setTextAlign('center');
        ctx.setTextBaseline('bottom');
        ctx.fillText(record.height.toString(), x, y - 8);
      });
    }

    // 绘制图例
    const legendX = margin.left + 10;
    let legendY = margin.top + 10;
    const legendSpacing = 20;

    // WHO标准曲线图例
    ctx.beginPath();
    ctx.setStrokeStyle('#4caf50');
    ctx.setLineWidth(2);
    ctx.moveTo(legendX, legendY);
    ctx.lineTo(legendX + 20, legendY);
    ctx.stroke();
    ctx.setTextAlign('left');
    ctx.setTextBaseline('middle');
    ctx.fillText('WHO标准', legendX + 25, legendY);

    // 宝宝数据图例
    legendY += legendSpacing;
    ctx.beginPath();
    ctx.setFillStyle('#e91e63');
    ctx.arc(legendX + 10, legendY, 4, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillText('宝宝身高', legendX + 25, legendY);

    // 绘制到画布
    ctx.draw();
  },

  // 返回上一页
  navigateBack: function () {
    wx.navigateBack();
  }
});