document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({}, (tabs) => {
    chrome.tabGroups.query({}, (groups) => {
      const groupMap = new Map(groups.map(g => [g.id, {...g, count: 0, tabs: []}]));
      
      tabs.forEach(tab => {
        if (tab.groupId > -1) {
          const group = groupMap.get(tab.groupId);
          if (group) {
            group.count++;
            group.tabs.push(tab); // 存储tab对象
          }
        }
      });

      const groupsHTML = Array.from(groupMap.values())
        .filter(g => g.count > 0)
        .map(g => `
          <div class="group">
            <div class="group-header" data-group-id="${g.id}">
              ${g.title || '未命名分组'}: ${g.count}
            </div>
            <div class="group-content" id="content-${g.id}" style="max-height: 0px;" >
              ${g.tabs.map(t => 
                `<div class="tab-item" 
                     data-tab-id="${t.id}" 
                     title="${t.title}">
                  ${t.title}
                </div>`
              ).join('')}
            </div>
          </div>
        `).join('');

        const ungrouped = tabs.filter(t => t.groupId === -1).length;
      const total = tabs.length;

      document.getElementById('groups').innerHTML = groupsHTML + 
        (ungrouped ? `
          <div class="group">
            <div class="group-header" data-group-id="ungrouped">
              未分组标签: ${ungrouped}
            </div>
            <div class="group-content" id="content-ungrouped" style="max-height: 0px;">
              ${tabs.filter(t => t.groupId === -1).map(t => 
                `<div class="tab-item" 
                     data-tab-id="${t.id}" 
                     title="${t.title}">
                  ${t.title}
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

      // 统一处理标签点击事件（事件委托）
      document.getElementById('groups').addEventListener('click', (e) => {
        const tabItem = e.target.closest('.tab-item');
        if (tabItem) {
          const tabId = parseInt(tabItem.dataset.tabId);
          chrome.tabs.update(tabId, { active: true });
          window.close();
        }
      });

      
    });
  });
});