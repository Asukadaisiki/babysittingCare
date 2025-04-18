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
        onInitChart(F2, config) {
            const chart = new F2.Chart(config);
            const data = [
              { value: 63.4, city: 'New York', date: '2011-10-01' },
              { value: 62.7, city: 'Alaska', date: '2011-10-01' },
              { value: 72.2, city: 'Austin', date: '2011-10-01' },
              { value: 58, city: 'New York', date: '2011-10-02' },
              { value: 59.9, city: 'Alaska', date: '2011-10-02' },
              { value: 67.7, city: 'Austin', date: '2011-10-02' },
              { value: 53.3, city: 'New York', date: '2011-10-03' },
              { value: 59.1, city: 'Alaska', date: '2011-10-03' },
              { value: 69.4, city: 'Austin', date: '2011-10-03' },
            ];
            chart.source(data, {
              date: {
                range: [0, 1],
                type: 'timeCat',
                mask: 'MM-DD'
              },
              value: {
                max: 300,
                tickCount: 4
              }
            });
            chart.area().position('date*value').color('city').adjust('stack');
            chart.line().position('date*value').color('city').adjust('stack');
            chart.render();
            // 注意：需要把chart return 出来
            return chart;
        }

	},
	onLoad: function () {
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

	onShow: function () {
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
	setCurrentDate: function () {
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
	loadChildInfo: function () {
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
	calculateAges: function (birthDateStr, expectedDateStr) {
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
	switchChild: function (e) {
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
	showDeleteChildModal: function () {
		this.setData({
			showDeleteModal: true
		});
	},

	// 隐藏删除宝宝确认对话框
	hideDeleteChildModal: function () {
		this.setData({
			showDeleteModal: false
		});
	},

	// 删除宝宝信息
	deleteChild: function () {
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
	onHeightInput: function (e) {
		this.setData({
			'newRecord.height': e.detail.value
		});
	},

	onWeightInput: function (e) {
		this.setData({
			'newRecord.weight': e.detail.value
		});
	},

	onHeadCircumferenceInput: function (e) {
		this.setData({
			'newRecord.headCircumference': e.detail.value
		});
	},

	// 添加生长记录
	addGrowthRecord: function () {
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
	deleteRecord: function (e) {
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
	switchTab: function (e) {
		const tab = e.currentTarget.dataset.tab;

		this.setData({
			activeTab: tab,
			chartRendered: false
		});

		// 重新渲染图表
		this.prepareChartData();
	},

	// 导航到信息收集页面
	navigateToInfoCollection: function () {
		wx.navigateTo({
			url: '/pages/info-collection/info-collection?mode=add'
		});
	},

	// 加载WHO标准数据
	loadWHOStandards: function () {
		// WHO标准数据（示例数据，实际应从数据文件加载）
		const whoStandard = {
			height: [
				{ age: 0, p3: 46.3, p15: 48.0, p50: 49.9, p85: 51.8, p97: 53.4 },
				{ age: 1, p3: 51.1, p15: 52.8, p50: 54.7, p85: 56.7, p97: 58.4 },
				{ age: 2, p3: 54.4, p15: 56.2, p50: 58.4, p85: 60.6, p97: 62.4 },
				{ age: 3, p3: 56.7, p15: 58.6, p50: 61.1, p85: 63.6, p97: 65.4 },
				{ age: 4, p3: 58.6, p15: 60.6, p50: 63.1, p85: 65.6, p97: 67.6 },
				{ age: 5, p3: 60.3, p15: 62.4, p50: 65.0, p85: 67.6, p97: 69.6 },
				{ age: 6, p3: 63.3, p15: 65.4, p50: 67.6, p85: 69.8, p97: 71.9 },
				{ age: 9, p3: 68.0, p15: 70.2, p50: 72.3, p85: 74.5, p97: 76.6 },
				{ age: 12, p3: 71.7, p15: 74.0, p50: 76.1, p85: 78.3, p97: 80.5 },
				{ age: 15, p3: 74.8, p15: 77.1, p50: 79.3, p85: 81.5, p97: 83.7 },
				{ age: 18, p3: 77.5, p15: 79.9, p50: 82.1, p85: 84.4, p97: 86.6 },
				{ age: 21, p3: 79.9, p15: 82.3, p50: 84.7, p85: 87.1, p97: 89.4 },
				{ age: 24, p3: 82.1, p15: 84.6, p50: 87.1, p85: 89.7, p97: 92.0 }
			],
			weight: [
				{ age: 0, p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.7, p97: 4.0 },
				{ age: 1, p3: 3.4, p15: 3.9, p50: 4.5, p85: 5.1, p97: 5.5 },
				{ age: 2, p3: 4.0, p15: 4.5, p50: 5.2, p85: 5.8, p97: 6.3 },
				{ age: 3, p3: 4.5, p15: 5.1, p50: 5.9, p85: 6.7, p97: 7.3 },
				{ age: 4, p3: 5.0, p15: 5.6, p50: 6.4, p85: 7.3, p97: 8.0 },
				{ age: 5, p3: 5.4, p15: 6.1, p50: 6.9, p85: 7.8, p97: 8.6 },
				{ age: 6, p3: 6.0, p15: 6.7, p50: 7.6, p85: 8.5, p97: 9.3 },
				{ age: 9, p3: 7.0, p15: 7.8, p50: 8.6, p85: 9.6, p97: 10.4 },
				{ age: 12, p3: 7.7, p15: 8.5, p50: 9.5, p85: 10.5, p97: 11.5 },
				{ age: 15, p3: 8.3, p15: 9.1, p50: 10.2, p85: 11.3, p97: 12.4 },
				{ age: 18, p3: 8.8, p15: 9.7, p50: 10.8, p85: 12.0, p97: 13.2 },
				{ age: 21, p3: 9.2, p15: 10.2, p50: 11.4, p85: 12.6, p97: 13.9 },
				{ age: 24, p3: 9.7, p15: 10.6, p50: 11.9, p85: 13.2, p97: 14.6 }
			],
			headCircumference: [
				{ age: 0, p3: 32.1, p15: 33.1, p50: 34.2, p85: 35.3, p97: 36.2 },
				{ age: 1, p3: 35.1, p15: 36.1, p50: 37.2, p85: 38.3, p97: 39.2 },
				{ age: 2, p3: 36.9, p15: 37.9, p50: 39.1, p85: 40.3, p97: 41.3 },
				{ age: 3, p3: 37.2, p15: 38.3, p50: 39.5, p85: 40.8, p97: 41.9 },
				{ age: 4, p3: 38.6, p15: 39.7, p50: 40.9, p85: 42.2, p97: 43.3 },
				{ age: 5, p3: 39.6, p15: 40.7, p50: 42.0, p85: 43.3, p97: 44.4 },
				{ age: 6, p3: 40.2, p15: 41.3, p50: 42.6, p85: 43.8, p97: 44.9 },
				{ age: 9, p3: 42.2, p15: 43.3, p50: 44.6, p85: 45.8, p97: 46.9 },
				{ age: 12, p3: 43.5, p15: 44.6, p50: 45.8, p85: 47.0, p97: 48.0 },
				{ age: 15, p3: 44.3, p15: 45.4, p50: 46.6, p85: 47.8, p97: 48.9 },
				{ age: 18, p3: 44.9, p15: 46.0, p50: 47.2, p85: 48.4, p97: 49.5 },
				{ age: 21, p3: 45.3, p15: 46.4, p50: 47.6, p85: 48.8, p97: 49.9 },
				{ age: 24, p3: 45.7, p15: 46.8, p50: 48.0, p85: 49.2, p97: 50.3 }
			]
		};

		this.setData({ whoStandard });
	},

	// 初始化图表
	initChart(F2, config) {
        const chart = new F2.Chart(config);
        const data = [
          { value: 63.4, city: 'New York', date: '2011-10-01' },
          { value: 62.7, city: 'Alaska', date: '2011-10-01' },
          { value: 72.2, city: 'Austin', date: '2011-10-01' },
          { value: 58, city: 'New York', date: '2011-10-02' },
          { value: 59.9, city: 'Alaska', date: '2011-10-02' },
          { value: 67.7, city: 'Austin', date: '2011-10-02' },
          { value: 53.3, city: 'New York', date: '2011-10-03' },
          { value: 59.1, city: 'Alaska', date: '2011-10-03' },
          { value: 69.4, city: 'Austin', date: '2011-10-03' },
        ];
        
        chart.source(data, {
          date: {
            range: [0, 1],
            type: 'timeCat',
            mask: 'MM-DD'
          },
          value: {
            max: 300,
            tickCount: 4
          }
        });
        
        chart.area().position('date*value').color('city').adjust('stack');
        chart.line().position('date*value').color('city').adjust('stack');
        chart.render();
        
        return chart;
      },


	prepareChartData: function () {
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

		// 设置图表配置选项
		const opts = {
			padding: [30, 20, 30, 40],
			pixelRatio: wx.getWindowInfo().pixelRatio
		};

		this.setData({
			chartData,
			chartRendered: false,
			opts: opts
		}, () => {
			// 数据准备完成后，图表会通过bindInit自动初始化
		});
	}
});
