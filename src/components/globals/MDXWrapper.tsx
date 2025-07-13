import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AlertProps, CalloutProps, CustomButtonProps, DemoProps, InfoCardProps } from "@/types";

import { MDXProvider } from "@mdx-js/react";

// Custom Alert component for MDX
const CustomAlert = ({ type = "info", children }: AlertProps) => {
    const getAlertStyles = (alertType: string) => {
        switch (alertType) {
        case "warning":
            return "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/50";
        case "error":
            return "border-destructive bg-destructive/10";
        case "success":
            return "border-green-500 bg-green-50/50 dark:bg-green-950/50";
        default:
            return "border-primary bg-primary/10";
        }
    };

    return (
        <Alert className={`my-4 ${getAlertStyles(type)}`}>
            <AlertDescription>{children}</AlertDescription>
        </Alert>
    );
};

// Custom Info Card component for MDX
const CustomInfoCard = ({ title, children }: InfoCardProps) => (
    <Card className="my-4">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
);

// Custom Callout component for MDX
const CustomCallout = ({ type = "note", children }: CalloutProps) => {
    const getCalloutStyles = (calloutType: string) => {
        switch (calloutType) {
        case "tip":
            return "border-green-500 bg-green-50/50 dark:bg-green-950/50";
        case "warning":
            return "border-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/50";
        case "important":
            return "border-destructive bg-destructive/10";
        default:
            return "border-primary bg-primary/10";
        }
    };

    const getCalloutIcon = (calloutType: string) => {
        switch (calloutType) {
        case "tip":
            return "💡";
        case "warning":
            return "⚠️";
        case "important":
            return "🔥";
        default:
            return "📝";
        }
    };

    return (
        <div className={`my-4 rounded-r-md border-l-4 p-4 ${getCalloutStyles(type)}`}>
            <div className="flex items-start">
                <span className="mr-2 text-lg">{getCalloutIcon(type)}</span>
                <div className="flex-1">{children}</div>
            </div>
        </div>
    );
};

// Custom Demo component for MDX
const CustomDemo = ({ title, description, children }: DemoProps) => (
    <div className="border-border my-6 overflow-hidden rounded-lg border">
        <div className="border-border bg-muted border-b p-4">
            <h3 className="font-medium">{title}</h3>
            {description && <p className="text-muted-foreground mt-1 text-sm">{description}</p>}
        </div>
        <div className="bg-card p-4">{children}</div>
    </div>
);

// Custom Button component for MDX
const CustomButton = ({ children, variant = "default", onClick }: CustomButtonProps) => (
    <Button variant={variant} onClick={onClick} className="my-2">
        {children}
    </Button>
);

// All MDX components available for use
const mdxComponents = {
    Alert: CustomAlert,
    InfoCard: CustomInfoCard,
    Callout: CustomCallout,
    Demo: CustomDemo,
    Button: CustomButton,
};

// Main MDX wrapper component
export function MDXWrapper({ children }: { children: React.ReactNode }) {
    return <MDXProvider components={mdxComponents}>{children}</MDXProvider>;
}
