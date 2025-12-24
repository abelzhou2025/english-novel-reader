#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the webnovels.html file
const webnovelsPath = path.join(__dirname, 'webnovels.html');
let webnovelsContent = fs.readFileSync(webnovelsPath, 'utf8');

// Find the article list section
const articleListRegex = /<div class="webnovel-content" id="webnovelContent">(.*?)<\/div>/s;
const articleListMatch = webnovelsContent.match(articleListRegex);

if (!articleListMatch) {
    console.error('Could not find article list section in webnovels.html');
    process.exit(1);
}

// Extract all article entries
const articlesRegex = /<div class="webnovel-article"[^>]*>.*?<\/div>/gs;
const allArticles = webnovelsContent.match(articlesRegex) || [];
console.log(`Found ${allArticles.length} articles total`);

// Create a map to store unique articles by URL
const uniqueArticlesMap = new Map();

// Process each article to find unique ones
allArticles.forEach(article => {
    const urlMatch = article.match(/href="(.*?)"/);
    if (urlMatch) {
        const url = urlMatch[1];
        if (!uniqueArticlesMap.has(url)) {
            uniqueArticlesMap.set(url, article);
        }
    }
});

console.log(`Found ${uniqueArticlesMap.size} unique articles`);

// Create the updated article list
const uniqueArticlesHtml = Array.from(uniqueArticlesMap.values()).join('\n');
const updatedArticleList = `<div class="webnovel-content" id="webnovelContent">
${uniqueArticlesHtml}
                    </div>`;

// Replace the old article list with the new unique one
webnovelsContent = webnovelsContent.replace(articleListRegex, updatedArticleList);

// Write the fixed content back to file
fs.writeFileSync(webnovelsPath, webnovelsContent, 'utf8');

console.log('Fixed webnovels.html by removing duplicate articles');
console.log(`Reduced from ${allArticles.length} to ${uniqueArticlesMap.size} articles`);
