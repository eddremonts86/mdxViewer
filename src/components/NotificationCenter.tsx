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
    const sortedNotifications = useMemo(() => {
        return [...notifications]
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, maxDisplayed);
    }, [notifications, maxDisplayed]);

    const unreadCount = useMemo(() => {
        return notifications.filter(notification => !notification.isRead)
            .length;
    }, [notifications]);

    // Event handlers with proper typing
    const handleDismiss = useCallback(
        (id: string, event: React.MouseEvent) => {
            event.stopPropagation();
            onDismiss(id);
        },
        [onDismiss]
    );

    const handleToggleExpanded = useCallback(
        (id: string) => {
            setExpandedId(current => (current === id ? null : id));
            onMarkAsRead(id);
        },
        [onMarkAsRead]
    );

    const getNotificationIcon = (type: NotificationData["type"]) => {
        switch (type) {
            case "success":
                return <CheckCircle className="h-4 w-4 text-green-600" />;
            case "error":
                return <AlertCircle className="h-4 w-4 text-destructive" />;
            case "warning":
                return <AlertCircle className="h-4 w-4 text-yellow-600" />;
            case "info":
            default:
                return <Info className="h-4 w-4 text-blue-600" />;
        }
    };

    const getNotificationVariant = (
        type: NotificationData["type"]
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
                    <Info className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
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
                    <CardTitle className="text-base font-medium text-foreground">
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
                            className="text-xs text-muted-foreground hover:text-foreground"
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
                            "w-full text-left border rounded-lg p-3 transition-colors",
                            "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary",
                            !notification.isRead &&
                                "bg-primary/5 border-primary/20",
                            compact && "p-2"
                        )}
                        onClick={() => handleToggleExpanded(notification.id)}
                        aria-expanded={expandedId === notification.id}
                        aria-label={`Notification: ${notification.title}`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-medium text-foreground truncate">
                                        {notification.title}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={getNotificationVariant(
                                                notification.type
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
                                                    e
                                                )
                                            }
                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </div>
                                <p
                                    className={cn(
                                        "text-sm text-muted-foreground",
                                        expandedId === notification.id
                                            ? "line-clamp-none"
                                            : "line-clamp-2"
                                    )}
                                >
                                    {notification.message}
                                </p>
                                {expandedId === notification.id && (
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs text-muted-foreground">
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
