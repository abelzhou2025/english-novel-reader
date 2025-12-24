// DOM Elements
const novelSidebar = document.getElementById('novelSidebar');
const toggleSidebar = document.getElementById('toggleSidebar');
const novelList = document.getElementById('novelList');
const novelTitle = document.getElementById('novelTitle');
const novelAuthor = document.getElementById('novelAuthor');
const novelContent = document.getElementById('novelContent');
const translationPopup = document.getElementById('translationPopup');
const closeBtn = document.getElementById('closeBtn');
const originalText = document.getElementById('originalText');
const translatedText = document.getElementById('translatedText');
const container = document.querySelector('.container');

// Pagination Elements (will be added to HTML)
let prevPageBtn = null;
let nextPageBtn = null;
let pageInfo = null;

// Pagination settings
const PAGINATION = {
    paragraphsPerPage: 10, // 每页显示10个段落
    currentPage: 1,
    totalPages: 1,
    currentNovelId: 'jane_eyre'
};

// Translation API Configuration
const API_CONFIG = {
    // Using a free translation API for demonstration
    // You can replace this with your preferred translation service
    url: 'https://api.mymemory.translated.net/get',
    params: {
        langpair: 'en|zh',
        de: 'example@example.com'
    }
};

// Novel Data - Modular management for easy expansion
const novels = {
    "gullivers_travels_into_several_remote_nations_of_the_world": {
        "title": "Gulliver's Travels into Several Remote Nations of the World",
        "author": "Unknown Author",
        "content": [
            "The Project Gutenberg eBook of Gulliver's Travels into Several Remote Nations of the World",
            "This ebook is for the use of anyone anywhere in the United States and\r\nmost other parts of the world at no cost and with almost no restrictions\r\nwhatsoever. You may copy it, give it away or re-use it under the terms\r\nof the Project Gutenberg License included with this ebook or online\r\nat www.gutenberg.org. If you are not located in the United States,\r\nyou will have to check the laws of the country where you are located\r\nbefore using this eBook.",
            "Title: Gulliver's Travels into Several Remote Nations of the World",
            "Author: Jonathan Swift",
            "Release date: February 1, 1997 [eBook #829]\r\n                Most recently updated: April 6, 2025",
            "Language: English",
            "Credits: David Price",
            "*** START OF THE PROJECT GUTENBERG EBOOK GULLIVER'S TRAVELS INTO SEVERAL REMOTE NATIONS OF THE WORLD ***",
            "GULLIVER’S TRAVELS",
            "into several",
            "REMOTE NATIONS OF THE WORLD",
            "BY JONATHAN SWIFT, D.D.,",
            "dean of st. patrick’s, dublin.",
            "[_First published in_ 1726–7.]",
            "cover",
            "Contents",
            "THE PUBLISHER TO THE READER.\r\n A LETTER FROM CAPTAIN GULLIVER TO HIS COUSIN SYMPSON.\r\n PART I. A VOYAGE TO LILLIPUT.\r\n PART II. A VOYAGE TO BROBDINGNAG.\r\n PART III. A VOYAGE TO LAPUTA, BALNIBARBI, GLUBBDUBDRIB, LUGGNAGG AND JAPAN.\r\n PART IV. A VOYAGE TO THE COUNTRY OF THE HOUYHNHNMS.",
            "THE PUBLISHER TO THE READER.",
            "[_As given in the original edition_.]",
            "The author of these Travels, Mr. Lemuel Gulliver, is my ancient and\r\nintimate friend; there is likewise some relation between us on the\r\nmother’s side. About three years ago, Mr. Gulliver growing weary of the\r\nconcourse of curious people coming to him at his house in Redriff, made\r\na small purchase of land, with a convenient house, near Newark, in\r\nNottinghamshire, his native country; where he now lives retired, yet in\r\ngood esteem among his neighbours."
        ]
    },
    "jane_eyre": {
        "title": "Jane Eyre",
        "author": "Unknown Author",
        "content": [
            "The Project Gutenberg eBook of Jane Eyre: An Autobiography",
            "This ebook is for the use of anyone anywhere in the United States and\r\nmost other parts of the world at no cost and with almost no restrictions\r\nwhatsoever. You may copy it, give it away or re-use it under the terms\r\nof the Project Gutenberg License included with this ebook or online\r\nat www.gutenberg.org. If you are not located in the United States,\r\nyou will have to check the laws of the country where you are located\r\nbefore using this eBook.",
            "Title: Jane Eyre: An Autobiography",
            "Author: Charlotte Brontë",
            "Illustrator: F. H. Townsend",
            "Release date: March 1, 1998 [eBook #1260]\r\n                Most recently updated: September 27, 2025",
            "Language: English",
            "Credits: David Price",
            "*** START OF THE PROJECT GUTENBERG EBOOK JANE EYRE: AN AUTOBIOGRAPHY ***",
            "JANE EYRE\r\nAN AUTOBIOGRAPHY",
            "by Charlotte Brontë",
            "_ILLUSTRATED BY F. H. TOWNSEND_",
            "London\r\nSERVICE & PATON\r\n5 HENRIETTA STREET\r\n1897",
            "_The Illustrations_\r\n_in this Volume are the copyright of_\r\nSERVICE & PATON, _London_",
            "TO\r\nW. M. THACKERAY, ESQ.,",
            "This Work\r\nIS RESPECTFULLY INSCRIBED",
            "BY\r\nTHE AUTHOR",
            "PREFACE",
            "A preface to the first edition of “Jane Eyre” being unnecessary, I gave\r\nnone: this second edition demands a few words both of acknowledgment\r\nand miscellaneous remark.",
            "My thanks are due in three quarters."
        ]
    },
    "moby_dick": {
        "title": "Moby Dick",
        "author": "Unknown Author",
        "content": [
            "The Project Gutenberg eBook of Moby Dick; Or, The Whale",
            "This ebook is for the use of anyone anywhere in the United States and\r\nmost other parts of the world at no cost and with almost no restrictions\r\nwhatsoever. You may copy it, give it away or re-use it under the terms\r\nof the Project Gutenberg License included with this ebook or online\r\nat www.gutenberg.org. If you are not located in the United States,\r\nyou will have to check the laws of the country where you are located\r\nbefore using this eBook.",
            "Title: Moby Dick; Or, The Whale",
            "Author: Herman Melville",
            "Release date: July 1, 2001 [eBook #2701]\r\n                Most recently updated: September 11, 2025",
            "Language: English",
            "Credits: Daniel Lazarus, Jonesey, and David Widger",
            "*** START OF THE PROJECT GUTENBERG EBOOK MOBY DICK; OR, THE WHALE ***",
            "MOBY-DICK;",
            "or, THE WHALE.",
            "By Herman Melville",
            "CONTENTS",
            "ETYMOLOGY.",
            "EXTRACTS (Supplied by a Sub-Sub-Librarian).",
            "CHAPTER 1. Loomings.",
            "CHAPTER 2. The Carpet-Bag.",
            "CHAPTER 3. The Spouter-Inn.",
            "CHAPTER 4. The Counterpane.",
            "CHAPTER 5. Breakfast.",
            "CHAPTER 6. The Street."
        ]
    },
    "pride_and_prejudice": {
        "title": "Pride and Prejudice",
        "author": "Unknown Author",
        "content": [
            "The Project Gutenberg eBook of Pride and Prejudice",
            "This ebook is for the use of anyone anywhere in the United States and\r\nmost other parts of the world at no cost and with almost no restrictions\r\nwhatsoever. You may copy it, give it away or re-use it under the terms\r\nof the Project Gutenberg License included with this ebook or online\r\nat www.gutenberg.org. If you are not located in the United States,\r\nyou will have to check the laws of the country where you are located\r\nbefore using this eBook.",
            "Title: Pride and Prejudice",
            "Author: Jane Austen",
            "Release date: June 1, 1998 [eBook #1342]\r\n                Most recently updated: September 22, 2025",
            "Language: English",
            "Credits: Chuck Greif and the Online Distributed Proofreading Team at http://www.pgdp.net (This file was produced from images available at The Internet Archive)",
            "*** START OF THE PROJECT GUTENBERG EBOOK PRIDE AND PREJUDICE ***",
            "[Illustration:",
            "GEORGE ALLEN\r\n                               PUBLISHER",
            "156 CHARING CROSS ROAD\r\n                                LONDON",
            "RUSKIN HOUSE\r\n                                   ]",
            "[Illustration:",
            "_Reading Jane’s Letters._      _Chap 34._\r\n                                   ]",
            "PRIDE.\r\n                                  and\r\n                               PREJUDICE",
            "by\r\n                             Jane Austen,",
            "with a Preface by\r\n                           George Saintsbury\r\n                                  and\r\n                           Illustrations by\r\n                             Hugh Thomson",
            "[Illustration: 1894]",
            "Ruskin       156. Charing\r\n                       House.        Cross Road.",
            "London\r\n                             George Allen."
        ]
    },
    "the_count_of_monte_cristo": {
        "title": "The Count of Monte Cristo",
        "author": "Unknown Author",
        "content": [
            "The Project Gutenberg eBook of The Count of Monte Cristo",
            "This ebook is for the use of anyone anywhere in the United States and\r\nmost other parts of the world at no cost and with almost no restrictions\r\nwhatsoever. You may copy it, give it away or re-use it under the terms\r\nof the Project Gutenberg License included with this ebook or online\r\nat www.gutenberg.org. If you are not located in the United States,\r\nyou will have to check the laws of the country where you are located\r\nbefore using this eBook.",
            "Title: The Count of Monte Cristo",
            "Author: Alexandre Dumas\r\n        Auguste Maquet",
            "Release date: January 1, 1998 [eBook #1184]\r\n                Most recently updated: August 9, 2025",
            "Language: English",
            "Credits: Anonymous Project Gutenberg Volunteers, Dan Muller and David Widger",
            "*** START OF THE PROJECT GUTENBERG EBOOK THE COUNT OF MONTE CRISTO ***",
            "THE COUNT OF MONTE CRISTO",
            "by Alexandre Dumas [père]",
            "Contents",
            "VOLUME ONE\r\nChapter 1. Marseilles—The Arrival\r\nChapter 2. Father and Son\r\nChapter 3. The Catalans\r\nChapter 4. Conspiracy\r\nChapter 5. The Marriage Feast\r\nChapter 6. The Deputy Procureur du Roi\r\nChapter 7. The Examination\r\nChapter 8. The Château d’If\r\nChapter 9. The Evening of the Betrothal\r\nChapter 10. The King’s Closet at the Tuileries\r\nChapter 11. The Corsican Ogre\r\nChapter 12. Father and Son\r\nChapter 13. The Hundred Days\r\nChapter 14. The Two Prisoners\r\nChapter 15. Number 34 and Number 27\r\nChapter 16. A Learned Italian\r\nChapter 17. The Abbé’s Chamber\r\nChapter 18. The Treasure\r\nChapter 19. The Third Attack\r\nChapter 20. The Cemetery of the Château d’If\r\nChapter 21. The Island of Tiboulen\r\nChapter 22. The Smugglers\r\nChapter 23. The Island of Monte Cristo\r\nChapter 24. The Secret Cave\r\nChapter 25. The Unknown\r\nChapter 26. The Pont du Gard Inn\r\nChapter 27. The Story",
            "VOLUME TWO\r\nChapter 28. The Prison Register\r\nChapter 29. The House of Morrel & Son\r\nChapter 30. The Fifth of September\r\nChapter 31. Italy: Sinbad the Sailor\r\nChapter 32. The Waking\r\nChapter 33. Roman Bandits\r\nChapter 34. The Colosseum\r\nChapter 35. La Mazzolata\r\nChapter 36. The Carnival at Rome.\r\nChapter 37. The Catacombs of Saint Sebastian\r\nChapter 38. The Rendezvous\r\nChapter 39. The Guests\r\nChapter 40. The Breakfast\r\nChapter 41. The Presentation\r\nChapter 42. Monsieur Bertuccio\r\nChapter 43. The House at Auteuil\r\nChapter 44. The Vendetta\r\nChapter 45. The Rain of Blood\r\nChapter 46. Unlimited Credit\r\nChapter 47. The Dappled Grays",
            "VOLUME THREE\r\nChapter 48. Ideology\r\nChapter 49. Haydée\r\nChapter 50. The Morrel Family\r\nChapter 51. Pyramus and Thisbe\r\nChapter 52. Toxicology\r\nChapter 53. Robert le Diable\r\nChapter 54. A Flurry in Stocks\r\nChapter 55. Major Cavalcanti\r\nChapter 56. Andrea Cavalcanti\r\nChapter 57. In the Lucern Patch\r\nChapter 58. M. Noirtier de Villefort\r\nChapter 59. The Will\r\nChapter 60. The Telegraph\r\nChapter 61. How a Gardener May Get Rid of the Dormice\r\nChapter 62. Ghosts\r\nChapter 63. The Dinner\r\nChapter 64. The Beggar\r\nChapter 65. A Conjugal Scene\r\nChapter 66. Matrimonial Projects\r\nChapter 67. The Office of the King’s Attorney\r\nChapter 68. A Summer Ball\r\nChapter 69. The Inquiry\r\nChapter 70. The Ball\r\nChapter 71. Bread and Salt\r\nChapter 72. Madame de Saint-Méran\r\nChapter 73. The Promise",
            "VOLUME FOUR\r\nChapter 74. The Villefort Family Vault\r\nChapter 75. A Signed Statement\r\nChapter 76. Progress of Cavalcanti the Younger\r\nChapter 77. Haydée\r\nChapter 78. We hear From Yanina\r\nChapter 79. The Lemonade\r\nChapter 80. The Accusation\r\nChapter 81. The Room of the Retired Baker\r\nChapter 82. The Burglary\r\nChapter 83. The Hand of God\r\nChapter 84. Beauchamp\r\nChapter 85. The Journey\r\nChapter 86. The Trial\r\nChapter 87. The Challenge\r\nChapter 88. The Insult\r\nChapter 89. The Night\r\nChapter 90. The Meeting\r\nChapter 91. Mother and Son\r\nChapter 92. The Suicide\r\nChapter 93. Valentine\r\nChapter 94. Maximilian’s Avowal\r\nChapter 95. Father and Daughter",
            "VOLUME FIVE\r\nChapter 96. The Contract\r\nChapter 97. The Departure for Belgium\r\nChapter 98. The Bell and Bottle Tavern\r\nChapter 99. The Law\r\nChapter 100. The Apparition\r\nChapter 101. Locusta\r\nChapter 102. Valentine\r\nChapter 103. Maximilian\r\nChapter 104. Danglars’ Signature\r\nChapter 105. The Cemetery of Père-Lachaise\r\nChapter 106. Dividing the Proceeds\r\nChapter 107. The Lions’ Den\r\nChapter 108. The Judge\r\nChapter 109. The Assizes\r\nChapter 110. The Indictment\r\nChapter 111. Expiation\r\nChapter 112. The Departure\r\nChapter 113. The Past\r\nChapter 114. Peppino\r\nChapter 115. Luigi Vampa’s Bill of Fare\r\nChapter 116. The Pardon\r\nChapter 117. The Fifth of October",
            "VOLUME ONE",
            "Chapter 1. Marseilles—The Arrival",
            "On the 24th of February, 1815, the look-out at Notre-Dame de la Garde\r\nsignalled the three-master, the _Pharaon_ from Smyrna, Trieste, and\r\nNaples.",
            "As usual, a pilot put off immediately, and rounding the Château d’If,\r\ngot on board the vessel between Cape Morgiou and Rion island."
        ]
    },
    "the_railway_children": {
        "title": "The Railway Children",
        "author": "Unknown Author",
        "content": [
            "The Project Gutenberg eBook of The Railway Children",
            "This ebook is for the use of anyone anywhere in the United States and\r\nmost other parts of the world at no cost and with almost no restrictions\r\nwhatsoever. You may copy it, give it away or re-use it under the terms\r\nof the Project Gutenberg License included with this ebook or online\r\nat www.gutenberg.org. If you are not located in the United States,\r\nyou will have to check the laws of the country where you are located\r\nbefore using this eBook.",
            "Title: The Railway Children",
            "Author: E. Nesbit",
            "Release date: August 1, 1999 [eBook #1874]\r\n                Most recently updated: March 9, 2018",
            "Language: English",
            "Credits: Produced by Les Bowler, and David Widger",
            "*** START OF THE PROJECT GUTENBERG EBOOK THE RAILWAY CHILDREN ***",
            "Produced by Les Bowler",
            "THE RAILWAY CHILDREN",
            "By E. Nesbit",
            "To my dear son Paul Bland,\r\n               behind whose knowledge of railways\r\n               my ignorance confidently shelters.",
            "Contents.",
            "I.    The beginning of things.\r\n     II.   Peter's coal-mine.\r\n     III.  The old gentleman.\r\n     IV.   The engine-burglar.\r\n     V.    Prisoners and captives.\r\n     VI.   Saviours of the train.\r\n     VII.  For valour.\r\n     VIII. The amateur fireman.\r\n     IX.   The pride of Perks.\r\n     X.    The terrible secret.\r\n     XI.   The hound in the red jersey.\r\n     XII.  What Bobbie brought home.\r\n     XIII. The hound's grandfather.\r\n     XIV.  The End.",
            "Chapter I. The beginning of things.",
            "They were not railway children to begin with. I don't suppose they had\r\never thought about railways except as a means of getting to Maskelyne\r\nand Cook's, the Pantomime, Zoological Gardens, and Madame Tussaud's.\r\nThey were just ordinary suburban children, and they lived with their\r\nFather and Mother in an ordinary red-brick-fronted villa, with coloured\r\nglass in the front door, a tiled passage that was called a hall, a\r\nbath-room with hot and cold water, electric bells, French windows, and\r\na good deal of white paint, and 'every modern convenience', as the\r\nhouse-agents say.",
            "There were three of them. Roberta was the eldest. Of course, Mothers\r\nnever have favourites, but if their Mother HAD had a favourite, it might\r\nhave been Roberta. Next came Peter, who wished to be an Engineer when he\r\ngrew up; and the youngest was Phyllis, who meant extremely well.",
            "Mother did not spend all her time in paying dull calls to dull ladies,\r\nand sitting dully at home waiting for dull ladies to pay calls to her.\r\nShe was almost always there, ready to play with the children, and read\r\nto them, and help them to do their home-lessons. Besides this she used\r\nto write stories for them while they were at school, and read them\r\naloud after tea, and she always made up funny pieces of poetry for their\r\nbirthdays and for other great occasions, such as the christening of the\r\nnew kittens, or the refurnishing of the doll's house, or the time when\r\nthey were getting over the mumps.",
            "These three lucky children always had everything they needed: pretty\r\nclothes, good fires, a lovely nursery with heaps of toys, and a Mother\r\nGoose wall-paper. They had a kind and merry nursemaid, and a dog who was\r\ncalled James, and who was their very own. They also had a Father who was\r\njust perfect--never cross, never unjust, and always ready for a game--at\r\nleast, if at any time he was NOT ready, he always had an excellent\r\nreason for it, and explained the reason to the children so interestingly\r\nand funnily that they felt sure he couldn't help himself.",
            "You will think that they ought to have been very happy. And so they\r\nwere, but they did not know HOW happy till the pretty life in the Red\r\nVilla was over and done with, and they had to live a very different life\r\nindeed."
        ]
    }
};

// Initialize the application
function init() {
    // Add sidebar toggle functionality
    addSidebarToggle();
    
    // Add novel selection event listeners
    addNovelSelectionListeners();
    
    // Add click event listeners to selectable elements
    addSelectableEventListeners();
    
    // Add close event listener to popup
    addPopupCloseListeners();
}

// Add sidebar toggle functionality
function addSidebarToggle() {
    toggleSidebar.addEventListener('click', () => {
        novelSidebar.classList.toggle('collapsed');
        container.classList.toggle('sidebar-collapsed');
    });
}

// Add novel selection event listeners
function addNovelSelectionListeners() {
    const novelItems = document.querySelectorAll('.novel-item');
    
    novelItems.forEach(item => {
        item.addEventListener('click', () => {
            const novelId = item.dataset.novel;
            loadNovel(novelId);
            
            // Update active state
            novelItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

// Load novel content with pagination
function loadNovel(novelId) {
    const novel = novels[novelId];
    if (!novel) return;
    
    // Debug: Log novel content length
    console.log(`Novel ${novelId} has ${novel.content.length} paragraphs`);
    
    // Update current novel ID
    PAGINATION.currentNovelId = novelId;
    // Reset to first page
    PAGINATION.currentPage = 1;
    // Calculate total pages - ensure at least 1 page
    PAGINATION.totalPages = Math.max(1, Math.ceil(novel.content.length / PAGINATION.paragraphsPerPage));
    
    // Debug: Log pagination info
    console.log(`Pagination: ${PAGINATION.currentPage} / ${PAGINATION.totalPages}, ${PAGINATION.paragraphsPerPage} paragraphs per page`);
    
    // Update title and author
    novelTitle.textContent = novel.title;
    novelAuthor.textContent = `By ${novel.author}`;
    
    // Render current page
    renderPage();
    
    // Create or update pagination controls
    createPaginationControls();
}

// Render current page content
function renderPage() {
    const novel = novels[PAGINATION.currentNovelId];
    if (!novel) return;
    
    // Debug: Log current page info
    console.log(`Rendering page ${PAGINATION.currentPage} for ${PAGINATION.currentNovelId}`);
    
    // Calculate start and end indices
    const startIndex = (PAGINATION.currentPage - 1) * PAGINATION.paragraphsPerPage;
    const endIndex = startIndex + PAGINATION.paragraphsPerPage;
    
    // Debug: Log indices
    console.log(`Start: ${startIndex}, End: ${endIndex}, Total: ${novel.content.length}`);
    
    // Get current page paragraphs
    const currentParagraphs = novel.content.slice(startIndex, endIndex);
    
    // Debug: Log current paragraphs count
    console.log(`Current page has ${currentParagraphs.length} paragraphs`);
    
    // Generate content HTML
    let contentHtml = '';
    currentParagraphs.forEach(paragraph => {
        contentHtml += `<p><span class="selectable">${paragraph}</span></p>`;
    });
    
    // Update content
    novelContent.innerHTML = contentHtml;
    
    // Add event listeners to new selectable elements
    addSelectableEventListeners();
    
    // Update pagination info
    updatePaginationInfo();
    
    // Scroll to top of content
    novelContent.scrollTop = 0;
    
    // Update main content margin to account for top navigation
    const mainContent = document.querySelector('.main-content');
    mainContent.style.marginTop = '70px'; // Match top navigation height
}

// Create pagination controls
function createPaginationControls() {
    // Check if pagination controls already exist
    let paginationContainer = document.getElementById('paginationControls');
    
    if (!paginationContainer) {
        // Create pagination container
        paginationContainer = document.createElement('div');
        paginationContainer.id = 'paginationControls';
        paginationContainer.className = 'pagination-controls';
        
        // Create previous page button
        prevPageBtn = document.createElement('button');
        prevPageBtn.id = 'prevPage';
        prevPageBtn.className = 'pagination-btn';
        prevPageBtn.textContent = '上一页';
        prevPageBtn.addEventListener('click', goToPrevPage);
        
        // Create page info
        pageInfo = document.createElement('span');
        pageInfo.id = 'pageInfo';
        pageInfo.className = 'pagination-info';
        
        // Create next page button
        nextPageBtn = document.createElement('button');
        nextPageBtn.id = 'nextPage';
        nextPageBtn.className = 'pagination-btn';
        nextPageBtn.textContent = '下一页';
        nextPageBtn.addEventListener('click', goToNextPage);
        
        // Append elements to container
        paginationContainer.appendChild(prevPageBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextPageBtn);
        
        // Add pagination container to the DOM (after novel content)
        const mainElement = novelContent.parentElement;
        mainElement.appendChild(paginationContainer);
    }
    
    // Update button states
    updatePaginationButtons();
}

// Update pagination button states
function updatePaginationButtons() {
    // Update previous button state
    if (prevPageBtn) {
        prevPageBtn.disabled = PAGINATION.currentPage === 1;
    }
    
    // Update next button state
    if (nextPageBtn) {
        nextPageBtn.disabled = PAGINATION.currentPage === PAGINATION.totalPages;
    }
}

// Update pagination info
function updatePaginationInfo() {
    if (pageInfo) {
        pageInfo.textContent = `${PAGINATION.currentPage} / ${PAGINATION.totalPages}`;
    }
}

// Go to previous page
function goToPrevPage() {
    if (PAGINATION.currentPage > 1) {
        PAGINATION.currentPage--;
        renderPage();
    }
}

// Go to next page
function goToNextPage() {
    if (PAGINATION.currentPage < PAGINATION.totalPages) {
        PAGINATION.currentPage++;
        renderPage();
    }
}

// Add event listeners to selectable text elements
function addSelectableEventListeners() {
    const selectableElements = document.querySelectorAll('.selectable');
    
    selectableElements.forEach(element => {
        // Click event for single word/phrase selection
        element.addEventListener('click', handleTextClick);
        
        // Double click event for sentence selection
        element.addEventListener('dblclick', handleTextDoubleClick);
    });
}

// Handle single click event
function handleTextClick(e) {
    // Get the clicked text
    const clickedText = getSelectedText(e.target);
    if (clickedText) {
        showTranslationPopup(clickedText);
    }
}

// Handle double click event
function handleTextDoubleClick(e) {
    // Get the full sentence
    const sentence = e.target.textContent;
    showTranslationPopup(sentence);
}

// Get selected text
function getSelectedText(element) {
    // Check if there's any user selection
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
        return selection.toString();
    }
    // If no selection, return the full element text
    return element.textContent;
}

// Show translation popup
async function showTranslationPopup(text) {
    // Set original text
    originalText.textContent = text;
    
    // Show loading state
    translatedText.textContent = 'Translating...';
    
    // Show popup
    translationPopup.classList.add('show');
    
    try {
        // Translate text
        const translation = await translateText(text);
        translatedText.textContent = translation;
    } catch (error) {
        console.error('Translation error:', error);
        translatedText.textContent = 'Translation failed. Please try again.';
    }
}

// Translate text using API
async function translateText(text) {
    try {
        // Build API URL
        const url = new URL(API_CONFIG.url);
        url.searchParams.append('q', text);
        url.searchParams.append('langpair', API_CONFIG.params.langpair);
        url.searchParams.append('de', API_CONFIG.params.de);
        
        // Make API request
        const response = await fetch(url);
        const data = await response.json();
        
        // Return translation result
        return data.responseData.translatedText;
    } catch (error) {
        console.error('Translation API error:', error);
        // Fallback to mock translation if API fails
        return getMockTranslation(text);
    }
}

// Mock translation function (fallback)
function getMockTranslation(text) {
    // You can extend this object with more translations as needed
    const mockTranslations = {
        // Jane Eyre translations
        'Conventionality is not morality.': '传统习俗不等于道德。',
        'Self-righteousness is not religion.': '自以为是不等于宗教。',
        'To attack the first is not to assail the last.': '攻击前者不等于攻击后者。',
        
        // Pride and Prejudice translations
        'It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.': '凡是有钱的单身汉，总想娶位太太，这已经成了一条举世公认的真理。',
        
        // Wuthering Heights translations
        '1801.—I have just returned from a visit to my landlord—the solitary neighbour that I shall be troubled with.': '1801年。我刚刚拜访过我的房东回来——就是那个将要给我惹麻烦的孤独的邻居。',
        
        // Great Expectations translations
        'My father’s family name being Pirrip, and my Christian name Philip, my infant tongue could make of both names nothing longer or more explicit than Pip.': '我父亲姓皮里瑞普，教名是菲利普，由于我幼年口齿不清，所以把自己的姓名念成了皮普。'
    };
    
    return mockTranslations[text] || 'Translation not available for this text.';
}

// Add popup close listeners
function addPopupCloseListeners() {
    // Close button click
    closeBtn.addEventListener('click', hideTranslationPopup);
    
    // Click outside popup content
    translationPopup.addEventListener('click', (e) => {
        if (e.target === translationPopup) {
            hideTranslationPopup();
        }
    });
    
    // Escape key press
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && translationPopup.classList.contains('show')) {
            hideTranslationPopup();
        }
    });
}

// Hide translation popup
function hideTranslationPopup() {
    translationPopup.classList.remove('show');
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);