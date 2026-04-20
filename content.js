// 备案域名提取器 - 优化版

(function() {
  'use strict';

  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // 检查页面
  function checkForData() {
    return { hasData: !!document.body.innerText.match(/ICP备/) };
  }

  // 查找备案行 - 尝试多种选择器
  function findRows() {
    const selectors = [
      '.el-table__row',
      'tbody tr',
      'tr',
      '[class*="row"]',
      '.el-table tbody > div',  // Element UI 可能用div
    ];

    for (const sel of selectors) {
      const rows = document.querySelectorAll(sel);
      const validRows = Array.from(rows).filter(r => {
        const text = r.innerText || '';
        return text.match(/ICP备/) && text.length > 10;
      });
      if (validRows.length > 0) {
        console.log(`[提取] 使用选择器 "${sel}" 找到 ${validRows.length} 行`);
        return validRows;
      }
    }
    return [];
  }

  // 提取域名/IP
  function extractDomain() {
    const selectors = ['.el-dialog__body', '.el-dialog', '[class*="dialog"]', 'body'];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el && el.innerText.includes('域名')) {
        const text = el.innerText;
        const match = text.match(/网站域名[：:]?\s*([a-zA-Z0-9][-\.a-zA-Z0-9]*)/i) ||
                     text.match(/域名[：:]?\s*([a-zA-Z0-9][-\.a-zA-Z0-9]*)/i) ||
                     text.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/);
        if (match) return match[1];
      }
    }
    return '';
  }

  // 关闭弹窗
  function closeModal() {
    const closeBtn = document.querySelector('.el-dialog__close, .ant-modal-close, .dialog-close, .el-dialog__headerbtn');
    if (closeBtn) closeBtn.click();
  }

  // 检查是否有下一页
  function hasNextPage() {
    const nextBtn = document.querySelector('.btn-next:not(.disabled):not([disabled])');
    if (!nextBtn) return false;
    // 检查按钮文字或样式，如果包含"disabled"类则没有下一页
    return !nextBtn.classList.contains('disabled');
  }

  // 点击下一页
  async function goNextPage() {
    const nextBtn = document.querySelector('.btn-next:not(.disabled)');
    if (!nextBtn) return false;

    nextBtn.click();
    // 等待页面加载完成（检测行数变化或等待足够时间）
    await sleep(2000);
    return true;
  }

  // 提取单页
  async function extractPage(domains) {
    const rows = findRows();
    console.log(`[提取] 本页找到 ${rows.length} 行`);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      // 更通用的按钮选择器
      const btn = row.querySelector('button, .el-button, .el-button--text, a, [class*="detail"], [class*="btn"]');

      if (!btn) {
        console.log(`[提取] 第${i+1}行未找到按钮`);
        continue;
      }

      btn.click();
      await sleep(800);

      let domain = extractDomain();

      // 如果没提取到，再试一次
      if (!domain) {
        console.log(`[提取] 第${i+1}行首次未提取到，重试...`);
        await sleep(800);
        domain = extractDomain();
      }

      if (domain && !domains.includes(domain)) {
        domains.push(domain);
        console.log(`[提取] 第${i+1}行成功: ${domain}`);
      } else if (!domain) {
        console.log(`[提取] 第${i+1}行未提取到域名`);
      }

      closeModal();
      await sleep(300);
    }

    return domains;
  }

  // 提取当前页
  async function extractCurrentPage() {
    return extractPage([]);
  }

  // 提取所有页
  async function extractAllPages() {
    const allDomains = [];
    let pageNum = 1;

    while (true) {
      // 提取当前页
      await extractPage(allDomains);

      // 检查是否还有下一页
      if (!hasNextPage()) {
        break;
      }

      // 翻页
      const success = await goNextPage();
      if (!success) break;

      pageNum++;
      if (pageNum > 50) break; // 安全限制，最多50页
    }

    return allDomains;
  }

  // 消息监听
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    (async () => {
      switch (request.action) {
        case 'checkData':
          sendResponse(checkForData());
          break;
        case 'extractDomains':
          sendResponse({ domains: await extractCurrentPage() });
          break;
        case 'extractDomainsAll':
          sendResponse({ domains: await extractAllPages() });
          break;
        case 'hasNextPage':
          sendResponse({ hasNext: hasNextPage() });
          break;
      }
    })();
    return true;
  });

  console.log('[备案提取器] 已加载');
})();
