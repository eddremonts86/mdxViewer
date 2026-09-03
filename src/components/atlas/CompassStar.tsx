interface CompassStarProps {
    className?: string;
    size?: number;
}

/**
 * The atlas rose, drawn in the world's own grammar rather than borrowed from an
 * icon set. It marks the primary action and the active chart, and nothing else.
 */
export function CompassStar({ className, size = 12 }: CompassStarProps) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className={className}
            focusable="false"
        >
            <path d="M12 0 L13.6 10.4 L24 12 L13.6 13.6 L12 24 L10.4 13.6 L0 12 L10.4 10.4 Z" fill="currentColor" />
            <path
                d="M12 4.6 L12.7 11.3 L19.4 12 L12.7 12.7 L12 19.4 L11.3 12.7 L4.6 12 L11.3 11.3 Z"
                fill="currentColor"
                opacity="0.45"
            />
        </svg>
    );
}
