const fs = require('fs');
const path = require('path');

// Main function to rebuild webnovels.html
function rebuildWebnovels() {
    try {
        // Read the current webnovels.html file
        const webnovelsPath = path.join(__dirname, 'webnovels.html');
        let webnovelsContent = fs.readFileSync(webnovelsPath, 'utf8');

        // Read all article HTML files from the articles directory
        const articlesDir = path.join(__dirname, 'articles');
        const articleFiles = fs.readdirSync(articlesDir).filter(file => file.endsWith('.html'));
        console.log('Found', articleFiles.length, 'article HTML files');

        // Extract article data from each HTML file
        const articlesMap = new Map();
        articleFiles.forEach(file => {
            try {
                const filePath = path.join(articlesDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Extract title from the HTML file
                const titleMatch = content.match(/<h1 class="article-title">(.*?)<\/h1>/);
                const title = titleMatch ? titleMatch[1].trim() : 'Untitled Article';
                
                // Extract paragraphs for tag extraction
                const paragraphMatches = content.match(/<div class="english-text">(.*?)<\/div>/g) || [];
                const paragraphs = paragraphMatches.map(para => 
                    para.replace(/<div class="english-text">(.*?)<\/div>/, '$1').trim()
                );
                
                // Deduplicate by title
                // Prefer shorter filenames or filenames without 'md'
                const existing = articlesMap.get(title);
                if (!existing || 
                    (file.length < existing.filename.length && !file.includes('md.')) ||
                    (!file.includes('md.') && existing.filename.includes('md.'))) {
                    articlesMap.set(title, {
                        filename: file,
                        title: title,
                        paragraphs: paragraphs
                    });
                }
            } catch (error) {
                console.error('Error reading article file', file, ':', error.message);
            }
        });

        const articles = Array.from(articlesMap.values());
        console.log('Extracted data from', articles.length, 'unique article titles');

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

        // Generate properly formatted articles HTML with closing tags
        const articlesHTML = articles.map(article => {
            const tags = extractTags(article.title, article.paragraphs);
            return `                    <div class="webnovel-article" data-tags="${tags.join(' ')}">
                        <h2 class="webnovel-title">
                            <a href="articles/${article.filename}" class="webnovel-title-link">
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

        // Replace the article list with fresh content
        const updatedArticleList = `<div class="webnovel-content" id="webnovelContent">
${articlesHTML}
                    </div>`;
        
        webnovelsContent = webnovelsContent.replace(/<div class="webnovel-content" id="webnovelContent">[\s\S]*?<\/div>/, updatedArticleList);

        // Write the updated content back to webnovels.html
        fs.writeFileSync(webnovelsPath, webnovelsContent, 'utf8');
        console.log('Successfully rebuilt webnovels.html with', articles.length, 'unique articles');
        console.log('All articles now have proper closing tags');
        
    } catch (error) {
        console.error('Error rebuilding webnovels.html:', error);
    }
}

// Run the function
rebuildWebnovels();
