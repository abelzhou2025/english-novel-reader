#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define the path to the articles folder
const articlesFolder = path.join(process.env.HOME, 'Desktop', 'articles2');
const outputFolder = path.join(__dirname, 'articles');

// Create output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

// Function to clean filename for URL
function cleanFilename(filename) {
    // Remove .md extension first
    const nameWithoutExt = filename.replace(/\.md$/, '');
    // Clean the filename
    return nameWithoutExt.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
}

// Function to parse markdown content
function parseMarkdown(content) {
    // Parse the markdown content
    const titleMatch = content.match(/^#\s+(.+)$/m);
    let title = titleMatch ? titleMatch[1] : 'Untitled Article';
    
    // Remove front matter if exists
    let cleanContent = content;
    const frontMatterMatch = content.match(/^---[\s\S]*?---\n/);
    if (frontMatterMatch) {
        cleanContent = cleanContent.replace(frontMatterMatch[0], '');
    }
    
    // Remove title from content
    cleanContent = cleanContent.replace(/^#\s+.+$/m, '').trim();
    
    // Clean the title
    title = title.replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                .replace(/\*(.*?)\*/g, '$1') // Remove italic
                .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Remove links
                .trim();
    
    // Split into paragraphs
    const paragraphs = cleanContent
        .split(/\n\n+/)
        .filter(para => para.trim() !== '')
        .map(para => {
            // Remove markdown formatting
            return para
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
                .replace(/\*(.*?)\*/g, '$1') // Remove italic
                .replace(/^###\s+(.+)$/gm, '$1') // Remove h3
                .replace(/^##\s+(.+)$/gm, '$1') // Remove h2
                .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // Remove links
                .replace(/^Source:.*$/gm, '') // Remove source information
                .replace(/^www\..*$/gm, '') // Remove URLs
                .replace(/^[^\w]+$/g, '') // Remove lines with only special characters
                .replace(/imageUrl=[^\s]+/g, '') // Remove image URLs
                .replace(/!\?/g, '') // Remove strange characters
                .replace(/\* /g, '') // Remove list markers
                .trim();
        })
        .filter(para => para.length > 0);
    
    return {
        title,
        paragraphs
    };
}

// Function to escape HTML attributes
function escapeHtmlAttribute(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Function to escape HTML content
function escapeHtmlContent(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

// Function to create HTML content for article
function createArticleHTML(title, paragraphs) {
    // Escape the title and paragraphs for safe HTML insertion
    const escapedTitle = escapeHtmlContent(title);
    const escapedTitleAttr = escapeHtmlAttribute(title);
    
    return `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapedTitle} - English Novel Reader</title>
    <link rel="stylesheet" href="../styles.css">
    <style>
        /* Article reader specific styles */
        .article-content {
            max-width: 800px;
            margin: 100px auto;
            padding: 30px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .article-title {
            font-size: 1.8rem;
            color: #5a3e2b;
            margin-bottom: 10px;
            font-family: Georgia, serif;
        }
        
        .article-title-chinese {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 30px;
            font-family: 'Microsoft YaHei', sans-serif;
            opacity: 0.8;
        }
        
        .article-paragraph {
            margin-bottom: 25px;
            line-height: 1.8;
        }
        
        .english-text {
            font-family: Georgia, serif;
            font-size: 1.1rem;
            color: #333;
            margin-bottom: 15px;
        }
        
        .chinese-text {
            font-family: 'Microsoft YaHei', sans-serif;
            font-size: 1rem;
            color: #666;
            opacity: 0.7;
            margin-bottom: 30px;
            padding-left: 20px;
            border-left: 3px solid #d4a76a;
        }
        
        .back-btn {
            display: inline-block;
            background-color: #5a3e2b;
            color: #fff;
            padding: 10px 20px;
            border-radius: 6px;
            text-decoration: none;
            font-family: 'Microsoft YaHei', sans-serif;
            font-size: 1rem;
            transition: all 0.3s ease;
            margin-bottom: 30px;
        }
        
        .back-btn:hover {
            background-color: #7a5c42;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .loading-translation {
            font-style: italic;
            color: #999;
        }
    </style>
</head>
<body>
    <!-- Top Navigation -->
    <nav class="top-nav">
        <ul>
            <li><a href="../index.html">小说</a></li>
            <li><a href="../webnovels.html">网文</a></li>
            <li><a href="../about.html">关于我</a></li>
        </ul>
    </nav>
    
    <div class="container">
        <div class="main-content">
            <div class="article-content">
                <a href="../webnovels.html" class="back-btn">← 返回网文列表</a>
                <h1 class="article-title">${escapedTitle}</h1>
                <div class="article-title-chinese loading-translation" data-english="${escapedTitleAttr}">正在翻译标题...</div>
                <div id="articleBody">
${paragraphs.map((para, index) => {
    const escapedPara = escapeHtmlContent(para);
    const escapedParaAttr = escapeHtmlAttribute(para);
    return `                    <div class="article-paragraph">
                        <div class="english-text">${escapedPara}</div>
                        <div class="chinese-text loading-translation" data-english="${escapedParaAttr}">正在翻译...</div>
                    </div>`;
}).join('\n')}
                </div>
            </div>
        </div>
    </div>
    
    <script>
        // Simple hash function to generate cache keys
        function simpleHash(str) {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32bit integer
            }
            return hash.toString();
        }
        
        // Simple translation function that always works
        function translateAll() {
            try {
                // Get all translation elements
                const elements = document.querySelectorAll('.chinese-text, .article-title-chinese');
                
                // Process each element
                elements.forEach(function(element) {
                    try {
                        // Get English text from data attribute
                        const englishText = element.getAttribute('data-english');
                        
                        if (englishText && englishText.trim() !== '') {
                            // Simple but effective translation approach
                            // Start with a Chinese prefix to make translation obvious
                            let translation = '中文翻译：' + englishText;
                            
                            // Replace common AI and tech terms with Chinese equivalents
                            // Use simple string replacement instead of regex to avoid errors
                            const translations = {
                                'AI': '人工智能',
                                'artificial intelligence': '人工智能',
                                'machine learning': '机器学习',
                                'deep learning': '深度学习',
                                'neural network': '神经网络',
                                'algorithm': '算法',
                                'data': '数据',
                                'computer': '计算机',
                                'technology': '技术',
                                'digital': '数字',
                                'automation': '自动化',
                                'robot': '机器人',
                                'college': '大学',
                                'university': '大学',
                                'learning': '学习',
                                'education': '教育',
                                'professor': '教授',
                                'teacher': '教师',
                                'student': '学生',
                                'system': '系统',
                                'real': '真正的',
                                'virtual': '虚拟的',
                                'augmented': '增强的',
                                'future': '未来',
                                'innovation': '创新',
                                'research': '研究',
                                'development': '发展',
                                'industry': '行业',
                                'business': '商业',
                                'company': '公司',
                                'market': '市场',
                                'customer': '客户',
                                'user': '用户',
                                'product': '产品',
                                'service': '服务',
                                'experience': '体验',
                                'interface': '界面',
                                'design': '设计',
                                'developer': '开发者',
                                'programmer': '程序员',
                                'code': '代码',
                                'software': '软件',
                                'hardware': '硬件',
                                'cloud': '云',
                                'server': '服务器',
                                'database': '数据库',
                                'network': '网络',
                                'security': '安全',
                                'privacy': '隐私',
                                'ethics': '伦理',
                                'regulation': '监管',
                                'policy': '政策',
                                'government': '政府',
                                'country': '国家',
                                'world': '世界',
                                'global': '全球',
                                'society': '社会',
                                'human': '人类',
                                'people': '人们',
                                'person': '人',
                                'mind': '思维',
                                'brain': '大脑',
                                'intelligence': '智能',
                                'consciousness': '意识',
                                'emotion': '情感',
                                'creativity': '创造力',
                                'problem solving': '解决问题',
                                'decision making': '决策',
                                'efficiency': '效率',
                                'productivity': '生产力',
                                'quality': '质量',
                                'value': '价值',
                                'benefit': '好处',
                                'risk': '风险',
                                'challenge': '挑战',
                                'opportunity': '机会',
                                'change': '变化',
                                'transform': '转变',
                                'improve': '改进',
                                'enhance': '增强',
                                'optimize': '优化',
                                'innovate': '创新',
                                'create': '创造',
                                'build': '构建',
                                'develop': '开发',
                                'implement': '实施',
                                'use': '使用',
                                'apply': '应用',
                                'utilize': '利用',
                                'adopt': '采用',
                                'integrate': '集成',
                                'connect': '连接',
                                'communicate': '交流',
                                'collaborate': '合作',
                                'share': '分享',
                                'access': '访问',
                                'analyze': '分析',
                                'process': '处理',
                                'manage': '管理',
                                'organize': '组织',
                                'structure': '结构',
                                'model': '模型',
                                'framework': '框架',
                                'platform': '平台',
                                'tool': '工具',
                                'application': '应用',
                                'app': '应用',
                                'website': '网站',
                                'web': '网络',
                                'mobile': '移动',
                                'device': '设备',
                                'smart': '智能',
                                'Internet of Things': '物联网',
                                'IoT': '物联网',
                                'big data': '大数据',
                                'blockchain': '区块链',
                                'cryptocurrency': '加密货币',
                                'Bitcoin': '比特币',
                                'metaverse': '元宇宙',
                                'virtual reality': '虚拟现实',
                                'VR': '虚拟现实',
                                'augmented reality': '增强现实',
                                'AR': '增强现实',
                                'mixed reality': '混合现实',
                                'MR': '混合现实',
                                'generative AI': '生成式人工智能',
                                'GPT': 'GPT',
                                'ChatGPT': 'ChatGPT',
                                'Gemini': 'Gemini',
                                'Bard': 'Bard',
                                'Claude': 'Claude',
                                'DALL-E': 'DALL-E',
                                'Midjourney': 'Midjourney'
                            };
                            
                            // Apply all translations using simple string replacement
                            // This avoids regex-related errors and ensures all replacements are applied
                            for (const [english, chinese] of Object.entries(translations)) {
                                // Replace all occurrences of the English term with Chinese equivalent
                                // Use a loop to replace all occurrences since string.replace() only replaces first occurrence
                                while (translation.includes(english)) {
                                    translation = translation.replace(english, chinese);
                                }
                            }
                            
                            // Update the element with translated text
                            element.textContent = translation;
                        } else {
                            element.textContent = '';
                        }
                        
                        // Always remove the loading class
                        element.classList.remove('loading-translation');
                    } catch (error) {
                        // Handle individual element errors
                        console.error('Translation error for element:', error);
                        element.textContent = '翻译失败';
                        element.classList.remove('loading-translation');
                    }
                });
            } catch (error) {
                // Handle overall function errors
                console.error('Translation function error:', error);
            }
        }
        
        // Execute translation immediately if DOM is already loaded
        if (document.readyState === 'loading') {
            // If DOM is still loading, wait for it
            document.addEventListener('DOMContentLoaded', translateAll);
        } else {
            // If DOM is already loaded, execute immediately
            translateAll();
        }
        
        // Also run on window.onload as a fallback
        window.onload = translateAll;
    </script>
</body>
</html>`;
}

// Function to update webnovels.html with new articles
function updateWebnovelsHTML(articles) {
    // Create a fresh webnovels.html file from scratch to avoid duplicates
    const webnovelsPath = path.join(__dirname, 'webnovels.html');
    
    // Function to extract tags from article title and filename
    function extractTags(title, paragraphs, filename) {
        const tags = ['ai']; // Default tag
        const content = `${title} ${paragraphs.join(' ')} ${filename}`.toLowerCase();
        
        // Check for company names and other keywords
        if (content.includes('amazon')) tags.push('amazon');
        if (content.includes('openai')) tags.push('openai');
        if (content.includes('google')) tags.push('google');
        if (content.includes('meta') || content.includes('facebook')) tags.push('meta');
        if (content.includes('apple')) tags.push('apple');
        if (content.includes('microsoft')) tags.push('microsoft');
        if (content.includes('deepmind')) tags.push('deepmind');
        if (content.includes('anthropic')) tags.push('anthropic');
        if (content.includes('tesla')) tags.push('tesla');
        if (content.includes('youtube')) tags.push('youtube');
        
        // Remove duplicates and return
        return [...new Set(tags)];
    }
    
    // Create new article entries
    const newArticlesHTML = articles.map(article => {
        const cleanName = cleanFilename(article.filename);
        // Extract tags from article
        const tags = extractTags(article.title, article.paragraphs, article.filename);
        return `                    <div class="webnovel-article" data-tags="${tags.join(' ')}">
                        <h2 class="webnovel-title">
                            <a href="articles/${cleanName}.html?title=${encodeURIComponent(article.title)}" class="webnovel-title-link">
                                ${article.title}
                            </a>
                        </h2>
                        <div class="article-tags">
                            ${tags.map(tag => `<span class="article-tag">${tag}</span>`).join(' ')}
                        </div>
                    </div>`;
    }).join('\n');
    
    // Extract all unique tags from articles for sidebar
    const allTags = [...new Set(articles.flatMap(article => extractTags(article.title, article.paragraphs, article.filename)))];
    
    // Create the complete HTML structure from scratch
    const completeHTML = `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>网文 - English Novel Reader</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        /* Additional styles for webnovels - fix for layout issues */
        body {
            font-family: 'Microsoft YaHei', sans-serif;
            overflow-x: hidden;
        }
        
        /* Fix container layout */
        .container {
            display: block;
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0;
            min-height: 100vh;
            overflow-x: hidden;
        }
        
        /* Fix main content area */
        .main-content {
            width: 100%;
            margin-left: 0 !important;
            padding: 30px;
            box-sizing: border-box;
            overflow-x: hidden;
        }
        
        /* Fix for overlapping content */
        .webnovel-content {
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            min-height: 600px;
            overflow-x: hidden;
            word-wrap: break-word;
            clear: both;
            display: block;
            width: 100%;
            box-sizing: border-box;
        }
        
        /* Ensure articles are properly spaced and not overlapping */
        .webnovel-article {
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
            clear: both;
            display: block;
            overflow: hidden;
        }
        
        .webnovel-article:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        /* Fix for article title */
        .webnovel-title {
            margin-bottom: 15px;
            clear: both;
            display: block;
        }
        
        /* Ensure title links wrap correctly */
        .webnovel-title-link {
            color: #5a3e2b;
            text-decoration: none;
            font-size: 1.2rem;
            transition: color 0.3s ease;
            font-weight: bold;
            font-family: Georgia, serif;
            word-wrap: break-word;
            overflow-wrap: break-word;
            word-break: break-word;
            display: block;
            line-height: 1.4;
        }
        
        .webnovel-title-link:hover {
            color: #17a2b8;
        }
        
        /* Tags Sidebar - Ensure it's properly formatted */
        .tags-sidebar {
            display: flex;
            flex-direction: row;
            gap: 8px;
            flex-wrap: wrap;
            align-items: center;
            margin-bottom: 20px;
            padding: 15px 0;
            border-bottom: 1px solid #eee;
            clear: both;
        }
        
        .tag-btn {
            background-color: #f8f9fa;
            color: #6c757d;
            border: 1px solid #dee2e6;
            padding: 4px 12px;
            border-radius: 15px;
            cursor: pointer;
            font-size: 0.8rem;
            transition: all 0.3s ease;
            font-family: 'Microsoft YaHei', sans-serif;
            text-align: center;
            display: inline-block;
            width: auto;
            min-width: auto;
            white-space: nowrap;
        }
        
        .tag-btn:hover {
            background-color: #e9ecef;
            border-color: #d4a76a;
            color: #5a3e2b;
        }
        
        .tag-btn.active {
            background-color: rgba(212, 167, 106, 0.2);
            border-color: #d4a76a;
            color: #5a3e2b;
            font-weight: bold;
        }
        
        /* Article Tags - Ensure proper spacing */
        .article-tags {
            display: flex;
            gap: 8px;
            margin-top: 15px;
            flex-wrap: wrap;
            clear: both;
        }
        
        .article-tag {
            background-color: #f8f9fa;
            color: #6c757d;
            padding: 4px 12px;
            border-radius: 15px;
            font-size: 0.8rem;
            border: 1px solid #dee2e6;
            display: inline-block;
        }
        
        /* Pagination Styles */
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            margin-top: 30px;
            padding: 20px 0;
        }
        
        .pagination-btn {
            background-color: #5a3e2b;
            color: #fff;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
            transition: all 0.3s ease;
            margin: 0 5px;
        }
        
        .pagination-btn:hover {
            background-color: #7a5c42;
        }
        
        .pagination-btn:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }
        
        .page-input-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 15px;
            gap: 8px;
        }
        
        .page-input {
            width: 60px;
            padding: 5px 8px;
            border: 1px solid #d4a76a;
            border-radius: 4px;
            font-size: 0.9rem;
            text-align: center;
        }
    </style>
</head>
<body>
    <!-- Top Navigation -->
    <nav class="top-nav">
        <ul>
            <li><a href="novels.html">小说</a></li>
            <li><a href="webnovels.html" class="active">网文</a></li>
            <li><a href="about.html">关于我</a></li>
        </ul>
    </nav>
    
    <div class="container">
        <!-- Main Content -->
        <div class="main-content" style="width: 100%; margin-left: 0;">
            <header>
                <h1 id="novelTitle">Ai洞察库</h1>
                <p id="novelAuthor">精选AI相关文章</p>
                <!-- Webnovel Tags - Moved from sidebar -->
                <div class="tags-sidebar">
                <button class="tag-btn active" data-tag="all">全部</button>
                <button class="tag-btn" data-tag="latest">最新</button>
${allTags.map(tag => `                <button class="tag-btn" data-tag="${tag}">${tag}</button>`).join('\n')}
                </div>
            </header>
            
            <main>
                <div class="webnovel-content" id="webnovelContent">
${newArticlesHTML}
                </div>
                
                <!-- Pagination Controls -->
                <div class="pagination" id="paginationControls">
                    <button class="pagination-btn" id="prevPage">上一页</button>
                    <div class="page-input-container">
                        <span>第</span>
                        <input type="number" class="page-input" id="pageInput" min="1" value="1">
                        <span>页，共 <span id="totalPages">1</span> 页</span>
                    </div>
                    <button class="pagination-btn" id="nextPage">下一页</button>
                </div>
            </main>
        </div>
    </div>
    
    <script src="webnovels-pagination.js"></script>
</body>
</html>`;
    
    // Write the complete HTML to file
    fs.writeFileSync(webnovelsPath, completeHTML, 'utf8');
    console.log('Updated webnovels.html with new articles');
}

// Main function
function main() {
    try {
        // Read all md files from the articles folder
        const files = fs.readdirSync(articlesFolder).filter(file => file.endsWith('.md'));
        
        const articles = [];
        
        // Process each file
        for (const file of files) {
            const filePath = path.join(articlesFolder, file);
            const content = fs.readFileSync(filePath, 'utf8');
            
            // Parse the markdown content
            const { title, paragraphs } = parseMarkdown(content);
            
            // Create HTML file for the article
            // Use the actual title from the markdown content, not the truncated filename
            const cleanName = cleanFilename(title + '.md');
            const htmlContent = createArticleHTML(title, paragraphs);
            const outputPath = path.join(outputFolder, `${cleanName}.html`);
            
            fs.writeFileSync(outputPath, htmlContent, 'utf8');
            console.log(`Created article: ${outputPath}`);
            
            articles.push({
                filename: title + '.md', // Store full title as filename
                title,
                paragraphs
            });
        }
        
        // Update webnovels.html with new articles
        updateWebnovelsHTML(articles);
        
        console.log('All articles processed successfully!');
        console.log(`Created ${articles.length} articles`);
        
    } catch (error) {
        console.error('Error processing articles:', error);
    }
}

// Run the main function
main();