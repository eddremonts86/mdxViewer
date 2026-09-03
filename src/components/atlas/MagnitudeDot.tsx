import { radiusForMagnitude } from "@/lib/atlas";
import { cn } from "@/lib/utils";

interface MagnitudeDotProps {
    /** 0 (brightest, largest file) to 5 (faintest). */
    magnitude: number;
    /** Modified within the last 7 days: drawn ringed, the atlas mark for a variable object. */
    variable?: boolean;
    /** Selected into the drawn set. */
    drawn?: boolean;
    className?: string;
}

/**
 * A document plotted as a point. Diameter carries the ranking that type declines
 * to carry, so hierarchy survives both renditions and any color vision.
 */
export function MagnitudeDot({ magnitude, variable = false, drawn = false, className }: MagnitudeDotProps) {
    const diameter = radiusForMagnitude(magnitude) * 2;

    return (
        <span
            className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
            style={{ width: 15, height: 15 }}
            aria-hidden="true"
        >
            <span
                className={cn("bg-star rounded-full transition-colors", drawn && "bg-mark")}
                style={{ width: diameter, height: diameter }}
            />
            {variable ? (
                <span
                    className="border-mark absolute rounded-full border"
                    style={{ width: diameter + 6, height: diameter + 6 }}
                />
            ) : null}
        </span>
    );
}
