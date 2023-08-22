import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import firebase from 'firebase/compat/app';
@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  isLoggedIn = false;

  constructor(public firebaseAuth: AngularFireAuth, private router: Router) {}

  getCurrentUser(): Observable<firebase.User | null> {
    return this.firebaseAuth.authState;
  }

  async login(email: string, password: string) {
    try {
      const res = await this.firebaseAuth.signInWithEmailAndPassword(
        email,
        password
      );
      this.isLoggedIn = true;
      console.log('OK');
      this.router.navigate(['/forum'], {
        queryParams: { user: email.split('@')[0] },
      });
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
