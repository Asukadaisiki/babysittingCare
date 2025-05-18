# 早护通小程序后端开发规划指南

## 1. 项目概述

早护通是一款面向家长的育儿助手微信小程序，主要功能包括宝宝信息管理、生长发育监测、复诊提醒、AI育儿问答以及在线科普等。目前项目已完成前端开发，需要规划后端开发以支持数据持久化、用户认证、AI交互等功能。

## 2. 需要接入后端的功能模块

通过分析现有代码，以下功能模块需要接入后端：

### 2.1 用户认证与管理

**当前实现**：使用微信小程序本地存储保存用户信息。

**需要后端支持**：
- 用户登录与注册（基于微信授权）
- 用户信息存储与管理
- 用户角色管理（普通用户/医护人员）

**相关文件**：
- `app.js`（微信登录）
- `pages/index/index.js`（用户信息获取）
- `pages/account-privacy/account-privacy.js`（账户隐私设置）

### 2.2 宝宝信息管理

**当前实现**：使用微信小程序本地存储保存宝宝信息。

**需要后端支持**：
- 宝宝基本信息的存储与管理
- 多设备数据同步
- 数据备份与恢复

**相关文件**：
- `pages/info-collection/info-collection.js`（宝宝信息收集）
- `pages/home/home.js`（宝宝信息展示与管理）
- `pages/baby-info/baby-info.js`（宝宝详细信息）

### 2.3 生长发育监测

**当前实现**：使用本地存储保存生长记录，使用Canvas在前端绘制生长曲线。

**需要后端支持**：
- 生长记录数据的存储与管理
- WHO标准生长曲线数据的提供
- 生长曲线的计算与分析
- 生长异常的智能提醒

**相关文件**：
- `pages/height-chart/height-chart.js`（身高曲线）
- `pages/weight-chart/weight-chart.js`（体重曲线）
- `pages/head-chart/head-chart.js`（头围曲线）
- `pages/home/home.js`（生长记录管理）

### 2.4 复诊提醒

**当前实现**：使用本地存储保存复诊信息，使用微信订阅消息实现提醒。

**需要后端支持**：
- 复诊信息的存储与管理
- 定时任务系统（发送提醒）
- 微信订阅消息的发送

**相关文件**：
- `pages/home/home.js`（复诊信息管理）
- `pages/appointment-setting/appointment-setting.js`（复诊设置）

### 2.5 AI育儿问答

**当前实现**：使用前端模拟回答，无实际AI能力。

**需要后端支持**：
- 接入AI大模型API
- 问答历史记录的存储与管理
- 育儿知识库的构建与维护

**相关文件**：
- `pages/ai-qa/ai-qa.js`（AI问答界面）

### 2.6 在线科普

**当前实现**：使用前端静态数据展示。

**需要后端支持**：
- 科普内容的存储与管理（文章、视频）
- 内容分类与标签系统
- 内容推荐算法
- 用户浏览历史记录

**相关文件**：
- `pages/onlineClass/onlineClass.js`（在线科普页面）

### 2.7 消息通知

**当前实现**：页面基本结构已完成，但无实际功能。

**需要后端支持**：
- 系统消息的存储与管理
- 消息推送服务

**相关文件**：
- `pages/notifications/notifications.js`（消息通知页面）

### 2.8 用户反馈

**当前实现**：页面基本结构已完成，但无实际功能。

**需要后端支持**：
- 用户反馈的存储与管理
- 反馈处理流程

**相关文件**：
- `pages/help-feedback/help-feedback.js`（帮助与反馈页面）

## 3. 数据模型设计

根据功能需求，建议设计以下数据模型：

### 3.1 用户模型 (User)

```json
{
  "id": "用户唯一标识",
  "openid": "微信openid",
  "unionid": "微信unionid（如有）",
  "nickname": "用户昵称",
  "avatar": "头像URL",
  "role": "用户角色（user/doctor）",
  "phone": "手机号码",
  "created_at": "创建时间",
  "updated_at": "更新时间"
}
```

### 3.2 宝宝模型 (Child)

```json
{
  "id": "宝宝唯一标识",
  "user_id": "关联的用户ID",
  "name": "宝宝姓名",
  "gender": "性别（男/女）",
  "birth_date": "出生日期",
  "expected_date": "预产期",
  "created_at": "创建时间",
  "updated_at": "更新时间"
}
```

### 3.3 生长记录模型 (GrowthRecord)

```json
{
  "id": "记录唯一标识",
  "child_id": "关联的宝宝ID",
  "date": "记录日期",
  "age_in_months": "月龄",
  "height": "身高（cm）",
  "weight": "体重（kg）",
  "head_circumference": "头围（cm）",
  "created_at": "创建时间",
  "updated_at": "更新时间"
}
```

### 3.4 复诊提醒模型 (Appointment)

```json
{
  "id": "提醒唯一标识",
  "child_id": "关联的宝宝ID",
  "hospital_name": "医院名称",
  "department": "科室",
  "appointment_date": "复诊日期",
  "notes": "备注",
  "has_subscribed": "是否已订阅消息",
  "created_at": "创建时间",
  "updated_at": "更新时间"
}
```

### 3.5 问答记录模型 (QARecord)

```json
{
  "id": "记录唯一标识",
  "user_id": "关联的用户ID",
  "question": "用户问题",
  "answer": "AI回答",
  "created_at": "创建时间"
}
```

### 3.6 科普内容模型 (Content)

```json
{
  "id": "内容唯一标识",
  "title": "标题",
  "type": "类型（article/video）",
  "cover": "封面图URL",
  "content": "内容（文章内容或视频URL）",
  "tags": "标签列表",
  "view_count": "浏览次数",
  "created_at": "创建时间",
  "updated_at": "更新时间"
}
```

### 3.7 消息通知模型 (Notification)

```json
{
  "id": "通知唯一标识",
  "user_id": "关联的用户ID",
  "title": "通知标题",
  "content": "通知内容",
  "type": "通知类型（system/appointment/growth）",
  "is_read": "是否已读",
  "created_at": "创建时间"
}
```

### 3.8 用户反馈模型 (Feedback)

```json
{
  "id": "反馈唯一标识",
  "user_id": "关联的用户ID",
  "content": "反馈内容",
  "contact": "联系方式",
  "status": "处理状态（pending/processing/resolved）",
  "created_at": "创建时间",
  "updated_at": "更新时间"
}
```

## 4. API接口设计

### 4.1 用户认证与管理

```
POST /api/auth/login          # 微信登录
GET  /api/user/info           # 获取用户信息
PUT  /api/user/info           # 更新用户信息
```

### 4.2 宝宝信息管理

```
GET    /api/children              # 获取宝宝列表
POST   /api/children              # 添加宝宝
GET    /api/children/:id          # 获取宝宝详情
PUT    /api/children/:id          # 更新宝宝信息
DELETE /api/children/:id          # 删除宝宝
```

### 4.3 生长发育监测

```
GET    /api/children/:id/growth-records           # 获取生长记录列表
POST   /api/children/:id/growth-records           # 添加生长记录
PUT    /api/children/:id/growth-records/:recordId # 更新生长记录
DELETE /api/children/:id/growth-records/:recordId # 删除生长记录
GET    /api/growth-standards                      # 获取WHO标准生长数据
GET    /api/children/:id/growth-analysis          # 获取生长分析结果
```

### 4.4 复诊提醒

```
GET    /api/children/:id/appointments           # 获取复诊提醒列表
POST   /api/children/:id/appointments           # 添加复诊提醒
PUT    /api/children/:id/appointments/:appId    # 更新复诊提醒
DELETE /api/children/:id/appointments/:appId    # 删除复诊提醒
POST   /api/children/:id/appointments/:appId/subscribe # 订阅提醒消息
```

### 4.5 AI育儿问答

```
POST   /api/ai/question          # 提交问题获取回答
GET    /api/ai/history           # 获取问答历史
DELETE /api/ai/history/:id       # 删除问答历史
```

### 4.6 在线科普

```
GET    /api/contents             # 获取科普内容列表
GET    /api/contents/:id         # 获取科普内容详情
GET    /api/contents/recommended # 获取推荐内容
GET    /api/contents/tags        # 获取内容标签列表
GET    /api/contents/search      # 搜索科普内容
```

### 4.7 消息通知

```
GET    /api/notifications        # 获取通知列表
GET    /api/notifications/:id    # 获取通知详情
PUT    /api/notifications/:id    # 标记通知为已读
DELETE /api/notifications/:id    # 删除通知
```

### 4.8 用户反馈

```
POST   /api/feedback             # 提交反馈
GET    /api/feedback             # 获取反馈列表
GET    /api/feedback/:id         # 获取反馈详情
```

## 5. 后端技术选型建议

### 5.1 开发语言与框架

**推荐选项1：Node.js + Express/Koa**
- 优点：学习曲线较平缓，适合前端开发者过渡到后端开发；生态丰富，有大量现成的库和中间件
- 缺点：对于大型应用，性能和可维护性可能不如其他选项

**推荐选项2：Python + Django/Flask**
- 优点：语法简洁，易于学习；AI相关功能实现便捷；Django提供完整的Web开发框架
- 缺点：在高并发场景下性能可能不如Go或Java

**推荐选项3：Go + Gin/Echo**
- 优点：性能优秀，适合高并发场景；编译型语言，部署简单
- 缺点：学习曲线相对陡峭

### 5.2 数据库

**关系型数据库：MySQL/PostgreSQL**
- 适用于结构化数据，如用户信息、宝宝信息、生长记录等

**NoSQL数据库：MongoDB**
- 适用于非结构化或半结构化数据，如AI问答记录、科普内容等

**缓存：Redis**
- 用于缓存频繁访问的数据，如WHO标准生长曲线数据、热门科普内容等

### 5.3 云服务

**微信云开发**
- 优点：与微信小程序无缝集成，开发便捷，无需自行搭建服务器
- 缺点：定制化能力有限，高级功能可能受限

**阿里云/腾讯云/华为云**
- 优点：功能全面，可扩展性强，适合长期发展
- 缺点：配置和维护成本较高

### 5.4 AI服务

**推荐选项1：百度智能云**
- 提供NLP、知识图谱等AI能力，适合构建育儿问答系统

**推荐选项2：阿里云智能对话分析服务**
- 提供智能问答、多轮对话等能力

**推荐选项3：腾讯云AI平台**
- 提供自然语言处理、智能对话等服务

**推荐选项4：OpenAI API**
- 提供强大的语言模型能力，如GPT系列

## 6. 开发步骤建议

### 6.1 前期准备

1. **确定技术栈**：根据团队技术背景和项目需求选择合适的技术栈
2. **搭建开发环境**：配置本地开发环境和版本控制系统
3. **设计数据库结构**：根据数据模型设计数据库表结构

### 6.2 基础架构开发

1. **用户认证系统**：实现微信登录和用户信息管理
2. **数据库连接与ORM**：实现数据库连接和对象关系映射
3. **API路由设计**：设计RESTful API路由结构

### 6.3 核心功能开发

1. **宝宝信息管理**：实现宝宝信息的CRUD操作
2. **生长发育监测**：实现生长记录管理和曲线计算
3. **复诊提醒**：实现复诊提醒管理和消息推送
4. **AI育儿问答**：接入AI服务，实现智能问答功能

### 6.4 扩展功能开发

1. **在线科普**：实现科普内容管理和推荐系统
2. **消息通知**：实现系统消息和推送服务
3. **用户反馈**：实现反馈收集和处理流程

### 6.5 测试与部署

1. **单元测试**：编写API接口的单元测试
2. **集成测试**：测试前后端交互
3. **部署上线**：将后端服务部署到生产环境

## 7. 前后端对接方案

### 7.1 修改前端代码

需要修改的主要部分：

1. **数据存储方式**：将`wx.setStorageSync`和`wx.getStorageSync`替换为API请求
2. **数据加载逻辑**：在页面`onLoad`和`onShow`中添加API请求
3. **表单提交逻辑**：将本地保存替换为API提交

### 7.2 示例：修改宝宝信息管理

**原代码（使用本地存储）**：

```javascript
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
```

**修改后（使用API请求）**：

```javascript
// 保存信息到后端
const childrenInfo = children.map(child => ({
  name: child.childName,
  expectedDate: child.expectedDate,
  birthDate: child.birthDate,
  gender: child.gender
}))

// 发送API请求
wx.request({
  url: 'https://api.example.com/api/children',
  method: 'POST',
  data: childrenInfo,
  header: {
    'content-type': 'application/json',
    'Authorization': `Bearer ${wx.getStorageSync('token')}`
  },
  success: (res) => {
    console.log('宝宝信息已保存:', res.data)
    // 跳转到首页
    wx.switchTab({
      url: '/pages/home/home'
    })
  },
  fail: (err) => {
    console.error('保存失败:', err)
    wx.showToast({
      title: '保存失败，请重试',
      icon: 'none'
    })
  }
})
```

### 7.3 示例：修改生长记录管理

**原代码（使用本地存储）**：

```javascript
// 获取生长记录
let growthRecords = [];
if (currentChild && currentChild.name) {
  const storageKey = `growthRecords_${currentChild.name}`;
  growthRecords = wx.getStorageSync(storageKey) || [];
}
```

**修改后（使用API请求）**：

```javascript
// 获取生长记录
let growthRecords = [];
if (currentChild && currentChild.id) {
  wx.request({
    url: `https://api.example.com/api/children/${currentChild.id}/growth-records`,
    method: 'GET',
    header: {
      'Authorization': `Bearer ${wx.getStorageSync('token')}`
    },
    success: (res) => {
      this.setData({
        growthRecords: res.data
      });
    },
    fail: (err) => {
      console.error('获取生长记录失败:', err);
      wx.showToast({
        title: '获取数据失败，请重试',
        icon: 'none'
      });
    }
  });
}
```

## 8. 安全性考虑

### 8.1 用户认证与授权

- 使用JWT（JSON Web Token）进行用户认证
- 实现基于角色的访问控制（RBAC）
- 对敏感API接口添加权限验证

### 8.2 数据安全

- 对敏感数据进行加密存储（如用户手机号）
- 实现数据备份和恢复机制
- 定期清理无用数据

### 8.3 API安全

- 使用HTTPS协议
- 实现API请求频率限制
- 添加请求签名验证
- 防止SQL注入和XSS攻击

## 9. 扩展性考虑

### 9.1 微服务架构

对于未来可能的功能扩展，可以考虑采用微服务架构：

- 用户服务：处理用户认证和信息管理
- 宝宝服务：处理宝宝信息和生长记录
- AI服务：处理智能问答
- 内容服务：处理科普内容管理
- 通知服务：处理消息推送

### 9.2 API网关

使用API网关统一管理API请求：

- 请求路由
- 认证授权
- 限流控制
- 日志监控

### 9.3 消息队列

使用消息队列处理异步任务：

- 消息推送
- 数据统计
- 日志记录

## 10. 总结

本文档提供了早护通小程序后端开发的全面规划，包括需要接入后端的功能模块、数据模型设计、API接口设计、技术选型建议以及开发步骤。通过按照本文档的规划进行开发，可以实现从前端到全栈的平稳过渡，为早护通小程序提供强大的后端支持。

后端开发是一个循序渐进的过程，建议先实现核心功能（用户认证、宝宝信息管理、生长发育监测），再逐步扩展其他功能。同时，注重代码质量和文档编写，为未来的维护和扩展打下良好基础。