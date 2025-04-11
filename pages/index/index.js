// index.js
const defaultAvatarUrl = 'https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0'

Page({
  data: {
    motto: 'Hello World',
    userInfo: {
      avatarUrl: defaultAvatarUrl,
      nickName: '',
    },
    hasUserInfo: false,
    canIUseGetUserProfile: wx.canIUse('getUserProfile'),
    canIUseNicknameComp: wx.canIUse('input.type.nickname'),
  },

chooseRole(e) {
    const role = e.currentTarget.dataset.role; // 获取 data-role 值
   
    // 根据角色跳转到不同页面
    switch (role) {
      case 'parents':
        wx.navigateTo({
            url: '/pages/Loading-parents/Loading-parents' 
        }) // 普通用户页面路径
        break;
      case 'doctor':
        wx.navigateTo({
            url: '/pages/Loading-doctor/Loading-doctor'
        }) 
        break; // 医护人员页面路径
      default:
        wx.showToast({ title: '未知身份', icon: 'none' });
        return;
    }

  },


  bindViewTap() 
  {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onChooseAvatar(e) 
  {
    const { avatarUrl } = e.detail
    const { nickName } = this.data.userInfo
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  onInputChange(e)
   {
    const nickName = e.detail.value
    const { avatarUrl } = this.data.userInfo
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    })
  },
  getUserProfile(e) 
  {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile(
        {
      desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) =>
       {
        console.log(res)
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      },
    }
)}
})