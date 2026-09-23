import { useEffect, useMemo, useState } from "react";

import { PlateLabel } from "@/components/atlas";
import { cn } from "@/lib/utils";
import { parseHeadings } from "@/utils/headingUtils";

interface TableOfContentsProps {
    /** Markdown source; headings are parsed with the same id generator the
        rendered headings use, so every anchor resolves. */
    content: string;
    className?: string;
}

const SCROLL_OFFSET = 84;
const INDENT_REM_PER_LEVEL = 0.65;

export function TableOfContents({ content, className }: TableOfContentsProps) {
    const headings = useMemo(() => parseHeadings(content), [content]);
    const [activeId, setActiveId] = useState<string>("");

    useEffect(() => {
        if (headings.length === 0) return undefined;

        const observer = new IntersectionObserver(
            entries => {
                for (const entry of entries) {
                    if (entry.isIntersecting) setActiveId(entry.target.id);
                }
            },
            { rootMargin: "-15% 0% -60% 0%", threshold: 0.05 }
        );

        for (const { id } of headings) {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        }

        return () => observer.disconnect();
    }, [headings]);

    if (headings.length === 0) return null;

    const goTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
        const element = document.getElementById(id);
        if (!element) return;
        event.preventDefault();
        const container = element.closest("main") ?? document.documentElement;
        const top = element.getBoundingClientRect().top + container.scrollTop - SCROLL_OFFSET;
        container.scrollTo({ top, behavior: "smooth" });
        window.history.replaceState(null, "", `#${id}`);
    };

    return (
        <nav className={cn("space-y-3", className)} aria-label="On this plate">
            <PlateLabel reading={`${headings.length}`}>On this plate</PlateLabel>
            <ul className="space-y-px">
                {headings.map(({ id, title, level }) => (
                    <li key={id}>
                        <a
                            href={`#${id}`}
                            onClick={event => goTo(event, id)}
                            aria-current={activeId === id ? "location" : undefined}
                            className={cn(
                                "focus-visible:outline-mark block truncate border-l py-1 pr-1 text-[0.8125rem] transition-colors focus-visible:outline focus-visible:outline-offset-[-2px]",
                                activeId === id
                                    ? "border-mark text-mark-read"
                                    : "border-rule text-ink-dim hover:text-ink"
                            )}
                            style={{ paddingLeft: `calc(${level * INDENT_REM_PER_LEVEL}rem)` }}
                        >
                            {title}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
