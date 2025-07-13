import React from "react";
import { useNavigate } from "react-router-dom";

import { transitionToRoute } from "@/utils/viewTransitions";

interface TransitionLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    /** The route to navigate to */
    to: string;
    /** Optional transition name for CSS targeting */
    transitionName?: string;
    /** Whether to replace the current entry in history */
    replace?: boolean;
    /** Whether to respect user's reduced motion preference */
    respectReducedMotion?: boolean;
    /** Custom className */
    className?: string;
    /** Child elements */
    children: React.ReactNode;
}

/**
 * TransitionLink component that provides smooth transitions between routes
 * Uses the View Transitions API with proper fallbacks
 *
 * Features:
 * - Smooth page transitions using View Transitions API
 * - Automatic fallback for unsupported browsers
 * - Respects user motion preferences
 * - Works with React Router
 * - Accessible by default
 */
export const TransitionLink: React.FC<TransitionLinkProps> = ({
    to,
    transitionName = "route-transition",
    replace = false,
    respectReducedMotion = true,
    className = "",
    children,
    onClick,
    ...props
}) => {
    const navigate = useNavigate();

    const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Call any custom onClick handler first
        if (onClick) {
            onClick(e);
        }

        // Don't interfere with modified clicks (middle click, ctrl+click, etc.)
        if (e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0 || e.defaultPrevented) {
            return;
        }

        // Don't interfere with external links
        if (to.startsWith("http") || to.startsWith("//")) {
            return;
        }

        e.preventDefault();

        // Use View Transitions for smooth navigation
        await transitionToRoute(
            () => {
                navigate(to, { replace });
            },
            {
                transitionName,
                respectReducedMotion,
                debug: process.env.NODE_ENV === "development",
            },
        );
    };

    return (
        <a href={to} className={className} onClick={handleClick} {...props}>
            {children}
        </a>
    );
};
