// Webnovel Pagination and Tag Filtering Script
// This script is specifically for the webnovels.html page

// Article pagination configuration
const ARTICLE_PAGINATION = {
    currentPage: 1,
    articlesPerPage: 10,
    totalPages: 1,
    totalArticles: 0,
    allArticles: [],
    filteredArticles: []
};

// Tag filtering configuration
const TAG_FILTER = {
    selectedTags: new Set(),
    allTagBtn: null,
    latestTagBtn: null
};

// Initialize article pagination when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initArticlePagination();
    initTagFiltering();
});

// Initialize article pagination
function initArticlePagination() {
    const webnovelContent = document.getElementById('webnovelContent');
    if (webnovelContent) {
        // Get all articles and filter out empty or invalid ones
        ARTICLE_PAGINATION.allArticles = Array.from(webnovelContent.querySelectorAll('.webnovel-article'))
            .filter(article => {
                // Check if article has a valid title link
                const titleLink = article.querySelector('.webnovel-title-link');
                return titleLink && titleLink.textContent.trim() !== '';
            });
        
        ARTICLE_PAGINATION.filteredArticles = [...ARTICLE_PAGINATION.allArticles];
        ARTICLE_PAGINATION.totalArticles = ARTICLE_PAGINATION.filteredArticles.length;
        ARTICLE_PAGINATION.totalPages = Math.max(1, Math.ceil(ARTICLE_PAGINATION.totalArticles / ARTICLE_PAGINATION.articlesPerPage));
        
        // Initialize pagination
        updateArticlePagination();
        
        // Add event listeners for pagination buttons
        addArticlePaginationListeners();
    }
}

// Initialize tag filtering
function initTagFiltering() {
    // Get all tag buttons
    const tagBtns = document.querySelectorAll('.tag-btn');
    
    // Store special tag buttons
    TAG_FILTER.allTagBtn = document.querySelector('.tag-btn[data-tag="all"]');
    TAG_FILTER.latestTagBtn = document.querySelector('.tag-btn[data-tag="latest"]');
    
    // Add event listeners to tag buttons
    tagBtns.forEach(btn => {
        btn.addEventListener('click', handleTagClick);
    });
}

// Handle tag button click
function handleTagClick(event) {
    const btn = event.target;
    const tag = btn.dataset.tag;
    
    // Handle special tags
    if (tag === 'all') {
        // Clear all selected tags and select 'all'
        clearAllTags();
        btn.classList.add('active');
        TAG_FILTER.selectedTags.clear();
    } else if (tag === 'latest') {
        // For 'latest' tag, just toggle it (not implemented yet)
        toggleTagBtn(btn, tag);
    } else {
        // For regular tags, toggle selection
        toggleTagBtn(btn, tag);
        
        // Remove 'all' tag selection if any regular tag is selected
        if (TAG_FILTER.allTagBtn && TAG_FILTER.selectedTags.size > 0) {
            TAG_FILTER.allTagBtn.classList.remove('active');
        }
        
        // Clear 'latest' tag if any regular tag is selected
        if (TAG_FILTER.latestTagBtn && TAG_FILTER.selectedTags.size > 0) {
            TAG_FILTER.latestTagBtn.classList.remove('active');
        }
    }
    
    // Apply filter
    applyTagFilter();
}

// Toggle tag button state
function toggleTagBtn(btn, tag) {
    if (btn.classList.contains('active')) {
        // Deselect tag
        btn.classList.remove('active');
        TAG_FILTER.selectedTags.delete(tag);
        
        // If no tags selected, select 'all'
        if (TAG_FILTER.selectedTags.size === 0 && TAG_FILTER.allTagBtn) {
            TAG_FILTER.allTagBtn.classList.add('active');
        }
    } else {
        // Select tag
        btn.classList.add('active');
        TAG_FILTER.selectedTags.add(tag);
    }
}

// Clear all tag selections
function clearAllTags() {
    const tagBtns = document.querySelectorAll('.tag-btn');
    tagBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    TAG_FILTER.selectedTags.clear();
}

// Apply tag filter to articles
function applyTagFilter() {
    const webnovelContent = document.getElementById('webnovelContent');
    if (!webnovelContent) return;
    
    // Reset to first page
    ARTICLE_PAGINATION.currentPage = 1;
    
    // If 'all' tag is selected, show all valid articles
    if (TAG_FILTER.allTagBtn && TAG_FILTER.allTagBtn.classList.contains('active')) {
        ARTICLE_PAGINATION.filteredArticles = [...ARTICLE_PAGINATION.allArticles];
    } else {
        // Filter articles by selected tags
        ARTICLE_PAGINATION.filteredArticles = ARTICLE_PAGINATION.allArticles.filter(article => {
            const articleTags = article.dataset.tags.split(' ');
            
            // If no tags selected, show all articles
            if (TAG_FILTER.selectedTags.size === 0) {
                return true;
            }
            
            // Check if article has all selected tags
            for (const tag of TAG_FILTER.selectedTags) {
                if (!articleTags.includes(tag)) {
                    return false;
                }
            }
            return true;
        });
    }
    
    // Update pagination
    ARTICLE_PAGINATION.totalArticles = ARTICLE_PAGINATION.filteredArticles.length;
    ARTICLE_PAGINATION.totalPages = Math.max(1, Math.ceil(ARTICLE_PAGINATION.totalArticles / ARTICLE_PAGINATION.articlesPerPage));
    
    // Update display
    updateArticlePagination();
}

// Update article pagination display
function updateArticlePagination() {
    const webnovelContent = document.getElementById('webnovelContent');
    if (!webnovelContent) return;
    
    // Calculate start and end indices
    const startIndex = (ARTICLE_PAGINATION.currentPage - 1) * ARTICLE_PAGINATION.articlesPerPage;
    const endIndex = startIndex + ARTICLE_PAGINATION.articlesPerPage;
    
    // Show/hide all articles - first hide all
    ARTICLE_PAGINATION.allArticles.forEach(article => {
        article.style.display = 'none';
    });
    
    // Then show only filtered articles on current page
    ARTICLE_PAGINATION.filteredArticles.slice(startIndex, endIndex).forEach(article => {
        article.style.display = 'block';
    });
    
    // Update pagination controls
    updateArticlePaginationControls();
}

// Update article pagination controls
function updateArticlePaginationControls() {
    // Update total pages display
    const totalPagesElement = document.getElementById('totalPages');
    if (totalPagesElement) {
        totalPagesElement.textContent = ARTICLE_PAGINATION.totalPages;
    }
    
    // Update page input value
    const pageInput = document.getElementById('pageInput');
    if (pageInput) {
        pageInput.value = ARTICLE_PAGINATION.currentPage;
    }
    
    // Update button states
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    
    if (prevPageBtn) {
        prevPageBtn.disabled = ARTICLE_PAGINATION.currentPage === 1;
    }
    
    if (nextPageBtn) {
        nextPageBtn.disabled = ARTICLE_PAGINATION.currentPage === ARTICLE_PAGINATION.totalPages;
    }
}

// Add article pagination event listeners
function addArticlePaginationListeners() {
    // Previous page button
    const prevPageBtn = document.getElementById('prevPage');
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', goToPrevArticlePage);
    }
    
    // Next page button
    const nextPageBtn = document.getElementById('nextPage');
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', goToNextArticlePage);
    }
    
    // Page input
    const pageInput = document.getElementById('pageInput');
    if (pageInput) {
        pageInput.addEventListener('change', goToArticlePage);
        pageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                goToArticlePage.call(pageInput);
            }
        });
    }
}

// Go to previous article page
function goToPrevArticlePage() {
    if (ARTICLE_PAGINATION.currentPage > 1) {
        ARTICLE_PAGINATION.currentPage--;
        updateArticlePagination();
    }
}

// Go to next article page
function goToNextArticlePage() {
    if (ARTICLE_PAGINATION.currentPage < ARTICLE_PAGINATION.totalPages) {
        ARTICLE_PAGINATION.currentPage++;
        updateArticlePagination();
    }
}

// Go to specific article page
function goToArticlePage() {
    const pageInput = document.getElementById('pageInput');
    if (!pageInput) return;
    
    let page = parseInt(pageInput.value);
    if (isNaN(page)) page = 1;
    
    // Ensure page is within bounds
    page = Math.max(1, Math.min(page, ARTICLE_PAGINATION.totalPages));
    
    ARTICLE_PAGINATION.currentPage = page;
    updateArticlePagination();
}