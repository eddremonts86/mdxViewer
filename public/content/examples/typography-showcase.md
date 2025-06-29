# Markdown Typography Showcase

This document demonstrates the beautiful typography and improved readability of the MDX Viewer with **Inter** for text and **JetBrains Mono** for code.

## Code Blocks

Here's a JavaScript example with syntax highlighting:

```javascript
function createBeautifulCode() {
    const message = "Hello, beautiful typography!";

    // This demonstrates JetBrains Mono in action
    const styles = {
        fontFamily: "JetBrains Mono",
        fontSize: "14px",
        lineHeight: "1.6",
        fontFeatureSettings: '"liga" 1, "calt" 1',
    };

    return { message, styles };
}

// Call the function
const result = createBeautifulCode();
console.log(result.message);
```

And here's a Python example:

```python
def demonstrate_typography():
    """
    This function showcases beautiful code typography
    using JetBrains Mono font with ligatures.
    """

    # Mathematical operators look great with ligatures
    result = (10 <= 20) and (30 >= 25)
    arrow_function = lambda x: x ** 2

    # String formatting
    name = "MDX Viewer"
    message = f"Welcome to {name}!"

    return {
        'result': result,
        'function': arrow_function,
        'message': message
    }

# Usage example
data = demonstrate_typography()
print(data['message'])
```

## Typography Elements

This paragraph demonstrates the **Inter font family** with its excellent readability. The text flows naturally with proper _letter spacing_ and `inline code` that uses JetBrains Mono.

### Beautiful Headings

All headings use **Inter** with carefully adjusted letter spacing and weights:

#### Level 4 Heading

##### Level 5 Heading

###### Level 6 Heading

## Lists

Unordered lists with proper spacing:

-   First item with **bold text**
-   Second item with _italic text_
-   Third item with `inline code`
    -   Nested item A
    -   Nested item B with a [link](https://example.com)
    -   Nested item C

Ordered lists:

1. First numbered item
2. Second numbered item with **emphasis**
3. Third item with more content
    1. Sub-item with proper indentation
    2. Another sub-item
    3. Final sub-item

## Blockquotes

> This is a beautiful blockquote using Inter font with proper spacing and styling. It demonstrates how quotes can be elegantly rendered with the improved typography system.

> **Note:** This blockquote includes **bold text** and _italic text_ to show how they render within quotes.

## Tables

| Feature                 | Description                   | Status         |
| ----------------------- | ----------------------------- | -------------- |
| **Inter Font**          | Beautiful sans-serif for text | ✅ Implemented |
| **JetBrains Mono**      | Monospace for code blocks     | ✅ Implemented |
| **Syntax Highlighting** | Code syntax with themes       | ✅ Implemented |
| **Responsive Design**   | Works on all screen sizes     | ✅ Implemented |

## Links and Emphasis

Visit the [MDX Viewer documentation](https://example.com) to learn more about these **typography improvements**. You can also check out the _beautiful styling_ that makes reading more enjoyable.

---

## Mathematical Expressions

When KaTeX is enabled, you can write beautiful mathematical expressions:

Inline math: $E = mc^2$ and $\sum_{i=1}^n x_i$

Block math:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## Final Notes

The combination of **Inter** and **JetBrains Mono** creates a professional and highly readable experience. The improved spacing, weights, and font features make this MDX Viewer perfect for documentation, technical writing, and code examples.

_Happy reading!_ 🎉
