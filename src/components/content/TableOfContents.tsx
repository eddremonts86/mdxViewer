import { useEffect, useState } from "react";

import { Book, ChevronDown, ChevronRight, ChevronUp } from "lucide-react";

import { cn } from "@/lib/utils";
import { generateHeadingId } from "@/utils/headingUtils";

interface TableOfContentsItem {
    level: number;
    title: string;
    id: string;
}

interface TableOfContentsProps {
    content?: string;
    items?: TableOfContentsItem[];
    className?: string;
}

export function TableOfContents({ content, items, className }: TableOfContentsProps) {
    const [toc, setToc] = useState<TableOfContentsItem[]>([]);
    const [activeId, setActiveId] = useState<string>("");
    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    useEffect(() => {
        // Si se pasan items directamente, usarlos
        if (items) {
            setToc(items);
            return;
        }

        // Si no, extraer encabezados del contenido
        if (!content) {
            setToc([]);
            return;
        }

        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const headings: TableOfContentsItem[] = [];

        let match;
        while ((match = headingRegex.exec(content)) !== null) {
            const level = match[1].length;
            const title = match[2].trim();
            const id = generateHeadingId(title);

            headings.push({ level, title, id });
        }

        setToc(headings);
    }, [content, items]);

    useEffect(() => {
        // Observar elementos en el viewport para resaltar el activo
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-20% 0% -35% 0%",
                threshold: 0.1,
            },
        );

        // Observar todos los encabezados
        toc.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => observer.disconnect();
    }, [toc]);

    const handleClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            // Use a better scroll implementation with offset for header
            const headerOffset = 80; // Adjust based on your header height
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });

            // Update URL hash
            window.history.pushState(null, "", `#${id}`);
        }
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    if (toc.length === 0) {
        return null;
    }

    return (
        <div className={cn("space-y-2", className)}>
            <button
                onClick={toggleExpanded}
                className="hover:bg-accent/50 flex w-full items-center justify-between border-b px-4 py-2 transition-colors duration-200"
            >
                <div className="flex items-center gap-2">
                    <Book className="text-muted-foreground h-4 w-4" />
                    <h3 className="text-foreground text-sm font-semibold">Índice de Contenido</h3>
                </div>
                {isExpanded ? (
                    <ChevronUp className="text-muted-foreground h-4 w-4" />
                ) : (
                    <ChevronDown className="text-muted-foreground h-4 w-4" />
                )}
            </button>

            {isExpanded && (
                <nav className="space-y-1">
                    {toc.map(({ level, title, id }) => (
                        <button
                            key={id}
                            onClick={() => handleClick(id)}
                            className={cn(
                                "group hover:bg-accent hover:text-accent-foreground flex w-full items-center gap-2 rounded-lg px-4 py-1.5 text-left text-sm transition-all duration-200",
                                activeId === id && "bg-accent text-accent-foreground font-medium",
                                level === 1 && "font-medium",
                                level === 2 && "pl-6",
                                level === 3 && "pl-8 text-xs",
                                level === 4 && "pl-10 text-xs",
                                level === 5 && "pl-12 text-xs opacity-75",
                                level === 6 && "pl-14 text-xs opacity-50",
                            )}
                        >
                            {level > 1 && <ChevronRight className="text-muted-foreground h-3 w-3 flex-shrink-0" />}
                            <span className="truncate">{title}</span>
                        </button>
                    ))}
                </nav>
            )}
        </div>
    );
}
