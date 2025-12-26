// Novel Reader with Enhanced Features
// Features: Novel selection, pagination, click-to-translate near cursor

// Global variables
let currentNovelId = 'jane_eyre';
let currentPage = 1;
let paragraphsPerPage = 10;
let totalPages = 1;
let allParagraphs = [];
let selectedParagraph = null;

// Translation API (using free MyMemory API)
const TRANSLATION_API = 'https://api.mymemory.translated.net/get';

// DOM elements
let novelContent, novelTitle, novelAuthor, translationTooltip;
let prevBtn, nextBtn, pageInput, totalPagesSpan;

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    novelContent = document.getElementById('novelContent');
    novelTitle = document.getElementById('novelTitle');
    novelAuthor = document.getElementById('novelAuthor');
    translationTooltip = document.getElementById('translationTooltip');
    prevBtn = document.getElementById('prevBtn');
    nextBtn = document.getElementById('nextBtn');
    pageInput = document.getElementById('pageInput');
    totalPagesSpan = document.getElementById('totalPages');
    
    // Load default novel
    loadNovel(currentNovelId);
    
    // Add event listeners for novel selection buttons
    document.querySelectorAll('.novel-selector-btn').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('.novel-selector-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Load the selected novel
            const novelId = this.dataset.novel;
            loadNovel(novelId);
        });
    });
    
    // Add click listener to close tooltip when clicking outside
    document.addEventListener('click', function(e) {
        // Check if click is outside tooltip and not on a selectable paragraph
        if (translationTooltip && 
            !translationTooltip.contains(e.target) && 
            !e.target.classList.contains('selectable')) {
            hideTranslation();
        }
    });
});

// Load novel content
function loadNovel(novelId) {
    currentNovelId = novelId;
    currentPage = 1;
    
    // Get novel data from NOVELS_DATA (loaded from novels_data.js)
    const novel = NOVELS_DATA[novelId];
    
    if (!novel) {
        console.error('Novel not found:', novelId);
        return;
    }
    
    // Update title and author
    novelTitle.textContent = novel.title;
    novelAuthor.textContent = 'By ' + novel.author;
    
    // Store all paragraphs
    allParagraphs = novel.content;
    
    // Calculate total pages
    totalPages = Math.ceil(allParagraphs.length / paragraphsPerPage);
    
    // Update pagination
    updatePagination();
    
    // Display first page
    displayPage(1);
}

// Display specific page
function displayPage(page) {
    if (page < 1 || page > totalPages) {
        return;
    }
    
    currentPage = page;
    
    // Calculate paragraph range for this page
    const startIdx = (page - 1) * paragraphsPerPage;
    const endIdx = Math.min(startIdx + paragraphsPerPage, allParagraphs.length);
    
    // Clear current content
    novelContent.innerHTML = '';
    
    // Add paragraphs for this page
    for (let i = startIdx; i < endIdx; i++) {
        const p = document.createElement('p');
        const span = document.createElement('span');
        span.className = 'selectable';
        span.textContent = allParagraphs[i];
        span.dataset.index = i;
        
        // Add click listener for translation
        span.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent document click from firing
            handleParagraphClick(this, e);
        });
        
        p.appendChild(span);
        novelContent.appendChild(p);
    }
    
    // Update pagination controls
    updatePagination();
    
    // Scroll to top of content
    novelContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Update pagination controls
function updatePagination() {
    // Update page input
    pageInput.value = currentPage;
    pageInput.max = totalPages;
    
    // Update total pages display
    totalPagesSpan.textContent = `/ ${totalPages} 页`;
    
    // Enable/disable buttons
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    // Update button styles
    if (currentPage === 1) {
        prevBtn.style.opacity = '0.5';
        prevBtn.style.cursor = 'not-allowed';
    } else {
        prevBtn.style.opacity = '1';
        prevBtn.style.cursor = 'pointer';
    }
    
    if (currentPage === totalPages) {
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
    } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }
}

// Navigation functions
function goToPrevPage() {
    if (currentPage > 1) {
        displayPage(currentPage - 1);
    }
}

function goToNextPage() {
    if (currentPage < totalPages) {
        displayPage(currentPage + 1);
    }
}

function goToPage() {
    const page = parseInt(pageInput.value);
    if (page >= 1 && page <= totalPages) {
        displayPage(page);
    } else {
        alert(`请输入 1 到 ${totalPages} 之间的页码`);
        pageInput.value = currentPage;
    }
}

// Handle paragraph click for translation
function handleParagraphClick(element, event) {
    // Remove previous selection
    if (selectedParagraph) {
        selectedParagraph.classList.remove('selected');
    }
    
    // Mark as selected
    element.classList.add('selected');
    selectedParagraph = element;
    
    // Get the text to translate
    const textToTranslate = element.textContent;
    
    // Position tooltip near the click
    positionTooltip(event);
    
    // Show tooltip with loading state
    showTranslation(textToTranslate);
    
    // Fetch translation
    translateText(textToTranslate);
}

// Position tooltip near cursor but ensure it stays on screen
function positionTooltip(event) {
    const tooltip = translationTooltip;
    const offset = 15; // Offset from cursor
    
    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Initial position near cursor
    let left = event.pageX + offset;
    let top = event.pageY + offset;
    
    // Show tooltip temporarily to get its dimensions
    tooltip.style.display = 'block';
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    
    // Get tooltip dimensions
    const tooltipRect = tooltip.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;
    
    // Adjust if tooltip goes off right edge
    if (event.clientX + tooltipWidth + offset > viewportWidth) {
        left = event.pageX - tooltipWidth - offset;
    }
    
    // Adjust if tooltip goes off bottom edge
    if (event.clientY + tooltipHeight + offset > viewportHeight) {
        top = event.pageY - tooltipHeight - offset;
    }
    
    // Ensure tooltip doesn't go off left or top edges
    if (left < 10) left = 10;
    if (top < 80) top = 80; // Account for top nav
    
    // Set final position
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

// Show translation tooltip
function showTranslation(originalText) {
    const translationDiv = translationTooltip.querySelector('.tooltip-translation');
    
    // Show loading state
    translationDiv.textContent = '翻译中...';
    translationDiv.style.color = '#999';
    
    // Show tooltip
    translationTooltip.style.display = 'block';
}

// Hide translation tooltip
function hideTranslation() {
    translationTooltip.style.display = 'none';
    if (selectedParagraph) {
        selectedParagraph.classList.remove('selected');
        selectedParagraph = null;
    }
}

// Translate text using free API
async function translateText(text) {
    const translationDiv = translationTooltip.querySelector('.tooltip-translation');
    
    // Limit text length for API (MyMemory has a 500 character limit)
    const textToTranslate = text.length > 500 ? text.substring(0, 500) : text;
    
    // If text is too long, split it into chunks
    const maxChunkLength = 500; // MyMemory API limit
    
    if (text.length <= maxChunkLength) {
        // Short text - translate directly
        try {
            const url = `${TRANSLATION_API}?q=${encodeURIComponent(text)}&langpair=en|zh-CN`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData) {
                const translation = data.responseData.translatedText;
                translationDiv.textContent = translation;
                translationDiv.style.color = '#5a3e2b';
            } else {
                translationDiv.textContent = '翻译失败,请稍后重试';
                translationDiv.style.color = '#d9534f';
            }
        } catch (error) {
            console.error('Translation error:', error);
            translationDiv.textContent = '翻译服务暂时不可用';
            translationDiv.style.color = '#d9534f';
        }
    } else {
        // Long text - split into chunks and translate each chunk
        try {
            // Split text into chunks of maxChunkLength, trying to break at sentence boundaries
            const chunks = [];
            let currentChunk = '';
            
            // First, try to split by sentence endings
            const sentences = text.match(/[^.!?。！？]+[.!?。！？]*/g) || [text];
            
            for (const sentence of sentences) {
                if ((currentChunk + sentence).length <= maxChunkLength) {
                    currentChunk += sentence;
                } else {
                    if (currentChunk) {
                        chunks.push(currentChunk);
                    }
                    // If single sentence is too long, force split by maxChunkLength
                    if (sentence.length > maxChunkLength) {
                        for (let i = 0; i < sentence.length; i += maxChunkLength) {
                            chunks.push(sentence.substring(i, i + maxChunkLength));
                        }
                        currentChunk = '';
                    } else {
                        currentChunk = sentence;
                    }
                }
            }
            
            if (currentChunk) {
                chunks.push(currentChunk);
            }
            
            // Translate each chunk
            let fullTranslation = '';
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const url = `${TRANSLATION_API}?q=${encodeURIComponent(chunk)}&langpair=en|zh-CN`;
                const response = await fetch(url);
                const data = await response.json();
                
                if (data.responseStatus === 200 && data.responseData) {
                    fullTranslation += data.responseData.translatedText;
                    // Update display with progress
                    translationDiv.textContent = fullTranslation + ' [翻译中...]';
                } else {
                    fullTranslation += '[翻译失败]';
                }
                
                // Add small delay to avoid rate limiting
                if (i < chunks.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
            }
            
            translationDiv.textContent = fullTranslation;
            translationDiv.style.color = '#5a3e2b';
        } catch (error) {
            console.error('Translation error:', error);
            translationDiv.textContent = '翻译服务暂时不可用';
            translationDiv.style.color = '#d9534f';
        }
    }
}

// Add CSS for selected state
const style = document.createElement('style');
style.textContent = `
    .selectable {
        cursor: pointer;
        transition: background-color 0.2s ease;
        padding: 2px 4px;
        border-radius: 3px;
    }
    
    .selectable:hover {
        background-color: rgba(212, 167, 106, 0.2);
    }
    
    .selectable.selected {
        background-color: rgba(212, 167, 106, 0.4);
    }
    
    .pagination-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed !important;
    }
    
    .translation-tooltip {
        animation: fadeIn 0.2s ease;
    }
    
    /* Novel selector button styles */
    .novel-selector-btn {
        background-color: #f8f9fa;
        border: 1px solid #dee2e6;
        color: #6c757d;
        padding: 8px 20px;
        border-radius: 15px;
        cursor: pointer;
        font-size: 0.9rem;
        font-family: 'Microsoft YaHei', sans-serif;
        transition: all 0.3s ease;
    }
    
    .novel-selector-btn:hover {
        background-color: #e9ecef;
        border-color: #d4a76a;
        color: #5a3e2b;
    }
    
    .novel-selector-btn.active {
        background-color: rgba(212, 167, 106, 0.2);
        border-color: #d4a76a;
        color: #5a3e2b;
        font-weight: bold;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-5px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);