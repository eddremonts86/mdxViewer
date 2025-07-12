import React, { useCallback, useMemo, useState } from "react";

import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Define proper TypeScript interfaces - NEVER use 'any'
interface NotificationData {
    id: string;
    title: string;
    message: string;
    type: "success" | "error" | "info" | "warning";
    timestamp: Date;
    isRead: boolean;
    actionLabel?: string;
    onAction?: () => void;
}

interface NotificationCenterProps {
    /** Array of notifications with proper typing */
    notifications: NotificationData[];
    /** Callback when notification is dismissed */
    onDismiss: (id: string) => void;
    /** Callback when notification is marked as read */
    onMarkAsRead: (id: string) => void;
    /** Callback when all notifications are cleared */
    onClearAll: () => void;
    /** Maximum number of notifications to display */
    maxDisplayed?: number;
    /** Whether the component is in compact mode */
    compact?: boolean;
    /** Additional CSS classes */
    className?: string;
}

/**
 * NotificationCenter component for displaying app notifications
 * Uses shadcn/ui components and Lucide icons
 * Follows MDXViewer design system and English-only practices
 * Demonstrates proper TypeScript typing without 'any'
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
    notifications,
    onDismiss,
    onMarkAsRead,
    onClearAll,
    maxDisplayed = 5,
    compact = false,
    className,
}) => {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // Memoized computed values with proper typing
    const sortedNotifications = useMemo(
        () =>
            [...notifications]
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, maxDisplayed),
        [notifications, maxDisplayed],
    );

    const unreadCount = useMemo(
        () => notifications.filter(notification => !notification.isRead).length,
        [notifications],
    );

    // Event handlers with proper typing
    const handleDismiss = useCallback(
        (id: string, event: React.MouseEvent) => {
            event.stopPropagation();
            onDismiss(id);
        },
        [onDismiss],
    );

    const handleToggleExpanded = useCallback(
        (id: string) => {
            setExpandedId(current => (current === id ? null : id));
            onMarkAsRead(id);
        },
        [onMarkAsRead],
    );

    const getNotificationIcon = (type: NotificationData["type"]) => {
        switch (type) {
        case "success":
            return <CheckCircle className="h-4 w-4 text-green-600" />;
        case "error":
            return <AlertCircle className="text-destructive h-4 w-4" />;
        case "warning":
            return <AlertCircle className="h-4 w-4 text-yellow-600" />;
        case "info":
        default:
            return <Info className="h-4 w-4 text-blue-600" />;
        }
    };

    const getNotificationVariant = (
        type: NotificationData["type"],
    ): "default" | "secondary" | "destructive" => {
        switch (type) {
        case "error":
            return "destructive";
        case "success":
        case "warning":
        case "info":
        default:
            return "secondary";
        }
    };

    if (sortedNotifications.length === 0) {
        return (
            <Card className={cn("w-full max-w-md", className)}>
                <CardContent className="p-6 text-center">
                    <Info className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                    <p className="text-muted-foreground text-sm">
                        No notifications to display
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn("w-full max-w-md", className)}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-base font-medium">
                        Notifications
                        {unreadCount > 0 && (
                            <Badge
                                variant="destructive"
                                className="ml-2 text-xs"
                            >
                                {unreadCount}
                            </Badge>
                        )}
                    </CardTitle>
                    {notifications.length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearAll}
                            className="text-muted-foreground hover:text-foreground text-xs"
                        >
                            Clear All
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-2">
                {sortedNotifications.map(notification => (
                    <button
                        key={notification.id}
                        type="button"
                        className={cn(
                            "w-full rounded-lg border p-3 text-left transition-colors",
                            "hover:bg-muted/50 focus:ring-primary focus:ring-2 focus:outline-none",
                            !notification.isRead &&
                                "bg-primary/5 border-primary/20",
                            compact && "p-2",
                        )}
                        onClick={() => handleToggleExpanded(notification.id)}
                        aria-expanded={expandedId === notification.id}
                        aria-label={`Notification: ${notification.title}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="mt-0.5 flex-shrink-0">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-1 flex items-center justify-between">
                                    <h4 className="text-foreground truncate text-sm font-medium">
                                        {notification.title}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={getNotificationVariant(
                                                notification.type,
                                            )}
                                            className="text-xs"
                                        >
                                            {notification.type}
                                        </Badge>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={e =>
                                                handleDismiss(
                                                    notification.id,
                                                    e,
                                                )
                                            }
                                            className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <p
                                    className={cn(
                                        "text-muted-foreground text-sm",
                                        expandedId === notification.id
                                            ? "line-clamp-none"
                                            : "line-clamp-2",
                                    )}
                                >
                                    {notification.message}
                                </p>
                                {expandedId === notification.id && (
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-muted-foreground text-xs">
                                            {notification.timestamp.toLocaleString()}
                                        </span>
                                        {notification.actionLabel &&
                                            notification.onAction && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    notification.onAction?.();
                                                }}
                                                className="text-xs"
                                            >
                                                {notification.actionLabel}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </CardContent>
        </Card>
    );
};
