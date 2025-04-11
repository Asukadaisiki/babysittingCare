Component({
    data: {
      showTabBar: true,
      currentPage: ''
    },
    methods: {
      updateVisibility() {
        const pages = getCurrentPages();
        if (pages.length === 0) return;
  
        const currentPage = pages[pages.length - 1].route;
  
        // 如果当前页面在 tabBar 页面列表中，就显示 tabBar，否则隐藏
        const tabBarPages = [
          'pages/home/home',
          'pages/ai-qa/ai-qa',
          'pages/onlineClass/onlineClass',
          'pages/settings/settings'
        ];
  
        this.setData({
          showTabBar: tabBarPages.includes(currentPage),
          currentPage
        });
      }
    },
    lifetimes: {
      attached() {
        this.updateVisibility();
      }
    },
    pageLifetimes: {
      show() {
        this.updateVisibility();
      }
    }
  });
  