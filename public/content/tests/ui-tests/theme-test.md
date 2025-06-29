# Markdown Theme Test

This is a test document to demonstrate the improved markdown rendering with proper theming support.

## Code Blocks

Here's some JavaScript code:

```javascript
function greet(name) {
    console.log(`Hello, ${name}!`);
    return `Welcome to MDX Viewer`;
}

// Call the function
greet("World");
```

And some Python:

```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Generate first 10 fibonacci numbers
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
```

## Typography

This paragraph demonstrates **bold text**, _italic text_, and `inline code`. The typography should be properly themed for both light and dark modes.

### Lists

-   Item 1
-   Item 2
    -   Nested item A
    -   Nested item B
-   Item 3

1. First numbered item
2. Second numbered item
3. Third numbered item

## Blockquotes

> This is a blockquote that should be properly styled with theme-aware colors and borders.
>
> It can span multiple lines and should maintain proper styling.

## Tables

| Feature     | Light Mode         | Dark Mode          |
| ----------- | ------------------ | ------------------ |
| Background  | White              | Dark               |
| Text        | Dark               | Light              |
| Code blocks | Syntax highlighted | Syntax highlighted |
| Tables      | Bordered           | Bordered           |

## Links and Images

Check out [this link](https://ui.shadcn.com) - it should be properly themed.

## Mathematical Expressions

Inline math: $E = mc^2$

Block math:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

## Horizontal Rule

---

The content above and below this rule should be properly separated with theme-appropriate styling.
