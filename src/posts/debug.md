---
title: "Debug: Syntax Highlighting Test"
description: "Testing syntax highlighting with theme switching"
tags: ["debug", "test"]
draft: false
---

Testing syntax highlighting across both light and dark themes.

## JavaScript

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(`Result: ${result}`);
```

## TypeScript

```typescript
interface Post {
  slug: string;
  frontmatter: {
    title: string;
    date: string;
    tags: string[];
  };
}

function getAllPosts(): Post[] {
  return posts.filter(post => !post.frontmatter.draft);
}
```

## Python

```python
def quicksort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quicksort(left) + middle + quicksort(right)

print(quicksort([3, 6, 8, 10, 1, 2, 1]))
```

## Bash

```bash
#!/bin/bash
for file in *.md; do
  echo "Processing $file"
  cat "$file" | wc -l
done
```

Toggle the theme (🌞/🌚) to see syntax colors change.
