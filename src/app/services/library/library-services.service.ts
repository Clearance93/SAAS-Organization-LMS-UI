import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ILibrary } from '../../interfaces/library/ilibrary';
import { BehaviorSubject, Observable, throwError, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { LibraryModel } from '../../features/organization/models/library/library-model';

@Injectable({
  providedIn: 'root'
})
export class LibraryServicesService {
  private apiUrl = "https://localhost:7270/api/Library"
  
  constructor(private http: HttpClient) {
    console.log('LibraryServicesService initialized with URL:', this.apiUrl);
  }

  private librarySubject = new BehaviorSubject<ILibrary[]>([]);

  public library$ = this.librarySubject.asObservable();

  public loadLibraryBooks(): Observable<LibraryModel[]> {
    console.log('LibraryService: Loading all books...');
    return this.getAllBooks();
  }

  testConnection(): Observable<any> {
    console.log('Testing connection to:', this.apiUrl);
    return this.http.get(`${this.apiUrl}/getAllLibraryItems`).pipe(
      tap(response => {
        console.log('Connection successful:', response);
      }),
      catchError(error => {
        console.error('Connection failed:', error);
        return of(null);
      })
    );
  }

  checkApiHealth(): void {
    console.log('=== API Health Check ===');
    console.log('Attempting to connect to:', this.apiUrl);
    console.log('Make sure your .NET API is running on https://localhost:7270');
  }



  addBook(bookData: ILibrary): Observable<LibraryModel> {
    const url = `${this.apiUrl}/addLibraryItem`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    
    const model = new LibraryModel(
      bookData.libraryId || '',
      bookData.title || '',
      bookData.author || '',
      bookData.genre || '',
      bookData.description || '',
      (bookData.coverPage as any) || null,
      (bookData as any).year || null,
      (bookData.book as any) || null
    );

    const payload: any = model.toJson();

    if ((bookData as any).organizationId) {
      payload.library = (bookData as any).organizationId;
    }

    if (!payload.libraryId) {
      delete payload.libraryId;
    }

    console.log('Adding book with payload:', payload);
    console.log('API URL:', url);

    return this.http.post<LibraryModel>(url, payload, { headers })
      .pipe(
        tap(response => {
          console.log('Add book response:', response);
          this.loadLibraryBooks(); 
        }),
        catchError(error => {
          console.error('Add book error details:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);
          console.error('Error body:', error.error);

          let validationMessages: string[] = [];
          if (error.error) {
            const errBody = error.error;
            if (errBody.errors && typeof errBody.errors === 'object') {

              for (const key of Object.keys(errBody.errors)) {
                const val = errBody.errors[key];
                if (Array.isArray(val)) {
                  validationMessages.push(...val.map(v => `${key}: ${v}`));
                } else if (typeof val === 'string') {
                  validationMessages.push(`${key}: ${val}`);
                }
              }
            } else if (errBody.ModelState && typeof errBody.ModelState === 'object') {
              for (const key of Object.keys(errBody.ModelState)) {
                const val = errBody.ModelState[key];
                if (Array.isArray(val)) {
                  validationMessages.push(...val.map(v => `${key}: ${v}`));
                } else if (typeof val === 'string') {
                  validationMessages.push(`${key}: ${val}`);
                }
              }
            } else if (errBody.message) {
              validationMessages.push(errBody.message);
            }
          }

          if (validationMessages.length) {
            console.error('Validation errors:', validationMessages);

            const aggregated = validationMessages.join(' | ');
            return throwError(() => new Error(aggregated));
          }

          return this.handleError(error);
        })
      );
  }

  getAllBooks(): Observable<LibraryModel[]> {
    const url = `${this.apiUrl}/getAllLibraryItems`;
    console.log('Calling API:', url);

    return this.http.get<any>(url).pipe(
      tap(response => {
        console.log('Raw API Response:', response);
        console.log('Response type:', typeof response);
        console.log('Is array:', Array.isArray(response));
      }),
      map(response => {

        let books: any[] = [];
        
        if (Array.isArray(response)) {
          books = response;
        } else if (response && typeof response === 'object') {
          if (response.data && Array.isArray(response.data)) {
            books = response.data;
          } else if (response.$values && Array.isArray(response.$values)) {
            books = response.$values;
          } else if (response.items && Array.isArray(response.items)) {
            books = response.items;
          } else {
            console.warn('Unknown response format:', response);
            return [];
          }
        } else {
          console.warn('API returned invalid data:', response);
          return [];
        }
        
        console.log('Processed books array:', books);
        return books.map(book => {
          try {
            return LibraryModel.fromJson(book);
          } catch (error) {
            console.error('Error mapping book:', book, error);
            return null;
          }
        }).filter(book => book !== null);
      }),
      tap(books => {
        console.log('Final mapped books:', books);
        this.librarySubject.next(books);
      }),
      catchError(error => {
        console.error('getAllBooks Error Details:');
        console.error('Status:', error.status);
        console.error('Message:', error.message);
        console.error('Full error:', error);
        
        // Return empty array instead of throwing error
        this.librarySubject.next([]);
        return of([]);
      })
    );
  }

  deleteBook(id: string): Observable<void> {
    const url = `${this.apiUrl}/deleteLibraryItem/${id}`;

    return this.http.delete<void>(url).pipe(
      tap(() => {
        const currentScales = this.librarySubject.value || [];
        const updatedScales = currentScales.filter(book => ((book as any).id) !== id);
        this.librarySubject.next(updatedScales);
      }),
      catchError(this.handleError)
    )
  }

  updateBook(id: string, bookData: ILibrary): Observable<LibraryModel> {
    const url = `${this.apiUrl}/updateLibraryItem/${id}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.put<LibraryModel>(url, bookData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  getBookById(id: string): Observable<LibraryModel> {
    const url = `${this.apiUrl}/getLibraryItemById/${id}`;
    
    return this.http.get<ILibrary>(url).pipe(
      map(book => LibraryModel.fromJson(book)),
      catchError(this.handleError)
    );
  }


  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    let errorMessage = `Error: ${error.message}`;

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;  
      
      if (error.error?.message) {
        errorMessage = error.error.message;
      }
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  } 
}
