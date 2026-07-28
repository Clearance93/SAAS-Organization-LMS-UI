import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/authServices/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Skip auth headers for direct Azure Blob Storage requests only.
  // The /api/VideoUpload/upload-to-blob endpoint is our own API and needs the Bearer token.
  if (req.url.includes('.blob.core.windows.net')) {
    return next(req);
  }

  const authService = inject(AuthService);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req);
};
