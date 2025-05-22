// pages/info-collection/info-collection.js
Page({
  data: {
    children: [{
      childName: '',
      expectedDate: '',
      birthDate: '',
      gestationalWeeks: '', // 新增周龄字段
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
          gestationalWeeks: '', // 新增周龄字段
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
      gestationalWeeks: '', // 新增周龄字段
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

  // 新增周龄输入处理方法
  onGestationalWeeksInput(e) {
    const index = e.currentTarget.dataset.index
    const children = [...this.data.children]
    children[index].gestationalWeeks = e.detail.value
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
      
      // 验证周龄输入
      if (!child.gestationalWeeks) {
        wx.showToast({
          title: `请输入第${i + 1}个宝宝的出生周龄`,
          icon: 'none'
        })
        return
      }
      
      // 验证周龄是否为有效数字
      const weeks = parseInt(child.gestationalWeeks)
      if (isNaN(weeks) || weeks < 20 || weeks > 45) {
        wx.showToast({
          title: `第${i + 1}个宝宝的出生周龄应在20-45周之间`,
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
      gestationalWeeks: parseInt(child.gestationalWeeks), // 保存为数字类型
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
    wx.switchTab({
      url: '/pages/home/home'
    })
  }
})