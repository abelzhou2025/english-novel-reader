const axios = require('axios');
const cheerio = require('cheerio');

const url = 'https://www.justinwelsh.me/article/the-relentless-pursuit-of-more';

async function findContent() {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });
        
        const html = response.data;
        const $ = cheerio.load(html);
        
        console.log('=== 查找文章内容 ===\n');
        
        // 1. 查找包含文章标题的元素
        const title = 'The Relentless Pursuit of More';
        console.log(`1. 查找包含标题 "${title}" 的元素:`);
        
        let titleElement = null;
        $('h1, h2, h3').each((index, element) => {
            if ($(element).text().includes(title)) {
                titleElement = element;
                console.log(`   找到标题元素: ${element.tagName}，类名: "${element.className}"`);
                
                // 查看父元素
                let parent = element.parentElement;
                for (let i = 0; i < 5 && parent; i++) {
                    console.log(`   父元素 ${i+1}: ${parent.tagName}，类名: "${parent.className}"，ID: "${parent.id}"`);
                    parent = parent.parentElement;
                }
            }
        });
        
        console.log('\n2. 查找包含最多段落的元素:');
        let maxParagraphs = 0;
        let bestElement = null;
        
        $('div, article, section').each((index, element) => {
            const $element = $(element);
            const pCount = $element.find('p').length;
            const textLength = $element.text().trim().length;
            
            if (pCount > maxParagraphs) {
                maxParagraphs = pCount;
                bestElement = element;
            }
        });
        
        if (bestElement) {
            console.log(`   找到最佳元素: ${bestElement.tagName}`);
            console.log(`   类名: "${bestElement.className}"`);
            console.log(`   ID: "${bestElement.id}"`);
            console.log(`   段落数: ${maxParagraphs}`);
            
            // 显示前几个段落内容
            const paragraphs = $(bestElement).find('p');
            console.log('\n   前3个段落内容:');
            for (let i = 0; i < Math.min(3, paragraphs.length); i++) {
                console.log(`   ${i+1}. ${$(paragraphs[i]).text().substring(0, 100)}...`);
            }
        }
        
        console.log('\n3. 查看页面所有section元素:');
        $('section').each((index, section) => {
            const $section = $(section);
            const pCount = $section.find('p').length;
            const textLength = $section.text().trim().length;
            
            if (pCount > 5 || textLength > 1000) {
                console.log(`   Section ${index}: 类名="${section.className}", 段落数=${pCount}, 文本长度=${textLength}`);
            }
        });
        
    } catch (error) {
        console.error('错误:', error.message);
    }
}

findContent();
