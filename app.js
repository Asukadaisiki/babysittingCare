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
      // 获取儿童信息
      this.getChildInfo();
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
    const childInfo = wx.getStorageSync('childInfo') || []

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
      // 显示加载提示
      wx.showLoading({
        title: '登录中...',
      });

      // 调用微信登录接口获取临时登录凭证code
      wx.login({
        success: loginRes => {
          if (loginRes.code) {
            // 获取到登录凭证code，发送到开发者服务器
            wx.request({
              url: 'https://pinf.top/api/login',
              method: 'POST',
              data: {
                code: loginRes.code
              },
              success: (res) => {
                wx.hideLoading();

                if (res.statusCode === 200 && res.data.success) {
                  // 登录成功，保存用户信息
                  this.globalData.userInfo = res.data.userInfo;
                  this.globalData.role = res.data.role;

                  // 保存openid和session_key到本地存储
                  if (res.data.openid) {
                    wx.setStorageSync('openid', res.data.openid);
                  }

                  if (res.data.session_key) {
                    wx.setStorageSync('session_key', res.data.session_key);
                  }

                  // 保存childInfo到本地存储
                  const childInfo = res.data.childInfo || [];
                  wx.setStorageSync('childInfo', childInfo);

                  // 保存token到本地存储（如果有）
                  if (res.data.token) {
                    wx.setStorageSync('token', res.data.token);
                  }

                  // 根据是否有childInfo决定导航
                  this.checkChildInfoAndNavigate();

                  resolve({
                    userInfo: res.data.userInfo,
                    childInfo: childInfo
                  });
                } else {
                  // 登录失败
                  reject(new Error(res.data.message || '登录失败'));
                }
              },
              fail: (err) => {
                wx.hideLoading();
                console.error('登录请求失败:', err);
                reject(new Error('网络错误，请检查网络连接'));
              }
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
    // 先尝试从本地缓存获取
    let childInfo = wx.getStorageSync('childInfo') || [];

    // 如果本地没有缓存，且网络可用，则从服务器获取
    if (childInfo.length === 0 && this.globalData.networkStatus) {
      // 获取用户的 openid
      const openid = wx.getStorageSync('openid');
      if (openid) {
        // 显示加载提示
        wx.showLoading({
          title: '获取宝宝信息...',
        });

        // 从服务器获取儿童信息
        wx.request({
          url: 'https://pinf.top/api/getChildInfo',
          method: 'GET',
          data: {
            openid: openid
          },
          success: (res) => {
            if (res.statusCode === 200 && res.data.success) {
              childInfo = res.data.childInfo || [];
              // 保存到本地缓存
              wx.setStorageSync('childInfo', childInfo);
              // 更新全局变量
              this.globalData.childInfo = childInfo;
            }
          },
          complete: () => {
            wx.hideLoading();
          }
        });
      }
    }

    // 更新全局变量
    this.globalData.childInfo = childInfo;
    return childInfo;
  },

  // 保存儿童信息（本地优先，然后尝试同步到服务器）
  saveChildInfo(childInfo) {
    // 保存到本地缓存
    wx.setStorageSync('childInfo', childInfo);
    // 更新全局变量
    this.globalData.childInfo = childInfo;

    // 添加到待同步队列
    this.addToSyncQueue({
      type: 'childInfo',
      data: childInfo,
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

    // 发送同步请求
    wx.request({
      url: 'https://pinf.top/api/syncData',
      method: 'POST',
      data: {
        openid: openid,
        token: token,
        data: queue
      },
      success: (res) => {
        if (res.statusCode === 200 && res.data.success) {
          // 同步成功，清空队列
          this.globalData.pendingSyncData = [];
          wx.setStorageSync('pendingSyncData', []);

          // 更新最后同步时间
          this.globalData.lastSyncTime = Date.now();
          wx.setStorageSync('lastSyncTime', this.globalData.lastSyncTime);
        }
      },
      complete: () => {
        // 重置同步状态
        this.globalData.isDataSyncing = false;
      }
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
    // 先尝试从本地缓存获取
    const storageKey = `appointment_${childId}`;
    let appointmentInfo = wx.getStorageSync(storageKey) || null;

    // 如果本地没有缓存，且网络可用，则从服务器获取
    if (!appointmentInfo && this.globalData.networkStatus) {
      // 获取用户的 openid
      const openid = wx.getStorageSync('openid');
      if (openid) {
        // 显示加载提示
        wx.showLoading({
          title: '获取复诊信息...',
        });

        // 从服务器获取复诊信息
        wx.request({
          url: 'https://pinf.top/api/getAppointmentInfo',
          method: 'GET',
          data: {
            openid: openid,
            childId: childId
          },
          success: (res) => {
            if (res.statusCode === 200 && res.data.success) {
              appointmentInfo = res.data.appointmentInfo || null;
              // 保存到本地缓存
              if (appointmentInfo) {
                wx.setStorageSync(storageKey, appointmentInfo);
              }
              // 更新全局变量
              this.globalData.appointmentInfo[childId] = appointmentInfo;
            }
          },
          complete: () => {
            wx.hideLoading();
          }
        });
      }
    }

    // 更新全局变量
    if (!this.globalData.appointmentInfo) {
      this.globalData.appointmentInfo = {};
    }
    this.globalData.appointmentInfo[childId] = appointmentInfo;
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
    childInfo: null, // 当前使用的儿童信息
    appointmentInfo: {}, // 添加复诊信息全局变量
    chatHistory: {}, // 添加聊天历史全局变量
    // 同步相关状态
    isDataSyncing: false, // 是否正在同步
    lastSyncTime: 0,      // 最后同步时间戳
    pendingSyncData: [],  // 待同步到服务器的数据
    networkStatus: true,   // 网络状态
    // WHO生长标准数据（LMS参数）
    whoData: {
      boy: {
        weight: [
          { ageMonth: 0, L: -0.0631, M: 3.530, S: 0.1547 }, // 0月龄
          { ageMonth: 1, L: 0.0067, M: 4.327, S: 0.1469 },   // 1月龄
          { ageMonth: 2, L: 0.0424, M: 5.118, S: 0.1428 },   // 2月龄
          { ageMonth: 3, L: 0.0751, M: 5.846, S: 0.1409 },   // 3月龄
          { ageMonth: 4, L: 0.1053, M: 6.509, S: 0.1400 },   // 4月龄
          { ageMonth: 5, L: 0.1330, M: 7.110, S: 0.1397 },   // 5月龄
          { ageMonth: 6, L: 0.1585, M: 7.651, S: 0.1396 },   // 6月龄
          { ageMonth: 7, L: 0.1818, M: 8.138, S: 0.1397 },   // 7月龄
          { ageMonth: 8, L: 0.2032, M: 8.577, S: 0.1398 },   // 8月龄
          { ageMonth: 9, L: 0.2227, M: 8.975, S: 0.1399 },   // 9月龄
          { ageMonth: 10, L: 0.2404, M: 9.339, S: 0.1400 },  // 10月龄
          { ageMonth: 11, L: 0.2566, M: 9.673, S: 0.1401 },  // 11月龄
          { ageMonth: 12, L: 0.2714, M: 9.980, S: 0.1402 },  // 12月龄
          { ageMonth: 18, L: 0.3394, M: 11.473, S: 0.1407 }, // 18月龄
          { ageMonth: 24, L: 0.3834, M: 12.687, S: 0.1412 }, // 24月龄
          { ageMonth: 30, L: 0.4132, M: 13.776, S: 0.1418 }, // 30月龄
          { ageMonth: 36, L: 0.4330, M: 14.784, S: 0.1425 }  // 36月龄
        ],
        height: [
          { ageMonth: 0, L: 1, M: 49.9, S: 0.0380 },  // 0月龄
          { ageMonth: 1, L: 1, M: 54.7, S: 0.0364 },  // 1月龄
          { ageMonth: 2, L: 1, M: 58.4, S: 0.0352 },  // 2月龄
          { ageMonth: 3, L: 1, M: 61.4, S: 0.0342 },  // 3月龄
          { ageMonth: 4, L: 1, M: 63.9, S: 0.0334 },  // 4月龄
          { ageMonth: 5, L: 1, M: 65.9, S: 0.0327 },  // 5月龄
          { ageMonth: 6, L: 1, M: 67.6, S: 0.0321 },  // 6月龄
          { ageMonth: 7, L: 1, M: 69.2, S: 0.0317 },  // 7月龄
          { ageMonth: 8, L: 1, M: 70.6, S: 0.0314 },  // 8月龄
          { ageMonth: 9, L: 1, M: 72.0, S: 0.0312 },  // 9月龄
          { ageMonth: 10, L: 1, M: 73.3, S: 0.0311 }, // 10月龄
          { ageMonth: 11, L: 1, M: 74.5, S: 0.0310 }, // 11月龄
          { ageMonth: 12, L: 1, M: 75.7, S: 0.0309 }, // 12月龄
          { ageMonth: 18, L: 1, M: 82.3, S: 0.0310 }, // 18月龄
          { ageMonth: 24, L: 1, M: 87.8, S: 0.0314 }, // 24月龄
          { ageMonth: 30, L: 1, M: 92.5, S: 0.0320 }, // 30月龄
          { ageMonth: 36, L: 1, M: 96.9, S: 0.0327 }  // 36月龄
        ]
      },
      girl: {
        weight: [
          { ageMonth: 0, L: -0.0243, M: 3.400, S: 0.1428 }, // 0月龄
          { ageMonth: 1, L: 0.0222, M: 4.107, S: 0.1367 },  // 1月龄
          { ageMonth: 2, L: 0.0668, M: 4.812, S: 0.1325 },  // 2月龄
          { ageMonth: 3, L: 0.1091, M: 5.449, S: 0.1294 },  // 3月龄
          { ageMonth: 4, L: 0.1493, M: 6.022, S: 0.1270 },  // 4月龄
          { ageMonth: 5, L: 0.1873, M: 6.539, S: 0.1252 },  // 5月龄
          { ageMonth: 6, L: 0.2233, M: 7.006, S: 0.1238 },  // 6月龄
          { ageMonth: 7, L: 0.2572, M: 7.431, S: 0.1227 },  // 7月龄
          { ageMonth: 8, L: 0.2891, M: 7.820, S: 0.1219 },  // 8月龄
          { ageMonth: 9, L: 0.3191, M: 8.178, S: 0.1212 },  // 9月龄
          { ageMonth: 10, L: 0.3471, M: 8.510, S: 0.1207 }, // 10月龄
          { ageMonth: 11, L: 0.3734, M: 8.820, S: 0.1203 }, // 11月龄
          { ageMonth: 12, L: 0.3981, M: 9.112, S: 0.1200 }, // 12月龄
          { ageMonth: 18, L: 0.5178, M: 10.565, S: 0.1192 },// 18月龄
          { ageMonth: 24, L: 0.6051, M: 11.848, S: 0.1195 },// 24月龄
          { ageMonth: 30, L: 0.6703, M: 13.031, S: 0.1205 },// 30月龄
          { ageMonth: 36, L: 0.7190, M: 14.147, S: 0.1221 } // 36月龄
        ],
        height: [
          { ageMonth: 0, L: 1, M: 49.1, S: 0.0379 },  // 0月龄
          { ageMonth: 1, L: 1, M: 53.7, S: 0.0364 },  // 1月龄
          { ageMonth: 2, L: 1, M: 57.1, S: 0.0353 },  // 2月龄
          { ageMonth: 3, L: 1, M: 59.8, S: 0.0343 },  // 3月龄
          { ageMonth: 4, L: 1, M: 62.1, S: 0.0336 },  // 4月龄
          { ageMonth: 5, L: 1, M: 64.0, S: 0.0330 },  // 5月龄
          { ageMonth: 6, L: 1, M: 65.7, S: 0.0325 },  // 6月龄
          { ageMonth: 7, L: 1, M: 67.3, S: 0.0321 },  // 7月龄
          { ageMonth: 8, L: 1, M: 68.7, S: 0.0318 },  // 8月龄
          { ageMonth: 9, L: 1, M: 70.1, S: 0.0316 },  // 9月龄
          { ageMonth: 10, L: 1, M: 71.5, S: 0.0315 }, // 10月龄
          { ageMonth: 11, L: 1, M: 72.8, S: 0.0314 }, // 11月龄
          { ageMonth: 12, L: 1, M: 74.0, S: 0.0314 }, // 12月龄
          { ageMonth: 18, L: 1, M: 80.7, S: 0.0317 }, // 18月龄
          { ageMonth: 24, L: 1, M: 86.4, S: 0.0325 }, // 24月龄
          { ageMonth: 30, L: 1, M: 91.4, S: 0.0333 }, // 30月龄
          { ageMonth: 36, L: 1, M: 95.9, S: 0.0343 }  // 36月龄
        ]
      }
    }
  },

})

// 添加以下方法到App对象中
// 添加以下方法到App对象中

// 获取聊天历史
App.prototype.getChatHistory = function (userId) {
  // 先尝试从本地缓存获取
  const storageKey = `chat_history_${userId}`;
  let chatHistory = wx.getStorageSync(storageKey) || null;

  // 如果本地没有缓存，且网络可用，则从服务器获取
  if (!chatHistory && this.globalData.networkStatus) {
    // 获取用户的 openid
    const openid = wx.getStorageSync('openid');
    if (openid) {
      // 显示加载提示
      wx.showLoading({
        title: '获取聊天记录...',
      });

      // 从服务器获取聊天历史
      wx.request({
        url: 'https://pinf.top/api/syncData',
        method: 'GET',
        data: {
          openid: openid,
          type: 'chatHistory',
          userId: userId
        },
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            chatHistory = res.data.chatHistory || null;
            // 保存到本地缓存
            if (chatHistory) {
              wx.setStorageSync(storageKey, chatHistory);
            }
            // 更新全局变量
            this.globalData.chatHistory[userId] = chatHistory;
          }
        },
        complete: () => {
          wx.hideLoading();
        }
      });
    }
  }

  // 更新全局变量
  if (!this.globalData.chatHistory) {
    this.globalData.chatHistory = {};
  }

  // 如果没有聊天历史，创建一个空的
  if (!chatHistory) {
    chatHistory = {
      userId: userId,
      messageList: [],
      lastUpdateTime: Date.now()
    };
  }

  this.globalData.chatHistory[userId] = chatHistory;
  return chatHistory;
};

// 保存聊天消息
App.prototype.saveChatMessage = function (userId, message) {
  // 获取当前聊天历史
  const storageKey = `chat_history_${userId}`;
  let chatHistory = wx.getStorageSync(storageKey) || {
    userId: userId,
    messageList: [],
    lastUpdateTime: Date.now()
  };

  // 添加新消息
  chatHistory.messageList.push(message);
  chatHistory.lastUpdateTime = Date.now();

  // 保存到本地缓存
  wx.setStorageSync(storageKey, chatHistory);

  // 更新全局变量
  if (!this.globalData.chatHistory) {
    this.globalData.chatHistory = {};
  }
  this.globalData.chatHistory[userId] = chatHistory;

  // 添加到待同步队列
  this.addToSyncQueue({
    type: 'chatHistory',
    userId: userId,
    data: chatHistory,
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