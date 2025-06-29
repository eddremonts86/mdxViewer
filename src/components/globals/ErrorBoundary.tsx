import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

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
                <div className="flex items-center justify-center min-h-screen p-4 bg-background">
                    <Card className="w-full max-w-2xl">
                        <CardHeader className="text-center">
                            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-destructive/10">
                                <AlertTriangle className="w-8 h-8 text-destructive" />
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
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Try again
                                </Button>
                                <Button
                                    onClick={this.handleGoHome}
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                >
                                    <Home className="w-4 h-4 mr-2" />
                                    Go home
                                </Button>
                                <Button
                                    onClick={this.handleReload}
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    Reload page
                                </Button>
                            </div>

                            {/* Error Details (Development Mode) */}
                            {(this.props.showDetails ||
                                process.env.NODE_ENV === "development") &&
                                this.state.error && (
                                    <details className="mt-6">
                                        <summary className="text-sm font-medium cursor-pointer text-muted-foreground hover:text-foreground">
                                            View error details (for developers)
                                        </summary>
                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <h4 className="mb-2 text-sm font-medium">
                                                    Error:
                                                </h4>
                                                <pre className="p-3 overflow-auto text-xs rounded bg-muted">
                                                    {this.state.error.toString()}
                                                </pre>
                                            </div>
                                            {this.state.errorInfo && (
                                                <div>
                                                    <h4 className="mb-2 text-sm font-medium">
                                                        Stack Trace:
                                                    </h4>
                                                    <pre className="p-3 overflow-auto text-xs rounded bg-muted">
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
                            <div className="text-sm text-center text-muted-foreground">
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
