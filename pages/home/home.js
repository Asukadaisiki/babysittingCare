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
		// 复诊提醒相关数据
		hasAppointment: false, // 是否有复诊提醒
		appointmentCountdown: 0, // 复诊倒计时天数
		appointmentInfo: {}, // 复诊信息
		appointmentMonth: '', // 复诊月份（用于日历显示）
		appointmentDay: '', // 复诊日期（用于日历显示）
		hasSubscribed: false, // 是否已订阅消息
		showDeleteAppointmentModal: false, // 删除复诊提醒确认对话框
	},

	onLoad: function (options) {
		console.log('页面加载中...');

		// 设置当前日期
		this.setCurrentDate();
		// 从本地缓存获取宝宝信息
		this.loadChildInfo();
		// 加载复诊提醒信息
		this.loadAppointmentInfo();
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

		// 重新加载复诊提醒信息
		this.loadAppointmentInfo();
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

		// 删除复诊提醒信息
		const appointmentKey = `appointment_${childName}`;
		wx.removeStorageSync(appointmentKey);
		wx.removeStorageSync(`subscribed_${childName}`);

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

			// 重新加载复诊提醒信息
			this.loadAppointmentInfo();
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
				hasAppointment: false,
				appointmentInfo: {},
				appointmentCountdown: 0,
				hasSubscribed: false
			});
		}

		wx.showToast({
			title: '删除成功',
			icon: 'success'
		});
	},
	// 切换添加表单显示状态
	toggleAddForm: function () {
		this.setData({
			showAddForm: !this.data.showAddForm
		});
	},

	// 日期选择器变化事件
	onDateChange: function (e) {
		this.setData({
			'newRecord.date': e.detail.value
		});
	},

	// 身高输入事件
	onHeightInput: function (e) {
		this.setData({
			'newRecord.height': e.detail.value
		});
	},

	// 体重输入事件
	onWeightInput: function (e) {
		this.setData({
			'newRecord.weight': e.detail.value
		});
	},

	// 头围输入事件
	onHeadCircumferenceInput: function (e) {
		this.setData({
			'newRecord.headCircumference': e.detail.value
		});
	},

	// 月龄输入事件
	onAgeInMonthsInput: function (e) {
		this.setData({
			'newRecord.ageInMonths': e.detail.value
		});
	},

	// 添加生长记录
	addGrowthRecord: function () {
		// 验证输入
		if (!this.data.newRecord.date) {
			wx.showToast({
				title: '请选择日期',
				icon: 'none'
			});
			return;
		}

		// 至少需要输入一项数据
		if (!this.data.newRecord.height && !this.data.newRecord.weight && !this.data.newRecord.headCircumference) {
			wx.showToast({
				title: '请至少输入一项数据',
				icon: 'none'
			});
			return;
		}

		// 创建新记录
		const newRecord = {
			date: this.data.newRecord.date,
			ageInMonths: this.data.newRecord.ageInMonths ? parseFloat(this.data.newRecord.ageInMonths) : null,
			height: this.data.newRecord.height ? parseFloat(this.data.newRecord.height) : null,
			weight: this.data.newRecord.weight ? parseFloat(this.data.newRecord.weight) : null,
			headCircumference: this.data.newRecord.headCircumference ? parseFloat(this.data.newRecord.headCircumference) : null
		};

		// 添加到记录列表
		const updatedRecords = [...this.data.growthRecords, newRecord];

		// 按日期排序
		updatedRecords.sort((a, b) => {
			return new Date(a.date) - new Date(b.date);
		});

		// 保存到本地存储
		if (this.data.currentChild && this.data.currentChild.name) {
			const storageKey = `growthRecords_${this.data.currentChild.name}`;
			wx.setStorageSync(storageKey, updatedRecords);
		}

		// 更新页面数据
		this.setData({
			growthRecords: updatedRecords,
			showAddForm: false,
			newRecord: {
				date: '',
				ageInMonths: '',  // 重置月龄字段
				height: '',
				weight: '',
				headCircumference: ''
			}
		}, () => {
			// 重新合并记录
			this.mergeGrowthRecords();

			// 提示成功
			wx.showToast({
				title: '记录已添加',
				icon: 'success'
			});
		});
	},

	// 在获取生长记录数据后调用此方法合并同一天的记录
	mergeGrowthRecords: function () {
		const records = this.data.growthRecords;
		const mergedMap = {};

		// 按日期分组
		records.forEach(record => {
			if (!mergedMap[record.date]) {
				mergedMap[record.date] = {};
			}

			// 合并同一天的数据
			if (record.height !== null && record.height !== undefined) {
				mergedMap[record.date].height = record.height;
			}
			if (record.weight !== null && record.weight !== undefined) {
				mergedMap[record.date].weight = record.weight;
			}
			if (record.headCircumference !== null && record.headCircumference !== undefined) {
				mergedMap[record.date].headCircumference = record.headCircumference;
			}
			if (record.ageInMonths !== null && record.ageInMonths !== undefined) {
				mergedMap[record.date].ageInMonths = record.ageInMonths;
			}

			// 保存日期
			mergedMap[record.date].date = record.date;
		});

		// 转换为数组并按日期排序
		const mergedRecords = Object.values(mergedMap).sort((a, b) => {
			return new Date(b.date) - new Date(a.date); // 降序排列，最新的在前面
		});

		this.setData({
			mergedRecords: mergedRecords
		});
	},
  // ... 现有代码 ...
  
  // 修改删除记录的方法，按日期删除
  deleteRecordByDate: function (e) {
    const date = e.currentTarget.dataset.date;
    const childName = this.data.currentChild.name;
    
    if (!childName) {
      wx.showToast({
        title: '无法删除记录',
        icon: 'none'
      });
      return;
    }

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: res => {
        if (res.confirm) {
          // 获取所有需要删除的记录索引
          const recordsToDelete = this.data.growthRecords.filter(record =>
            record.date === date
          );

          // 获取剩余的记录
          const remainingRecords = this.data.growthRecords.filter(record =>
            record.date !== date
          );

          // 更新本地存储
          const storageKey = `growthRecords_${childName}`;
          wx.setStorageSync(storageKey, remainingRecords);

          // 更新页面数据
          this.setData({
            growthRecords: remainingRecords
          }, () => {
            // 重新合并记录
            this.mergeGrowthRecords();

            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
          });
        }
      }
    });
  },
  
  // ... 现有代码 ...
	// 导航到信息收集页面
	navigateToInfoCollection: function () {
		wx.navigateTo({
			url: '/pages/info-collection/info-collection?mode=add'
		});
	},

	// 复诊提醒相关方法
	// 加载复诊提醒信息
	loadAppointmentInfo: function () {
		const childId = this.data.currentChild.name || '';
		if (!childId) {
			this.setData({
				hasAppointment: false,
				appointmentInfo: {},
				appointmentCountdown: 0,
				appointmentMonth: '',
				appointmentDay: ''
			});
			return;
		}

		// 从本地存储获取复诊信息
		const storageKey = `appointment_${childId}`;
		const appointmentInfo = wx.getStorageSync(storageKey) || null;

		if (appointmentInfo) {
			// 计算倒计时天数
			const today = new Date();
			today.setHours(0, 0, 0, 0); // 设置为当天0点
			const appointmentDate = new Date(appointmentInfo.appointmentDate);
			appointmentDate.setHours(0, 0, 0, 0);

			// 计算天数差
			const timeDiff = appointmentDate.getTime() - today.getTime();
			const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

			// 获取月份和日期，用于日历式显示
			const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
			const month = months[appointmentDate.getMonth()];
			const day = appointmentDate.getDate();

			// 检查是否已订阅消息
			const hasSubscribed = wx.getStorageSync(`subscribed_${childId}`) || false;

			this.setData({
				hasAppointment: true,
				appointmentInfo: appointmentInfo,
				appointmentCountdown: dayDiff > 0 ? dayDiff : 0,
				appointmentMonth: month,
				appointmentDay: day,
				hasSubscribed: hasSubscribed
			});
		} else {
			this.setData({
				hasAppointment: false,
				appointmentInfo: {},
				appointmentCountdown: 0,
				appointmentMonth: '',
				appointmentDay: '',
				hasSubscribed: false
			});
		}
	},

	// 导航到复诊提醒设置页面
	navigateToAppointmentSetting: function () {
		const childId = this.data.currentChild.name || '';
		if (!childId) {
			wx.showToast({
				title: '请先添加宝宝信息',
				icon: 'none'
			});
			return;
		}

		wx.navigateTo({
			url: `/pages/appointment-setting/appointment-setting?childId=${encodeURIComponent(childId)}`
		});
	},

	// 编辑复诊提醒
	editAppointment: function () {
		const childId = this.data.currentChild.name || '';
		if (!childId) return;

		wx.navigateTo({
			url: `/pages/appointment-setting/appointment-setting?childId=${encodeURIComponent(childId)}&edit=true`
		});
	},

	// 显示删除复诊提醒确认对话框
	showDeleteAppointmentModal: function () {
		this.setData({
			showDeleteAppointmentModal: true
		});
	},

	// 隐藏删除复诊提醒确认对话框
	hideDeleteAppointmentModal: function () {
		this.setData({
			showDeleteAppointmentModal: false
		});
	},

	// 删除复诊提醒
	deleteAppointment: function () {
		const childId = this.data.currentChild.name || '';
		if (!childId) return;

		// 删除本地存储的复诊信息
		const storageKey = `appointment_${childId}`;
		wx.removeStorageSync(storageKey);
		wx.removeStorageSync(`subscribed_${childId}`);

		this.setData({
			hasAppointment: false,
			appointmentInfo: {},
			appointmentCountdown: 0,
			hasSubscribed: false,
			showDeleteAppointmentModal: false
		});

		wx.showToast({
			title: '复诊提醒已删除',
			icon: 'success'
		});
	},

	// 请求订阅消息
	requestSubscription: function () {
		const that = this;
		const childId = this.data.currentChild.name || '';
		if (!childId) return;

		// 请求订阅消息权限
		// 注意：需要在微信公众平台申请模板ID
		wx.requestSubscribeMessage({
			tmplIds: ['这里替换为您申请的模板ID'], // 替换为实际的模板ID
			success(res) {
				console.log('订阅消息结果:', res);
				// 如果用户同意订阅
				if (res['这里替换为您申请的模板ID'] === 'accept') {
					// 记录用户已订阅
					wx.setStorageSync(`subscribed_${childId}`, true);
					that.setData({
						hasSubscribed: true
					});

					wx.showToast({
						title: '订阅成功，将在复诊前提醒您',
						icon: 'none'
					});
				}
			},
			fail(err) {
				console.error('订阅消息失败:', err);
				wx.showToast({
					title: '订阅失败，请稍后重试',
					icon: 'none'
				});
			}
		});
	},
});