import { LibraryItem } from "./library-item";

export interface LibrarySettings {
    items: LibraryItem[];
    categories: string[];
    accessRiles: Record<string, string[]>;
}
