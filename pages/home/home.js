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
				growthRecords,'newRecord.date': dateStr,
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
	calculateCorrectedAge: function(birthDate, expectedDate) {
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
	switchTab: function (e) {
		const tab = e.currentTarget.dataset.tab;
		console.log('切换到标签:', tab);

		// 如果切换到相同标签，不执行任何操作
		if (tab === this.data.activeTab) {
			this.refreshAllCharts();
		}

		// 设置当前活动标签
		this.setData({
			activeTab: tab
		}, () => {
			// 直接调用对应标签的渲染函数
			switch(tab) {
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
					console.log('未知图表类型:', tab);
					// 默认显示身高图表
					this.renderHeightChart();
			}
		});
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
				switch(activeTab) {
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
	initChart: function(F2, config) {
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

	
	// 创建新图表
	createNewChart: function(F2, config, tabType, childId, chartData, whoStandard) {
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
			switch(tabType) {
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
		
		// 图表标题
		let title = this.getChartTitle(tabType);
		
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
	getChartTitle: function(type) {
		switch (type) {
			case 'height':
				return '身高生长曲线';
			case 'weight':
				return '体重生长曲线';
			case 'headCircumference':
				return '头围生长曲线';
			default:
				return '生长曲线';
		}
	},
	
	// 获取坐标轴标签
	getAxisLabel: function(type) {
		switch (type) {
			case 'height':
				return '身高(cm)';
			case 'weight':
				return '体重(kg)';
			case 'headCircumference':
				return '头围(cm)';
			default:
				return '';
		}
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

	// 加载WHO标准数据
	loadWHOStandards: function(callback) {
		console.log('开始加载WHO标准数据...');
		const { currentChild } = this.data;
		
		// 获取全局WHO标准数据
		const whoData = app.globalData.whoData;
		if (!whoData) {
			console.error('未找到WHO标准数据');
			if (typeof callback === 'function') callback();
			return;
		}
		
		console.log('WHO全局数据:', whoData);
		
		// 如果有孩子信息，根据性别选择对应数据；否则默认使用男孩数据
		let gender = 'boy'; // 默认使用男孩数据
		
		if (currentChild && currentChild.gender) {
			gender = currentChild.gender.toLowerCase() === '女' ? 'girl' : 'boy';
			console.log('根据宝宝性别选择WHO数据:', gender);
		} else {
			console.log('没有宝宝性别信息，使用默认性别(男孩)数据');
		}
		
		const genderData = whoData[gender];
		
		if (!genderData) {
			console.error('未找到性别对应的WHO标准数据');
			if (typeof callback === 'function') callback();
			return;
		}
		
		console.log('找到性别对应的WHO数据:', gender);
		
		// 处理WHO标准数据成图表可用格式
		const whoStandard = {
			height: [],
			weight: [],
			headCircumference: []
		};
		
		// 转换身高数据
		if (genderData.height) {
			console.log('处理WHO身高数据...');
			genderData.height.forEach(item => {
				whoStandard.height.push({
					age: item.ageMonth,
					value: item.M  // 中位数值
				});
			});
			console.log('WHO身高数据处理完成，数据点数量:', whoStandard.height.length);
		} else {
			console.warn('WHO身高数据不存在');
		}
		
		// 转换体重数据
		if (genderData.weight) {
			console.log('处理WHO体重数据...');
			genderData.weight.forEach(item => {
				whoStandard.weight.push({
					age: item.ageMonth,
					value: item.M  // 中位数值
				});
			});
			console.log('WHO体重数据处理完成，数据点数量:', whoStandard.weight.length);
		} else {
			console.warn('WHO体重数据不存在');
		}
		
		// 转换头围数据 (如果有的话)
		if (genderData.headCircumference) {
			console.log('处理WHO头围数据...');
			genderData.headCircumference.forEach(item => {
				whoStandard.headCircumference.push({
					age: item.ageMonth,
					value: item.M  // 中位数值
				});
			});
			console.log('WHO头围数据处理完成，数据点数量:', whoStandard.headCircumference.length);
		} else {
			console.warn('WHO头围数据不存在');
		}
		
		// 打印一些关键数据点以便验证
		if (whoStandard.height.length > 0) {
			console.log('WHO身高数据示例:', whoStandard.height.slice(0, 3));
		}
		if (whoStandard.weight.length > 0) {
			console.log('WHO体重数据示例:', whoStandard.weight.slice(0, 3));
		}
		if (whoStandard.headCircumference.length > 0) {
			console.log('WHO头围数据示例:', whoStandard.headCircumference.slice(0, 3));
		}
		
		this.setData({ whoStandard }, () => {
			console.log('WHO标准数据已加载完成');
			// 加载完成后执行回调
			if (typeof callback === 'function') callback();
		});
	},

	// 根据当前选项卡渲染对应图表
	renderChartForTab: function(tabType) {
		console.log('renderChartForTab 被调用，图表类型:', tabType);
		
		// 确保类型正确
		switch(tabType) {
			case 'weight':
				this.renderWeightChart();
				break;
			case 'height':
				this.renderHeightChart();
				break;
			case 'head':
			case 'headCircumference':  // 允许两种不同的命名
				this.renderHeadCircumferenceChart();
				break;
			default:
				console.log('未知图表类型:', tabType);
				// 默认显示身高图表
				this.renderHeightChart();
		}
	},
	
	// 渲染体重图表
	renderWeightChart: function() {
		console.log('渲染体重图表');
		const { currentChild, chartData, whoStandard, currentTab} = this.data;
		let childId = 'default';
		if (currentChild && currentChild.name) {
			childId = encodeURIComponent(currentChild.name);
		}
		this.createNewChart(this.data.F2, this.data.tconfig, currentTab, childId, chartData, whoStandard);
	},
	
	// 渲染身高图表
	renderHeightChart: function() {
		console.log('渲染身高图表');
		const { currentChild, chartData, whoStandard, currentTab} = this.data;
		let childId = 'default';
		if (currentChild && currentChild.name) {
			childId = encodeURIComponent(currentChild.name);
		}
		this.createNewChart(this.data.F2, this.data.tconfig, currentTab, childId, chartData, whoStandard);
	},
	
	// 渲染头围图表
	renderHeadCircumferenceChart: function() {
		console.log('渲染头围图表');
		const { currentChild, chartData, whoStandard, currentTab} = this.data;
		let childId = 'default';
		if (currentChild && currentChild.name) {
			childId = encodeURIComponent(currentChild.name);
		}
		this.createNewChart(this.data.F2, this.data.tconfig, currentTab, childId, chartData, whoStandard);
	},
	
	// 不再需要销毁图表实例的函数，因为我们不再缓存图表实例
	// 保留此函数是为了兼容性，但内部逻辑已简化
	destroyChartInstance: function(chartId) {
		// 只清理对应的图表数据缓存
		if (this.chartCache[chartId]) {
			delete this.chartCache[chartId];
			console.log(`已清除图表数据缓存: ${chartId}`);
		}
	},

	// 清除所有图表缓存
	clearAllChartCache: function() {
		console.log("清除所有图表缓存");
		
		// 清除图表实例缓存
		this.chartInstances = {};
		
		// 清除图表数据缓存
		const childName = this.data.currentChild ? this.data.currentChild.name : "";
		if (childName) {
			const safeChildName = childName.replace(/[^a-zA-Z0-9]/g, "_");
			const tabs = ['height', 'weight', 'headCircumference'];
			
			tabs.forEach(tab => {
				const chartCacheKey = `chart_${safeChildName}_${tab}`;
				const dataCacheKey = `data_${safeChildName}_${tab}`;
				
				// 从缓存中删除
				delete this.chartInstances[chartCacheKey];
				console.log(`删除图表缓存: ${chartCacheKey}`);
				
				// 也可以删除本地存储中的数据缓存，如果有的话
				// wx.removeStorageSync(dataCacheKey);
				// console.log(`删除数据缓存: ${dataCacheKey}`);
			});
		}
	},

	// 准备图表数据
	prepareChartData: function() {
		const currentChild = this.data.currentChild;
		const growthRecords = this.data.growthRecords || [];
		
		// 初始化图表数据结构
		const chartData = {
			height: [],
			weight: [],
			headCircumference: []
		};
		
		// 如果没有宝宝信息或生长记录，只更新空数据
		if (!currentChild || !currentChild.name || !currentChild.birthDate) {
			console.log('当前没有选择的孩子或缺少出生日期，仅显示WHO标准数据');
			this.setData({ chartData });
			return [];
		}
		
		// 使用更健壮的方式生成缓存键，使用encodeURIComponent处理可能包含特殊字符的名称
		const safeChildName = encodeURIComponent(currentChild.name);
		const childCacheKey = `data_${safeChildName}`;
		
		// 强制刷新数据，不使用缓存
		console.log('准备图表数据...');
		
		// 处理生长记录数据
		try {
			console.log('处理生长记录数据，记录数量:', growthRecords.length);
			
			growthRecords.forEach(record => {
				// 数据验证
				if (!record || !record.date) {
					console.warn('跳过无效记录:', record);
					return;
				}
				
				// 计算记录时的月龄
				const recordDate = new Date(record.date);
				const birthDate = new Date(currentChild.birthDate);
				
				// 计算月龄差
				const monthDiff = (recordDate.getFullYear() - birthDate.getFullYear()) * 12 + 
								 recordDate.getMonth() - birthDate.getMonth();
				const age = monthDiff + (recordDate.getDate() >= birthDate.getDate() ? 0 : -1);
				
				console.log(`记录日期: ${record.date}, 出生日期: ${currentChild.birthDate}, 计算月龄: ${age}`);
				
				// 添加身高数据点
				if (record.height) {
					const value = parseFloat(record.height);
					if (!isNaN(value)) {
					chartData.height.push({
						age: age,
							value: value
						});
					}
				}
				
				// 添加体重数据点
				if (record.weight) {
					const value = parseFloat(record.weight);
					if (!isNaN(value)) {
						chartData.weight.push({
							age: age,
							value: value
						});
					}
				}
				
				// 添加头围数据点
				if (record.headCircumference) {
					const value = parseFloat(record.headCircumference);
					if (!isNaN(value)) {
						chartData.headCircumference.push({
							age: age,
							value: value
						});
					}
				}
			});
			
			// 数据排序
			Object.keys(chartData).forEach(key => {
				chartData[key].sort((a, b) => a.age - b.age);
			});
			
			console.log('图表数据已准备完成，当前活动标签:', this.data.activeTab, '数据点数量:', 
				chartData[this.data.activeTab] ? chartData[this.data.activeTab].length : 0);
		} catch (error) {
			console.error('处理图表数据时出错:', error);
		}
		
		// 更新页面数据 - 使用回调确保数据更新后再进行后续操作
		this.setData({ chartData }, () => {
			console.log('图表数据已更新到页面');
		});
		
		// 按照记录日期排序
		const sortedRecords = [...growthRecords].sort((a, b) => {
			return new Date(a.date) - new Date(b.date);
		});
		
		// 缓存处理后的数据
		this.chartCache[childCacheKey] = {
			data: chartData, // 存储处理后的图表数据，而不是原始记录
			recordCount: growthRecords.length,
			timestamp: Date.now() // 添加时间戳，用于判断缓存是否过期
		};
		
		return sortedRecords;
	},

	// 刷新图表按钮事件处理函数
	refreshAllCharts: function() {
		console.log('刷新当前图表...');
		
		// 显示加载中提示
		wx.showLoading({
			title: '刷新中...',
			mask: true
		});
		
		try {
			// 清除所有图表数据缓存和实例
			this.clearAllChartCache();
			
			// 重新加载WHO标准数据
			this.loadWHOStandards();
			
			// 重新准备图表数据
			this.prepareChartData();
			
			// 根据当前活动标签调用对应的渲染函数
			const activeTab = this.data.activeTab;
			setTimeout(() => {
				switch(activeTab) {
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
				
				// 隐藏加载提示
				wx.hideLoading();
				
				// 刷新成功提示
		wx.showToast({
					title: '刷新成功',
					icon: 'success',
					duration: 1500
				});
			}, 300); // 延迟以确保WHO数据和图表数据已准备好
			
		} catch (error) {
			// 如果刷新过程中出错
			console.error('刷新图表时出错:', error);
			wx.hideLoading();
			wx.showToast({
				title: '刷新失败，请重试',
				icon: 'none',
				duration: 2000
			});
		}
	}
});

const getChartConfig = (type) => {
	return {
		padding: [40, 20, 30, 40],
		pixelRatio: wx.getWindowInfo().pixelRatio,
		animate: true,
		interactions: [
			{ type: 'pan' },
			{ type: 'pinch' }
		],
		scales: {
			age: {
				min: 0,
				max: 36,
				tickCount: 7,
				alias: '月龄(月)'
			},
			value: {
				tickCount: 5,
				alias: getYAxisLabel(type)
			}
		}
	};
};

// 获取Y轴标签
const getYAxisLabel = (type) => {
	switch (type) {
		case 'height':
			return '身高(cm)';
		case 'weight':
			return '体重(kg)';
		case 'headCircumference':
			return '头围(cm)';
		default:
			return '';
	}
};
