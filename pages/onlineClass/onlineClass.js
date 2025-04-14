Page({
  data: {
    searchText: '',
    // 视频数据改为一维数组
    videoGroups: [
      { id: 1, title: '宝宝喂养技巧', cover: '/images/onlineClass/bbwy.jpg' },
      { id: 2, title: '婴儿常见疾病预防', cover: '/images/onlineClass/jbyf.jpg' },
      { id: 3, title: '新生儿护理指南', cover: '/images/onlineClass/hlzn.jpg' }
    ],
    // 文章数据改为一维数组
    articleGroups: [
      { id: 1, title: '0-3岁宝宝成长关键期', cover: '/images/onlineClass/cjgjq.jpg' },
      { id: 2, title: '如何应对宝宝挑食问题', cover: '/images/onlineClass/tswt.jpg' },
      { id: 3, title: '婴儿湿疹的护理方法', cover: '/images/onlineClass/szhl.jpg' }
    ]
  },
  
  onLoad: function () {
    this.fetchPageData();
  },

  fetchPageData: function () {
    console.log('获取页面数据');
  },

  onSearchInput: function (e) {
    this.setData({
      searchText: e.detail.value
    });
  },

  clearSearch: function () {
    this.setData({
      searchText: ''
    });
  },

  navigateToVideoDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/videoDetail/videoDetail?id=${id}`
    });
  },

  navigateToArticleDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/articleDetail/articleDetail?id=${id}`
    });
  }
})
  