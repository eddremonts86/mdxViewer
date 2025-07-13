export function ErrorState() {
    return (
        <div className="container mx-auto px-6 py-8">
            <div className="flex h-64 items-center justify-center">
                <div className="text-center">
                    <h3 className="mb-2 text-lg font-semibold">Error loading documents</h3>
                    <p className="text-muted-foreground">An error occurred</p>
                </div>
            </div>
        </div>
    );
}
