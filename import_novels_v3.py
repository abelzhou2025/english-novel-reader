#!/usr/bin/env python3
"""
Import novels from txt files and convert to JavaScript format
Improved version: Merge related paragraphs for better reading experience + split long paragraphs
"""
import os
import re
import json

# Novel files location
NOVELS_DIR = os.path.expanduser('~/Desktop/Novels')
OUTPUT_FILE = 'novels_data.js'

# Novel metadata (Chinese names)
NOVEL_META = {
    "Jane Eyre": {
        "author": "Charlotte Brontë",
        "chinese_name": "简·爱"
    },
    "Pride and Prejudice": {
        "author": "Jane Austen",
        "chinese_name": "傲慢与偏见"
    },
    "Moby Dick": {
        "author": "Herman Melville",
        "chinese_name": "白鲸"
    },
    "The Count of Monte Cristo": {
        "author": "Alexandre Dumas",
        "chinese_name": "基督山伯爵"
    },
    "Gulliver's Travels into Several Remote Nations of the World": {
        "author": "Jonathan Swift",
        "chinese_name": "格列佛游记",
        "short_name": "Gulliver's Travels"
    },
    "The Railway Children": {
        "author": "E. Nesbit",
        "chinese_name": "铁路少年"
    }
}

def clean_text(text):
    """Clean text but preserve sentence structure"""
    # Remove excessive whitespace but preserve sentence flow
    text = ' '.join(text.split())
    return text

def is_chapter_header(text):
    """Check if text is a chapter header"""
    patterns = [
        r'^Chapter',
        r'^CHAPTER',
        r'^Ch\.?\s*\d+',
        r'^[IVX]+\.?\s+',
        r'^Part\s+\d+',
        r'^PART\s+\d+',
        r'^Section\s+\d+',
        r'^VOLUME',
        r'^Volume',
        r'^Letter\s+\d+',
        r'^Letter',
        r'^Preface',
        r'^Introduction',
        r'^Epilogue',
        r'^Conclusion',
        r'^Appendix',
        r'^Contents',
        r'^Contents:',
        r'^TITLE PAGE',
        r'^TRANSCRIBER.*NOTE',
        r'^PRODUCER.*NOTE',
        r'^END OF',
        r'^THE END',
        r'^Footnotes?',
        r'^Footnote',
        r'^ILLUSTRATIONS?',
        r'^LIST OF ILLUSTRATIONS'
    ]
    
    text_upper = text.upper()
    for pattern in patterns:
        if re.search(pattern, text_upper):
            return True
    return False

def split_long_paragraphs(paragraphs, max_words=250):
    """Split long paragraphs into smaller ones while preserving sentence boundaries"""
    result = []
    
    for paragraph in paragraphs:
        # Count words in the paragraph
        words = paragraph.split()
        
        if len(words) <= max_words:
            # Paragraph is within the limit, add as is
            result.append(paragraph)
        else:
            # Split the long paragraph into chunks
            sentences = re.split(r'([.!?。！？]["\']?\s+|[.!?。！？](?=\s*[A-Z]))', paragraph)
            
            # Reconstruct sentences with their punctuation
            full_sentences = []
            i = 0
            while i < len(sentences):
                if i + 1 < len(sentences) and sentences[i+1].strip():
                    # Combine sentence with its punctuation
                    full_sentences.append(sentences[i] + sentences[i+1])
                    i += 2
                else:
                    # Just the sentence part
                    if sentences[i].strip():
                        full_sentences.append(sentences[i])
                    i += 1
            
            # Group sentences into chunks that don't exceed max_words
            current_chunk = []
            current_word_count = 0
            
            for sentence in full_sentences:
                sentence_words = sentence.split()
                
                # If adding this sentence would exceed the limit and we already have content
                if current_word_count + len(sentence_words) > max_words and current_chunk:
                    # Add the current chunk to results
                    result.append(' '.join(current_chunk).strip())
                    # Start a new chunk with this sentence
                    current_chunk = [sentence]
                    current_word_count = len(sentence_words)
                else:
                    # Add sentence to current chunk
                    current_chunk.append(sentence)
                    current_word_count += len(sentence_words)
            
            # Add the last chunk if it exists
            if current_chunk:
                result.append(' '.join(current_chunk).strip())
    
    return result


def process_novel(filepath):
    """Process a single novel file with improved paragraph merging"""
    filename = os.path.basename(filepath)
    title = os.path.splitext(filename)[0]
    
    print(f"\n📚 Processing: {title}")
    
    # Get metadata
    meta = NOVEL_META.get(title, {
        "author": "Unknown Author",
        "chinese_name": title
    })
    
    # Read file
    with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    # Split into lines
    lines = content.split('\n')
    
    # Clean and filter lines
    cleaned_lines = []
    for line in lines:
        # Skip empty lines and common Project Gutenberg headers
        line = line.strip()
        if not line:
            continue
        
        # Skip common header/footer content
        skip_patterns = [
            r'Project Gutenberg',
            r'gutenberg\.org',
            r'END OF.*PROJECT GUTENBERG',
            r'START OF.*PROJECT GUTENBERG',
            r'\*\*\* (START|END)',
            r'Produced by',
            r'eBook',
            r'ebook',
            r'Available from',
            r'language:.*en',
            r'character set encoding:.*utf-8',
            r'encoding:.*utf-8',
            r'last updated',
            r'created on',
            r'posted to',
            r'last modified',
            r'posted with permission',
            r'posted with the permission',
            r'posted with the consent',
            r'posted with the authorization',
            r'posted with the agreement',
            r'posted with the authorization',
            r'posted with the agreement',
            r'posted with the consent',
            r'posted with the permission',
            r'posted with the authorization',
            r'posted with the agreement',
            r'posted with the consent',
            r'posted with the permission',
            r'posted with the authorization',
            r'posted with the agreement',
            r'posted with the consent',
        ]
        
        skip = False
        for pattern in skip_patterns:
            if re.search(pattern, line, re.IGNORECASE):
                skip = True
                break
        
        if skip:
            continue
        
        cleaned_lines.append(line)
    
    # Group lines into paragraphs with intelligent merging
    paragraphs = []
    current_paragraph = ""
    
    for i, line in enumerate(cleaned_lines):
        # Skip if line is a chapter header
        if is_chapter_header(line):
            # If we have accumulated text, save it as a paragraph
            if current_paragraph.strip():
                cleaned_para = clean_text(current_paragraph)
                if len(cleaned_para) > 50:  # Only add substantial paragraphs
                    paragraphs.append(cleaned_para)
            
            # Add the chapter header as a separate paragraph
            cleaned_header = clean_text(line)
            paragraphs.append(cleaned_header)
            current_paragraph = ""
            continue
        
        # Check if this line starts a new paragraph based on formatting
        # Lines that are short and look like section headers
        is_new_paragraph = False
        if len(line) < 100:  # Short lines might be section headers
            if re.match(r'^[A-Z][A-Z ]+$', line):  # All caps short line
                is_new_paragraph = True
            elif re.match(r'^[IVX]+$', line.strip()):  # Roman numerals
                is_new_paragraph = True
            elif re.match(r'^\d+\.$', line.strip()):  # Just a number with period
                is_new_paragraph = True
        
        # If this is a new paragraph and we have accumulated text, save it
        if is_new_paragraph and current_paragraph.strip():
            cleaned_para = clean_text(current_paragraph)
            if len(cleaned_para) > 50:  # Only add substantial paragraphs
                paragraphs.append(cleaned_para)
            current_paragraph = line
        # If line is empty, it's a paragraph break
        elif not line.strip():
            if current_paragraph.strip():
                cleaned_para = clean_text(current_paragraph)
                if len(cleaned_para) > 50:  # Only add substantial paragraphs
                    paragraphs.append(cleaned_para)
                current_paragraph = ""
        # Otherwise, append to current paragraph
        else:
            if current_paragraph:
                current_paragraph += " " + line
            else:
                current_paragraph = line
    
    # Don't forget the last paragraph
    if current_paragraph.strip():
        cleaned_para = clean_text(current_paragraph)
        if len(cleaned_para) > 50:  # Only add substantial paragraphs
            paragraphs.append(cleaned_para)
    
    # Split long paragraphs to ensure they don't exceed 250 words
    paragraphs = split_long_paragraphs(paragraphs, max_words=250)
    
    print(f"   ✓ Merged into {len(paragraphs)} coherent paragraphs (with long paragraphs split)")
    
    # Create novel ID (safe for JavaScript)
    novel_id = title.lower().replace("'", "").replace(" ", "_")
    novel_id = re.sub(r'[^a-z0-9_]', '', novel_id)
    
    return {
        'id': novel_id,
        'title': meta.get('short_name', title),
        'author': meta['author'],
        'chinese_name': meta['chinese_name'],
        'content': paragraphs[:2000]  # Limit to 2000 paragraphs per novel for performance
    }

def generate_javascript(novels):
    """Generate JavaScript file with novel data"""
    
    js_content = """// Novel Data - Auto-generated from txt files
// DO NOT EDIT MANUALLY - regenerate using import_novels_v3.py
// Improved version: Merged related paragraphs for better reading experience + split long paragraphs

const NOVELS_DATA = {
"""
    
    for novel in novels:
        # Escape special characters in content
        content_json = json.dumps(novel['content'], ensure_ascii=False, indent=8)
        
        js_content += f"""    "{novel['id']}": {{
        "title": "{novel['title']}",
        "author": "{novel['author']}",
        "chineseName": "{novel['chinese_name']}",
        "content": {content_json}
    }},
"""
    
    js_content += """};

// Export for use in novels.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NOVELS_DATA;
}
"""
    
    return js_content

def main():
    """Main function"""
    print("🔄 Importing novels from txt files with improved paragraph merging and long paragraph splitting...")
    print(f"📁 Source directory: {NOVELS_DIR}")
    
    # Check if directory exists
    if not os.path.exists(NOVELS_DIR):
        print(f"❌ Error: Directory not found: {NOVELS_DIR}")
        return
    
    # Process all txt files
    novels = []
    txt_files = [f for f in os.listdir(NOVELS_DIR) if f.endswith('.txt')]
    
    if not txt_files:
        print(f"❌ No .txt files found in {NOVELS_DIR}")
        return
    
    print(f"\n📖 Found {len(txt_files)} novel files")
    
    for filename in sorted(txt_files):
        filepath = os.path.join(NOVELS_DIR, filename)
        try:
            novel = process_novel(filepath)
            novels.append(novel)
        except Exception as e:
            print(f"   ❌ Error processing {filename}: {e}")
    
    # Generate JavaScript file
    print(f"\n💾 Generating {OUTPUT_FILE}...")
    js_content = generate_javascript(novels)
    
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write(js_content)
    
    print(f"✅ Successfully created {OUTPUT_FILE}")
    print(f"📊 Imported {len(novels)} novels:")
    for novel in novels:
        print(f"   - {novel['title']} ({novel['chinese_name']}): {len(novel['content'])} paragraphs")
    
    print("\n🎉 Import complete! Paragraphs have been merged for better reading experience and long paragraphs have been split.")

if __name__ == '__main__':
    main()