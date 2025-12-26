const fs = require('fs');
const path = require('path');

// Main function to create a clean webnovels.html file
function createCleanWebnovels() {
    try {
        // Read all article HTML files from the articles directory
        const articlesDir = path.join(__dirname, 'articles');
        const articleFiles = fs.readdirSync(articlesDir).filter(function(file) { return file.endsWith('.html'); });
        console.log('Found', articleFiles.length, 'article HTML files');

        // Extract article data from each HTML file
        const articles = [];
        articleFiles.forEach(function(file) {
            try {
                const filePath = path.join(articlesDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                
                // Extract title from the HTML file
                const titleMatch = content.match(/<h1 class="article-title">(.*?)<\/h1>/);
                const title = titleMatch ? titleMatch[1] : 'Untitled Article';
                
                // Extract paragraphs for tag extraction
                const paragraphMatches = content.match(/<div class="english-text">(.*?)<\/div>/g) || [];
                const paragraphs = paragraphMatches.map(function(para) {
                    return para.replace(/<div class="english-text">(.*?)<\/div>/, '$1').trim();
                });
                
                articles.push({
                    filename: file,
                    title: title,
                    paragraphs: paragraphs
                });
            } catch (error) {
                console.error('Error reading article file', file, ':', error.message);
            }
        });

        console.log('Extracted data from', articles.length, 'article files');

        // Function to extract tags from article title and content
        function extractTags(title, paragraphs) {
            const tags = ['ai']; // Default tag
            const content = title + ' ' + paragraphs.join(' ').toLowerCase();
            
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
            return Array.from(new Set(tags));
        }

        // Generate properly formatted articles HTML with closing tags
        let articlesHTML = '';
        articles.forEach(function(article) {
            const tags = extractTags(article.title, article.paragraphs);
            let tagHTML = '';
            tags.forEach(function(tag) {
                tagHTML += '<span class="article-tag">' + tag + '</span> ';
            });
            articleHTML = '                    <div class="webnovel-article" data-tags="' + tags.join(' ') + '">\n' +
                          '                        <h2 class="webnovel-title">\n' +
                          '                            <a href="articles/' + article.filename + '" class="webnovel-title-link">\n' +
                          '                                ' + article.title + '\n' +
                          '                            </a>\n' +
                          '                        </h2>\n' +
                          '                        <div class="article-tags">\n' +
                          '                            ' + tagHTML.trim() + '\n' +
                          '                        </div>\n' +
                          '                    </div>';
            articlesHTML += articleHTML + '\n';
        });

        // Extract all unique tags from articles for sidebar
        const allTags = [];
        const tagSet = new Set();
        articles.forEach(function(article) {
            const tags = extractTags(article.title, article.paragraphs);
            tags.forEach(function(tag) {
                tagSet.add(tag);
            });
        });
        Array.from(tagSet).forEach(function(tag) {
            allTags.push(tag);
        });
        
        // Create tag buttons HTML
        let tagButtonsHTML = '';
        allTags.forEach(function(tag) {
            tagButtonsHTML += '                    <button class="tag-btn" data-tag="' + tag + '">' + tag + '</button>\n';
        });

        // Create the complete HTML structure from scratch
        const completeHTML = '<!DOCTYPE html>\n' +
'<html lang="zh">\n' +
'<head>\n' +
'    <meta charset="UTF-8">\n' +
'    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'    <title>网文 - English Novel Reader</title>\n' +
'    <link rel="stylesheet" href="styles.css">\n' +
'    <style>\n' +
'        /* Additional styles for webnovels */\n' +
'        body {\n' +
'            font-family: \'Microsoft YaHei\', sans-serif;\n' +
'        }\n' +
'        \n' +
'        .webnovel-content {\n' +
'            background-color: #fff;\n' +
'            padding: 20px;\n' +
'            border-radius: 8px;\n' +
'            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);\n' +
'            min-height: 600px;\n' +
'            overflow-x: hidden;\n' +
'            word-wrap: break-word;\n' +
'        }\n' +
'        \n' +
'        /* Ensure all elements wrap correctly on mobile */\n' +
'        .webnovel-title-link {\n' +
'            word-wrap: break-word;\n' +
'            overflow-wrap: break-word;\n' +
'            word-break: break-word;\n' +
'            display: block;\n' +
'        }\n' +
'        \n' +
'        .article-tags {\n' +
'            display: flex;\n' +
'            gap: 8px;\n' +
'            margin-top: 15px;\n' +
'            flex-wrap: wrap;\n' +
'        }\n' +
'        \n' +
'        /* Responsive adjustments for mobile */\n' +
'        @media (max-width: 768px) {\n' +
'            .main-content {\n' +
'                padding: 10px;\n' +
'            }\n' +
'            \n' +
'            .webnovel-content {\n' +
'                padding: 15px;\n' +
'            }\n' +
'            \n' +
'            .tags-sidebar {\n' +
'                gap: 6px;\n' +
'                padding: 10px 0;\n' +
'            }\n' +
'            \n' +
'            .tag-btn {\n' +
'                font-size: 0.8rem;\n' +
'                padding: 3px 8px;\n' +
'            }\n' +
'            \n' +
'            .webnovel-title-link {\n' +
'                font-size: 1.1rem;\n' +
'            }\n' +
'            \n' +
'            .article-tag {\n' +
'                font-size: 0.75rem;\n' +
'                padding: 3px 10px;\n' +
'            }\n' +
'        }\n' +
'        \n' +
'        /* Tags Styles */\n' +
'        .tags-sidebar {\n' +
'            display: flex;\n' +
'            flex-direction: row;\n' +
'            gap: 8px;\n' +
'            flex-wrap: wrap;\n' +
'            align-items: center;\n' +
'            margin-bottom: 20px;\n' +
'            padding: 15px 0;\n' +
'            border-bottom: 1px solid #eee;\n' +
'        }\n' +
'        \n' +
'        .tag-btn {\n' +
'            background-color: #f8f9fa;\n' +
'            color: #6c757d;\n' +
'            border: 1px solid #dee2e6;\n' +
'            padding: 4px 12px;\n' +
'            border-radius: 15px;\n' +
'            cursor: pointer;\n' +
'            font-size: 0.8rem;\n' +
'            transition: all 0.3s ease;\n' +
'            font-family: \'Microsoft YaHei\', sans-serif;\n' +
'            text-align: center;\n' +
'            display: inline-block;\n' +
'            width: auto;\n' +
'            min-width: auto;\n' +
'            white-space: nowrap;\n' +
'        }\n' +
'        \n' +
'        .tag-btn:hover {\n' +
'            background-color: #e9ecef;\n' +
'            border-color: #d4a76a;\n' +
'            color: #5a3e2b;\n' +
'        }\n' +
'        \n' +
'        .tag-btn.active {\n' +
'            background-color: rgba(212, 167, 106, 0.2);\n' +
'            border-color: #d4a76a;\n' +
'            color: #5a3e2b;\n' +
'            font-weight: bold;\n' +
'        }\n' +
'        \n' +
'        .webnovel-article {\n' +
'            margin-bottom: 20px;\n' +
'            padding-bottom: 15px;\n' +
'            border-bottom: 1px solid #eee;\n' +
'        }\n' +
'        \n' +
'        .webnovel-article:last-child {\n' +
'            border-bottom: none;\n' +
'            margin-bottom: 0;\n' +
'            padding-bottom: 0;\n' +
'        }\n' +
'        \n' +
'        .webnovel-title {\n' +
'            margin-bottom: 10px;\n' +
'        }\n' +
'        \n' +
'        .webnovel-title-link {\n' +
'            color: #5a3e2b;\n' +
'            text-decoration: none;\n' +
'            font-size: 1.2rem;\n' +
'            transition: color 0.3s ease;\n' +
'            font-weight: bold;\n' +
'            font-family: Georgia, serif;\n' +
'            word-wrap: break-word;\n' +
'            overflow-wrap: break-word;\n' +
'            word-break: break-word;\n' +
'        }\n' +
'        \n' +
'        .webnovel-title-link:hover {\n' +
'            color: #17a2b8;\n' +
'        }\n' +
'        \n' +
'        /* Article Tags */\n' +
'        .article-tags {\n' +
'            display: flex;\n' +
'            gap: 8px;\n' +
'            margin-top: 15px;\n' +
'        }\n' +
'        \n' +
'        .article-tag {\n' +
'            background-color: #f8f9fa;\n' +
'            color: #6c757d;\n' +
'            padding: 4px 12px;\n' +
'            border-radius: 15px;\n' +
'            font-size: 0.8rem;\n' +
'            border: 1px solid #dee2e6;\n' +
'        }\n' +
'        \n' +
'        /* Pagination Styles */\n' +
'        .pagination {\n' +
'            display: flex;\n' +
'            justify-content: center;\n' +
'            align-items: center;\n' +
'            margin-top: 30px;\n' +
'            padding: 20px 0;\n' +
'        }\n' +
'        \n' +
'        .pagination-btn {\n' +
'            background-color: #5a3e2b;\n' +
'            color: #fff;\n' +
'            border: none;\n' +
'            padding: 8px 16px;\n' +
'            border-radius: 4px;\n' +
'            cursor: pointer;\n' +
'            font-size: 1rem;\n' +
'            transition: all 0.3s ease;\n' +
'            margin: 0 5px;\n' +
'        }\n' +
'        \n' +
'        .pagination-btn:hover {\n' +
'            background-color: #7a5c42;\n' +
'        }\n' +
'        \n' +
'        .pagination-btn:disabled {\n' +
'            background-color: #ccc;\n' +
'            cursor: not-allowed;\n' +
'        }\n' +
'        \n' +
'        .page-input-container {\n' +
'            display: flex;\n' +
'            align-items: center;\n' +
'            gap: 8px;\n' +
'            margin: 0 15px;\n' +
'        }\n' +
'        \n' +
'        .page-input {\n' +
'            width: 60px;\n' +
'            padding: 5px 8px;\n' +
'            border: 1px solid #d4a76a;\n' +
'            border-radius: 4px;\n' +
'            font-size: 0.9rem;\n' +
'            text-align: center;\n' +
'        }\n' +
'    </style>\n' +
'</head>\n' +
'<body>\n' +
'    <!-- Top Navigation -->\n' +
'    <nav class="top-nav">\n' +
'        <ul>\n' +
'            <li><a href="novels.html">小说</a></li>\n' +
'            <li><a href="webnovels.html" class="active">网文</a></li>\n' +
'            <li><a href="about.html">关于我</a></li>\n' +
'        </ul>\n' +
'    </nav>\n' +
'    \n' +
'    <div class="container">\n' +
'        <!-- Main Content -->\n' +
'        <div class="main-content" style="width: 100%; margin-left: 0;">\n' +
'            <header>\n' +
'                <h1 id="novelTitle">Ai洞察库</h1>\n' +
'                <p id="novelAuthor">精选AI相关文章</p>\n' +
'                <!-- Webnovel Tags - Moved from sidebar -->\n' +
'                <div class="tags-sidebar">\n' +
'                    <button class="tag-btn active" data-tag="all">全部</button>\n' +
'                    <button class="tag-btn" data-tag="latest">最新</button>\n' +
                    tagButtonsHTML +
'                </div>\n' +
'            </header>\n' +
'            \n' +
'            <main>\n' +
'                <div class="webnovel-content" id="webnovelContent">\n' +
                    articlesHTML +
'                </div>\n' +
'            </main>\n' +
'        </div>\n' +
'    </div>\n' +
'    \n' +
'    <script>\n' +
'        // DOM Elements\n' +
'        const webnovelContent = document.getElementById("webnovelContent");\n' +
'        const tagButtons = document.querySelectorAll(".tag-btn");\n' +
'        \n' +
'        // Pagination settings\n' +
'        const articlesPerPage = 20;\n' +
'        let currentPage = 1;\n' +
'        let filteredArticles = [];\n' +
'        const selectedTags = new Set();\n' +
'        \n' +
'        // Initialize the application when DOM is loaded\n' +
'        document.addEventListener("DOMContentLoaded", init);\n' +
'        \n' +
'        // Main initialization function\n' +
'        function init() {\n' +
'            // Add tags filter functionality\n' +
'            addTagsFilter();\n' +
'            // Initialize articles\n' +
'            initializeArticles();\n' +
'        }\n' +
'        \n' +
'        // Initialize articles for filtering and pagination\n' +
'        function initializeArticles() {\n' +
'            filterArticles();\n' +
'        }\n' +
'        \n' +
'        // Add tags filter functionality\n' +
'        function addTagsFilter() {\n' +
'            tagButtons.forEach(function(button) {\n' +
'                button.addEventListener("click", function() {\n' +
'                    const tag = button.dataset.tag;\n' +
'                    \n' +
'                    // Handle "all" tag specially\n' +
'                    if (tag === "all") {\n' +
'                        // Clear all selected tags and show all articles\n' +
'                        selectedTags.clear();\n' +
'                        tagButtons.forEach(function(btn) { btn.classList.remove("active"); });\n' +
'                        button.classList.add("active");\n' +
'                    } else if (tag === "latest") {\n' +
'                        // Handle "latest" tag specially\n' +
'                        selectedTags.clear();\n' +
'                        tagButtons.forEach(function(btn) { btn.classList.remove("active"); });\n' +
'                        button.classList.add("active");\n' +
'                    } else {\n' +
'                        // Toggle the tag in selectedTags set\n' +
'                        if (selectedTags.has(tag)) {\n' +
'                            selectedTags.delete(tag);\n' +
'                            button.classList.remove("active");\n' +
'                        } else {\n' +
'                            selectedTags.add(tag);\n' +
'                            button.classList.add("active");\n' +
'                        }\n' +
'                        \n' +
'                        // Remove "all" and "latest" active state if any tags are selected\n' +
'                        tagButtons.forEach(function(btn) {\n' +
'                            if (btn.dataset.tag === "all" || btn.dataset.tag === "latest") {\n' +
'                                btn.classList.remove("active");\n' +
'                            }\n' +
'                        });\n' +
'                        \n' +
'                        // If no tags selected, activate "all"\n' +
'                        if (selectedTags.size === 0) {\n' +
'                            tagButtons.forEach(function(btn) {\n' +
'                                if (btn.dataset.tag === "all") {\n' +
'                                    btn.classList.add("active");\n' +
'                                }\n' +
'                            });\n' +
'                        }\n' +
'                    }\n' +
'                    \n' +
'                    // Reset to first page when filters change\n' +
'                    currentPage = 1;\n' +
'                    // Filter articles based on selected tags\n' +
'                    filterArticles();\n' +
'                });\n' +
'            });\n' +
'        }\n' +
'        \n' +
'        // Filter articles by selected tags\n' +
'        function filterArticles() {\n' +
'            const allArticles = Array.from(document.querySelectorAll(".webnovel-article"));\n' +
'            \n' +
'            // Filter articles based on selected tags\n' +
'            filteredArticles = allArticles.filter(function(article) {\n' +
'                const articleTags = article.dataset.tags.split(" ");\n' +
'                let shouldShow = false;\n' +
'                \n' +
'                // Check if "all" is active\n' +
'                const allButton = document.querySelector('.tag-btn[data-tag="all"].active');\n' +
'                if (allButton) {\n' +
'                    shouldShow = true;\n' +
'                } \n' +
'                // Check if "latest" is active (for now, show all articles)\n' +
'                else if (document.querySelector('.tag-btn[data-tag="latest"].active')) {\n' +
'                    shouldShow = true;\n' +
'                }\n' +
'                // Check if article has all selected tags\n' +
'                else if (selectedTags.size > 0) {\n' +
'                    // Article should have all selected tags\n' +
'                    shouldShow = Array.from(selectedTags).every(function(tag) {\n' +
'                        return articleTags.includes(tag);\n' +
'                    });\n' +
'                } else {\n' +
'                    // No tags selected, show all\n' +
'                    shouldShow = true;\n' +
'                }\n' +
'                \n' +
'                return shouldShow;\n' +
'            });\n' +
'            \n' +
'            // Render the filtered articles with pagination\n' +
'            renderArticles();\n' +
'            // Update pagination controls\n' +
'            renderPagination();\n' +
'        }\n' +
'        \n' +
'        // Render articles for the current page\n' +
'        function renderArticles() {\n' +
'            const allArticles = document.querySelectorAll(".webnovel-article");\n' +
'            \n' +
'            // Hide all articles first\n' +
'            allArticles.forEach(function(article) {\n' +
'                article.style.display = "none";\n' +
'            });\n' +
'            \n' +
'            // Calculate start and end indices for current page\n' +
'            const startIndex = (currentPage - 1) * articlesPerPage;\n' +
'            const endIndex = startIndex + articlesPerPage;\n' +
'            \n' +
'            // Show only the articles for the current page\n' +
'            const articlesToShow = filteredArticles.slice(startIndex, endIndex);\n' +
'            articlesToShow.forEach(function(article) {\n' +
'                article.style.display = "block";\n' +
'            });\n' +
'        }\n' +
'        \n' +
'        // Render pagination controls\n' +
'        function renderPagination() {\n' +
'            // Calculate total pages\n' +
'            const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);\n' +
'            \n' +
'            // Check if pagination container exists, if not create it\n' +
'            let paginationContainer = document.getElementById("pagination");\n' +
'            if (!paginationContainer) {\n' +
'                paginationContainer = document.createElement("div");\n' +
'                paginationContainer.id = "pagination";\n' +
'                paginationContainer.className = "pagination";\n' +
'                webnovelContent.parentNode.appendChild(paginationContainer);\n' +
'            }\n' +
'            \n' +
'            // Clear existing pagination controls\n' +
'            paginationContainer.innerHTML = "";\n' +
'            \n' +
'            // Create previous button\n' +
'            const prevButton = document.createElement("button");\n' +
'            prevButton.textContent = "上一页";\n' +
'            prevButton.className = "pagination-btn";\n' +
'            prevButton.disabled = currentPage === 1;\n' +
'            prevButton.addEventListener("click", function() {\n' +
'                if (currentPage > 1) {\n' +
'                    currentPage--;\n' +
'                    renderArticles();\n' +
'                    renderPagination();\n' +
'                }\n' +
'            });\n' +
'            paginationContainer.appendChild(prevButton);\n' +
'            \n' +
'            // Create page input container\n' +
'            const pageInputContainer = document.createElement("div");\n' +
'            pageInputContainer.className = "page-input-container";\n' +
'            pageInputContainer.style.display = "flex";\n' +
'            pageInputContainer.style.alignItems = "center";\n' +
'            pageInputContainer.style.gap = "8px";\n' +
'            pageInputContainer.style.margin = "0 15px";\n' +
'            \n' +
'            // Create page input label\n' +
'            const pageLabel = document.createElement("span");\n' +
'            pageLabel.textContent = "第";\n' +
'            pageLabel.style.color = "#5a3e2b";\n' +
'            pageLabel.style.fontWeight = "bold";\n' +
'            pageInputContainer.appendChild(pageLabel);\n' +
'            \n' +
'            // Create page input box\n' +
'            const pageInput = document.createElement("input");\n' +
'            pageInput.type = "number";\n' +
'            pageInput.className = "page-input";\n' +
'            pageInput.value = currentPage;\n' +
'            pageInput.min = "1";\n' +
'            pageInput.max = totalPages;\n' +
'            pageInput.style.width = "60px";\n' +
'            pageInput.style.padding = "5px 8px";\n' +
'            pageInput.style.border = "1px solid #d4a76a";\n' +
'            pageInput.style.borderRadius = "4px";\n' +
'            pageInput.style.fontSize = "0.9rem";\n' +
'            pageInput.style.textAlign = "center";\n' +
'            pageInput.addEventListener("keypress", function(e) {\n' +
'                if (e.key === "Enter") {\n' +
'                    const pageNum = parseInt(pageInput.value);\n' +
'                    if (pageNum >= 1 && pageNum <= totalPages) {\n' +
'                        currentPage = pageNum;\n' +
'                        renderArticles();\n' +
'                        renderPagination();\n' +
'                    }\n' +
'                }\n' +
'            });\n' +
'            pageInputContainer.appendChild(pageInput);\n' +
'            \n' +
'            // Create page total label\n' +
'            const pageTotalLabel = document.createElement("span");\n' +
'            pageTotalLabel.textContent = "页 / 共 " + totalPages + " 页";\n' +
'            pageTotalLabel.style.color = "#5a3e2b";\n' +
'            pageTotalLabel.style.fontWeight = "bold";\n' +
'            pageInputContainer.appendChild(pageTotalLabel);\n' +
'            \n' +
'            paginationContainer.appendChild(pageInputContainer);\n' +
'            \n' +
'            // Create next button\n' +
'            const nextButton = document.createElement("button");\n' +
'            nextButton.textContent = "下一页";\n' +
'            nextButton.className = "pagination-btn";\n' +
'            nextButton.disabled = currentPage === totalPages;\n' +
'            nextButton.addEventListener("click", function() {\n' +
'                if (currentPage < totalPages) {\n' +
'                    currentPage++;\n' +
'                    renderArticles();\n' +
'                    renderPagination();\n' +
'                }\n' +
'            });\n' +
'            paginationContainer.appendChild(nextButton);\n' +
'        }\n' +
'    </script>\n' +
'</body>\n' +
'</html>';

        // Write the complete HTML to webnovels.html
        const webnovelsPath = path.join(__dirname, 'webnovels.html');
        fs.writeFileSync(webnovelsPath, completeHTML, 'utf8');
        console.log('Successfully created a clean webnovels.html with', articles.length, 'unique articles');
        console.log('Total pages will be:', Math.ceil(articles.length / 20));
        
    } catch (error) {
        console.error('Error creating clean webnovels.html:', error);
        console.error('Stack trace:', error.stack);
    }
}

// Run the function
createCleanWebnovels();
