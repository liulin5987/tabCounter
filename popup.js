document.addEventListener('DOMContentLoaded', () => {
  chrome.tabs.query({}, (tabs) => {
    chrome.tabGroups.query({}, (groups) => {
      const groupMap = new Map(groups.map(g => [g.id, {...g, count: 0}]));
      
      tabs.forEach(tab => {
        if (tab.groupId > -1) {
          const group = groupMap.get(tab.groupId);
          if (group) group.count++;
        }
      });

      const groupsHTML = Array.from(groupMap.values())
        .filter(g => g.count > 0)
        .map(g => `<div class="group">${g.title || '未命名分组'}: ${g.count}</div>`)
        .join('');

      const ungrouped = tabs.filter(t => t.groupId === -1).length;
      const total = tabs.length;

      document.getElementById('groups').innerHTML = groupsHTML + 
        (ungrouped ? `<div class="group">未分组标签: ${ungrouped}</div>` : '');
      document.getElementById('total').textContent = total;
    });
  });
});