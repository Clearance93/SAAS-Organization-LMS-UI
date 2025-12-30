export interface ILibrary {
    libraryId: string;
    title: string;
    author: string;
    genre: string;
    coverPage?: string | null;
    description: string;
    book?: string | null;
}