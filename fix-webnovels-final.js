const fs = require('fs');
const path = require('path');

// Read the entire webnovels.html file
const webnovelsPath = path.join(__dirname, 'webnovels.html');
let content = fs.readFileSync(webnovelsPath, 'utf8');

// Extract all the content before the articles
const startMarker = '<div class="webnovel-content" id="webnovelContent">';
const endMarker = '        <script>';
const startIndex = content.indexOf(startMarker) + startMarker.length;
const endIndex = content.indexOf(endMarker);

const headerContent = content.substring(0, startIndex);
const scriptContent = content.substring(endIndex);
let articlesContent = content.substring(startIndex, endIndex);

// Use a more robust approach to extract and clean articles
// First, let's find all unique URLs and their positions
const urlRegex = /<a href="(articles\/[^"\s]+)"[^>]*>([^<]+)<\/a>/g;
let match;
const urlPositions = [];

while ((match = urlRegex.exec(articlesContent)) !== null) {
    urlPositions.push({
        url: match[1],
        title: match[2].trim(),
        start: match.index
    });
}

console.log('Found', urlPositions.length, 'article links');

// Get unique URLs and their first occurrence
const uniqueUrlMap = new Map();
urlPositions.forEach(pos => {
    if (!uniqueUrlMap.has(pos.url)) {
        uniqueUrlMap.set(pos.url, pos);
    }
});

console.log('Found', uniqueUrlMap.size, 'unique articles');

// Create a list of unique positions sorted by their start index
const uniquePositions = Array.from(uniqueUrlMap.values())
    .sort((a, b) => a.start - b.start);

// Extract each article block based on URL positions
const articles = [];
for (let i = 0; i < uniquePositions.length; i++) {
    const pos = uniquePositions[i];
    const nextPos = i < uniquePositions.length - 1 ? uniquePositions[i + 1] : { start: articlesContent.length };
    
    // Extract the article block from current URL position back to the previous article end
    // Find the start of the article div
    const articleStart = articlesContent.lastIndexOf('<div class="webnovel-article"', pos.start);
    if (articleStart === -1) continue;
    
    // Extract the article block
    const articleBlock = articlesContent.substring(articleStart, nextPos.start);
    articles.push(articleBlock);
}

// Generate properly formatted articles with closing tags
const formattedArticles = articles
    .map(article => {
        // Make sure the article has proper closing tags
        let cleanArticle = article;
        // Count opening and closing div tags
        const openingDivs = (cleanArticle.match(/<div\s/g) || []).length;
        const closingDivs = (cleanArticle.match(/<\/div>/g) || []).length;
        const divDiff = openingDivs - closingDivs;
        
        // Add missing closing tags if needed
        if (divDiff > 0) {
            cleanArticle += '</div>'.repeat(divDiff);
        }
        
        return cleanArticle;
    })
    .join('\n');

// Reconstruct the entire HTML file
const newContent = headerContent + '\n' + formattedArticles + '\n' + scriptContent;

// Write the fixed content back to webnovels.html
fs.writeFileSync(webnovelsPath, newContent, 'utf8');

console.log('Successfully fixed webnovels.html with', articles.length, 'unique articles');
console.log('All articles now have proper HTML structure');
