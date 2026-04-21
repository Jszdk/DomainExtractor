// 调试脚本 - 粘贴到浏览器控制台运行

// 方式1: 检查是否有全局数据变量
console.log('检查 window 对象中的数据...');
for (let key in window) {
  if (typeof window[key] === 'object' && window[key] !== null) {
    const str = JSON.stringify(window[key]).slice(0, 200);
    if (str.includes('domain') || str.includes('ICP备') || str.includes('nankai')) {
      console.log(`找到可能的数据: window.${key}`, window[key]);
    }
  }
}

// 方式2: 直接读取页面上的文本内容
const allTables = document.querySelectorAll('table, .el-table, [class*="table"]');
console.log(`找到 ${allTables.length} 个表格/列表`);

allTables.forEach((table, index) => {
  const text = table.innerText;
  if (text.includes('ICP备')) {
    console.log(`\n=== 表格 ${index} ===`);
    console.log(text.slice(0, 500));
    
    // 显示行数据
    const rows = table.querySelectorAll('tr, .el-table__row');
    rows.forEach((row, ridx) => {
      const cells = row.querySelectorAll('td, .cell');
      const cellTexts = Array.from(cells).map(c => c.innerText.trim()).join(' | ');
      if (cellTexts.includes('ICP备')) {
        console.log(`  行 ${ridx}: ${cellTexts}`);
      }
    });
  }
});

// 方式3: 提取所有可见文本中的备案数据
const bodyText = document.body.innerText;
const icpMatches = bodyText.match(/[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼]ICP备[\d-]+/g);
const domainMatches = bodyText.match(/[a-zA-Z0-9][-a-zA-Z0-9]*\.(com|cn|net|org|edu|gov|mil)(\.cn)?/gi);

console.log('\n=== 提取到的备案号 ===');
console.log(icpMatches ? [...new Set(icpMatches)] : '未找到');

console.log('\n=== 提取到的域名 ===');
console.log(domainMatches ? [...new Set(domainMatches)].slice(0, 20) : '未找到');
