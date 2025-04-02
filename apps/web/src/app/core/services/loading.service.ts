// loading.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private progressValueSubject = new BehaviorSubject<Number | null>(null);
  loading$ = this.loadingSubject.asObservable();
  progressValue$ = this.progressValueSubject.asObservable();

  show(determinateValue: Boolean = false) {
    if (determinateValue === true) {
      this.progressValueSubject.next(10)
    }

    this.loadingSubject.next(true);
  }

  updateProgressValue(determinateValue: Number) {
    this.progressValueSubject.next(determinateValue);
  }

  hide() {
    this.loadingSubject.next(false);
  }
}
