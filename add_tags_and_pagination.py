#!/usr/bin/env python3
"""
Add intelligent tags to articles based on content and add pagination
"""
import os
import re
from bs4 import BeautifulSoup

# Common company/organization tags to look for
COMPANY_KEYWORDS = {
    'google': 'Google',
    'openai': 'OpenAI',
    'microsoft': 'Microsoft',
    'amazon': 'Amazon',
    'meta': 'Meta',
    'facebook': 'Facebook',
    'apple': 'Apple',
    'nvidia': 'Nvidia',
    'anthropic': 'Anthropic',
    'tesla': 'Tesla',
    'spacex': 'SpaceX',
    'netflix': 'Netflix',
    'walmart': 'Walmart',
    'ford': 'Ford',
    'ibm': 'IBM',
    'oracle': 'Oracle',
    'salesforce': 'Salesforce',
    'adobe': 'Adobe',
    'intel': 'Intel',
    'amd': 'AMD',
    'deepmind': 'DeepMind',
    'stanford': 'Stanford',
    'mit': 'MIT',
    'harvard': 'Harvard',
    'yale': 'Yale',
    'gemini': 'Gemini',
    'chatgpt': 'ChatGPT',
    'claude': 'Claude',
    'grok': 'Grok',
    'perplexity': 'Perplexity',
    'midjourney': 'Midjourney',
    'stability': 'StabilityAI',
    'irs': 'IRS',
    'fda': 'FDA',
    'tiktok': 'TikTok',
    'youtube': 'YouTube',
    'reddit': 'Reddit',
    'yelp': 'Yelp',
    'cloudflare': 'Cloudflare',
    'coca-cola': 'Coca-Cola',
    'bezos': 'Bezos',
    'musk': 'Musk',
    'altman': 'Altman',
    'pichai': 'Pichai',
    'hinton': 'Hinton',
    'lecun': 'LeCun',
    'bengio': 'Bengio',
    'fei-fei': 'Fei-Fei Li',
}

# Topic tags
TOPIC_KEYWORDS = {
    'healthcare': 'Healthcare',
    'health': 'Healthcare',
    'medical': 'Healthcare',
    'doctor': 'Healthcare',
    'hospital': 'Healthcare',
    'education': 'Education',
    'school': 'Education',
    'university': 'Education',
    'college': 'Education',
    'student': 'Education',
    'teacher': 'Education',
    'business': 'Business',
    'enterprise': 'Business',
    'startup': 'Business',
    'investment': 'Business',
    'ethical': 'Ethics',
    'ethics': 'Ethics',
    'privacy': 'Privacy',
    'security': 'Security',
    'data center': 'DataCenter',
    'coding': 'Programming',
    'programming': 'Programming',
    'developer': 'Programming',
    'software': 'Programming',
    'climate': 'Climate',
    'energy': 'Energy',
    'environment': 'Climate',
    'carbon': 'Climate',
    'regulation': 'Regulation',
    'law': 'Regulation',
    'policy': 'Policy',
    'government': 'Government',
    'job': 'Employment',
    'employment': 'Employment',
    'work': 'Employment',
    'career': 'Employment',
    'chatbot': 'Chatbot',
    'agent': 'AI-Agent',
    'robot': 'Robotics',
    'autonomous': 'Autonomous',
    'research': 'Research',
    'prediction': 'Future',
    'future': 'Future',
}

articles_dir = 'articles'
article_files = sorted([f for f in os.listdir(articles_dir) if f.endswith('.html')])

print(f"Processing {len(article_files)} articles for tag generation...")

articles_data = []

for filename in article_files:
    filepath = os.path.join(articles_dir, filename)
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            soup = BeautifulSoup(content, 'html.parser')
        
        # Get title
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.get_text(strip=True)
            title = re.sub(r'\s*-\s*English Novel Reader.*$', '', title)
        else:
            title = filename.replace('.html', '').replace('_', ' ').title()
        
        # Get text content for analysis
        text_content = soup.get_text().lower()
        
        # Generate tags
        tags = {'ai'}  # All articles get 'ai' tag
        
        # Check for company names
        for keyword, tag in COMPANY_KEYWORDS.items():
            if keyword.lower() in text_content:
                tags.add(tag)
        
        # Check for topics
        for keyword, tag in TOPIC_KEYWORDS.items():
            if keyword.lower() in text_content:
                tags.add(tag)
        
        # Limit to most relevant tags (max 6)
        tags_list = sorted(list(tags))[:6]
        tags_str = ' '.join(tags_list)
        
        articles_data.append({
            'filename': filename,
            'title': title,
            'tags': tags_str
        })
        
        print(f"✓ {filename[:50]}: {tags_str}")
        
    except Exception as e:
        print(f"✗ Error processing {filename}: {e}")
        articles_data.append({
            'filename': filename,
            'title': filename.replace('.html', ''),
            'tags': 'ai'
        })

print(f"\nGenerated tags for {len(articles_data)} articles")

# Read webnovels.html template
with open('webnovels.html', 'r', encoding='utf-8') as f:
    content = f.read()
    header_end = content.find('<div class="webnovel-content" id="webnovelContent">')
    if header_end == -1:
        print("Error: Could not find content section")
        exit(1)
    header = content[:header_end + len('<div class="webnovel-content" id="webnovelContent">')]

# Generate article HTML with new tags
articles_html = []
for data in articles_data:
    tags_list = data['tags'].split()
    tags_html = ' '.join([f'<span class="article-tag">{tag}</span>' for tag in tags_list])
    
    article_html = f'''                    <div class="webnovel-article" data-tags="{data['tags']}">
                        <h2 class="webnovel-title">
                            <a href="articles/{data['filename']}" class="webnovel-title-link">
                                {data['title']}
                            </a>
                        </h2>
                        <div class="article-tags">
                            {tags_html}
                        </div>
                    </div>'''
    articles_html.append(article_html)

# Generate footer with pagination JavaScript
footer = f'''
                </div>
                
                <!-- Pagination Controls -->
                <div class="pagination" id="pagination">
                    <button class="page-btn" id="prevBtn" onclick="changePage(-1)">← 上一页</button>
                    <span class="page-info">
                        第 <span id="currentPage">1</span> 页 / 共 <span id="totalPages">18</span> 页
                    </span>
                    <button class="page-btn" id="nextBtn" onclick="changePage(1)">下一页 →</button>
                </div>
            </main>
        </div>
    </div>
    
    <style>
        /* Pagination styles */
        .pagination {{
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin: 40px auto;
            padding: 20px;
        }}
        
        .page-btn {{
            background-color: #5a3e2b;
            color: #fff;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 1rem;
            font-family: 'Microsoft YaHei', sans-serif;
            transition: all 0.3s ease;
        }}
        
        .page-btn:hover {{
            background-color: #7a5c42;
            transform: translateY(-2px);
        }}
        
        .page-btn:disabled {{
            background-color: #ccc;
            cursor: not-allowed;
            transform: none;
        }}
        
        .page-info {{
            font-size: 1.1rem;
            color: #5a3e2b;
            font-family: 'Microsoft YaHei', sans-serif;
        }}
        
        #currentPage, #totalPages {{
            font-weight: bold;
            color: #5a3e2b;
        }}
    </style>
    
    <script>
        const ARTICLES_PER_PAGE = 10;
        let currentPage = 1;
        let currentFilter = 'all';
        let allArticles = [];
        let filteredArticles = [];
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {{
            allArticles = Array.from(document.querySelectorAll('.webnovel-article'));
            filteredArticles = allArticles;
            
            // Tag filtering
            const tagButtons = document.querySelectorAll('.tag-btn');
            tagButtons.forEach(button => {{
                button.addEventListener('click', function() {{
                    tagButtons.forEach(btn => btn.classList.remove('active'));
                    this.classList.add('active');
                    
                    currentFilter = this.getAttribute('data-tag');
                    filterArticles();
                }});
            }});
            
            updatePagination();
        }});
        
        function filterArticles() {{
            if (currentFilter === 'all') {{
                filteredArticles = allArticles;
            }} else if (currentFilter === 'latest') {{
                filteredArticles = allArticles.slice(0, 20);
            }} else {{
                filteredArticles = allArticles.filter(article => {{
                    const tags = article.getAttribute('data-tags');
                    return tags && tags.includes(currentFilter);
                }});
            }}
            
            currentPage = 1;
            updatePagination();
        }}
        
        function updatePagination() {{
            const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
            const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
            const endIndex = startIndex + ARTICLES_PER_PAGE;
            
            // Hide all articles first
            allArticles.forEach(article => article.style.display = 'none');
            
            // Show only current page articles
            filteredArticles.slice(startIndex, endIndex).forEach(article => {{
                article.style.display = 'block';
            }});
            
            // Update pagination info
            document.getElementById('currentPage').textContent = currentPage;
            document.getElementById('totalPages').textContent = totalPages;
            
            // Update button states
            document.getElementById('prevBtn').disabled = currentPage === 1;
            document.getElementById('nextBtn').disabled = currentPage === totalPages;
            
            // Scroll to top of article list
            document.getElementById('webnovelContent').scrollIntoView({{ behavior: 'smooth', block: 'start' }});
        }}
        
        function changePage(direction) {{
            const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
            currentPage += direction;
            
            if (currentPage < 1) currentPage = 1;
            if (currentPage > totalPages) currentPage = totalPages;
            
            updatePagination();
        }}
    </script>
</body>
</html>'''

# Write new webnovels.html
new_html = header + '\n' + '\n'.join(articles_html) + footer

with open('webnovels_with_tags.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print(f"\n✓ Generated webnovels_with_tags.html with {len(articles_data)} articles")
print(f"  - Pagination: 10 articles per page")
print(f"  - Auto-generated tags based on content")
print(f"\nRun: mv webnovels.html webnovels_no_tags.html && mv webnovels_with_tags.html webnovels.html")
