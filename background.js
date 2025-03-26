chrome.runtime.onInstalled.addListener(() => {
  updateStatistics();
});

// 监听所有标签变动事件
chrome.tabs.onCreated.addListener(updateStatistics);
chrome.tabs.onRemoved.addListener(updateStatistics);
chrome.tabs.onAttached.addListener(updateStatistics);
chrome.tabs.onDetached.addListener(updateStatistics);

// 监听分组变动事件
chrome.tabGroups.onUpdated.addListener(updateStatistics);
chrome.tabGroups.onRemoved.addListener(updateStatistics);

function updateStatistics() {
  chrome.tabs.query({}, (tabs) => {
    chrome.tabGroups.query({}, (groups) => {
      const groupMap = new Map(groups.map(g => [g.id, {...g, count: 0}]));

      tabs.forEach(tab => {
        if (tab.groupId > -1) {
          const group = groupMap.get(tab.groupId);
          if (group) group.count++;
        }
      });

      const statistics = {
        grouped: Array.from(groupMap.values()).filter(g => g.count > 0),
        ungrouped: tabs.filter(t => t.groupId === -1).length,
        total: tabs.length
      };

      chrome.storage.local.set({ statistics });
    });
  });
}