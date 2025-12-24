# English Novel Reader - 网站更新维护指南

## 目录

1. [添加新小说](#添加新小说)
2. [更新现有小说内容](#更新现有小说内容)
3. [修改翻译API配置](#修改翻译API配置)
4. [调整网站样式](#调整网站样式)
5. [手动触发GitHub Actions](#手动触发github-actions)
6. [管理RSS订阅](#管理rss订阅)
7. [常见问题和解决方案](#常见问题和解决方案)
8. [网站结构说明](#网站结构说明)

## 添加新小说

### 步骤1：准备小说内容
- 准备小说的英文文本，按段落划分
- 确保文本格式正确，无特殊字符

### 步骤2：修改script.js文件
1. 打开`script.js`文件
2. 找到`novels`对象
3. 添加新的小说条目，格式如下：
   ```javascript
   novel_id: {
       title: 'Novel Title',
       author: 'Author Name',
       content: [
           'First paragraph of the novel.',
           'Second paragraph of the novel.',
           // 添加更多段落...
       ]
   },
   ```
4. 保存文件

### 步骤3：更新HTML中的小说列表
1. 打开`index.html`文件
2. 找到`novelList` div
3. 添加新的小说列表项，格式如下：
   ```html
   <div class="novel-item" data-novel="novel_id">
       <h3>Novel Title</h3>
       <p>Author Name</p>
   </div>
   ```
4. 保存文件

### 步骤4：提交更改
```bash
git add index.html script.js
git commit -m "Add new novel: Novel Title"
git push origin main
```

## 更新现有小说内容

### 方法1：手动更新
1. 打开`script.js`文件
2. 找到要更新的小说条目
3. 修改`content`数组中的内容
4. 保存文件
5. 提交更改

### 方法2：使用GitHub Actions自动更新
- GitHub Actions会每天自动运行，向Jane Eyre添加新段落
- 您可以自定义`generate-content.js`脚本，从其他来源获取新内容
- 修改`.github/workflows/daily-update.yml`文件中的cron表达式，调整更新频率

## 修改翻译API配置

### 步骤1：打开script.js文件
1. 找到`API_CONFIG`对象
2. 修改配置参数：
   ```javascript
   const API_CONFIG = {
       url: 'https://your-translation-api-url.com/translate',
       params: {
           // API特定参数
       }
   };
   ```

### 步骤2：更新翻译函数
- 如果您使用的API返回格式不同，需要修改`translateText`函数
- 调整API请求和响应处理逻辑

### 步骤3：更新mock翻译
- 在`getMockTranslation`函数中添加常用句子的翻译
- 确保翻译质量和准确性

## 调整网站样式

### 修改CSS样式
1. 打开`styles.css`文件
2. 根据需要修改样式规则：
   - 调整颜色方案
   - 修改字体大小和行间距
   - 调整侧边栏宽度
   - 修改响应式设计断点
3. 保存文件
4. 提交更改

### 添加新样式
- 在CSS文件中添加新的样式规则
- 确保样式名称唯一，避免冲突
- 测试不同设备上的显示效果

## 手动触发GitHub Actions

### 步骤1：进入GitHub仓库
1. 登录GitHub
2. 进入您的仓库页面
3. 点击"Actions"选项卡

### 步骤2：手动触发工作流
1. 找到"Daily Novel Update"工作流
2. 点击"Run workflow"按钮
3. 可选：输入手动更新的原因
4. 点击"Run workflow"确认

### 步骤3：查看运行结果
- 点击工作流运行记录
- 查看详细日志
- 确认更新成功

## 管理RSS订阅

### 查看RSS Feed
- RSS Feed URL: `https://your-username.github.io/english-novel-reader/rss.xml`
- 用户可以将此URL添加到任何RSS阅读器

### 自定义RSS Feed
1. 打开`rss-generator.js`文件
2. 修改以下配置：
   - `baseUrl`：您的GitHub Pages URL
   - 标题和描述
   - 语言设置
3. 保存文件
4. 提交更改

## 常见问题和解决方案

### 问题1：翻译功能不工作
**解决方案：**
- 检查翻译API配置是否正确
- 确保API密钥有效（如果使用需要密钥的API）
- 检查浏览器控制台是否有错误信息
- 尝试切换到其他翻译API

### 问题2：GitHub Actions更新失败
**解决方案：**
- 检查工作流日志，查找错误信息
- 确保仓库有足够的权限
- 检查脚本语法是否正确
- 尝试手动运行脚本，排查问题

### 问题3：小说内容显示不正确
**解决方案：**
- 检查`script.js`中的小说格式是否正确
- 确保所有引号和括号都正确闭合
- 检查HTML中的小说列表项是否与`script.js`中的`novel_id`匹配

### 问题4：RSS Feed不更新
**解决方案：**
- 检查`rss-generator.js`是否被正确调用
- 确保`script.js`中的小说数据格式正确
- 尝试手动运行`node rss-generator.js`

## 网站结构说明

### 核心文件
- `index.html`：网站主页，包含HTML结构
- `styles.css`：网站样式，定义外观和布局
- `script.js`：网站功能，包括小说数据和交互逻辑
- `rss-generator.js`：生成RSS Feed
- `.github/workflows/daily-update.yml`：GitHub Actions工作流配置

### 网站功能
1. **小说切换**：通过侧边栏选择不同小说
2. **点击翻译**：点击任意文本，弹出翻译结果
3. **选中文本翻译**：支持手动选择文本进行翻译
4. **响应式设计**：适配不同设备
5. **自动更新**：GitHub Actions每日自动添加新内容
6. **RSS订阅**：支持通过RSS阅读器获取更新

### 技术栈
- **HTML5**：网站结构
- **CSS3**：网站样式和布局
- **JavaScript (ES6+)**：网站交互和功能
- **GitHub Actions**：自动化更新
- **GitHub Pages**：网站部署

## 后续扩展建议

1. **添加夜间模式**：支持明暗主题切换
2. **实现章节导航**：支持长篇小说的章节管理
3. **添加单词释义**：点击单词显示详细释义
4. **支持更多翻译语言**：增加多语言翻译选项
5. **添加阅读进度保存**：记住用户的阅读位置
6. **实现评论功能**：允许用户添加评论和笔记

## 联系信息

如果您在维护过程中遇到问题，可以：
- 查看GitHub仓库的Issues页面
- 检查浏览器控制台的错误信息
- 参考相关技术文档

---

**更新日期**：2024-12-23
**版本**：1.0.0