import React from "react";

import { MARKDOWN_CLASSES } from "@/const/markdown";
import type {
    BlockquoteProps,
    ImageProps,
    LinkProps,
    ListProps,
    MarkdownComponentProps,
    TableProps,
} from "@/types/markdown";
import { generateHeadingId, getLinkAttributes, handleAnchorClick } from "@/utils/markdownUtils";

// Heading components
export const H1 = ({ children, ...props }: React.ComponentProps<"h1">) => {
    const id = generateHeadingId(children);
    return (
        <h1 {...props} id={id} className={MARKDOWN_CLASSES.h1}>
            {children}
        </h1>
    );
};

export const H2 = ({ children, ...props }: React.ComponentProps<"h2">) => {
    const id = generateHeadingId(children);
    return (
        <h2 {...props} id={id} className={MARKDOWN_CLASSES.h2}>
            {children}
        </h2>
    );
};

export const H3 = ({ children, ...props }: React.ComponentProps<"h3">) => {
    const id = generateHeadingId(children);
    return (
        <h3 {...props} id={id} className={MARKDOWN_CLASSES.h3}>
            {children}
        </h3>
    );
};

export const H4 = ({ children, ...props }: React.ComponentProps<"h4">) => {
    const id = generateHeadingId(children);
    return (
        <h4 {...props} id={id} className={MARKDOWN_CLASSES.h4}>
            {children}
        </h4>
    );
};

export const H5 = ({ children, ...props }: React.ComponentProps<"h5">) => {
    const id = generateHeadingId(children);
    return (
        <h5 {...props} id={id} className={MARKDOWN_CLASSES.h5}>
            {children}
        </h5>
    );
};

export const H6 = ({ children, ...props }: React.ComponentProps<"h6">) => {
    const id = generateHeadingId(children);
    return (
        <h6 {...props} id={id} className={MARKDOWN_CLASSES.h6}>
            {children}
        </h6>
    );
};

// Text components
export const Paragraph = ({ children }: MarkdownComponentProps) => <p className={MARKDOWN_CLASSES.p}>{children}</p>;

export const Blockquote = ({ children }: BlockquoteProps) => (
    <blockquote className={MARKDOWN_CLASSES.blockquote}>
        <div className="relative">
            <span className="text-primary/30 absolute -top-2 -left-2 text-4xl">"</span>
            {children}
        </div>
    </blockquote>
);

export const Strong = ({ children }: MarkdownComponentProps) => (
    <strong className={MARKDOWN_CLASSES.strong}>{children}</strong>
);

export const Emphasis = ({ children }: MarkdownComponentProps) => <em className={MARKDOWN_CLASSES.em}>{children}</em>;

// List components
export const UnorderedList = ({ children }: ListProps) => <ul className={MARKDOWN_CLASSES.ul}>{children}</ul>;

export const OrderedList = ({ children }: ListProps) => <ol className={MARKDOWN_CLASSES.ol}>{children}</ol>;

export const ListItem = ({ children }: MarkdownComponentProps) => <li className={MARKDOWN_CLASSES.li}>{children}</li>;

// Table components
export const Table = ({ children }: TableProps) => (
    <div className={MARKDOWN_CLASSES.table}>
        <table className="w-full border-collapse">{children}</table>
    </div>
);

export const TableHead = ({ children }: MarkdownComponentProps) => (
    <thead className={MARKDOWN_CLASSES.thead}>{children}</thead>
);

export const TableBody = ({ children }: MarkdownComponentProps) => (
    <tbody className={MARKDOWN_CLASSES.tbody}>{children}</tbody>
);

export const TableRow = ({ children }: MarkdownComponentProps) => <tr className={MARKDOWN_CLASSES.tr}>{children}</tr>;

export const TableHeader = ({ children }: MarkdownComponentProps) => (
    <th className={MARKDOWN_CLASSES.th}>{children}</th>
);

export const TableData = ({ children }: MarkdownComponentProps) => <td className={MARKDOWN_CLASSES.td}>{children}</td>;

// Link component
export const Link = ({ children, href, ...props }: LinkProps) => {
    const linkAttributes = getLinkAttributes(href);

    return (
        <a
            href={href}
            onClick={e => handleAnchorClick(e, href)}
            className={MARKDOWN_CLASSES.link}
            {...linkAttributes}
            {...props}
        >
            {children}
        </a>
    );
};

// Image component
export const Image = ({ src, alt, ...props }: ImageProps) => (
    <div className="my-8">
        <img src={src} alt={alt} className={MARKDOWN_CLASSES.image} {...props} />
        {alt && <p className={MARKDOWN_CLASSES.imageCaption}>{alt}</p>}
    </div>
);

// Horizontal rule
export const HorizontalRule = () => <hr className={MARKDOWN_CLASSES.hr} />;
