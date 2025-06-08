// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 初始化网络状态监听
    this.listenNetworkStatus();

    // 从本地存储加载待同步数据
    this.globalData.pendingSyncData = wx.getStorageSync('pendingSyncData') || [];
    this.globalData.lastSyncTime = wx.getStorageSync('lastSyncTime') || 0;

    // 使用自定义登录函数
    this.login().then(res => {
      console.log('登录成功', res);
      // 获取儿童信息 (登录成功时已经获取并保存了)
      // this.getChildInfo(); // 登录函数中已处理，此处不再需要
      // 检查是否有小孩信息，决定启动页面
      this.checkChildInfoAndNavigate();
      // 尝试同步数据
      this.syncToServer();
    }).catch(err => {
      console.error('登录失败', err);
      // 即使登录失败，也检查导航
      this.checkChildInfoAndNavigate();
    });
  },

  // 检查是否有小孩信息并导航到相应页面
  checkChildInfoAndNavigate() {
    // 从 globalData 获取 childInfo，因为登录成功后会更新 globalData
    const childInfo = this.globalData.childInfo || [];

    // 获取当前页面路径
    const pages = getCurrentPages()
    const currentPage = pages.length > 0 ? pages[pages.length - 1].route : ''

    // 如果已有小孩信息，直接导航到home页面
    if (childInfo.length > 0) {
      // 避免重复导航到home页面
      if (currentPage !== 'pages/home/home') {
        wx.switchTab({
          url: '/pages/home/home'
        })
      }
    } else {
      // 如果没有小孩信息，导航到index页面
      if (currentPage !== 'pages/index/index') {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    }
  },

  // 用户登录函数
  login() {
    return new Promise((resolve, reject) => {
      // 引入API模块
      const { API } = require('./utils/api.js');
      
      // 调用微信登录接口获取临时登录凭证code
      wx.login({
        success: loginRes => {
          if (loginRes.code) {
            // 使用统一的API接口进行登录
            API.auth.login(loginRes.code)
              .then(res => {
                // 登录成功，保存用户信息
                this.globalData.userInfo = res.userinfo;
                this.globalData.role = res.role;

                // 保存openid和session_key到本地存储
                if (res.openid) {
                  wx.setStorageSync('openid', res.openid);
                }

                if (res.session_key) {
                  wx.setStorageSync('session_key', res.session_key);
                }

                // 保存childInfo到本地存储并更新全局变量
                // 确保从后端获取的 childInfo 包含 growthRecords 字段
                const childInfo = res.childinfo || [];
                wx.setStorageSync('childInfo', childInfo);
                this.globalData.childInfo = childInfo; // 更新全局变量

                // 保存token到本地存储（如果有）
                if (res.token) {
                  wx.setStorageSync('token', res.token);
                }

                // 根据是否有childInfo决定导航
                // this.checkChildInfoAndNavigate(); // 在then/catch中调用

                resolve({
                  userInfo: res.userinfo,
                  childInfo: childInfo
                });
              })
              .catch(err => {
                console.error('登录请求失败:', err);
                reject(err);
              });
          } else {
            wx.hideLoading();
            reject(new Error('获取用户登录态失败：' + loginRes.errMsg));
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('微信登录失败:', err);
          reject(new Error('微信登录失败，请重试'));
        }
      });
    });
  },
  // 获取儿童信息
  getChildInfo() {
    // 直接从 globalData 获取，globalData 在登录时或 saveChildInfo 时已更新
    // 如果 globalData.childInfo 为 null，则尝试从本地缓存获取
    let childInfo = this.globalData.childInfo;

    if (!childInfo) {
      childInfo = wx.getStorageSync('childInfo') || [];
      this.globalData.childInfo = childInfo; // 更新 globalData
    }

    // 注意：这里的 getChildInfo 主要用于在其他页面获取当前 childInfo
    // 首次加载和同步逻辑主要在 login 和 syncToServer 中处理

    return childInfo;
  },

  // 保存儿童信息（本地优先，然后尝试同步到服务器）
  saveChildInfo(childInfo) {
    // 保存到本地缓存
    wx.setStorageSync('childInfo', childInfo);
    // 更新全局变量
    this.globalData.childInfo = childInfo;

    // 添加到待同步队列
    // 这里直接将完整的 childInfo 结构添加到队列
    this.addToSyncQueue({
      type: 'childInfo',
      data: childInfo, // 包含 growthRecords 的完整 childInfo 数组
      timestamp: Date.now()
    });

    // 尝试同步到服务器
    this.syncToServer();

    return childInfo;
  },

  // 添加到同步队列
  addToSyncQueue(item) {
    // 获取当前队列
    let queue = this.globalData.pendingSyncData || [];

    // 添加新项目
    queue.push(item);

    // 更新全局变量
    this.globalData.pendingSyncData = queue;

    // 保存到本地存储
    wx.setStorageSync('pendingSyncData', queue);
  },

  // 同步数据到服务器
  syncToServer() {
    // 如果已经在同步中或没有网络连接，则退出
    if (this.globalData.isDataSyncing || !this.globalData.networkStatus) {
      return;
    }

    // 获取待同步队列
    const queue = this.globalData.pendingSyncData || [];
    if (queue.length === 0) {
      return;
    }

    // 设置同步状态
    this.globalData.isDataSyncing = true;

    // 获取用户的 openid 和 token
    const openid = wx.getStorageSync('openid');
    const token = wx.getStorageSync('token');

    if (!openid || !token) {
      this.globalData.isDataSyncing = false;
      return;
    }

    // 引入API模块
    const { apiRequest } = require('./utils/api.js');
    
    // 发送同步请求
    apiRequest.post('/syncData', {
      openid: openid, // 仍然传递 openid，后端可能需要
      data: queue, // 传递整个待同步队列
      token: token,
    }, { needAuth: true })
      .then(res => {
        // 同步成功，清空队列
        this.globalData.pendingSyncData = [];
        wx.setStorageSync('pendingSyncData', []);

        // 更新最后同步时间
        this.globalData.lastSyncTime = Date.now();
        wx.setStorageSync('lastSyncTime', this.globalData.lastSyncTime);

        console.log('数据同步成功', res);

        // TODO: 根据后端返回的数据，可能需要更新本地的 childInfo, appointmentInfo, chatHistory 等
        // 例如：如果后端返回了最新的 childInfo，需要更新本地缓存和 globalData
        if (res.latestChildInfo) {
          this.globalData.childInfo = res.latestChildInfo;
          wx.setStorageSync('childInfo', res.latestChildInfo);
        }
        // 类似地处理 appointmentInfo 和 chatHistory
        if (res.latestAppointmentInfo) {
          this.globalData.appointmentInfo = res.latestAppointmentInfo;
          // 需要遍历保存到每个 childId 对应的 storageKey
          for (const childId in res.latestAppointmentInfo) {
            wx.setStorageSync(`appointment_${childId}`, res.latestAppointmentInfo[childId]);
          }
        }
        if (res.latestChatHistory) {
          this.globalData.chatHistory = res.latestChatHistory;
          // 需要遍历保存到每个 userId 对应的 storageKey
          for (const userId in res.latestChatHistory) {
            wx.setStorageSync(`chat_history_${userId}`, res.latestChatHistory[userId]);
          }
        }
      })
      .catch(err => {
        console.error('同步请求失败:', err);
        // TODO: 处理网络错误，可能需要指数退避重试
      })
      .finally(() => {
        // 重置同步状态
        this.globalData.isDataSyncing = false;
        // 无论成功失败，都尝试再次同步，以处理可能的新增数据或网络恢复
        // setTimeout(() => this.syncToServer(), 5000); // 可以考虑定时重试
      });
  },

  // 监听网络状态变化
  listenNetworkStatus() {
    wx.onNetworkStatusChange((res) => {
      this.globalData.networkStatus = res.isConnected;

      // 如果网络恢复，尝试同步数据
      if (res.isConnected) {
        this.syncToServer();
      }
    });
  },


  // 获取复诊信息
  getAppointmentInfo(childId) {
    // 先尝试从 globalData 获取
    let appointmentInfo = this.globalData.appointmentInfo ? this.globalData.appointmentInfo[childId] : null;

    // 如果 globalData 中没有，再尝试从本地缓存获取
    if (!appointmentInfo) {
      const storageKey = `appointment_${childId}`;
      appointmentInfo = wx.getStorageSync(storageKey) || null;
      // 如果从本地缓存获取到了，更新 globalData
      if (appointmentInfo) {
        if (!this.globalData.appointmentInfo) {
          this.globalData.appointmentInfo = {};
        }
        this.globalData.appointmentInfo[childId] = appointmentInfo;
      }
    }


    // 如果本地和 globalData 都没有，且网络可用，则从服务器获取
    if (!appointmentInfo && this.globalData.networkStatus) {
      // 获取用户的 openid
      const openid = wx.getStorageSync('openid');
      const token = wx.getStorageSync('token'); // 获取 token
      if (openid && token) {
        // 显示加载提示
        wx.showLoading({
          title: '获取复诊信息...',
        });

        // 引入API模块
        const { API } = require('./utils/api.js');
        
        // 从服务器获取预约信息
        API.appointment.getAppointments({ childId: childId })
          .then(res => {
            appointmentInfo = res.appointments || null;
            // 保存到本地缓存
            if (appointmentInfo) {
              const storageKey = `appointment_${childId}`;
              wx.setStorageSync(storageKey, appointmentInfo);
            }
            // 更新全局变量
            if (!this.globalData.appointmentInfo) {
              this.globalData.appointmentInfo = {};
            }
            this.globalData.appointmentInfo[childId] = appointmentInfo;
          })
          .catch(err => {
            console.error('获取预约信息失败:', err);
          })
          .finally(() => {
            wx.hideLoading();
          });
      }
    }

    // 返回当前获取到的 appointmentInfo (可能是本地缓存的，也可能是刚从服务器获取的，或者为 null)
    return appointmentInfo;
  },

  // 保存复诊信息（本地优先，然后尝试同步到服务器）
  saveAppointmentInfo(childId, appointmentInfo) {
    // 保存到本地缓存
    const storageKey = `appointment_${childId}`;
    wx.setStorageSync(storageKey, appointmentInfo);

    // 更新全局变量
    if (!this.globalData.appointmentInfo) {
      this.globalData.appointmentInfo = {};
    }
    this.globalData.appointmentInfo[childId] = appointmentInfo;

    // 添加到待同步队列
    this.addToSyncQueue({
      type: 'appointmentInfo',
      childId: childId,
      data: appointmentInfo,
      timestamp: Date.now()
    });

    // 尝试同步到服务器
    this.syncToServer();

    return appointmentInfo;
  },

  // 删除复诊信息
  deleteAppointmentInfo(childId) {
    // 从本地缓存删除
    const storageKey = `appointment_${childId}`;
    wx.removeStorageSync(storageKey);

    // 更新全局变量
    if (this.globalData.appointmentInfo) {
      delete this.globalData.appointmentInfo[childId];
    }

    // 添加到待同步队列
    this.addToSyncQueue({
      type: 'deleteAppointmentInfo',
      childId: childId,
      timestamp: Date.now()
    });

    // 尝试同步到服务器
    this.syncToServer();
  },

  // 添加以下方法到App对象中


  // 在globalData中添加appointmentInfo全局变量
  globalData: {
    userInfo: null,
    role: null, // 'user' or 'doctor',
    childInfo: null, // 当前使用的儿童信息，修改为数组，包含 growthRecords
    appointmentInfo: {}, // 添加复诊信息全局变量
    chatHistory: {}, // 添加聊天历史全局变量
    // 同步相关状态
    isDataSyncing: false, // 是否正在同步
    lastSyncTime: 0,      // 最后同步时间戳
    pendingSyncData: [],  // 待同步到服务器的数据
    networkStatus: true,   // 网络状态

  },

})

// 添加以下方法到App对象中
// 添加以下方法到App对象中

// 获取聊天历史
App.prototype.getChatHistory = function (userId) {
  // 先尝试从 globalData 获取
  let chatHistory = this.globalData.chatHistory ? this.globalData.chatHistory[userId] : null;

  // 如果 globalData 中没有，再尝试从本地缓存获取
  if (!chatHistory) {
    const storageKey = `chat_history_${userId}`;
    chatHistory = wx.getStorageSync(storageKey) || null;
    // 如果从本地缓存获取到了，更新 globalData
    if (chatHistory) {
      if (!this.globalData.chatHistory) {
        this.globalData.chatHistory = {};
      }
      this.globalData.chatHistory[userId] = chatHistory;
    }
  }


  // 如果本地和 globalData 都没有，且网络可用，则从服务器获取
  if (!chatHistory && this.globalData.networkStatus) {
    // 获取用户的 openid
    const openid = wx.getStorageSync('openid');
    const token = wx.getStorageSync('token'); // 获取 token
    if (openid && token) {
      // 显示加载提示
      wx.showLoading({
        title: '获取聊天记录...',
      });

      // 引入API模块
      const { API } = require('./utils/api.js');
      
      // 从服务器获取聊天历史
      API.chat.getChatHistory({ userId: userId })
        .then(res => {
          chatHistory = res.messages || null;
          // 保存到本地缓存
          if (chatHistory) {
            const storageKey = `chat_history_${userId}`;
            wx.setStorageSync(storageKey, chatHistory);
          }
          // 更新全局变量
          if (!this.globalData.chatHistory) {
            this.globalData.chatHistory = {};
          }
          this.globalData.chatHistory[userId] = chatHistory;
        })
        .catch(err => {
          console.error('获取聊天历史失败:', err);
        })
        .finally(() => {
          wx.hideLoading();
        });
    }
  }

  // 更新全局变量 (如果之前没有获取到，这里确保 globalData 中有该 userId 的空对象)
  if (!this.globalData.chatHistory) {
    this.globalData.chatHistory = {};
  }

  // 如果没有聊天历史，创建一个空的并更新 globalData
  if (!chatHistory) {
    chatHistory = {
      userId: userId,
      messageList: [],
      lastUpdateTime: Date.now()
    };
    this.globalData.chatHistory[userId] = chatHistory;
  } else {
    // 如果从本地或服务器获取到了，确保 globalData 是最新的
    this.globalData.chatHistory[userId] = chatHistory;
  }


  return chatHistory;
};

// 保存聊天消息
App.prototype.saveChatMessage = function (userId, message) {
  // 获取当前聊天历史，优先从 globalData 获取
  let chatHistory = this.globalData.chatHistory ? this.globalData.chatHistory[userId] : null;

  // 如果 globalData 中没有，尝试从本地缓存获取
  if (!chatHistory) {
    const storageKey = `chat_history_${userId}`;
    chatHistory = wx.getStorageSync(storageKey) || {
      userId: userId,
      messageList: [],
      lastUpdateTime: Date.now()
    };
    // 如果从本地缓存获取到了，更新 globalData
    if (!this.globalData.chatHistory) {
      this.globalData.chatHistory = {};
    }
    this.globalData.chatHistory[userId] = chatHistory;
  }


  // 添加新消息
  chatHistory.messageList.push(message);
  chatHistory.lastUpdateTime = Date.now();

  // 保存到本地缓存
  const storageKey = `chat_history_${userId}`;
  wx.setStorageSync(storageKey, chatHistory);

  // 更新全局变量 (已在上面处理)
  // if (!this.globalData.chatHistory) {
  //   this.globalData.chatHistory = {};
  // }
  // this.globalData.chatHistory[userId] = chatHistory;

  // 添加到待同步队列
  this.addToSyncQueue({
    type: 'chatHistory',
    userId: userId,
    data: chatHistory, // 传递完整的聊天历史对象
    timestamp: Date.now()
  });

  // 尝试同步到服务器
  this.syncToServer();

  return {
    success: true,
    chatHistory: chatHistory
  };
};

// 清空聊天历史
App.prototype.clearChatHistory = function (userId) {
  // 从本地缓存删除
  const storageKey = `chat_history_${userId}`;
  wx.removeStorageSync(storageKey);

  // 更新全局变量
  if (this.globalData.chatHistory) {
    this.globalData.chatHistory[userId] = {
      userId: userId,
      messageList: [],
      lastUpdateTime: Date.now()
    };
  } else {
    this.globalData.chatHistory = {};
    this.globalData.chatHistory[userId] = {
      userId: userId,
      messageList: [],
      lastUpdateTime: Date.now()
    };
  }


  // 添加到待同步队列
  this.addToSyncQueue({
    type: 'deleteChatHistory',
    userId: userId,
    timestamp: Date.now()
  });

  // 尝试同步到服务器
  this.syncToServer();

  return {
    success: true
  };
};