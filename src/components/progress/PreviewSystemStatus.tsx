import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface PreviewSystemStatusProps {
    totalDocuments: number;
    previewsAvailable: number;
    isLoading?: boolean;
}

export function PreviewSystemStatus({
    totalDocuments,
    previewsAvailable,
    isLoading = false,
}: PreviewSystemStatusProps) {
    const coverage = totalDocuments > 0 ? Math.round((previewsAvailable / totalDocuments) * 100) : 0;
    const isFullyCovered = coverage >= 95;
    const hasGoodCoverage = coverage >= 80;

    // Determine card styling
    let cardClasses = "border-2 ";
    let statusIcon;
    let statusTextColor;

    if (isFullyCovered) {
        cardClasses += "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950";
        statusIcon = <CheckCircle className="h-4 w-4 text-green-600" />;
        statusTextColor = "text-green-900 dark:text-green-100";
    } else if (hasGoodCoverage) {
        cardClasses += "border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950";
        statusIcon = <AlertCircle className="h-4 w-4 text-orange-600" />;
        statusTextColor = "text-orange-900 dark:text-orange-100";
    } else {
        cardClasses += "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950";
        statusIcon = <AlertCircle className="h-4 w-4 text-red-600" />;
        statusTextColor = "text-red-900 dark:text-red-100";
    }

    if (isLoading) {
        return (
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                <CardContent className="flex items-center gap-3 py-3">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        Loading preview system...
                    </span>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cardClasses}>
            <CardContent className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                    {statusIcon}
                    <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${statusTextColor}`}>Preview System Status</span>
                        <Badge variant={isFullyCovered ? "default" : "secondary"} className="text-xs">
                            {coverage}% Coverage
                        </Badge>
                    </div>
                </div>
                <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <span>
                        {previewsAvailable}/{totalDocuments} previews
                    </span>
                    {!isFullyCovered && (
                        <Badge variant="outline" className="text-xs">
                            🔧 Auto-generating
                        </Badge>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
