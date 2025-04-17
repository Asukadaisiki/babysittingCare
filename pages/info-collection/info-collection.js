// pages/info-collection/info-collection.js
Page({
  data: {
    children: [{
      childName: '',
      expectedDate: '',
      birthDate: '',
      gender: '男',
      genderIndex: 0
    }],
    genderArray: ['男', '女']
  },

  onLoad(options) {
    // 检查是否已有儿童信息，并且不是添加模式
    const childInfo = wx.getStorageSync('childInfo')
    if (childInfo && !options.mode) {
      wx.redirectTo({
        url: '/pages/home/home'
      })
    }
    
    // 如果是添加模式，不需要重定向，直接显示添加表单
    if (options.mode === 'add') {
      // 清空默认的子表单，用户将添加新的宝宝
      this.setData({
        children: [{
          childName: '',
          expectedDate: '',
          birthDate: '',
          gender: '男',
          genderIndex: 0
        }]
      });
    }
  },

  // 添加新的宝宝表单
  addChild() {
    const children = [...this.data.children]
    children.push({
      childName: '',
      expectedDate: '',
      birthDate: '',
      gender: '男',
      genderIndex: 0
    })
    this.setData({ children })
  },

  // 删除宝宝表单
  deleteChild(e) {
    const index = e.currentTarget.dataset.index
    const children = [...this.data.children]
    children.splice(index, 1)
    this.setData({ children })
  },

  // 输入框事件处理
  onNameInput(e) {
    const index = e.currentTarget.dataset.index
    const children = [...this.data.children]
    children[index].childName = e.detail.value
    this.setData({ children })
  },

  // 预产期选择
  onExpectedDateChange(e) {
    const index = e.currentTarget.dataset.index
    const children = [...this.data.children]
    children[index].expectedDate = e.detail.value
    this.setData({ children })
  },

  // 出生日期选择
  onBirthDateChange(e) {
    const index = e.currentTarget.dataset.index
    const children = [...this.data.children]
    children[index].birthDate = e.detail.value
    this.setData({ children })
  },

  // 性别选择
  onGenderChange(e) {
    const formIndex = e.currentTarget.dataset.index
    const genderIndex = e.detail.value
    const children = [...this.data.children]
    children[formIndex].genderIndex = genderIndex
    children[formIndex].gender = this.data.genderArray[genderIndex]
    this.setData({ children })
  },

  // 表单提交
  onSubmit() {
    const { children } = this.data
    
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (!child.childName) {
        wx.showToast({
          title: `请输入第${i + 1}个宝宝的姓名`,
          icon: 'none'
        })
        return
      }

      if (!child.expectedDate) {
        wx.showToast({
          title: `请选择第${i + 1}个宝宝的预产期`,
          icon: 'none'
        })
        return
      }

      if (!child.birthDate) {
        wx.showToast({
          title: `请选择第${i + 1}个宝宝的出生日期`,
          icon: 'none'
        })
        return
      }
    }

    // 保存信息到本地存储
    const childrenInfo = children.map(child => ({
      name: child.childName,
      expectedDate: child.expectedDate,
      birthDate: child.birthDate,
      gender: child.gender
    }))

    // 获取现有的儿童信息
    const existingChildInfo = wx.getStorageSync('childInfo') || []
    
    // 合并现有的和新的儿童信息
    const updatedChildInfo = [...existingChildInfo, ...childrenInfo]
    
    // 保存更新后的儿童信息
    wx.setStorageSync('childInfo', updatedChildInfo)
    console.log('儿童信息已保存:', updatedChildInfo)
    
    // 跳转到首页
    console.log('准备跳转到首页')
    try {
      wx.switchTab({
        url: '/pages/home/home',
        success: () => console.log('跳转成功'),
        fail: (err) => {
          console.error('跳转失败:', err)
          wx.showToast({
            title: '跳转失败，请重试',
            icon: 'none'
          })
        }
      })
    } catch (e) {
      console.error('跳转异常:', e)
      wx.showToast({
        title: '跳转异常，请重试',
        icon: 'none'
      })
    }
  }
})