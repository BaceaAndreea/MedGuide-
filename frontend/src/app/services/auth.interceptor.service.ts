import {inject, Injectable} from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import {exhaustMap, Observable, take} from 'rxjs';
import {AuthService} from './auth.service';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class AuthInterceptorService implements HttpInterceptor {
//
//   constructor(private authService: AuthService) {
//   }
//
//   //identifies and handles a given HTTP request and returns an observable of the event stream
//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     console.log('Interceptor should be called for:', req.url);
//
//     return this.authService.user.pipe(
//       take(1),
//       exhaustMap(user => {
//         if (!user) {
//           console.log("No user found, sending request without Authorization.");
//           return next.handle(req);
//         }
//
//         const modifiedRequest = req.clone({
//           setHeaders: {Authorization: `Bearer ${user.token}`}
//         });
//
//         console.log("Sending request with Authorization:", modifiedRequest);
//         return next.handle(modifiedRequest);
//       })
//     );
//   }
// }

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService); // Injectează serviciul direct în funcție

  return authService.user.pipe(
    take(1),
    exhaustMap(user => {
      if (!user) {
        return next(req);
      }
      const modifiedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${user.token}`
        }
      });

      return next(modifiedRequest);
    })
  );
};

