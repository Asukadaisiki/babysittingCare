// pages/home/home.js
const app = getApp(); // 获取全局应用实例

// 检查全局应用实例
console.log('全局应用实例:', app);

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
	},

	onLoad: function (options) {
		console.log('页面加载中...');

		// 设置当前日期
		this.setCurrentDate();
		// 从本地缓存获取宝宝信息
		this.loadChildInfo();
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
				growthRecords
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

	// 切换图表标签 - 导航到对应的图表页面
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
		});
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
				showDeleteModal: false
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
				showDeleteModal: false
			});
		}

		wx.showToast({
			title: '删除成功',
			icon: 'success'
		});
	},

	// 导航到信息收集页面
	navigateToInfoCollection: function () {
		wx.navigateTo({
			url: '/pages/info-collection/info-collection?mode=add'
		});
	},
});