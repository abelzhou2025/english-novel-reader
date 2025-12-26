const fs = require('fs');
const path = require('path');

// Read the entire webnovels.html file
const webnovelsPath = path.join(__dirname, 'webnovels.html');
let content = fs.readFileSync(webnovelsPath, 'utf8');

// Extract all URLs from article links
const urlRegex = /<a href="(articles\/[^"]*md.html)"/g;
const urls = [...content.matchAll(urlRegex)].map(match => match[1]);

// Get unique URLs using Set
const uniqueUrls = new Set(urls);
console.log('Found', urls.length, 'total URLs,', uniqueUrls.size, 'unique URLs');

// Read the import-articles.js to understand how articles are structured
const importScriptPath = path.join(__dirname, 'import-articles.js');
const importScript = fs.readFileSync(importScriptPath, 'utf8');

// Extract the articles2 directory path from the import script
const articlesDirMatch = importScript.match(/articlesDir = path\.join\(__dirname, '(.*?)'\)/);
const articlesDir = articlesDirMatch ? path.join(__dirname, articlesDirMatch[1]) : path.join(__dirname, 'articles2');

// Read all article files from articles2 directory
const articleFiles = fs.readdirSync(articlesDir).filter(file => file.endsWith('.json'));
console.log('Found', articleFiles.length, 'article files in', articlesDir);

// Create a map of articles by URL
const articlesMap = new Map();
articleFiles.forEach(file => {
    try {
        const articlePath = path.join(articlesDir, file);
        const articleData = JSON.parse(fs.readFileSync(articlePath, 'utf8'));
        // Generate URL from filename (remove .json extension and add .html)
        const url = `articles/${file.replace('.json', '.html')}`;
        articlesMap.set(url, articleData);
    } catch (error) {
        console.error('Error reading article file', file, ':', error.message);
    }
});

console.log('Loaded', articlesMap.size, 'articles into map');

// Generate properly formatted articles HTML
let articlesHTML = '';
uniqueUrls.forEach(url => {
    const article = articlesMap.get(url);
    if (article) {
        const tags = article.tags ? article.tags.join(' ') : 'ai';
        articlesHTML += `    <div class="webnovel-article" data-tags="${tags}">\n`;
        articlesHTML += `        <h2 class="webnovel-title">\n`;
        articlesHTML += `            <a href="${url}" class="webnovel-title-link">\n`;
        articlesHTML += `                ${article.title || 'Untitled'}\n`;
        articlesHTML += `            </a>\n`;
        articlesHTML += `        </h2>\n`;
        articlesHTML += `        <div class="article-tags">\n`;
        article.tags.forEach(tag => {
            articlesHTML += `            <span class="article-tag">${tag}</span>\n`;
        });
        articlesHTML += `        </div>\n`;
        articlesHTML += `    </div>\n`;
    }
});

// Replace the entire article content in webnovels.html
const startMarker = '<div class="webnovel-content" id="webnovelContent">';
const endMarker = '        <script>';
const startIndex = content.indexOf(startMarker) + startMarker.length;
const endIndex = content.indexOf(endMarker);

const headerContent = content.substring(0, startIndex);
const scriptContent = content.substring(endIndex);

const newContent = headerContent + '\n' + articlesHTML + '\n' + scriptContent;

// Write the fixed content back to webnovels.html
fs.writeFileSync(webnovelsPath, newContent, 'utf8');

console.log('Successfully regenerated webnovels.html with', uniqueUrls.size, 'unique articles');
console.log('All articles now have proper closing tags');
