// pages/ai-qa/ai-qa.js
const app = getApp(); // 获取全局应用实例

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    inputValue: '',
    messageList: [],
    loading: false,
    scrollToView: ''
  },

  /**
   * 输入框内容变化处理
   */
  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  /**
   * 发送消息
   */
  sendMessage() {
    const { inputValue, messageList, userId } = this.data;

    // 检查输入是否为空
    if (!inputValue.trim()) return;

    // 添加用户消息到列表
    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      time: new Date().getTime(),
      status: 'sent'
    };

    const newMessageList = [...messageList, userMessage];

    this.setData({
      messageList: newMessageList,
      inputValue: '',
      loading: true
    });

    // 保存消息到全局
    if (userId) {
      app.saveChatMessage(userId, userMessage);
    }

    // 滚动到底部
    this.scrollToBottom();

    // 模拟请求后端API
    this.requestAIResponse(inputValue);
  },

  /**
   * 请求AI回复
   */
  requestAIResponse(question) {
    // 模拟网络请求延迟
    setTimeout(() => {
      // 这里应该是实际的API请求
      // wx.request({
      //   url: 'https://example.com/ai-api',
      //   method: 'POST',
      //   data: { question },
      //   success: (res) => {
      //     this.handleAIResponse(res.data.answer);
      //   },
      //   fail: (err) => {
      //     this.handleRequestFail(err);
      //   }
      // });

      // 模拟成功响应
      this.handleAIResponse(this.getSimulatedResponse(question));
    }, 1000);
  },

  /**
   * 处理AI回复
   */
  handleAIResponse(answer) {
    const { messageList, userId } = this.data;

    // 添加AI回复到消息列表
    const aiMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: answer,
      time: new Date().getTime(),
      status: 'sent'
    };

    const newMessageList = [...messageList, aiMessage];

    this.setData({
      messageList: newMessageList,
      loading: false
    });

    // 保存消息到全局
    if (userId) {
      app.saveChatMessage(userId, aiMessage);
    }

    // 滚动到底部
    this.scrollToBottom();
  },

  /**
   * 处理请求失败
   */
  handleRequestFail(err) {
    wx.showToast({
      title: '网络请求失败，请稍后再试',
      icon: 'none',
      duration: 2000
    });

    this.setData({ loading: false });
  },

  /**
   * 获取模拟回复
   */
  getSimulatedResponse(question) {
    // 简单的模拟回复逻辑
    if (question.includes('喂养') || question.includes('奶粉')) {
      return '宝宝的喂养应当根据月龄来调整。0-6个月的宝宝建议纯母乳喂养，6个月后可以添加辅食。如果使用奶粉，请选择适合宝宝月龄的配方奶粉，并按照说明准备。';
    } else if (question.includes('睡眠')) {
      return '新生儿每天需要16-17小时的睡眠，3-6个月的宝宝需要14-15小时，6-12个月的宝宝需要约14小时。建立规律的睡眠习惯对宝宝的发育非常重要。';
    } else if (question.includes('发烧') || question.includes('生病')) {
      return '宝宝发烧是常见的症状，如果体温超过38℃，建议及时就医。同时保持宝宝充分休息和补充水分。请注意，这只是一般建议，具体情况请咨询专业医生。';
    } else {
      return '感谢您的提问！作为AI助手，我会尽力为您提供育儿方面的建议和信息。如果您有更具体的问题，请随时告诉我，我会尽可能详细地回答。';
    }
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    // 使用nextTick确保在DOM更新后滚动
    wx.nextTick(() => {
      const query = wx.createSelectorQuery().in(this);
      query.select('.message-list').boundingClientRect();
      query.exec((res) => {
        if (res && res[0]) {
          wx.pageScrollTo({
            scrollTop: res[0].height,
            duration: 300
          });
        }
      });
    });
  },

  /**
   * 清空聊天历史
   */
  clearHistory() {
    const { userId } = this.data;

    if (!userId) return;

    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有聊天记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清空聊天历史
          const result = app.clearChatHistory(userId);

          if (result.success) {
            this.setData({
              messageList: []
            });
            wx.showToast({
              title: '已清空聊天记录',
              icon: 'success'
            });
          }
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取用户ID
    const userId = wx.getStorageSync('openid') || '';

    this.setData({
      userId
    });

    // 获取聊天历史
    if (userId) {
      const chatHistory = app.getChatHistory(userId);
      if (chatHistory && chatHistory.messageList) {
        this.setData({
          messageList: chatHistory.messageList
        });
      }
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 可以在这里处理页面显示逻辑
  }
})