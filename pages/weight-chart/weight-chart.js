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
    ]
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

    this.setData({
      childInfo: currentChild
    });
  },

  onReady: function () {
    // Initialize chart after page rendering is complete
    this.drawSimpleChart();
  },

  // Draw a simple chart using canvas
  drawSimpleChart: function () {
    const ctx = wx.createCanvasContext('weight-chart');
    const data = this.data.whoStandard;

    // Set chart dimensions
    const width = 300;
    const height = 200;
    const padding = { top: 60, right: 20, bottom: 40, left: 40 };

    // Calculate chart area
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Find min and max values
    const maxAge = 36;
    const minAge = 0;
    const maxValue = Math.max(...data.map(item => item.value));
    const minValue = Math.min(...data.map(item => item.value));
    const valueRange = maxValue - minValue;

    // Draw white background
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, width, height);

    // Draw title
    ctx.setFontSize(14);
    ctx.setTextAlign('center');
    ctx.setFillStyle('#000000');
    

    // Draw axes
    ctx.beginPath();
    ctx.setLineWidth(1);
    ctx.setStrokeStyle('#333333');

    // X-axis
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);

    // Y-axis
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // Draw X-axis labels and grid lines
    const xStep = chartWidth / 6; // 6 segments
    for (let i = 0; i <= 6; i++) {
      const x = padding.left + i * xStep;
      const age = Math.round(minAge + (maxAge - minAge) * (i / 6));

      // Tick mark
      ctx.beginPath();
      ctx.moveTo(x, height - padding.bottom);
      ctx.lineTo(x, height - padding.bottom + 5);
      ctx.stroke();

      // Label
      ctx.setFontSize(10);
      ctx.setTextAlign('center');
      ctx.fillText(`${age}`, x, height - padding.bottom + 15);

      // Grid line
      if (i > 0) {
        ctx.beginPath();
        ctx.setLineWidth(0.5);
        ctx.setStrokeStyle('#e8e8e8');
        ctx.moveTo(x, padding.top);
        ctx.lineTo(x, height - padding.bottom);
        ctx.stroke();
      }
    }

    // Draw Y-axis labels and grid lines
    const yStep = chartHeight / 4; // 4 segments
    for (let i = 0; i <= 4; i++) {
      const y = height - padding.bottom - i * yStep;
      const value = minValue + valueRange * (i / 4);

      // Tick mark
      ctx.beginPath();
      ctx.setLineWidth(1);
      ctx.setStrokeStyle('#333333');
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left - 5, y);
      ctx.stroke();

      // Label
      ctx.setFontSize(10);
      ctx.setTextAlign('right');
      ctx.fillText(value.toFixed(1), padding.left - 8, y + 3);

      // Grid line
      if (i > 0) {
        ctx.beginPath();
        ctx.setLineWidth(0.5);
        ctx.setStrokeStyle('#e8e8e8');
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }
    }

    // Draw X-axis label
    ctx.setFontSize(12);
    ctx.setTextAlign('center');
    ctx.fillText('月龄(月)', width / 2, height - 10);

    // Draw Y-axis label
    ctx.save();
    ctx.setFontSize(12);
    ctx.translate(15, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.setTextAlign('center');
    ctx.fillText('体重(kg)', 0, 0);
    ctx.restore();

    // Draw data line
    if (data.length > 0) {
      ctx.beginPath();
      ctx.setLineWidth(2);
      ctx.setStrokeStyle('#1890FF');

      // Calculate first point position
      const firstPoint = data[0];
      const firstX = padding.left + (firstPoint.age - minAge) / (maxAge - minAge) * chartWidth;
      const firstY = height - padding.bottom - (firstPoint.value - minValue) / valueRange * chartHeight;

      ctx.moveTo(firstX, firstY);

      // Draw remaining points and connect with lines
      for (let i = 1; i < data.length; i++) {
        const point = data[i];
        const x = padding.left + (point.age - minAge) / (maxAge - minAge) * chartWidth;
        const y = height - padding.bottom - (point.value - minValue) / valueRange * chartHeight;

        ctx.lineTo(x, y);
      }

      ctx.stroke();

      // Draw data points
      for (let i = 0; i < data.length; i++) {
        const point = data[i];
        const x = padding.left + (point.age - minAge) / (maxAge - minAge) * chartWidth;
        const y = height - padding.bottom - (point.value - minValue) / valueRange * chartHeight;

        ctx.beginPath();
        ctx.setFillStyle('#1890FF');
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.setLineWidth(1);
        ctx.setStrokeStyle('#ffffff');
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Draw legend
    ctx.beginPath();
    ctx.setFillStyle('#1890FF');
    ctx.rect(padding.left, padding.top - 25, 15, 10);
    ctx.fill();

    ctx.setFontSize(12);
    ctx.setTextAlign('left');
    ctx.setFillStyle('#333333');
    ctx.fillText('WHO标准', padding.left + 20, padding.top - 17);

    // Draw the chart
    ctx.draw();
  },

  // Return to previous page
  navigateBack: function () {
    wx.navigateBack();
  }
});