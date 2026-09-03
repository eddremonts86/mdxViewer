/**
 * The trash.
 *
 * PRODUCT.md's fourth principle says destructive actions are recoverable. Before
 * this, a delete was `fs.rm` and the confirmation dialog told you how many
 * documents were about to stop existing — explicit, but not recoverable.
 *
 * An entry is one directory under the trash root:
 *
 *     trash/<id>/meta.json   where it came from, and when
 *     trash/<id>/<name>      the document or folder itself, under its own name
 *
 * A directory per entry rather than one shared index, because two people
 * deleting at once would race on a shared file and this way they cannot.
 */

import { promises as fs } from "fs";
import path from "path";

import { resolveInsideTrash, trashRoot } from "./validation.js";

export interface TrashEntry {
    id: string;
    /** Where it was, relative to the content root. Restoring puts it back here. */
    originalPath: string;
    name: string;
    type: "file" | "folder";
    size: number;
    deletedAt: string;
}

const META = "meta.json";
const ID_RADIX = 36;
const ID_ENTROPY = 1e9;

/** Sortable by time, unique enough for two deletes in the same millisecond. */
const newId = (): string =>
    `${Date.now().toString(ID_RADIX)}-${Math.floor(Math.random() * ID_ENTROPY).toString(ID_RADIX)}`;

/**
 * Rename, falling back to copy-and-remove.
 *
 * `fs.rename` cannot cross filesystems, and the content folder is often a mount
 * — audience 2 points this at a docs directory it already owns.
 */
const relocate = async (from: string, to: string): Promise<void> => {
    try {
        await fs.rename(from, to);
    } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EXDEV") throw error;
        await fs.cp(from, to, { recursive: true });
        await fs.rm(from, { recursive: true, force: true });
    }
};

/** Move something out of the content folder and record where it came from. */
export const moveToTrash = async (fullPath: string, originalPath: string): Promise<TrashEntry> => {
    const stats = await fs.stat(fullPath);
    const entry: TrashEntry = {
        id: newId(),
        originalPath,
        name: path.basename(originalPath),
        type: stats.isDirectory() ? "folder" : "file",
        size: stats.size,
        deletedAt: new Date().toISOString(),
    };

    const entryDir = path.join(trashRoot(), entry.id);
    await fs.mkdir(entryDir, { recursive: true });
    await relocate(fullPath, path.join(entryDir, entry.name));
    await fs.writeFile(path.join(entryDir, META), JSON.stringify(entry, null, 2), "utf8");

    return entry;
};

/** Everything waiting in the trash, most recently deleted first. */
export const listTrash = async (): Promise<TrashEntry[]> => {
    let ids: string[];
    try {
        ids = await fs.readdir(trashRoot());
    } catch {
        return [];
    }

    const entries = await Promise.all(
        ids.map(async id => {
            try {
                const raw = await fs.readFile(path.join(trashRoot(), id, META), "utf8");
                return JSON.parse(raw) as TrashEntry;
            } catch {
                // A half-written or hand-edited entry is skipped rather than
                // failing the whole listing; purging it is still possible.
                return null;
            }
        })
    );

    return entries
        .filter((entry): entry is TrashEntry => entry !== null)
        .sort((first, second) => second.deletedAt.localeCompare(first.deletedAt));
};

/** The entry's own directory, or null when the id names nothing inside the trash. */
export const trashEntryDir = async (id: unknown): Promise<string | null> => {
    if (typeof id !== "string" || !id) return null;

    const dir = resolveInsideTrash(id);
    if (!dir) return null;

    try {
        const stats = await fs.stat(dir);
        return stats.isDirectory() ? dir : null;
    } catch {
        return null;
    }
};

export const readTrashEntry = async (dir: string): Promise<TrashEntry | null> => {
    try {
        return JSON.parse(await fs.readFile(path.join(dir, META), "utf8")) as TrashEntry;
    } catch {
        return null;
    }
};

/** Put an entry back where it came from. `target` is already checked for containment. */
export const restoreFromTrash = async (dir: string, entry: TrashEntry, target: string): Promise<void> => {
    await fs.mkdir(path.dirname(target), { recursive: true });
    await relocate(path.join(dir, entry.name), target);
    await fs.rm(dir, { recursive: true, force: true });
};

/** Permanent. Nothing comes back from here. */
export const purgeFromTrash = async (dir: string): Promise<void> => {
    await fs.rm(dir, { recursive: true, force: true });
};
