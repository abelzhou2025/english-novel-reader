// DOM Elements
const novelContent = document.getElementById('novelContent');
const translationPopup = document.getElementById('translationPopup');
const closeBtn = document.getElementById('closeBtn');
const originalText = document.getElementById('originalText');
const translatedText = document.getElementById('translatedText');

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

// Initialize the application
function init() {
    // Add click event listeners to selectable elements
    addSelectableEventListeners();
    // Add close event listener to popup
    addPopupCloseListeners();
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
    const mockTranslations = {
        'Conventionality is not morality.': '传统习俗不等于道德。',
        'Self-righteousness is not religion.': '自以为是不等于宗教。',
        'To attack the first is not to assail the last.': '攻击前者不等于攻击后者。',
        'To pluck the mask from the face of the Pharisee, is not to lift an impious hand to the Crown of Thorns.': '揭下法利赛人脸上的面具，并不是对荆棘冠冕举起不敬的手。',
        'These things and deeds are diametrically opposed:': '这些事物和行为是截然相反的：',
        'they are as distinct as is vice from virtue.': '它们就像邪恶与美德一样截然不同。',
        'Men too often confound them:': '人们常常混淆它们：',
        'they should not be confounded:': '它们不应该被混淆：',
        'appearance should not be mistaken for truth;': '外表不应该被误认为是真理；',
        'narrow human doctrines, that only tend to elate and magnify a few, should not be substituted for the world-redeeming creed of Christ.': '狭隘的人类教义，只会让少数人得意洋洋，不应该被用来代替基督救赎世界的信条。',
        'There is—I repeat it—a difference;': '有一个区别——我再说一遍——；',
        'and it is a good, and not a bad action to mark broadly and clearly the line of separation between them.': '广泛而明确地标记它们之间的分界线是一件好事，而不是坏事。',
        'The world may not like to see these ideas dissevered, for it has been accustomed to blend them;': '世界可能不喜欢看到这些想法被割裂，因为它已经习惯了将它们融合在一起；',
        'finding it convenient to make external show pass for sterling worth—to let white-washed walls vouch for clean shrines.': '发现把外表当作真正的价值是很方便的——让粉刷过的墙壁为干净的神龛作证。',
        'It may hate him who dares to scrutinise and expose—to rase the gilding, and show base metal under it—to penetrate the sepulchre, and reveal charnel relics:': '它可能会憎恨那些敢于审视和揭露的人——刮掉镀金，露出下面的贱金属——穿透坟墓，露出尸骨：',
        'but, hate as it will, it is indebted to him.': '但是，无论它多么憎恨，它都欠他一份情。'
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