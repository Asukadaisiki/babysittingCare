// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    role: null, // 'user' or 'doctor',
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
  }
})

