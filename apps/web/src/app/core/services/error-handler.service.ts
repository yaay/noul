import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';
import { NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  routerSubscription: Subscription
  horizontalPosition: MatSnackBarHorizontalPosition = 'start';

  constructor(
    private _snackBar: MatSnackBar,
    private router: Router
  ) {
    this.routerSubscription = this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.dismissSnackbar();
      }
    });
  }

  dismissSnackbar() {
    if (this._snackBar) {
      this._snackBar.dismiss();
    }
  }

  alert(message: string, duration: number = 3,action: string = 'Close') {
    this._snackBar.open(message, action, {duration: (duration*1000)}), {
      horizontalPosition: this.horizontalPosition
    };
  }
}
