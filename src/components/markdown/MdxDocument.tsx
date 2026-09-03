import { useEffect, useState } from "react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { stripMdxImports } from "@/utils/mdxSource";

/**
 * An `.mdx` document, compiled and run.
 *
 * Two rules make this defensible rather than reckless, and neither is optional:
 *
 * 1. **The operator turns it on.** `MDX_EXECUTE=true` on the service, read back
 *    through `/api/health`. Off, nothing here is even imported. The upload
 *    endpoint has no authentication, so executing whatever is in the content
 *    folder is only safe where the operator trusts that folder — which is their
 *    call to make, with the consequence stated, not this component's to assume.
 * 2. **A document may not import.** Every `import` is removed before compiling,
 *    so a document cannot reach a URL, a bundle, or anything else the reader's
 *    browser could fetch. What it gets instead is the vocabulary below, provided
 *    by name, plus whatever it defines itself — which is what the seeded
 *    documents actually do.
 *
 * Expressions inside a compiled document still run. That is what compiling MDX
 * means, and it is exactly why rule 1 exists.
 */

/** The component vocabulary a document may use without importing anything. */
const VOCABULARY = {
    Alert,
    AlertDescription,
    AlertTitle,
    Badge,
    Button,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
};

interface MdxDocumentProps {
    source: string;
    /** Rendered instead when compiling fails, so a bad document still reads. */
    fallback: React.ReactNode;
}

interface Compiled {
    Content: React.ComponentType<{ components?: unknown }>;
    /** Import specifiers taken out before compiling, so the reader can be told. */
    removed: string[];
}

export function MdxDocument({ source, fallback }: MdxDocumentProps) {
    const [compiled, setCompiled] = useState<Compiled | null>(null);
    const [failure, setFailure] = useState<string | null>(null);

    useEffect(() => {
        let live = true;
        setCompiled(null);
        setFailure(null);

        const compile = async () => {
            const [{ evaluate }, { Fragment, jsx, jsxs }] = await Promise.all([
                import("@mdx-js/mdx"),
                import("react/jsx-runtime"),
            ]);
            const { source: withoutImports, removed } = stripMdxImports(source);

            const module = await evaluate(withoutImports, { Fragment, jsx, jsxs, baseUrl: window.location.href });

            if (live) setCompiled({ Content: module.default as Compiled["Content"], removed });
        };

        compile().catch((error: unknown) => {
            if (live) setFailure(error instanceof Error ? error.message : "This document could not be compiled");
        });

        return () => {
            live = false;
        };
    }, [source]);

    if (failure) {
        return (
            <>
                <p className="border-mark bg-mark-soft/60 text-ink mb-6 border-l px-4 py-3 text-[0.8125rem] leading-relaxed">
                    <span className="text-mark-read mr-2 text-[0.625rem] font-semibold tracking-[0.14em] uppercase">
                        Not compiled
                    </span>
                    {failure} The document is shown as Markdown below.
                </p>
                {fallback}
            </>
        );
    }

    // Compiling is a network fetch plus a parse; the Markdown reading stands in
    // rather than leaving the plate blank while that happens.
    if (!compiled) return <>{fallback}</>;

    const { Content, removed } = compiled;

    return (
        <>
            {removed.length > 0 ? (
                <p className="border-rule-bright bg-panel/50 text-ink-dim mb-6 border-l px-4 py-3 text-[0.8125rem] leading-relaxed">
                    <span className="mr-2 text-[0.625rem] font-semibold tracking-[0.14em] uppercase">Not imported</span>
                    A compiled document may not import: {removed.join(", ")}. Components it defines itself work, as does
                    the vocabulary this product provides.
                </p>
            ) : null}
            <Content components={VOCABULARY} />
        </>
    );
}
