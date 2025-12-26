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
const articlesContent = content.substring(startIndex, endIndex);

// Extract all article lines
const articleLines = articlesContent.split('\n');
const uniqueArticles = new Map();
let currentArticle = [];
let currentUrl = null;

// Process each line to build articles with proper closing tags
articleLines.forEach(line => {
    line = line.trim();
    if (line.startsWith('<div class="webnovel-article"')) {
        // Start of a new article
        if (currentArticle.length > 0 && currentUrl) {
            // Save previous article if it has content and URL
            currentArticle.push('</div>'); // Add closing tag
            uniqueArticles.set(currentUrl, currentArticle.join('\n'));
        }
        // Reset for new article
        currentArticle = [line];
        currentUrl = null;
    } else if (line.includes('<a href="') && !currentUrl) {
        // Extract URL from the link
        const urlMatch = line.match(/href="([^"]*)"/);
        if (urlMatch) {
            currentUrl = urlMatch[1];
        }
        currentArticle.push(line);
    } else if (line) {
        // Add other lines to current article
        currentArticle.push(line);
    }
});

// Add the last article
if (currentArticle.length > 0 && currentUrl) {
    currentArticle.push('</div>');
    uniqueArticles.set(currentUrl, currentArticle.join('\n'));
}

// Generate the final articles content
const finalArticles = Array.from(uniqueArticles.values()).join('\n\n');

// Reconstruct the entire file
const finalContent = headerContent + '\n' + finalArticles + '\n' + scriptContent;

// Write the fixed file
fs.writeFileSync(webnovelsPath, finalContent, 'utf8');

console.log('Fixed webnovels.html with properly closed article tags');
console.log('Total unique articles:', uniqueArticles.size);
