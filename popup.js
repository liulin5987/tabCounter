document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({}, (tabs) => {
    chrome.tabGroups.query({}, (groups) => {
      const groupMap = new Map(groups.map(g => [g.id, {...g, count: 0, tabs: []}]));
      
      tabs.forEach(tab => {
        if (tab.groupId > -1) {
          const group = groupMap.get(tab.groupId);
          if (group) {
            group.count++;
            group.tabs.push(tab);
          }
        }
      });

      const groupsHTML = Array.from(groupMap.values())
        .filter(g => g.count > 0)
        .map(g => {
          // 按字母顺序排序标签页
          g.tabs.sort((a, b) => a.title.localeCompare(b.title));
          return `
          <div class="group">
            <div class="group-header" data-group-id="${g.id}">
              ${g.title || '未命名分组'}: ${g.count}
            </div>
            <div class="group-content" id="content-${g.id}" style="max-height: 0px;" >
              ${g.tabs.map(t => 
                `<div class="tab-item ${t.active ? 'active-tab' : ''}" 
                     data-tab-id="${t.id}" 
                     title="${t.title}">
                  ${t.title}
                  <span class="close-tab" data-tab-id="${t.id}">×</span>
                </div>`
              ).join('')}
            </div>
          </div>
        `}).join('');

        // 处理未分组标签
        const ungroupedTabs = tabs.filter(t => t.groupId === -1);
        ungroupedTabs.sort((a, b) => a.title.localeCompare(b.title));
        const ungrouped = ungroupedTabs.length;
        const total = tabs.length;

      document.getElementById('groups').innerHTML = groupsHTML + 
        (ungrouped ? `
          <div class="group">
            <div class="group-header" data-group-id="ungrouped">
              未分组标签: ${ungrouped}
            </div>
            <div class="group-content" id="content-ungrouped" style="max-height: 0px;">
              ${ungroupedTabs.map(t => 
                `<div class="tab-item" 
                     data-tab-id="${t.id}" 
                     title="${t.title}">
                  ${t.title}
                  <span class="close-tab" data-tab-id="${t.id}">×</span>
                </div>`
              ).join('')}
            </div>
          </div>` : '');
      document.getElementById('total').textContent = total;

      // 添加分组点击事件
      document.getElementById('groups').addEventListener('click', (event) => {
        if (event.target.classList.contains('group-header')) {
          const header = event.target;
          const content = document.getElementById(`content-${header.dataset.groupId}`);
          content.style.maxHeight = content.style.maxHeight === '0px' ? '400px' : '0px';
        }
      });

      // 统一处理标签点击和关闭按钮事件
      document.getElementById('groups').addEventListener('click', (e) => {
        const tabItem = e.target.closest('.tab-item');
        if (tabItem) {
          const tabId = parseInt(tabItem.dataset.tabId);
          chrome.tabs.update(tabId, { active: true });
          window.close();
        }
        
        if (e.target.classList.contains('close-tab')) {
          const tabId = parseInt(e.target.dataset.tabId);
          chrome.tabs.remove(tabId);
          e.stopPropagation(); // 阻止事件冒泡
          e.preventDefault();
        }
      });
    });
  });
});