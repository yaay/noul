import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { PocketbaseService } from 'src/app/core/services/pocketbase.service';
import { MaterialModule } from 'src/app/shared/material/material.module';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule, RouterModule],
})
export class SignupComponent {

  constructor(private pocketbaseService: PocketbaseService) {
    merge(
      this.signupForm.controls.email.statusChanges,
      this.signupForm.controls.email.valueChanges,
      this.signupForm.controls.password.statusChanges,
      this.signupForm.controls.password.valueChanges,
      this.signupForm.controls.passwordConfirm.statusChanges,
      this.signupForm.controls.passwordConfirm.valueChanges,
    )
    .pipe(takeUntilDestroyed())
    .subscribe(() => this.updateErrorMessages());
  }

  signupForm = new FormGroup ({
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl(''),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
    passwordConfirm: new FormControl('', [Validators.required])
  }, { validators: this.passwordMatchValidator() })

  errorMessages = {
    name: signal(''),
    email: signal(''),
    password: signal(''),
    passwordConfirm: signal('')
  };


  updateErrorMessages() {
    this.updateFieldErrorMessage('email', 'Email is required', 'Not a valid email');
    this.updateFieldErrorMessage('password', 'Password is required', 'Use 8 characters or more for your password');
    this.updateFieldErrorMessage('passwordConfirm', 'Password confirmation is required', 'Passwords do not match');
  }

  updateFieldErrorMessage(field: keyof typeof this.signupForm.controls, requiredMessage: string, invalidMessage?: string) {
    const control = this.signupForm.controls[field];

    if (control?.errors || (field === 'passwordConfirm' && this.signupForm.hasError('passwordMismatch'))) {
      if (control.errors?.['required']) {
        this.errorMessages[field].set(requiredMessage);
      } else if (invalidMessage && (control.errors?.['email'] || control.errors?.['minlength'] || (field === 'passwordConfirm' && this.signupForm.hasError('passwordMismatch')))) {
        this.errorMessages[field].set(invalidMessage);
      }
    } else {
      this.errorMessages[field].set('');
    }
  }


  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): {[key: string]: any} | null => {
      const password = control.get('password');
      const passwordConfirm = control.get('passwordConfirm');
      
      if (password && passwordConfirm && password.value !== passwordConfirm.value) {
        passwordConfirm.setErrors({passwordMismatch: true});
        return { passwordMismatch: true };
      } else {
        passwordConfirm?.setErrors(null);
        return null;
      }
    };
  }

  googleSignup() {
    this.pocketbaseService.googleLogin();
  }

  signup() {
    if(this.signupForm.valid) {
      this.pocketbaseService.signUp(this.signupForm.value)
    }
  }
}


