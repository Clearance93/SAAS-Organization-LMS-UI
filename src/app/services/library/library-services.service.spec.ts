import { TestBed } from '@angular/core/testing';

import { LibraryServicesService } from './library-services.service';

describe('LibraryServicesService', () => {
  let service: LibraryServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LibraryServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
