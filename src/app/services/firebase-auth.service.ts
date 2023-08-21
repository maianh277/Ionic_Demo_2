import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  isLoggedIn = false;

  constructor(public firebaseAuth: AngularFireAuth, private router: Router) {}

  async login(email: string, password: string) {
    try {
      const res = await this.firebaseAuth.signInWithEmailAndPassword(
        email,
        password
      );
      this.isLoggedIn = true;
      console.log('OK');
      this.router.navigate(['/forum']);
    } catch (error) {
      console.error('Error signing in:', error);
      this.isLoggedIn = false;

      const firebaseError: any = error; 

      if (firebaseError.code === 'auth/user-not-found') {
        throw new Error('Email is incorrect');
      } else if (firebaseError.code === 'auth/wrong-password') {
        throw new Error('Password is incorrect');
      } else {
        throw new Error('An error occurred during login');
      }
    }
  }

  logout() {
    this.firebaseAuth.signOut();
    this.router.navigate(['/home']);
  }
}
