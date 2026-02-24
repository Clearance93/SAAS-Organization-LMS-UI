import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject, takeUntil } from 'rxjs';
import { ILibrary } from '../../interfaces/library/ilibrary';
import { LibraryServicesService } from '../../services/library/library-services.service';

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.css']
})
export class LibraryComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  currentFilter = 'all';
  searchTerm = '';
  libraryItems: ILibrary[] = [];

  selectedLibraryBook: ILibrary | null = null;
  isBookModalActive = false;

  isPdfReaderActive = false;
  currentPdfUrl = '';
  currentBookTitle = '';
  safePdfUrl: SafeResourceUrl | null = null;

  constructor(private libraryService: LibraryServicesService, private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.libraryService.library$
      .pipe(takeUntil(this.destroy$))
      .subscribe(items => {
        this.libraryItems = items as ILibrary[];
        console.log(`Books loaded successfully: ${this.libraryItems.length} books`);
      });

    // Trigger initial load
    this.libraryService.loadLibraryBooks().pipe(takeUntil(this.destroy$)).subscribe({ 
      next: (books) => {
        console.log(`Library books loaded: ${books.length} books`);
      }, 
      error: (error) => {
        console.error('Failed to load library books:', error);
      } 
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getFilteredBooks(): ILibrary[] {
    return this.libraryItems.filter(book => {
      const matchesFilter = this.currentFilter === 'all' || book.genre === this.currentFilter;
      const term = this.searchTerm ? this.searchTerm.toLowerCase() : '';
      const matchesSearch = !term || book.title.toLowerCase().includes(term) || book.author.toLowerCase().includes(term) || book.genre.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }

  getGenres(): string[] {
    const filteredBooks = this.getFilteredBooks();
    return [...new Set(filteredBooks.map(book => book.genre))];
  }

  getBooksByGenre(genre: string): ILibrary[] {
    return this.getFilteredBooks().filter(book => book.genre === genre);
  }

  setFilter(genre: string): void {
    this.currentFilter = genre;
  }

  onSearchInput(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  openBookModal(book: ILibrary): void {
    this.selectedLibraryBook = book;
    this.isBookModalActive = true;
  }

  closeBookModal(): void {
    this.isBookModalActive = false;
    setTimeout(() => (this.selectedLibraryBook = null), 300);
  }

  closeBookModalOutside(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closeBookModal();
    }
  }

  openPdfReader(book: ILibrary): void {
    this.currentBookTitle = book.title;
    this.currentPdfUrl = book.book || '';
    this.safePdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(`${this.currentPdfUrl}#toolbar=0&navpanes=0&scrollbar=0`);
    this.isPdfReaderActive = true;
  }

  closePdfReader(): void {
    this.isPdfReaderActive = false;
    this.currentPdfUrl = '';
    this.currentBookTitle = '';
    this.safePdfUrl = null;
  }

  closePdfReaderOutside(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal')) {
      this.closePdfReader();
    }
  }

  onPdfLoad(): void {}

  onPdfError(): void {
    console.error('Error loading PDF');
  }
}
