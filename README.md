# 备案域名提取器

浏览器插件，从工信部备案网站一键提取备案域名。

## 功能

- 点击详情按钮，自动提取备案域名（支持标准域名和IP地址）
- 支持当前页提取和自动翻页提取所有域名
- 结果去重，导出为文本或JSON

## 安装

1. 打开 `chrome://extensions/` 或 `edge://extensions/`
2. 开启「开发者模式」
3. 点击「加载已解压的扩展程序」
4. 选择 `beian-extractor-plugin` 文件夹

## 使用

1. 访问 https://beian.miit.gov.cn 搜索企业名称
2. 等待结果加载完成
3. 点击插件图标
4. 选择「提取当前页域名」或「提取所有页域名」
5. 复制或保存结果

## 输出格式

**文本**（每行一个域名）:
```
nankai.edu.cn
cmips.org.cn
60.29.219.201
```

**JSON**:
```json
["nankai.edu.cn", "cmips.org.cn", "60.29.219.201"]
```

## 结构

```
├── README.md
└── beian-extractor-plugin/
    ├── manifest.json
    ├── content.js
    ├── popup.html
    └── popup.js
```

## 注意

- 仅供学习研究使用
- 请遵守工信部网站使用条款
- 不要高频大量使用

## License

MIT
