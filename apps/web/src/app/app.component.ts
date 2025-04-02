import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoadingOverlayComponent } from './shared/components/loading-overlay/loading-overlay.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: true,
  imports: [RouterModule, LoadingOverlayComponent]
})
export class AppComponent {
  title = 'Noul';
}
