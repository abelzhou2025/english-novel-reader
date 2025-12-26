#!/usr/bin/env python3
"""
Fetch news content from links and update news page
"""
import requests
from bs4 import BeautifulSoup
import time
import re

def clean_text(text):
    """Clean and format text"""
    # Remove extra whitespace
    text = ' '.join(text.split())
    return text

def extract_article_content(url):
    """Extract article content from URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Remove script and style elements
        for script in soup(["script", "style", "nav", "header", "footer", "aside"]):
            script.decompose()
        
        # Try to find the main content
        article_body = None
        
        # Common selectors for article content
        selectors = [
            'article',
            '[role="main"]',
            '.article-body',
            '.post-content',
            '.entry-content',
            '.content',
            'main',
            '.main-content',
            '#content'
        ]
        
        for selector in selectors:
            article_body = soup.select_one(selector)
            if article_body:
                break
        
        if not article_body:
            # If no specific article element found, try paragraph tags
            paragraphs = soup.find_all('p')
            article_body = BeautifulSoup('', 'html.parser').new_tag('div')
            for p in paragraphs[:10]:  # Take first 10 paragraphs
                article_body.append(p)
        
        # Extract text from the content
        paragraphs = article_body.find_all('p') if article_body else []
        content = []
        
        for p in paragraphs:
            text = clean_text(p.get_text())
            if len(text) > 20:  # Only add substantial paragraphs
                content.append(text)
        
        full_content = ' '.join(content[:5])  # Take first 5 paragraphs
        
        # Extract title
        title_tag = soup.find('title')
        title = clean_text(title_tag.get_text()) if title_tag else url.split('/')[-1].replace('-', ' ')
        
        # Extract date if available
        date = extract_date_from_url(url)
        
        return {
            'title': title,
            'content': full_content,
            'url': url,
            'date': date
        }
    
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def extract_date_from_url(url):
    """Extract date from URL if available"""
    # Look for date patterns in URL (YYYY/MM/DD or YYYY-MM-DD)
    date_match = re.search(r'(\d{4})[/-](\d{1,2})[/-](\d{1,2})', url)
    if date_match:
        year, month, day = date_match.groups()
        return f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    return "2025-12-26"  # Default date

def create_news_page(news_items):
    """Create news page with fetched content"""
    
    html_template = """<!DOCTYPE html>
<html lang="zh">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI新闻 - English Novel Reader</title>
    <link rel="stylesheet" href="styles.css">
    <style>
        body {{
            font-family: 'Microsoft YaHei', sans-serif;
            background-color: #f8f4e9;
            margin: 0;
            padding: 0;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }}
        
        .news-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }}
        
        .news-card {{
            background: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
            cursor: pointer;
        }}
        
        .news-card:hover {{
            transform: translateY(-5px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        }}
        
        .news-title {{
            font-size: 1.1rem;
            font-weight: bold;
            color: #5a3e2b;
            margin: 0 0 10px 0;
            line-height: 1.4;
        }}
        
        .news-source {{
            font-size: 0.8rem;
            color: #888;
            margin: 5px 0;
        }}
        
        .news-description {{
            font-size: 0.9rem;
            color: #666;
            margin: 10px 0;
            line-height: 1.4;
        }}
        
        .news-date {{
            font-size: 0.7rem;
            color: #aaa;
            margin-top: 10px;
        }}
        
        /* 阅读器样式 */
        .reader-container {{
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: white;
            z-index: 1000;
            flex-direction: column;
        }}
        
        .reader-header {{
            padding: 15px;
            background: #5a3e2b;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        
        .reader-controls {{
            display: flex;
            gap: 10px;
        }}
        
        .reader-btn {{
            background: #d4a76a;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 4px;
            cursor: pointer;
        }}
        
        .reader-content {{
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            font-family: 'Georgia', serif;
            font-size: 1.1rem;
            line-height: 1.8;
            max-width: 800px;
            margin: 0 auto;
            width: 100%;
        }}
        
        /* 翻译提示框 */
        .translation-tooltip {{
            position: absolute;
            background: #333;
            color: white;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 1001;
            display: none;
            max-width: 300px;
            word-wrap: break-word;
            font-family: 'Microsoft YaHei', sans-serif;
        }}
        
        .translation-tooltip::after {{
            content: '';
            position: absolute;
            top: 100%;
            left: 50%;
            margin-left: -5px;
            border: 5px solid transparent;
            border-top-color: #333;
        }}
    </style>
</head>
<body>
    <!-- Top Navigation -->
    <nav class="top-nav">
        <ul>
            <li><a href="index.html">首页</a></li>
            <li><a href="novels.html">小说</a></li>
            <li><a href="webnovels.html">网文</a></li>
            <li><a href="news.html" class="active">新闻</a></li>
            <li><a href="about.html">关于我</a></li>
        </ul>
    </nav>
    
    <div class="container">
        <h1>AI新闻精选</h1>
        <p>人工挑选的AI相关新闻，点击标题阅读完整内容</p>
        
        <div class="news-grid" id="newsGrid">
            {news_cards}
        </div>
    </div>
    
    <!-- 阅读器 -->
    <div class="reader-container" id="readerContainer">
        <div class="reader-header">
            <div class="reader-controls">
                <button class="reader-btn" onclick="closeReader()">← 返回</button>
            </div>
            <div id="readerTitle">新闻阅读器</div>
            <button class="reader-btn" onclick="toggleTranslation()">翻译: 关</button>
        </div>
        <div class="reader-content" id="readerContent">
            <!-- 新闻内容将在这里显示 -->
        </div>
    </div>
    
    <!-- 翻译提示框 -->
    <div class="translation-tooltip" id="translationTooltip"></div>
    
    <script>
        // 新闻数据
        const newsData = {news_json};

        let isTranslationEnabled = false;
        let selectedText = '';

        // 渲染新闻卡片
        function renderNews() {{
            const newsGrid = document.getElementById('newsGrid');
            newsGrid.innerHTML = '';
            
            newsData.forEach((news, index) => {{
                const card = document.createElement('div');
                card.className = 'news-card';
                card.onclick = () => openReader(news);
                
                // 简单的英文到中文翻译（实际应用中应使用翻译API）
                const titleCN = translateToChinese(news.title);
                const descriptionCN = translateToChinese(news.content.substring(0, 100) + '...');
                
                card.innerHTML = `
                    <div class="news-title">${{news.title}}<br><small style="color: #d4a76a;">${{titleCN}}</small></div>
                    <div class="news-source">${{news.source || 'AI News'}}</div>
                    <div class="news-description">${{news.content.substring(0, 100)}}...<br><small style="color: #d4a76a;">${{descriptionCN}}</small></div>
                    <div class="news-date">${{news.date}}</div>
                `;
                
                newsGrid.appendChild(card);
            }});
        }}

        // 简单的英文到中文翻译（示例）
        function translateToChinese(text) {{
            // 这里应该使用翻译API，现在使用简单的映射作为示例
            const simpleTranslations = {{
                'AI': '人工智能',
                'artificial intelligence': '人工智能',
                'machine learning': '机器学习',
                'neural network': '神经网络',
                'algorithm': '算法',
                'data': '数据',
                'model': '模型',
                'training': '训练',
                'prediction': '预测',
                'analysis': '分析',
                'technology': '技术',
                'system': '系统',
                'computer': '计算机',
                'software': '软件',
                'hardware': '硬件',
                'internet': '互联网',
                'network': '网络',
                'security': '安全',
                'privacy': '隐私',
                'chatbot': '聊天机器人',
                'slop': '垃圾内容',
                'elon musk': '埃隆·马斯克',
                'nvidia': '英伟达',
                'ai chip': 'AI芯片',
                'education': '教育',
                'google': '谷歌',
                'news': '新闻',
                'recap': '回顾'
            }};
            
            let result = text;
            for (const [eng, chn] of Object.entries(simpleTranslations)) {{
                const regex = new RegExp(eng, 'gi');
                result = result.replace(regex, chn);
            }}
            
            return result || '翻译中...';
        }}

        // 打开阅读器
        function openReader(news) {{
            const readerContainer = document.getElementById('readerContainer');
            const readerContent = document.getElementById('readerContent');
            const readerTitle = document.getElementById('readerTitle');
            
            readerTitle.textContent = news.title;
            readerContent.innerHTML = `<h2>${{news.title}}</h2><p><em>{{news.source || 'AI News'}} • {{news.date}}</em></p><p>{{news.content.replace(/\\n\\n/g, '</p><p>')}}</p><p><a href="{{news.url}}" target="_blank" style="color: #d4a76a; text-decoration: none;">阅读原文 →</a></p>`;
            
            readerContainer.style.display = 'flex';
            
            // 添加文本选择监听器
            addTextSelectionListener();
        }}

        // 关闭阅读器
        function closeReader() {{
            document.getElementById('readerContainer').style.display = 'none';
        }}

        // 切换翻译功能
        function toggleTranslation() {{
            isTranslationEnabled = !isTranslationEnabled;
            const btn = document.querySelector('.reader-btn:nth-child(2)');
            btn.textContent = `翻译: ${{isTranslationEnabled ? '开' : '关'}}`;
            
            if (!isTranslationEnabled) {{
                document.getElementById('translationTooltip').style.display = 'none';
            }}
        }}

        // 添加文本选择监听器
        function addTextSelectionListener() {{
            const content = document.getElementById('readerContent');
            
            content.addEventListener('mouseup', function() {{
                const selection = window.getSelection();
                selectedText = selection.toString().trim();
                
                if (selectedText && selectedText.length > 0 && selectedText.length < 50 && isTranslationEnabled) {{
                    const range = selection.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    
                    showTranslationTooltip(rect, selectedText);
                }}
            }});
            
            // 点击空白处隐藏翻译提示
            content.addEventListener('click', function(e) {{
                if (e.target === content) {{
                    document.getElementById('translationTooltip').style.display = 'none';
                }}
            }});
        }}

        // 显示翻译提示框
        function showTranslationTooltip(rect, text) {{
            const tooltip = document.getElementById('translationTooltip');
            const translation = translateToChinese(text);
            
            tooltip.innerHTML = `<strong>${{text}}</strong><br>${{translation}}`;
            tooltip.style.display = 'block';
            tooltip.style.left = (rect.left + window.scrollX) + 'px';
            tooltip.style.top = (rect.top + window.scrollY - 40) + 'px';
        }}

        // 初始化页面
        document.addEventListener('DOMContentLoaded', function() {{
            renderNews();
        }});
    </script>
</body>
</html>"""

    # Generate news cards HTML
    news_cards_html = ""
    for item in news_items:
        title_cn = item['title'][:50]  # 简单截取作为中文标题
        description_cn = item['content'][:100] + "..."  # 简单截取作为中文描述
        news_cards_html += f'''
            <div class="news-card" onclick="openReader({{title: '{item['title'].replace("'", "&#39;")}', content: '{item['content'].replace("'", "&#39;")}', date: '{item['date']}', url: '{item['url']}'}})">
                <div class="news-title">{item['title']}<br><small style="color: #d4a76a;">{title_cn}</small></div>
                <div class="news-source">AI News</div>
                <div class="news-description">{item['content'][:100]}...<br><small style="color: #d4a76a;">{description_cn}</small></div>
                <div class="news-date">{item['date']}</div>
            </div>
        '''
    
    # Generate JSON for JavaScript
    import json
    news_json = json.dumps(news_items, ensure_ascii=False, indent=2)
    
    # Fill in the template
    html_content = html_template.format(news_cards=news_cards_html, news_json=news_json)
    
    return html_content

def main():
    """Main function to fetch news and update page"""
    # Read news links from file
    import os
    news_links_path = os.path.expanduser('~/Desktop/News_Links.txt')
    
    with open(news_links_path, 'r') as f:
        links = [line.strip() for line in f if line.strip() and line.strip().startswith('http')]
    
    print(f"Found {len(links)} links to process...")
    
    # Fetch content for each link
    news_items = []
    for i, link in enumerate(links):
        print(f"Processing {i+1}/{len(links)}: {link}")
        item = extract_article_content(link)
        if item:
            news_items.append(item)
            print(f"  ✓ Success: {item['title'][:50]}...")
        else:
            print(f"  ✗ Failed to fetch: {link}")
        
        # Be respectful to the servers
        time.sleep(1)
    
    print(f"\nFetched {len(news_items)} news items successfully.")
    
    # Create news page
    html_content = create_news_page(news_items)
    
    # Write to file
    with open('news_fetched.html', 'w', encoding='utf-8') as f:
        f.write(html_content)
    
    print("✅ News page created: news_fetched.html")

if __name__ == '__main__':
    main()