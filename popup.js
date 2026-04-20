// 备案信息提取器 - Popup 简化版

let domains = [];

async function checkPage() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  if (!tab.url?.includes('beian.miit.gov.cn')) {
    document.getElementById('notOnPage').classList.remove('hidden');
    document.getElementById('onPage').classList.add('hidden');
    return;
  }
  
  document.getElementById('notOnPage').classList.add('hidden');
  document.getElementById('onPage').classList.remove('hidden');
  
  chrome.tabs.sendMessage(tab.id, { action: 'checkData' }, (res) => {
    const status = document.getElementById('pageStatus');
    if (res?.hasData) {
      status.textContent = '发现备案数据';
      status.className = 'status-value success';
      document.getElementById('extractBtn').disabled = false;
      document.getElementById('extractAllBtn').disabled = false;
    } else {
      status.textContent = '请先搜索';
      status.className = 'status-value error';
    }
  });
}

// 提取当前页域名
async function extractCurrent() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  toggleLoading(true);
  
  chrome.tabs.sendMessage(tab.id, { action: 'extractDomains' }, (res) => {
    toggleLoading(false);
    if (res?.domains) {
      domains = res.domains;
      showResult();
    }
  });
}

// 提取所有页域名
async function extractAll() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  toggleLoading(true, '正在翻页提取，请稍候...');
  
  chrome.tabs.sendMessage(tab.id, { action: 'extractDomainsAll' }, (res) => {
    toggleLoading(false);
    if (res?.domains) {
      domains = res.domains;
      showResult();
      alert(`提取完成！共 ${domains.length} 个域名`);
    }
  });
}

function toggleLoading(show, text) {
  document.getElementById('extractBtn').disabled = show;
  document.getElementById('extractAllBtn').disabled = show;
  const progress = document.getElementById('progress');
  if (show) {
    progress.classList.remove('hidden');
    document.getElementById('progressText').textContent = text || '提取中...';
  } else {
    progress.classList.add('hidden');
  }
}

function showResult() {
  const list = document.getElementById('resultList');
  const resultDiv = document.getElementById('result');
  
  if (domains.length === 0) {
    list.innerHTML = '<div style="color:#999;padding:10px;">未提取到域名</div>';
  } else {
    list.innerHTML = domains.slice(0, 10).map(d => 
      `<div style="padding:6px 0;border-bottom:1px solid #f0f0f0;font-family:monospace;">${d}</div>`
    ).join('');
    if (domains.length > 10) {
      list.innerHTML += `<div style="color:#999;padding:8px;">...还有 ${domains.length - 10} 个...</div>`;
    }
  }
  
  resultDiv.classList.remove('hidden');
  document.getElementById('copyBtn').classList.remove('hidden');
  document.getElementById('saveBtn').classList.remove('hidden');
}

// 复制为文本（每行一个）
async function copyText() {
  if (!domains.length) return;
  const text = domains.join('\n');
  try {
    await navigator.clipboard.writeText(text);
    alert(`已复制 ${domains.length} 个域名`);
  } catch (e) {
    const t = document.createElement('textarea');
    t.value = text;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    alert(`已复制 ${domains.length} 个域名`);
  }
}

// 复制为 JSON
async function copyJson() {
  if (!domains.length) return;
  const json = JSON.stringify(domains, null, 2);
  try {
    await navigator.clipboard.writeText(json);
    alert('JSON 已复制');
  } catch (e) {
    const t = document.createElement('textarea');
    t.value = json;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    alert('JSON 已复制');
  }
}

// 保存为文件
function saveFile() {
  if (!domains.length) return;
  const blob = new Blob([JSON.stringify(domains, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `domains_${new Date().getTime()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// 事件监听
document.addEventListener('DOMContentLoaded', checkPage);
document.getElementById('extractBtn').addEventListener('click', extractCurrent);
document.getElementById('extractAllBtn').addEventListener('click', extractAll);
document.getElementById('copyBtn').addEventListener('click', copyText);
document.getElementById('saveBtn').addEventListener('click', saveFile);
