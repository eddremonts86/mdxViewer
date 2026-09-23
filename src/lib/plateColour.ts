/**
 * A folder's own hue, in one place.
 *
 * The chart derives it for the GPU as bytes; a card preview and a survey row need
 * the same hue as CSS. Deriving it twice is how two screens end up disagreeing
 * about what colour a folder is, so both take it from here.
 */

const GOLDEN_ANGLE = 137.508;

/**
 * Taken from the path so it is stable — the same folder is the same colour in
 * every session, on every machine — and spaced by the golden angle so two
 * folders next to each other in the tree never land on neighbouring hues.
 */
export function plateHue(folderPath: string): number {
    let hash = 0;
    for (let index = 0; index < folderPath.length; index++) {
        hash = (Math.imul(hash, 31) + folderPath.charCodeAt(index)) >>> 0;
    }
    return ((hash % 360) * GOLDEN_ANGLE) % 360;
}

/**
 * Saturation and lightness belong to the rendition, never to the hash: emitted
 * light on the night ground, pressed ink on chart paper. That is what keeps the
 * set reading as one palette rather than as confetti.
 */
export const PLATE_SATURATION = { dark: 0.62, light: 0.55 } as const;
export const PLATE_LIGHTNESS = { dark: 0.63, light: 0.42 } as const;

/** The hue as CSS, for anything drawn outside the GPU. */
export function plateColour(folderPath: string, rendition: "dark" | "light", alpha = 1): string {
    const hue = plateHue(folderPath);
    const saturation = PLATE_SATURATION[rendition] * 100;
    const lightness = PLATE_LIGHTNESS[rendition] * 100;
    return alpha === 1
        ? `hsl(${hue.toFixed(1)} ${saturation}% ${lightness}%)`
        : `hsl(${hue.toFixed(1)} ${saturation}% ${lightness}% / ${alpha})`;
}
