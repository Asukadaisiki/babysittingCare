// 来自官方示例的wxcharts基础代码
class WxCharts {
  constructor(n, t) {
    this.context = wx.createCanvasContext(n),
    this.opts = {
      width: t.width,
      height: t.height,
      ...t
    };
    this.chartData = {
      categories: [],
      series: []
    },
    this.opts = {
      width: t.width,
      height: t.height,
      ...t
    };
  }
    getContext() {
      return this.context;
    }
    setData(n) {
      this.chartData = n;
    }
    updateData(n) {
      this.chartData.series = n;
    }
    draw() {
      this.context.clearRect(0, 0, this.opts.width, this.opts.height);
      
      // 绘制坐标轴
      this.context.beginPath();
      this.context.strokeStyle = '#999';
      this.context.lineWidth = 1;
      
      // X轴
      this.context.moveTo(50, this.opts.height - 50);
      this.context.lineTo(this.opts.width - 20, this.opts.height - 50);
      
      // Y轴
      this.context.moveTo(50, 30);
      this.context.lineTo(50, this.opts.height - 50);
      this.context.stroke();
      
      // 绘制网格线
      this.context.beginPath();
      this.context.strokeStyle = '#eee';
      this.context.lineWidth = 0.5;
      
      // 水平网格线
      const yStep = (this.opts.height - 80) / 5;
      for (let i = 0; i <= 5; i++) {
        this.context.moveTo(50, 30 + i * yStep);
        this.context.lineTo(this.opts.width - 20, 30 + i * yStep);
      }
      
      // 垂直网格线
      if (this.chartData.categories.length > 0) {
        const xStep = (this.opts.width - 70) / (this.chartData.categories.length - 1);
        for (let i = 0; i < this.chartData.categories.length; i++) {
          this.context.moveTo(50 + i * xStep, 30);
          this.context.lineTo(50 + i * xStep, this.opts.height - 50);
        }
      }
      this.context.stroke();
      
      // 绘制数据曲线
      if (this.chartData.series.length > 0) {
        // 绘制所有系列
        this.chartData.series.forEach(series => {
          if (!series.data || series.data.length === 0) return;
          
          const maxValue = Math.max(...series.data);
          const yRatio = (this.opts.height - 80) / maxValue;
          const xStep = (this.opts.width - 70) / (this.chartData.categories.length - 1);
          
          this.context.beginPath();
          this.context.strokeStyle = series.color || '#1aad19';
          this.context.lineWidth = 2;
          
          for (let i = 0; i < series.data.length; i++) {
            const x = 50 + i * xStep;
            const y = this.opts.height - 50 - series.data[i] * yRatio;
            
            if (i === 0) {
              this.context.moveTo(x, y);
            } else {
              this.context.lineTo(x, y);
            }
            
            // 绘制数据点
            this.context.beginPath();
            this.context.arc(x, y, 3, 0, Math.PI * 2);
            this.context.fillStyle = series.color || '#1aad19';
            this.context.fill();
          }
          
          this.context.stroke();
          
          // 绘制系列名称
          if (series.name) {
            this.context.font = '12px Arial';
            this.context.fillStyle = series.color || '#1aad19';
            this.context.fillText(series.name, this.opts.width - 100, 30 + (this.chartData.series.indexOf(series) * 20));
          }
        });
      }
      
      // 绘制X轴标签
      if (this.chartData.categories.length > 0) {
        this.context.font = '10px Arial';
        this.context.fillStyle = '#666';
        this.context.textAlign = 'center';
        
        const xStep = (this.opts.width - 70) / (this.chartData.categories.length - 1);
        for (let i = 0; i < this.chartData.categories.length; i++) {
          this.context.fillText(this.chartData.categories[i], 50 + i * xStep, this.opts.height - 30);
        }
      }
      
      // 绘制Y轴标签
      this.context.font = '10px Arial';
      this.context.fillStyle = '#666';
      this.context.textAlign = 'right';
      
      const yStepLabel = (this.opts.height - 80) / 5;
      for (let i = 0; i <= 5; i++) {
        const value = (5 - i) * (this.opts.yAxis && this.opts.yAxis.max ? this.opts.yAxis.max / 5 : 1);
        this.context.fillText(value.toFixed(1), 45, 30 + i * yStepLabel + 5);
      }
    }
  }

module.exports = {
  init: function(t) {
    return new WxCharts(t.canvasId, t);
  }
};