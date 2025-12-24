const fs = require('fs');
const path = require('path');

// Novels folder path
const NOVELS_FOLDER = '/Users/abel/Desktop/Novels';

// Script.js path
const SCRIPT_PATH = path.join(__dirname, 'script.js');

// Function to read and process novel files
function importNovels() {
    console.log('Starting novel import process...');
    
    // Read files from novels folder
    const files = fs.readdirSync(NOVELS_FOLDER);
    
    // Filter TXT files
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    
    console.log(`Found ${txtFiles.length} novel files.`);
    
    // Process each file
    const novels = {};
    
    txtFiles.forEach(file => {
        const filePath = path.join(NOVELS_FOLDER, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract novel info
        const { title, author, novelId } = extractNovelInfo(file);
        
        // Process content
        const processedContent = processNovelContent(content);
        
        // Add to novels object
        novels[novelId] = {
            title: title,
            author: author,
            content: processedContent
        };
        
        console.log(`Processed: ${title}`);
    });
    
    // Update script.js with new novels data
    updateScriptJs(novels);
    
    console.log('Novel import completed successfully!');
}

// Extract novel info from filename
function extractNovelInfo(filename) {
    // Remove .txt extension
    let name = filename.replace('.txt', '');
    
    // Extract title and author (simplified)
    let title = name;
    let author = 'Unknown Author';
    
    // Generate novel ID (convert to snake_case)
    const novelId = name.toLowerCase()
        .replace(/[\s-]/g, '_')
        .replace(/[\'’]/g, '')
        .replace(/[^a-z0-9_]/g, '');
    
    return { title, author, novelId };
}

// Process novel content
function processNovelContent(content) {
    // Split into paragraphs
    let paragraphs = content.split(/\n\s*\n/);
    
    // Clean paragraphs
    paragraphs = paragraphs
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0)
        .slice(0, 20); // Take first 20 paragraphs for initial display
    
    return paragraphs;
}

// Update script.js with new novels data
function updateScriptJs(novels) {
    // Read current script.js
    let scriptContent = fs.readFileSync(SCRIPT_PATH, 'utf8');
    
    // Generate novels object string
    const novelsString = JSON.stringify(novels, null, 4);
    
    // Replace the novels object in script.js
    const updatedContent = scriptContent.replace(
        /const novels = \{[\s\S]*?\};/,
        `const novels = ${novelsString};`
    );
    
    // Write back to script.js
    fs.writeFileSync(SCRIPT_PATH, updatedContent, 'utf8');
    
    console.log('Updated script.js with new novels data.');
}

// Function to generate HTML for novel list items
function generateNovelListHTML() {
    console.log('Generating novel list HTML...');
    
    // Read files from novels folder
    const files = fs.readdirSync(NOVELS_FOLDER);
    const txtFiles = files.filter(file => file.endsWith('.txt'));
    
    let html = '';
    
    txtFiles.forEach(file => {
        const { title, author, novelId } = extractNovelInfo(file);
        
        html += `        <div class="novel-item" data-novel="${novelId}">
            <h3>${title}</h3>
            <p>${author}</p>
        </div>
`;
    });
    
    console.log('Generated novel list HTML:');
    console.log(html);
    
    return html;
}

// Main function
function main() {
    importNovels();
    generateNovelListHTML();
}

// Run if script is executed directly
if (require.main === module) {
    main();
}

module.exports = { importNovels, generateNovelListHTML };