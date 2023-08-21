import { Component } from '@angular/core';
import { FirebaseAuthService } from '../services/firebase-auth.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  email?: string;
  password?: string;
  loginError?: string;
  constructor(private authService: FirebaseAuthService) {}
  isToastOpen = false;
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }

  async login() {
    if (!this.email || !this.password) {
      if (!this.email) {
        this.loginError = 'Enter your email';
      } else {
        this.loginError = 'Enter your password';
      }
      this.setOpen(true);
    } else {
      try {
        await this.authService.login(this.email, this.password);
      } catch (error) {
        if (error instanceof Error) {
          this.loginError = error.message;
          this.setOpen(true);
        }
      }
    }
  }
}
