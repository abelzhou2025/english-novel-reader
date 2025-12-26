const fs = require('fs');
const path = require('path');

// Read the current webnovels.html file
const webnovelsPath = path.join(__dirname, 'webnovels.html');
let content = fs.readFileSync(webnovelsPath, 'utf8');

// Extract the HTML content before the articles (head and navigation)
const headEndIndex = content.indexOf('<div class="webnovel-content" id="webnovelContent">') + '<div class="webnovel-content" id="webnovelContent">'.length;
const headContent = content.substring(0, headEndIndex);

// Extract the HTML content after the articles (pagination script and closing tags)
const scriptStartIndex = content.indexOf('        <script>');
const scriptContent = content.substring(scriptStartIndex);

// Extract all articles content
const articlesContent = content.substring(headEndIndex, scriptStartIndex);

// Use regex to find all article blocks
const articleRegex = /<div class="webnovel-article"[^>]*>.*?<h2 class="webnovel-title">.*?<a href="([^"]*)".*?<\/h2>.*?<div class="article-tags">(.*?)<\/div>/gs;
let match;
const uniqueArticles = new Map();

// Extract unique articles by URL
while ((match = articleRegex.exec(articlesContent)) !== null) {
    const fullMatch = match[0];
    const url = match[1];
    if (!uniqueArticles.has(url)) {
        uniqueArticles.set(url, fullMatch);
    }
}

// Generate properly formatted articles with closing tags
const formattedArticles = Array.from(uniqueArticles.values())
    .map(article => article.replace(/<\/div>$/, '</div></div>'))
    .join('\n');

// Reconstruct the entire HTML file
const newContent = headContent + '\n' + formattedArticles + '\n' + scriptContent;

// Write the fixed content back to webnovels.html
fs.writeFileSync(webnovelsPath, newContent, 'utf8');

console.log('Fixed webnovels.html with properly closed article tags');
console.log('Total unique articles:', uniqueArticles.size);
