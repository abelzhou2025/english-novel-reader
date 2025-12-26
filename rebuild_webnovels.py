#!/usr/bin/env python3
import os
import re
from collections import defaultdict

# Get all HTML files
articles_dir = 'articles'
files = [f for f in os.listdir(articles_dir) if f.endswith('.html')]

# Group similar files
groups = defaultdict(list)
for f in files:
    # Create a normalized base name by removing common patterns
    base = f.lower()
    # Remove .html extensions
    base = base.replace('.html', '')
    # Remove 'md' suffix if present
    base = base.rstrip('md')
    # Remove underscores at the end
    base = base.rstrip('_')
    # Remove source indicators like " - the_new_york_tim" (truncated sources)
    base = re.sub(r'_-_[a-z_]+$', '', base)
    # Remove trailing underscores again
    base = base.rstrip('_')
    
    groups[base].append(f)

# Select best file from each group
unique_files = []
for base, file_list in groups.items():
    # Prefer non-md versions
    non_md = [f for f in file_list if not f.endswith('md.html')]
    
    if non_md:
        # Choose the longest filename (most complete title)
        best = max(non_md, key=len)
    else:
        # If only md.html files exist, take the longest
        best = max(file_list, key=len)
    
    unique_files.append(best)

# Sort by name
unique_files.sort()

print(f"Found {len(unique_files)} unique articles")
print(f"Total files in directory: {len(files)}")
print(f"\nFirst 10 unique articles:")
for f in unique_files[:10]:
    print(f"  {f}")

# Save the list
with open('unique_articles.txt', 'w') as out:
    for f in unique_files:
        out.write(f + '\n')

print(f"\nSaved unique articles list to unique_articles.txt")
