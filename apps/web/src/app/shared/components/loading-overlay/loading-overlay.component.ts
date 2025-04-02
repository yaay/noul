import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subscription } from 'rxjs';
import { LoadingService } from 'src/app/core/services/loading.service';

@Component({
  selector: 'app-loading-overlay',
  standalone: true,
  imports: [MatProgressBarModule, CommonModule],
  templateUrl: './loading-overlay.component.html',
  styleUrl: './loading-overlay.component.css',
})
export class LoadingOverlayComponent {
  @Input() roundedBorder: boolean = false;
  progress: Number | null = null;
  private progressSubscription!: Subscription;
  
  constructor (private loadingService: LoadingService) {}

  ngOnInit() {
    this.progressSubscription = this.loadingService.progressValue$.subscribe(
      value => this.progress = value
    );
  }

  isLoading$ = this.loadingService.loading$;

  ngOnDestroy() {
    if (this.progressSubscription) {
      this.progressSubscription.unsubscribe();
    }
  }

}
