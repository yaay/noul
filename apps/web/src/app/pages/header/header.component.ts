import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PocketbaseService } from 'src/app/core/services/pocketbase.service';
import { LoadingOverlayComponent } from 'src/app/shared/components/loading-overlay/loading-overlay.component';
import { MaterialModule } from 'src/app/shared/material/material.module';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, MaterialModule, RouterModule, LoadingOverlayComponent]
})
export class HeaderComponent {
  constructor(private pbService: PocketbaseService, private router: Router) {}

  navigateHome(): void {
    this.router.navigate(['/']);
  }

  isAuth() {
    return this.pbService.isAuthenticated()
  }

  isOnline() {
    return this.pbService.isOnline;
  }

  logOut() {
    this.pbService.logOut();
    window.location.reload();
  }

}
