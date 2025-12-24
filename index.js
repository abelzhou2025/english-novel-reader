const axios = require('axios');
const cheerio = require('cheerio');
const TurndownService = require('turndown');
const fs = require('fs');
const path = require('path');

// 解析命令行参数
const args = process.argv.slice(2);
if (args.length === 0) {
    console.error('请提供要抓取的URL');
    console.log('用法: node index.js <URL>');
    process.exit(1);
}

const url = args[0];

// 初始化Turndown服务
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    emDelimiter: '*'
});

// 添加对表格的支持
turndownService.addRule('table', {
    filter: 'table',
    replacement: function(content) {
        return '\n' + content + '\n';
    }
});

// 抓取网页并转换为markdown
async function scrapeAndConvert(url) {
    try {
        console.log(`正在抓取: ${url}`);
        
        // 发送HTTP请求获取网页内容
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const html = response.data;
        const $ = cheerio.load(html);
        
        // 尝试提取页面标题
        const title = $('title').text().trim() || 'untitled';
        
        // 只移除绝对不需要的元素
        $('script, style, link').remove();
        
        // 提取主要内容
        let mainContent = '';
        
        // 1. 查找包含最多段落的元素
        let maxParagraphs = 0;
        let bestElement = null;
        
        $('div, article, section').each((index, element) => {
            const $element = $(element);
            const pCount = $element.find('p').length;
            const textLength = $element.text().trim().length;
            
            if (pCount > maxParagraphs && textLength > 1000) {
                maxParagraphs = pCount;
                bestElement = element;
            }
        });
        
        if (bestElement) {
            console.log(`找到包含 ${maxParagraphs} 个段落的内容元素`);
            
            // 2. 直接获取该元素的所有段落文本
            const paragraphs = $(bestElement).find('p');
            const extractedParagraphs = [];
            
            paragraphs.each((index, p) => {
                const text = $(p).text().trim();
                if (text.length > 50) { // 只保留有意义的段落
                    extractedParagraphs.push(text);
                }
            });
            
            if (extractedParagraphs.length > 0) {
                mainContent = extractedParagraphs.join('\n\n');
            } else {
                // 如果没有找到足够的段落，使用元素的纯文本
                mainContent = $(bestElement).text().trim();
            }
        } else {
            // 3. 如果找不到，使用body的纯文本
            mainContent = $('body').text().trim();
        }
        
        // 过滤促销信息和无关内容
        let filteredContent = mainContent;
        
        // 移除常见的促销关键词
        const promoKeywords = [
            'BLACK FRIDAY',
            'SALE ENDING',
            'JOIN 8,000+',
            'The Creator MBA',
            'The LinkedIn Operating System',
            'The Content Operating System'
        ];
        
        promoKeywords.forEach(keyword => {
            const regex = new RegExp(`.*${keyword}.*`, 'gi');
            filteredContent = filteredContent.replace(regex, '');
        });
        
        // 简单清理和格式化
        let cleanedContent = filteredContent
            .replace(/\n{3,}/g, '\n\n') // 最多保留2个连续空行
            .replace(/^\s+|\s+$/g, '') // 移除首尾空白
            .trim();
        
        // 生成文件名
        const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        const fileName = `${safeTitle}.md`;
        const filePath = path.join(__dirname, fileName);
        
        // 保存到本地
        fs.writeFileSync(filePath, `# ${title}\n\n${cleanedContent}`);
        console.log(`转换完成！文件已保存到: ${filePath}`);
        
    } catch (error) {
        console.error('发生错误:', error.message);
        if (error.response) {
            console.error('HTTP错误状态码:', error.response.status);
        }
        process.exit(1);
    }
}

// 执行程序
scrapeAndConvert(url);
