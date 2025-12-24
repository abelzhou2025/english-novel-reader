const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.justinwelsh.me/article/the-relentless-pursuit-of-more';

async function analyzePage() {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const html = response.data;
        const $ = cheerio.load(html);
        
        console.log('=== 页面结构分析 ===\n');
        
        // 1. 查找所有包含大量段落的元素
        console.log('1. 包含段落数量最多的元素:');
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
            const $best = $(bestElement);
            console.log(`   元素: ${bestElement.tagName}`);
            console.log(`   类名: ${bestElement.className}`);
            console.log(`   ID: ${bestElement.id}`);
            console.log(`   段落数: ${maxParagraphs}`);
            console.log(`   文本长度: ${$best.text().trim().length}`);
            console.log(`   HTML: ${$best.html().substring(0, 200)}...`);
        }
        
        console.log('\n2. 所有可能的内容容器:');
        const contentSelectors = [
            'article',
            '.main-content',
            '.content',
            '#main',
            '.post',
            '.entry-content',
            '.article-content',
            '.blog-post',
            '.post-content',
            '.story-content',
            '.content-area',
            '.single-post-content'
        ];
        
        for (const selector of contentSelectors) {
            const elements = $(selector);
            if (elements.length > 0) {
                elements.each((index, element) => {
                    const $element = $(element);
                    const textLength = $element.text().trim().length;
                    if (textLength > 500) {
                        console.log(`   ${selector}: ${textLength} 字符`);
                    }
                });
            }
        }
        
        console.log('\n3. 页面主要section元素:');
        $('section').each((index, section) => {
            const $section = $(section);
            const textLength = $section.text().trim().length;
            const classNames = section.className;
            if (textLength > 1000) {
                console.log(`   索引 ${index}: 类名="${classNames}", ${textLength} 字符`);
                console.log(`   HTML: ${$section.html().substring(0, 200)}...`);
            }
        });
        
    } catch (error) {
        console.error('分析错误:', error.message);
    }
}

analyzePage();
