#!/usr/bin/env python3
"""
Rebuild webnovels.html from all articles in the articles/ folder.
No deduplication - uses ALL .html files found.
"""
import os
import re
from bs4 import BeautifulSoup

# Get all HTML files in articles folder
articles_dir = 'articles'
article_files = sorted([f for f in os.listdir(articles_dir) if f.endswith('.html')])

print(f"Found {len(article_files)} HTML files in {articles_dir}/")

# Extract title and generate article entries
articles_data = []
for filename in article_files:
    filepath = os.path.join(articles_dir, filename)
    
    try:
        # Read the HTML file and extract the title
        with open(filepath, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            
        # Try to get title from <title> tag
        title_tag = soup.find('title')
        if title_tag:
            title = title_tag.get_text(strip=True)
            # Remove common suffixes from title
            title = re.sub(r'\s*-\s*English Novel Reader.*$', '', title)
            title = re.sub(r'\s*\|\s*.*$', '', title)
        else:
            # Fallback: generate title from filename
            title = filename.replace('.html', '').replace('_', ' ').replace('-', ' ').title()
        
        # Default tags (all articles get 'ai' tag)
        tags = 'ai'
        
        articles_data.append({
            'filename': filename,
            'title': title,
            'tags': tags
        })
        
    except Exception as e:
        print(f"  Error processing {filename}: {e}")
        # Use filename as title if extraction fails
        title = filename.replace('.html', '').replace('_', ' ').title()
        articles_data.append({
            'filename': filename,
            'title': title,
            'tags': 'ai'
        })

print(f"Successfully processed {len(articles_data)} articles")

# Read the webnovels.html header (up to articles section)
with open('webnovels.html', 'r', encoding='utf-8') as f:
    content = f.read()
    header_end = content.find('<div class="webnovel-content" id="webnovelContent">')
    if header_end == -1:
        print("Error: Could not find article content section in webnovels.html")
        exit(1)
    header = content[:header_end + len('<div class="webnovel-content" id="webnovelContent">')]

# Generate article HTML entries
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

# Generate footer with JavaScript
footer = '''
                </div>
            </main>
        </div>
    </div>
    
    <script>
        // Tag filtering functionality
        document.addEventListener('DOMContentLoaded', function() {
            const tagButtons = document.querySelectorAll('.tag-btn');
            const articles = document.querySelectorAll('.webnovel-article');
            
            tagButtons.forEach(button => {
                button.addEventListener('click', function() {
                    // Remove active class from all buttons
                    tagButtons.forEach(btn => btn.classList.remove('active'));
                    // Add active class to clicked button
                    this.classList.add('active');
                    
                    const selectedTag = this.getAttribute('data-tag');
                    
                    articles.forEach(article => {
                        if (selectedTag === 'all') {
                            article.style.display = 'block';
                        } else if (selectedTag === 'latest') {
                            // Show first 20 articles for "latest"
                            const index = Array.from(articles).indexOf(article);
                            article.style.display = index < 20 ? 'block' : 'none';
                        } else {
                            const articleTags = article.getAttribute('data-tags');
                            if (articleTags && articleTags.includes(selectedTag)) {
                                article.style.display = 'block';
                            } else {
                                article.style.display = 'none';
                            }
                        }
                    });
                });
            });
        });
    </script>
</body>
</html>'''

# Write the new webnovels.html
new_html = header + '\n' + '\n'.join(articles_html) + footer

with open('webnovels_rebuilt.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print(f"\n✓ Generated webnovels_rebuilt.html with {len(articles_data)} articles")
print(f"  Review the file, then run:")
print(f"    mv webnovels.html webnovels_backup.html")
print(f"    mv webnovels_rebuilt.html webnovels.html")
