import { Component, type ErrorInfo, type ReactNode } from "react";

import { EmptyPlate } from "@/components/atlas";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    error: Error | null;
}

/**
 * The last plate. When the interface itself fails, the surface stays in the
 * world and says what happened rather than apologising in a stock card.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    public state: ErrorBoundaryState = { error: null };

    public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Interface error:", error, errorInfo);
    }

    private readonly handleRetry = () => this.setState({ error: null });

    private readonly handleReload = () => window.location.reload();

    public render() {
        const { error } = this.state;
        if (!error) return this.props.children;
        if (this.props.fallback) return this.props.fallback;

        return (
            <div className="bg-sky text-ink min-h-[100dvh]">
                <EmptyPlate
                    designation="Plate spoiled"
                    title="The interface stopped drawing"
                    message="Something in the viewer threw before the surface finished. Your documents on disk are untouched."
                    action={
                        <div className="flex flex-wrap justify-center gap-2">
                            <Button onClick={this.handleRetry}>Draw it again</Button>
                            <Button variant="outline" onClick={this.handleReload}>
                                Reload
                            </Button>
                        </div>
                    }
                />
                {import.meta.env.DEV ? (
                    <pre className="border-rule bg-panel text-ink-dim mx-auto mb-10 max-w-2xl overflow-x-auto border p-4 text-[0.75rem] leading-relaxed">
                        {error.message}
                        {"\n"}
                        {error.stack}
                    </pre>
                ) : null}
            </div>
        );
    }
}
