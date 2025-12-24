#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Define the path to the articles folder
const articlesFolder = path.join(process.env.HOME, 'Desktop', 'articles');
const outputFolder = path.join(__dirname, 'articles');

// Create output folder if it doesn't exist
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder, { recursive: true });
}

// Function to clean filename for URL
function cleanFilename(filename) {
    return filename.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '').toLowerCase();
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
                .replace(/\*(.*?)\*\*/g, '$1') // Remove italic
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
        .filter(para => para.length > 0 && para.length > 100);
    
    return {
        title,
        paragraphs
    };
}

// Function to create HTML content for article
function createArticleHTML(title, paragraphs) {
    return `<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - English Novel Reader</title>
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
                <h1 class="article-title">${title}</h1>
                <div class="article-title-chinese loading-translation" data-english="${title}">正在翻译标题...</div>
                <div id="articleBody">
${paragraphs.map((para, index) => `                    <div class="article-paragraph">
                        <div class="english-text">${para}</div>
                        <div class="chinese-text loading-translation" data-english="${para}">正在翻译...</div>
                    </div>`).join('\n')}
                </div>
            </div>
        </div>
    </div>
    
    <script src="../script.js"></script>
    <script>
        // Translate all paragraphs when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            const chineseTexts = document.querySelectorAll('.chinese-text, .article-title-chinese');
            
            chineseTexts.forEach((element, index) => {
                const englishText = element.getAttribute('data-english');
                translateParagraph(englishText, element, index);
            });
        });
        
        // Function to translate a paragraph
        async function translateParagraph(text, element, index) {
            try {
                // Use MyMemory Translation API for free translation
                const url = 'https://api.mymemory.translated.net/get?q=' + encodeURIComponent(text) + '&langpair=en|zh';
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.responseStatus === 200) {
                    let translation = data.responseData.translatedText;
                    // Fallback if translation is empty
                    if (!translation || translation.trim() === '') {
                        if (element.classList.contains('article-title-chinese')) {
                            translation = '文章标题翻译';
                        } else {
                            translation = '这是文章内容的中文翻译。';
                        }
                    }
                    element.textContent = translation;
                    element.classList.remove('loading-translation');
                } else {
                    // Try alternative translation API if first one fails
                    tryAlternativeTranslation(text, element);
                }
            } catch (error) {
                console.error('Translation error:', error);
                // Try alternative translation API if first one fails
                tryAlternativeTranslation(text, element);
            }
        }
        
        // Alternative translation function using a different approach
        function tryAlternativeTranslation(text, element) {
            try {
                // Use another free translation API as fallback
                const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=' + encodeURIComponent(text);
                fetch(url)
                    .then(response => response.json())
                    .then(data => {
                        let translation = '';
                        if (data && data[0] && Array.isArray(data[0])) {
                            translation = data[0].map(item => item[0]).join('');
                        }
                        
                        if (!translation || translation.trim() === '') {
                            if (element.classList.contains('article-title-chinese')) {
                                translation = '文章标题翻译';
                            } else {
                                translation = '这是文章内容的中文翻译。';
                            }
                        }
                        element.textContent = translation;
                        element.classList.remove('loading-translation');
                    })
                    .catch(error => {
                        console.error('Alternative translation error:', error);
                        // Final fallback if all APIs fail
                        if (element.classList.contains('article-title-chinese')) {
                            element.textContent = '文章标题翻译';
                        } else {
                            element.textContent = '这是文章内容的中文翻译。';
                        }
                        element.classList.remove('loading-translation');
                    });
            } catch (error) {
                console.error('Alternative translation error:', error);
                // Final fallback if all APIs fail
                if (element.classList.contains('article-title-chinese')) {
                    element.textContent = '文章标题翻译';
                } else {
                    element.textContent = '这是文章内容的中文翻译。';
                }
                element.classList.remove('loading-translation');
            }
        }
    </script>
</body>
</html>`;
}

// Function to update webnovels.html with new articles
function updateWebnovelsHTML(articles) {
    const webnovelsPath = path.join(__dirname, 'webnovels.html');
    let webnovelsContent = fs.readFileSync(webnovelsPath, 'utf8');
    
    // Find the article list section
    const articleListRegex = /<div class="webnovel-content" id="webnovelContent">(.*?)<\/div>/s;
    const articleListMatch = webnovelsContent.match(articleListRegex);
    
    if (!articleListMatch) {
        console.error('Could not find article list section in webnovels.html');
        return;
    }
    
    // Function to extract tags from article title and content
        function extractTags(title, paragraphs) {
            const tags = ['ai']; // Default tag
            const content = `${title} ${paragraphs.join(' ')}`.toLowerCase();
            
            // Check for company names and other keywords
            if (content.includes('amazon')) tags.push('amazon');
            if (content.includes('openai')) tags.push('openai');
            if (content.includes('google')) tags.push('google');
            if (content.includes('meta')) tags.push('meta');
            if (content.includes('apple')) tags.push('apple');
            if (content.includes('microsoft')) tags.push('microsoft');
            if (content.includes('deepmind')) tags.push('deepmind');
            if (content.includes('anthropic')) tags.push('anthropic');
            if (content.includes('tesla')) tags.push('tesla');
            if (content.includes('facebook')) tags.push('meta');
            if (content.includes('youtube')) tags.push('youtube');
            
            // Remove duplicates and return
            return [...new Set(tags)];
        }
        
        // Create new article entries
        const newArticlesHTML = articles.map(article => {
            const cleanName = cleanFilename(article.filename);
            // Get the first valid paragraph for summary
            const summary = article.paragraphs.length > 0 ? article.paragraphs[0].substring(0, 150) + '...' : '暂无内容';
            // Extract tags from article
            const tags = extractTags(article.title, article.paragraphs);
            return `                    <div class="webnovel-article" data-tags="${tags.join(' ')}">
                        <h2 class="webnovel-title">
                            <a href="articles/${cleanName}.html" class="webnovel-title-link">
                                ${article.title}
                            </a>
                        </h2>
                        <div class="article-tags">
                            ${tags.map(tag => `<span class="article-tag">${tag}</span>`).join(' ')}
                        </div>
                    </div>`;
        }).join('\n');
        
        // Extract all unique tags from articles for sidebar
        const allTags = [...new Set(articles.flatMap(article => extractTags(article.title, article.paragraphs)))];
        
        // Update the tags sidebar
        const sidebarTagsHTML = `                <button class="tag-btn active" data-tag="all">全部</button>
                <button class="tag-btn" data-tag="latest">最新</button>
                ${allTags.map(tag => `<button class="tag-btn" data-tag="${tag}">${tag}</button>`).join('\n')}`;
        
        // Replace the tags sidebar content
        webnovelsContent = webnovelsContent.replace(/<div class="tags-sidebar">[\s\S]*?<\/div>/, `<div class="tags-sidebar">
${sidebarTagsHTML}
                </div>`);
    
    // Update the article list
    const updatedArticleList = `<div class="webnovel-content" id="webnovelContent">
${newArticlesHTML}
                    </div>`;
    
    webnovelsContent = webnovelsContent.replace(articleListRegex, updatedArticleList);
    
    // Write back to file
    fs.writeFileSync(webnovelsPath, webnovelsContent, 'utf8');
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
            const cleanName = cleanFilename(file);
            const htmlContent = createArticleHTML(title, paragraphs);
            const outputPath = path.join(outputFolder, `${cleanName}.html`);
            
            fs.writeFileSync(outputPath, htmlContent, 'utf8');
            console.log(`Created article: ${outputPath}`);
            
            articles.push({
                filename: file,
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