// 页码调试脚本 - 粘贴到控制台运行

async function debugExtraction() {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const domains = [];
  let pageNum = 1;
  
  console.log('=== 开始调试 ===');
  
  while (true) {
    console.log(`\n--- 第 ${pageNum} 页 ---`);
    
    // 查找当前页所有行
    const rows = document.querySelectorAll('.el-table__row, tbody tr');
    console.log(`找到 ${rows.length} 行`);
    
    // 显示每行的ICP信息
    rows.forEach((row, i) => {
      const icp = row.innerText.match(/[京津沪渝]ICP备[\d-]+/);
      const btn = row.querySelector('button, .el-button--text, a');
      console.log(`  行${i+1}: ${icp ? icp[0] : '无ICP'} | 按钮: ${btn ? '有' : '无'}`);
    });
    
    // 检查是否有下一页
    const nextBtn = document.querySelector('.btn-next:not(.disabled)');
    console.log(`下一页按钮: ${nextBtn ? '可用' : '不可用/已到最后一页'}`);
    
    if (!nextBtn) {
      console.log('没有更多页面，结束');
      break;
    }
    
    // 点击下一页
    nextBtn.click();
    console.log('已点击下一页，等待2秒...');
    await sleep(2000);
    
    pageNum++;
    if (pageNum > 5) {
      console.log('达到最大页数限制，结束');
      break;
    }
  }
  
  console.log('\n=== 调试结束 ===');
}

debugExtraction();
