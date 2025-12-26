#!/usr/bin/env python3
"""
Update webnovels.html with multi-select tag filtering
"""
import re
from bs4 import BeautifulSoup

# Read current webnovels.html
with open('webnovels.html', 'r', encoding='utf-8') as f:
    content = f.read()

soup = BeautifulSoup(content, 'html.parser')

# Extract all unique tags from all articles
all_tags = set()
articles = soup.find_all('div', class_='webnovel-article')
for article in articles:
    tags_attr = article.get('data-tags', '')
    if tags_attr:
        tags = tags_attr.split()
        all_tags.update(tags)

# Sort tags alphabetically
sorted_tags = sorted(all_tags)

print(f"Found {len(sorted_tags)} unique tags across {len(articles)} articles:")
print(', '.join(sorted_tags))

# Create new tag filter HTML
tag_buttons_html = '\n'.join([
    f'                        <button class="tag-btn" data-tag="{tag}">{tag}</button>'
    for tag in sorted_tags
])

# Find and replace the tag filter section
# Look for the webnovel-tags div
tag_section_start = content.find('<div class="webnovel-tags">')
tag_section_end = content.find('</div>', tag_section_start) + len('</div>')

if tag_section_start == -1:
    print("Error: Could not find tag section")
    exit(1)

# Build new tag section with "All" button and all extracted tags
new_tag_section = f'''<div class="webnovel-tags">
                    <div class="tags-header">
                        <h3>筛选标签</h3>
                        <button class="clear-filters-btn" onclick="clearAllFilters()">清除所有筛选</button>
                    </div>
                    <div class="tags-container">
                        <button class="tag-btn active" data-tag="all">全部</button>
{tag_buttons_html}
                    </div>
                </div>'''

# Replace old tag section
new_content = content[:tag_section_start] + new_tag_section + content[tag_section_end:]

# Update the JavaScript for multi-select functionality
js_start = new_content.find('const ARTICLES_PER_PAGE = 10;')
js_end = new_content.find('</script>', js_start)

if js_start == -1 or js_end == -1:
    print("Error: Could not find JavaScript section")
    exit(1)

new_javascript = '''const ARTICLES_PER_PAGE = 10;
        let currentPage = 1;
        let selectedTags = new Set(['all']); // Multi-select tags
        let allArticles = [];
        let filteredArticles = [];
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            allArticles = Array.from(document.querySelectorAll('.webnovel-article'));
            filteredArticles = allArticles;
            
            // Tag filtering with multi-select
            const tagButtons = document.querySelectorAll('.tag-btn');
            tagButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const tag = this.getAttribute('data-tag');
                    
                    if (tag === 'all') {
                        // If "All" is clicked, clear all other selections
                        selectedTags.clear();
                        selectedTags.add('all');
                        tagButtons.forEach(btn => btn.classList.remove('active'));
                        this.classList.add('active');
                    } else {
                        // Remove "All" if it's selected
                        selectedTags.delete('all');
                        const allButton = document.querySelector('.tag-btn[data-tag="all"]');
                        if (allButton) allButton.classList.remove('active');
                        
                        // Toggle the clicked tag
                        if (selectedTags.has(tag)) {
                            selectedTags.delete(tag);
                            this.classList.remove('active');
                            
                            // If no tags selected, revert to "All"
                            if (selectedTags.size === 0) {
                                selectedTags.add('all');
                                if (allButton) allButton.classList.add('active');
                            }
                        } else {
                            selectedTags.add(tag);
                            this.classList.add('active');
                        }
                    }
                    
                    filterArticles();
                });
            });
            
            updatePagination();
        });
        
        function clearAllFilters() {
            selectedTags.clear();
            selectedTags.add('all');
            
            const tagButtons = document.querySelectorAll('.tag-btn');
            tagButtons.forEach(btn => btn.classList.remove('active'));
            
            const allButton = document.querySelector('.tag-btn[data-tag="all"]');
            if (allButton) allButton.classList.add('active');
            
            filterArticles();
        }
        
        function filterArticles() {
            if (selectedTags.has('all')) {
                // Show all articles
                filteredArticles = allArticles;
            } else {
                // Show articles that match ANY of the selected tags
                filteredArticles = allArticles.filter(article => {
                    const articleTags = article.getAttribute('data-tags');
                    if (!articleTags) return false;
                    
                    const tags = articleTags.split(' ');
                    // Check if article has ANY of the selected tags
                    return tags.some(tag => selectedTags.has(tag));
                });
            }
            
            currentPage = 1;
            updatePagination();
            
            // Update result count
            updateResultCount();
        }
        
        function updateResultCount() {
            const resultText = selectedTags.has('all') 
                ? `共 ${filteredArticles.length} 篇文章`
                : `找到 ${filteredArticles.length} 篇文章`;
            
            let countElement = document.getElementById('resultCount');
            if (!countElement) {
                countElement = document.createElement('div');
                countElement.id = 'resultCount';
                countElement.className = 'result-count';
                const tagsHeader = document.querySelector('.tags-header');
                if (tagsHeader) {
                    tagsHeader.appendChild(countElement);
                }
            }
            countElement.textContent = resultText;
        }
        
        function updatePagination() {
            const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
            const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
            const endIndex = startIndex + ARTICLES_PER_PAGE;
            
            // Hide all articles first
            allArticles.forEach(article => article.style.display = 'none');
            
            // Show only current page articles
            filteredArticles.slice(startIndex, endIndex).forEach(article => {
                article.style.display = 'block';
            });
            
            // Update pagination info
            document.getElementById('currentPage').textContent = currentPage;
            document.getElementById('totalPages').textContent = totalPages || 1;
            
            // Update button states
            document.getElementById('prevBtn').disabled = currentPage === 1;
            document.getElementById('nextBtn').disabled = currentPage === totalPages || totalPages === 0;
            
            // Scroll to top of article list
            const content = document.getElementById('webnovelContent');
            if (content) {
                content.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        
        function changePage(direction) {
            const totalPages = Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE);
            currentPage += direction;
            
            if (currentPage < 1) currentPage = 1;
            if (currentPage > totalPages) currentPage = totalPages;
            
            updatePagination();
        }'''

new_content = new_content[:js_start] + new_javascript + '\n    ' + new_content[js_end:]

# Add additional CSS for the new UI
css_insertion_point = new_content.find('/* Pagination styles */')
if css_insertion_point == -1:
    css_insertion_point = new_content.find('.pagination {')

new_css = '''/* Tag filter styles */
        .webnovel-tags {
            margin-bottom: 30px;
            padding: 20px;
            background-color: #f8f5f2;
            border-radius: 8px;
        }
        
        .tags-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .tags-header h3 {
            margin: 0;
            color: #5a3e2b;
            font-size: 1.2rem;
        }
        
        .clear-filters-btn {
            background-color: #d9534f;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }
        
        .clear-filters-btn:hover {
            background-color: #c9302c;
            transform: translateY(-1px);
        }
        
        .result-count {
            color: #7a5c42;
            font-size: 0.95rem;
            font-weight: 500;
        }
        
        .tags-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .tag-btn {
            background-color: #fff;
            color: #5a3e2b;
            border: 2px solid #d4c4b0;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
            font-family: 'Microsoft YaHei', sans-serif;
        }
        
        .tag-btn:hover {
            background-color: #f0e8dc;
            border-color: #5a3e2b;
            transform: translateY(-2px);
        }
        
        .tag-btn.active {
            background-color: #5a3e2b;
            color: #fff;
            border-color: #5a3e2b;
        }
        
        @media (max-width: 768px) {
            .tags-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .clear-filters-btn {
                width: 100%;
            }
        }
        
        '''

new_content = new_content[:css_insertion_point] + new_css + new_content[css_insertion_point:]

# Write the updated file
with open('webnovels_multiselect.html', 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f"\n✓ Created webnovels_multiselect.html")
print(f"  - {len(sorted_tags)} unique tags available for filtering")
print(f"  - Multi-select: click to select, click again to deselect")
print(f"  - Articles matching ANY selected tag will be shown")
print(f"\nRun: mv webnovels.html webnovels_single_filter.html && mv webnovels_multiselect.html webnovels.html")
