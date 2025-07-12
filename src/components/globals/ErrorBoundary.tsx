import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
    showDetails?: boolean;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
    ErrorBoundaryProps,
    ErrorBoundaryState
> {
    public state: ErrorBoundaryState = {
        hasError: false,
        error: null,
        errorInfo: null,
    };

    public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return {
            hasError: true,
            error,
            errorInfo: null,
        };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({
            error,
            errorInfo,
        });
    }

    private readonly handleReload = () => {
        window.location.reload();
    };

    private readonly handleGoHome = () => {
        window.location.href = "/";
    };

    private readonly handleRetry = () => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="bg-background flex min-h-screen items-center justify-center p-4">
                    <Card className="w-full max-w-2xl">
                        <CardHeader className="text-center">
                            <div className="bg-destructive/10 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                                <AlertTriangle className="text-destructive h-8 w-8" />
                            </div>
                            <CardTitle className="text-2xl">
                                Oops! Something went wrong
                            </CardTitle>
                            <CardDescription className="text-base">
                                An unexpected error has occurred in the
                                application. Don't worry, you can try the
                                following options:
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Action Buttons */}
                            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                                <Button
                                    onClick={this.handleRetry}
                                    className="w-full sm:w-auto"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Try again
                                </Button>
                                <Button
                                    onClick={this.handleGoHome}
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Go home
                                </Button>
                                <Button
                                    onClick={this.handleReload}
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                >
                                    <RefreshCw className="mr-2 h-4 w-4" />
                                    Reload page
                                </Button>
                            </div>

                            {/* Error Details (Development Mode) */}
                            {(this.props.showDetails ||
                                process.env.NODE_ENV === "development") &&
                                this.state.error && (
                                <details className="mt-6">
                                    <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-medium">
                                            View error details (for developers)
                                    </summary>
                                    <div className="mt-4 space-y-4">
                                        <div>
                                            <h4 className="mb-2 text-sm font-medium">
                                                    Error:
                                            </h4>
                                            <pre className="bg-muted overflow-auto rounded p-3 text-xs">
                                                {this.state.error.toString()}
                                            </pre>
                                        </div>
                                        {this.state.errorInfo && (
                                            <div>
                                                <h4 className="mb-2 text-sm font-medium">
                                                        Stack Trace:
                                                </h4>
                                                <pre className="bg-muted overflow-auto rounded p-3 text-xs">
                                                    {
                                                        this.state.errorInfo
                                                            .componentStack
                                                    }
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </details>
                            )}

                            {/* Help Text */}
                            <div className="text-muted-foreground text-center text-sm">
                                <p>
                                    If the problem persists, please reload the
                                    page or contact technical support.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}
