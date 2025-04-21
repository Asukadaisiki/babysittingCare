// pages/home/home.js
const F2 = require('../../miniprogram_npm/@antv/f2/index');
const app = getApp(); // 获取全局应用实例

// 检查全局应用实例
console.log('全局应用实例:', app);
if (app && app.globalData && app.globalData.whoData) {
	console.log('WHO数据已加载到全局实例');
} else {
	console.error('警告: 全局应用实例中未找到WHO数据');
}

Page({
	data: {
		userName: '家长',
		currentDate: '',
		tconfig: {},
		F2: null,
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
		activeTab: 'weight', // 当前激活的图表标签：height, weight, headCircumference
		onInitChart: null, // 图表初始化函数
		opts: {
			padding: [40, 20, 30, 40],
			pixelRatio: wx.getWindowInfo().pixelRatio
		},
		chartKey: Date.now() // 用于强制刷新图表组件的key
	},

	onLoad: function (options) {
		console.log('页面加载中...');

		// 初始化图表数据缓存
		this.chartCache = {};
		// 初始化图表实例缓存 - 恢复这个变量以确保图表刷新机制正常工作
		this.chartInstances = {};

		// 设置当前日期
		this.setCurrentDate();
		// 从本地缓存获取宝宝信息
		this.loadChildInfo();

		// 加载WHO标准数据（不依赖于是否有孩子信息）
		this.loadWHOStandards(() => {
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
					growthRecords, 'newRecord.date': dateStr,
					// 设置F2图表初始化函数
					onInitChart: this.initChart.bind(this)
				}, () => {
					console.log('初始数据已设置，准备图表数据');
					this.prepareChartData();
				});
			}
		});
	},

	onShow: function () {
		console.log('页面显示中...');
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
			}, () => {
				console.log('生长记录已更新，重新准备图表数据');
				this.prepareChartData();
			});
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

	// 计算年龄（月）
	calculateAge: function (birthDate) {
		const birth = new Date(birthDate);
		const today = new Date();

		// 计算月龄差
		const monthDiff = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
		const age = monthDiff + (today.getDate() >= birth.getDate() ? 0 : -1);

		return age;
	},

	// 计算矫正年龄（月）
	calculateCorrectedAge: function (birthDate, expectedDate) {
		if (!expectedDate) return this.calculateAge(birthDate);

		const birth = new Date(birthDate);
		const expected = new Date(expectedDate);

		// 计算实际月龄
		const actualAge = this.calculateAge(birthDate);

		// 计算预产期和出生日期之间的差值（月）
		const correctionMonths = (expected.getFullYear() - birth.getFullYear()) * 12 +
			expected.getMonth() - birth.getMonth() +
			(expected.getDate() >= birth.getDate() ? 0 : -1);

		// 矫正胎龄 = 实际月龄 - (预产期 - 出生日期)
		const correctedAge = actualAge - correctionMonths;

		return correctedAge > 0 ? correctedAge : 0;
	},

	// 切换图表标签
	// 切换图表标签
	switchTab: function (e) {
		const tab = e.currentTarget.dataset.tab;
		console.log('切换到标签:', tab);

		// 获取当前选中的宝宝信息
		const childInfo = this.data.currentChild;
		const childId = childInfo.name ? encodeURIComponent(childInfo.name) : 'default';
		
		// 根据标签类型跳转到对应页面
		switch (tab) {
			case 'weight':
				wx.navigateTo({
					url: `/pages/weight-chart/weight-chart?childId=${childId}`
				});
				break;
			case 'height':
				wx.navigateTo({
					url: `/pages/height-chart/height-chart?childId=${childId}`
				});
				break;
			case 'headCircumference':
				wx.navigateTo({
					url: `/pages/head-chart/head-chart?childId=${childId}`
				});
				break;
			default:
				console.log('未知图表类型:', tab);
		}
	},

	// 切换当前儿童
	switchChild: function (e) {
		const index = parseInt(e.currentTarget.dataset.index);
		console.log("切换到宝宝索引:", index);

		// 如果切换到相同宝宝，不执行任何操作
		if (index === this.data.currentChildIndex) {
			return;
		}

		// 获取宝宝信息
		const childInfo = this.data.childInfo;
		const selectedChild = childInfo[index];

		// 计算宝宝的实际年龄和矫正年龄
		const birthDate = selectedChild.birthDate;
		const expectedDate = selectedChild.expectedDate;
		const ageData = this.calculateAges(birthDate, expectedDate);

		// 从缓存获取该宝宝的生长记录
		const storageKey = `growthRecords_${selectedChild.name}`;
		const growthRecords = wx.getStorageSync(storageKey) || [];

		// 更新页面数据
		this.setData({
			currentChildIndex: index,
			currentChild: selectedChild,
			growthRecords: growthRecords,
			actualAge: ageData.actualAge,
			correctedAge: ageData.correctedAge
		}, () => {
			// 清除所有图表缓存
			this.clearAllChartCache();

			// 准备图表数据
			this.prepareChartData();

			// 重新加载WHO标准数据，确保性别正确
			this.loadWHOStandards(() => {
				// 获取当前活动标签
				const activeTab = this.data.activeTab;

				// 根据当前活动标签调用对应的渲染函数
				switch (activeTab) {
					case 'weight':
						this.renderWeightChart();
						break;
					case 'height':
						this.renderHeightChart();
						break;
					case 'headCircumference':
						this.renderHeadCircumferenceChart();
						break;
					default:
						console.log('未知图表类型:', activeTab);
						// 默认显示身高图表
						this.renderHeightChart();
				}
			});
		});
	},

	// F2图表初始化函数
	initChart: function (F2, config) {
		console.log('initChart 被调用，activeTab:', this.data.activeTab);
		// 将F2和config保存到data中，以便其他函数使用
		this.setData({
			tconfig: config,
			F2: F2
		});
		if (!F2 || !config) {
			console.error('无效的参数:', F2, config);
			return null;
		}

		try {
			const currentTab = this.data.activeTab;
			const { currentChild, chartData, whoStandard } = this.data;

			// 确保当前有选择的孩子
			let childId = 'default';
			if (currentChild && currentChild.name) {
				childId = encodeURIComponent(currentChild.name);
			} else {
				console.log('当前没有选择的孩子，使用默认图表');
			}

			// 检查当前活动标签是否有数据
			const hasCurrentTabData = chartData && chartData[currentTab] && chartData[currentTab].length > 0;
			console.log(`${currentTab}数据点数量:`, hasCurrentTabData ? chartData[currentTab].length : 0);


			// 创建新图表
			console.log('创建新图表实例');
			const newChart = this.createNewChart(F2, config, currentTab, childId, chartData, whoStandard);


			return newChart;
		} catch (error) {
			console.error('图表初始化错误:', error);
			return null;
		}
	},

	// 添加创建图表函数
	createNewChart: function (F2, config, tabType, childId, chartData, whoStandard) {
		console.log('创建新图表，类型:', tabType, '，孩子ID:', childId);

		// 创建图表实例
		const chart = new F2.Chart(config);

		// 准备数据
		let data = [];

		// 添加用户数据
		if (chartData && chartData[tabType] && chartData[tabType].length > 0) {
			console.log(`添加用户数据 - ${tabType}，数据点数量:`, chartData[tabType].length);
			chartData[tabType].forEach(item => {
				data.push({
					age: item.age,
					value: item.value,
					type: '实际值'
				});
			});
		} else {
			console.log(`${tabType}没有用户数据`);
		}

		// 添加WHO标准数据
		if (whoStandard && whoStandard[tabType] && whoStandard[tabType].length > 0) {
			console.log(`添加WHO标准数据 - ${tabType}，数据点数量:`, whoStandard[tabType].length);
			whoStandard[tabType].forEach(item => {
				data.push({
					age: item.age,
					value: item.value,
					type: 'WHO标准'
				});
			});
		} else {
			console.log(`${tabType}没有WHO标准数据`);
		}

		// 如果仍然没有数据，使用示例数据
		if (data.length === 0) {
			console.log('无实际数据和WHO数据，使用示例数据');

			// 根据图表类型提供不同的默认数据
			switch (tabType) {
				case 'height':
					data = [
						{ age: 0, value: 50, type: 'WHO标准' },
						{ age: 3, value: 60, type: 'WHO标准' },
						{ age: 6, value: 65, type: 'WHO标准' },
						{ age: 9, value: 70, type: 'WHO标准' },
						{ age: 12, value: 75, type: 'WHO标准' }
					];
					break;
				case 'weight':
					data = [
						{ age: 0, value: 3.5, type: 'WHO标准' },
						{ age: 3, value: 6, type: 'WHO标准' },
						{ age: 6, value: 8, type: 'WHO标准' },
						{ age: 9, value: 9, type: 'WHO标准' },
						{ age: 12, value: 10, type: 'WHO标准' }
					];
					break;
				case 'headCircumference':
					data = [
						{ age: 0, value: 35, type: 'WHO标准' },
						{ age: 3, value: 40, type: 'WHO标准' },
						{ age: 6, value: 43, type: 'WHO标准' },
						{ age: 9, value: 45, type: 'WHO标准' },
						{ age: 12, value: 47, type: 'WHO标准' }
					];
					break;
				default:
					data = [
						{ age: 0, value: 50, type: 'WHO标准' },
						{ age: 12, value: 75, type: 'WHO标准' }
					];
			}
		}

		console.log('图表数据最终点数:', data.length);

		// 配置图表
		chart.source(data, {
			age: {
				min: 0,
				max: 36,
				tickCount: 7,
				alias: '月龄(月)'
			},
			value: {
				tickCount: 5,
				alias: this.getAxisLabel(tabType)
			}
		});

		// 配置图例
		chart.legend({
			position: 'top',
			align: 'center'
		});

		// 绘制网格线
		chart.axis('age', {
			grid: {
				stroke: '#e8e8e8',
				lineWidth: 1
			}
		});

		chart.axis('value', {
			grid: {
				stroke: '#e8e8e8',
				lineWidth: 1
			}
		});

		// 绘制折线
		chart.line()
			.position('age*value')
			.color('type', ['#1890FF', '#FF6B3B'])
			.shape('smooth');

		// 绘制点
		chart.point()
			.position('age*value')
			.color('type', ['#1890FF', '#FF6B3B'])
			.size(4)
			.style({
				stroke: '#fff',
				lineWidth: 1
			});

		

		chart.guide().text({
			position: ['50%', '5%'],
			content: title,
			style: {
				fontSize: 14,
				fontWeight: 'bold',
				fill: '#000'
			}
		});

		// 渲染图表
		chart.render();

		console.log('新图表渲染完成:', tabType);
		return chart;
	},

	// 获取图表标题


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

		// 清除该宝宝的所有图表缓存
		delete this.chartInstances[`${childName}_height`];
		delete this.chartInstances[`${childName}_weight`];
		delete this.chartInstances[`${childName}_headCircumference`];

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
				chartKey: Date.now() // 更新key强制刷新
			}, () => {
				// 重新准备图表数据
				this.prepareChartData();

				// 重新加载WHO标准数据
				this.loadWHOStandards();
			});
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
				showDeleteModal: false,
				chartKey: Date.now() // 更新key强制刷新
			}, () => {
				// 重新加载WHO标准数据（显示默认标准）
				this.loadWHOStandards();
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

		// 显示加载中提示
		wx.showLoading({
			title: '更新图表...',
			mask: true
		});

		// 先清除所有图表缓存和实例
		this.clearAllChartCache();

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
			chartKey: Date.now() // 更新key强制刷新
		}, () => {
			// 重新准备图表数据
			this.prepareChartData();

			// 延迟设置图表初始化函数，确保DOM已完全更新
			setTimeout(() => {
				// 重新设置图表初始化函数
				this.setData({
					onInitChart: this.initChart.bind(this)
				}, () => {
					// 隐藏加载提示
					wx.hideLoading();

					// 显示成功提示
					wx.showToast({
						title: '记录添加成功',
						icon: 'success',
						duration: 1500
					});
				});
			}, 500); // 增加延迟确保DOM完全更新
		});
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
					// 获取要删除的记录
					const recordToDelete = growthRecords[index];

					// 更新记录列表
					const updatedRecords = [...growthRecords];
					updatedRecords.splice(index, 1);

					// 保存到本地存储
					const storageKey = `growthRecords_${currentChild.name}`;
					wx.setStorageSync(storageKey, updatedRecords);

					// 显示加载中提示
					wx.showLoading({
						title: '更新图表...',
						mask: true
					});

					// 先清除所有图表缓存和实例
					this.clearAllChartCache();

					// 更新状态
					this.setData({
						growthRecords: updatedRecords,
						chartKey: Date.now() // 更新key强制刷新
					}, () => {
						// 重新准备图表数据
						this.prepareChartData();

						// 延迟设置图表初始化函数，确保DOM已完全更新
						setTimeout(() => {
							// 重新设置图表初始化函数
							this.setData({
								onInitChart: this.initChart.bind(this)
							}, () => {
								// 隐藏加载提示
								wx.hideLoading();

								// 显示删除成功
								wx.showToast({
									title: '删除成功',
									icon: 'success',
									duration: 1500
								});
							});
						}, 500); // 增加延迟确保DOM完全更新
					});
				}
			}
		});
	},

	// 导航到信息收集页面
	navigateToInfoCollection: function () {
		wx.navigateTo({
			url: '/pages/info-collection/info-collection?mode=add'
		});
	},
});