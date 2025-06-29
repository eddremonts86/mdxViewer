/**
 * View Transitions utility for smooth navigation
 * Implements the CSS View Transitions API with fallbacks
 *
 * Features:
 * - Automatic fallback for unsupported browsers
 * - TypeScript support with proper types
 * - Configurable transition options
 * - Support for both programmatic and declarative transitions
 */

export interface ViewTransitionOptions {
    /** Whether to skip transition if user prefers reduced motion */
    respectReducedMotion?: boolean;
    /** Custom transition name for CSS targeting */
    transitionName?: string;
    /** Whether to log transition events for debugging */
    debug?: boolean;
}

/**
 * Checks if View Transitions API is supported in the current browser
 */
export function isViewTransitionSupported(): boolean {
    return typeof document !== "undefined" && "startViewTransition" in document;
}

/**
 * Checks if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Executes a view transition with proper fallback handling
 *
 * @param callback - Function to execute during the transition
 * @param options - Configuration options for the transition
 * @returns Promise that resolves when transition is complete
 */
export async function executeViewTransition(
    callback: () => void | Promise<void>,
    options: ViewTransitionOptions = {}
): Promise<void> {
    const {
        respectReducedMotion = true,
        transitionName,
        debug = false,
    } = options;

    // Skip transition if user prefers reduced motion and we should respect it
    if (respectReducedMotion && prefersReducedMotion()) {
        if (debug)
            console.log("View transition skipped: user prefers reduced motion");
        await callback();
        return;
    }

    // Skip transition if API is not supported
    if (!isViewTransitionSupported()) {
        if (debug) console.log("View transition skipped: API not supported");
        await callback();
        return;
    }

    try {
        if (debug) console.log("Starting view transition", { transitionName });

        // Add transition name to document if provided
        if (transitionName) {
            document.documentElement.style.setProperty(
                "--transition-name",
                transitionName
            );
        }

        const transition = (document as any).startViewTransition(callback);

        if (debug) {
            transition.ready.then(() => console.log("View transition ready"));
            transition.finished.then(() =>
                console.log("View transition finished")
            );
        }

        await transition.finished;

        // Clean up transition name
        if (transitionName) {
            document.documentElement.style.removeProperty("--transition-name");
        }
    } catch (error) {
        if (debug) console.error("View transition failed:", error);
        // Fallback: execute callback without transition
        await callback();
    }
}

/**
 * Creates a view transition for navigation between routes
 * Designed to work with React Router or similar routing libraries
 *
 * @param navigationCallback - Function that performs the navigation
 * @param options - Configuration options
 * @returns Promise that resolves when navigation is complete
 */
export async function transitionToRoute(
    navigationCallback: () => void | Promise<void>,
    options: ViewTransitionOptions = {}
): Promise<void> {
    return executeViewTransition(navigationCallback, {
        respectReducedMotion: true,
        transitionName: "route-transition",
        debug: process.env.NODE_ENV === "development",
        ...options,
    });
}

/**
 * Creates a view transition for modal/dialog state changes
 *
 * @param callback - Function that changes the modal state
 * @param options - Configuration options
 * @returns Promise that resolves when transition is complete
 */
export async function transitionModal(
    callback: () => void | Promise<void>,
    options: ViewTransitionOptions = {}
): Promise<void> {
    return executeViewTransition(callback, {
        respectReducedMotion: true,
        transitionName: "modal-transition",
        ...options,
    });
}

/**
 * Creates a view transition for theme changes
 *
 * @param callback - Function that changes the theme
 * @param options - Configuration options
 * @returns Promise that resolves when transition is complete
 */
export async function transitionTheme(
    callback: () => void | Promise<void>,
    options: ViewTransitionOptions = {}
): Promise<void> {
    return executeViewTransition(callback, {
        respectReducedMotion: false, // Theme transitions are usually acceptable even with reduced motion
        transitionName: "theme-transition",
        ...options,
    });
}

/**
 * Hook for View Transitions in React components
 * Returns utilities for creating smooth transitions
 */
export function useViewTransitions() {
    return {
        isSupported: isViewTransitionSupported(),
        prefersReducedMotion: prefersReducedMotion(),
        executeTransition: executeViewTransition,
        transitionToRoute,
        transitionModal,
        transitionTheme,
    };
}
