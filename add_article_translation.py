#!/usr/bin/env python3
import os
import re

# Define the directory containing the articles
ARTICLES_DIR = './articles'

# Define the translation tooltip HTML to add
TRANSLATION_TOOLTIP_HTML = '''
    <!-- Translation Tooltip HTML -->
    <div class="translation-tooltip" id="translationTooltip" style="display: none; position: fixed; max-width: 400px; background-color: rgba(255, 255, 255, 0.98); border: 2px solid #5a3e2b; border-radius: 8px; padding: 15px; box-shadow: 0 4px 20px rgba(0,0,0,0.2); z-index: 1000; font-family: 'Microsoft YaHei', sans-serif;">
        <div class="tooltip-translation" style="color: #5a3e2b; font-size: 1rem; font-weight: 500; line-height: 1.6;">翻译中...</div>
    </div>'''

# Define the translation script to add
TRANSLATION_SCRIPT = '''
    <!-- Translation Script -->
    <script>
        // Article Translation Features
        // Features: Click-to-translate near cursor
        
        // Global variables
        let selectedParagraph = null;
        
        // Translation API (using free MyMemory API)
        const TRANSLATION_API = 'https://api.mymemory.translated.net/get';
        
        // DOM elements
        let translationTooltip;
        
        // Initialize on page load
        document.addEventListener('DOMContentLoaded', function() {
            // Get DOM elements
            translationTooltip = document.getElementById('translationTooltip');
            
            // Add click listener to close tooltip when clicking outside
            document.addEventListener('click', function(e) {
                // Check if click is outside tooltip and not on a selectable paragraph
                if (translationTooltip && 
                    !translationTooltip.contains(e.target) && 
                    !e.target.classList.contains('selectable')) {
                    hideTranslation();
                }
            });
            
            // Add selectable class to all English text paragraphs in articles
            const englishParagraphs = document.querySelectorAll('.english-text');
            englishParagraphs.forEach(paragraph => {
                // Only make English text selectable
                if (paragraph.textContent.trim()) {
                    paragraph.classList.add('selectable');
                    
                    // Add click listener for translation
                    paragraph.addEventListener('click', function(e) {
                        e.stopPropagation(); // Prevent document click from firing
                        handleParagraphClick(this, e);
                    });
                }
            });
        });
        
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
                // Long text - split into chunks
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
            
            .translation-tooltip {
                animation: fadeIn 0.2s ease;
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
    </script>''' 

def add_translation_to_articles():
    """Add translation functionality to all HTML files in the articles directory."""
    # Get all HTML files in the articles directory
    html_files = [f for f in os.listdir(ARTICLES_DIR) if f.endswith('.html')]
    
    total_files = len(html_files)
    processed_files = 0
    updated_files = 0
    
    print(f"Found {total_files} HTML files to process.")
    
    # Process each HTML file
    for filename in html_files:
        file_path = os.path.join(ARTICLES_DIR, filename)
        
        try:
            # Read the file content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Check if the file already has translation functionality
            if 'translation-tooltip' in content or 'translationTooltip' in content:
                processed_files += 1
                continue
            
            # Add translation tooltip HTML and script before </body>
            updated_content = re.sub(r'</body>', f'{TRANSLATION_TOOLTIP_HTML}{TRANSLATION_SCRIPT}\n    </body>', content, flags=re.IGNORECASE)
            
            # Write the updated content back to the file
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(updated_content)
            
            processed_files += 1
            updated_files += 1
            
            print(f"Added translation functionality to: {filename}")
            
        except Exception as e:
            print(f"Error processing file {filename}: {e}")
    
    print(f"Processing completed.")
    print(f"Files processed: {processed_files}/{total_files}")
    print(f"Files updated: {updated_files}/{total_files}")

if __name__ == "__main__":
    add_translation_to_articles()
