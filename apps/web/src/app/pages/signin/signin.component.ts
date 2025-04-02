import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PocketbaseService } from 'src/app/core/services/pocketbase.service';
import { LoadingOverlayComponent } from 'src/app/shared/components/loading-overlay/loading-overlay.component';
import { MaterialModule } from 'src/app/shared/material/material.module';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css'],
  standalone: true,
  imports: [LoadingOverlayComponent, MaterialModule, ReactiveFormsModule, RouterModule]
})
export class SigninComponent {
  constructor(
    private pocketbaseService: PocketbaseService,
  ) {}


  loginForm = new FormGroup({
    identity: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [
      Validators.required,
      Validators.minLength(8),
    ]),
  });

  googleLogin() {
    this.pocketbaseService.googleLogin();
  }

  login() {
    if (this.loginForm.valid && typeof this.loginForm.value.identity === 'string' && typeof this.loginForm.value.password === 'string') {
      this.pocketbaseService.login(this.loginForm.value.identity, this.loginForm.value.password)
    }
  }

}
