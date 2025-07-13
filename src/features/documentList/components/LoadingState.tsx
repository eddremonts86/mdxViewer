export function LoadingState() {
    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex h-64 items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="border-primary h-8 w-8 animate-spin rounded-full border-b-2"></div>
                    <p className="text-muted-foreground">Loading documents...</p>
                </div>
            </div>
        </div>
    );
}
