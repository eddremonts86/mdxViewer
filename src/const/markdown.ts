// Font families used throughout the markdown renderer
export const FONT_FAMILIES = {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Source Code Pro', 'Menlo', 'Consolas', monospace",
} as const;

// Typography settings
export const TYPOGRAPHY = {
    letterSpacing: {
        tight: "-0.025em",
        normal: "-0.02em",
        relaxed: "-0.015em",
        slight: "-0.01em",
    },
    fontWeights: {
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
    },
    lineHeights: {
        normal: "1.6",
        relaxed: "1.7",
        loose: "1.75",
    },
} as const;

// Scroll and navigation settings
export const SCROLL_SETTINGS = {
    headerOffset: 80,
    behavior: "smooth" as const,
} as const;

// Code syntax highlighting settings
export const CODE_SETTINGS = {
    fontSize: "0.875rem",
    lineHeight: "1.6",
    padding: "1.25rem",
    borderRadius: "0.5rem",
    fontFeatures: "\"liga\" 1, \"calt\" 1",
} as const;

// CSS class names for markdown elements
export const MARKDOWN_CLASSES = {
    h1: "border-border text-foreground mt-12 mb-8 scroll-m-20 border-b pb-4 font-sans text-4xl font-bold tracking-tight antialiased lg:text-5xl",
    h2: "border-border text-foreground mt-10 mb-6 scroll-m-20 border-b pb-4 font-sans text-3xl font-semibold tracking-tight antialiased first:mt-0",
    h3: "text-foreground mt-8 mb-5 scroll-m-20 font-sans text-2xl font-semibold tracking-tight antialiased",
    h4: "text-foreground mt-7 mb-4 scroll-m-20 font-sans text-xl font-semibold tracking-tight antialiased",
    h5: "text-foreground mt-6 mb-3 scroll-m-20 font-sans text-lg font-semibold tracking-tight antialiased",
    h6: "text-foreground mt-5 mb-2 scroll-m-20 font-sans text-base font-semibold tracking-tight antialiased",
    p: "text-foreground mb-4 font-sans text-base leading-relaxed font-normal antialiased [&:not(:first-child)]:mt-4",
    blockquote:
        "border-primary text-muted-foreground bg-muted/20 mt-8 mb-8 rounded-r-lg border-l-4 py-6 pl-8 font-sans text-lg font-medium italic antialiased",
    ul: "text-foreground font-sans antialiased",
    ol: "text-foreground font-sans antialiased",
    li: "text-foreground font-sans antialiased",
    table: "border-border my-10 w-full overflow-x-auto rounded-lg border shadow-sm",
    thead: "bg-muted/50",
    tbody: "",
    tr: "border-border hover:bg-muted/30 border-b transition-colors duration-200",
    th: "border-border bg-muted/30 text-foreground border-r px-6 py-4 text-left font-sans font-semibold antialiased [&[align=center]]:text-center [&[align=right]]:text-right",
    td: "border-border text-foreground border-r px-6 py-4 text-left font-sans antialiased [&[align=center]]:text-center [&[align=right]]:text-right",
    link: "text-primary hover:text-primary/80 decoration-primary/40 hover:decoration-primary/70 font-sans font-medium underline underline-offset-4 antialiased transition-all duration-200",
    image: "w-full h-auto object-cover border-border mx-auto rounded-xl border shadow-lg",
    imageCaption: "text-muted-foreground mt-3 text-center font-sans text-sm italic antialiased",
    hr: "border-border mx-auto my-12 w-1/3 border-t-2 opacity-50",
    strong: "text-foreground font-sans font-semibold antialiased",
    em: "text-foreground font-sans italic antialiased",
    inlineCode: "bg-muted text-foreground border-border rounded border px-2 py-1 font-mono text-sm",
    codeBlock: "border-border overflow-hidden rounded-lg border shadow-sm",
} as const;
