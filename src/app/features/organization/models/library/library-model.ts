import { ILibrary } from "../../../../interfaces/library/ilibrary";

export class LibraryModel implements ILibrary {
    libraryId: string;
    title: string;
    author: string;
    genre: string;
    coverPage?: string | null;
    description: string;
    year?: string;
    book?: string | null;

    constructor(
        libraryId: string,
        title: string,
        author: string,
        genre: string,
        description: string,
        coverPage?: string | null,
        year?: string,
        book?: string | null
    ) {
        this.libraryId = libraryId;
        this.title = title;
        this.author = author;
        this.genre = genre;
        this.description = description;
        this.coverPage = coverPage;
        this.year = year;
        this.book = book;
    }

    static fromJson(json: any): LibraryModel {
        return new LibraryModel(
            json.libraryId,
            json.title,
            json.author,
            json.genre,
            json.description,
            json.coverImage || json.coverPage,
            json.year,
            json.book
        );
    }

    toJson(): any {
        return {
            libraryId: this.libraryId,
            title: this.title,
            author: this.author,
            genre: this.genre,
            coverImage: this.coverPage,
            description: this.description,
            year: this.year,
            book: this.book
        }
    }
}