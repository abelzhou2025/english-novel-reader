const fs = require('fs');
const path = require('path');

// Generate RSS feed
function generateRSSFeed() {
    // Read the script.js file to get novel data
    const scriptPath = path.join(__dirname, 'script.js');
    const scriptContent = fs.readFileSync(scriptPath, 'utf8');
    
    // Extract novel data (simplified parsing)
    const novels = extractNovelsFromScript(scriptContent);
    
    // Get current date
    const now = new Date();
    const pubDate = now.toUTCString();
    
    // Generate RSS XML
    const rssXml = generateRSSXml(novels, pubDate);
    
    // Write to rss.xml
    fs.writeFileSync(path.join(__dirname, 'rss.xml'), rssXml, 'utf8');
    console.log('RSS feed generated successfully!');
}

// Extract novels from script.js
function extractNovelsFromScript(scriptContent) {
    // This is a simplified parser - you may need to adjust it based on your actual script.js structure
    const novels = {};
    
    // Match the novels object
    const novelsMatch = scriptContent.match(/const novels = (\{[\s\S]*?\});/);
    if (novelsMatch) {
        try {
            // Parse the novels object
            const novelsObj = eval(`(${novelsMatch[1]})`);
            return novelsObj;
        } catch (error) {
            console.error('Error parsing novels object:', error);
        }
    }
    
    // Fallback: return default novels
    return {
        jane_eyre: {
            title: 'Jane Eyre',
            author: 'Charlotte Brontë',
            content: ['Default content for Jane Eyre']
        }
    };
}

// Generate RSS XML
function generateRSSXml(novels, pubDate) {
    const baseUrl = 'https://your-username.github.io/english-novel-reader';
    
    let itemsXml = '';
    
    // Generate items for each novel
    Object.entries(novels).forEach(([id, novel]) => {
        const novelUrl = `${baseUrl}?novel=${id}`;
        const lastUpdate = pubDate;
        
        // Use the first paragraph as description
        const description = novel.content[0] || 'No content available';
        
        itemsXml += `
        <item>
            <title>${escapeXml(novel.title)}</title>
            <link>${novelUrl}</link>
            <description>${escapeXml(description)}</description>
            <author>${escapeXml(novel.author)}</author>
            <pubDate>${lastUpdate}</pubDate>
            <guid isPermaLink="true">${novelUrl}</guid>
        </item>`;
    });
    
    return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>English Novel Reader</title>
        <link>${baseUrl}</link>
        <description>English novel reader with click-to-translate feature</description>
        <language>en-US</language>
        <lastBuildDate>${pubDate}</lastBuildDate>
        <pubDate>${pubDate}</pubDate>
        <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
        ${itemsXml}
    </channel>
</rss>`;
}

// Escape XML special characters
function escapeXml(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// Update the RSS feed when the script is run directly
if (require.main === module) {
    generateRSSFeed();
}

module.exports = { generateRSSFeed };