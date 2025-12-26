#!/usr/bin/env python3
import os
import re
from collections import defaultdict
from bs4 import BeautifulSoup

# Read unique articles list
with open('unique_articles.txt', 'r') as f:
    unique_files = [line.strip() for line in f if line.strip()]

print(f"Processing {len(unique_files)} unique articles...")

# Read the original webnovels.html to extract article metadata
with open('webnovels.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

# Extract existing article data (title and tags) from the original file
article_data = {}
for article in soup.find_all('div', class_='webnovel-article'):
    link = article.find('a', class_='webnovel-title-link')
    if link and link.get('href'):
        filename = link['href'].replace('articles/', '')
        title = link.get_text(strip=True)
        tags = article.get('data-tags', 'ai')
        article_data[filename] = {
            'title': title,
            'tags': tags
        }

# Generate the articles HTML
articles_html = []
for filename in sorted(unique_files):
    if filename in article_data:
        data = article_data[filename]
    else:
        # Create default data for new files
        title = filename.replace('.html', '').replace('_', ' ').title()
        data = {'title': title, 'tags': 'ai'}
    
    tags_list = data['tags'].split()
    tags_html = ' '.join([f'<span class="article-tag">{tag}</span>' for tag in tags_list])
    
    article_html = f'''                    <div class="webnovel-article" data-tags="{data['tags']}">
                        <h2 class="webnovel-title">
                            <a href="articles/{filename}" class="webnovel-title-link">
                                {data['title']}
                            </a>
                        </h2>
                        <div class="article-tags">
                            {tags_html}
                        </div>
                    </div>'''
    articles_html.append(article_html)

print(f"Generated {len(articles_html)} article entries")

# Read the header part of webnovels.html (up to the articles section)
with open('webnovels.html', 'r', encoding='utf-8') as f:
    content = f.read()
    header_end = content.find('<div class="webnovel-content" id="webnovelContent">')
    header = content[:header_end + len('<div class="webnovel-content" id="webnovelContent">')]

# Generate the complete new HTML
new_html = header + '\n' + '\n'.join(articles_html) + '''
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

# Write the new clean webnovels.html
with open('webnovels_new.html', 'w', encoding='utf-8') as f:
    f.write(new_html)

print("Generated webnovels_new.html successfully!")
print("Review the file and then rename it to webnovels.html to replace the old version.")
