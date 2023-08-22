import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import 'firebase/compat/auth';
import firebase from 'firebase/compat/app';
import { AngularFireAuth } from '@angular/fire/compat/auth';

export interface Forum {
  id: string;
  author?: string;
  content?: string;
  datePosted: string; // Sử dụng kiểu Timestamp ở đây
}

@Injectable({
  providedIn: 'root',
})
export class FirestoreDataService {
  ForumRef: AngularFirestoreCollection<Forum>;

  constructor(private db: AngularFirestore, private auth: AngularFireAuth) {
    this.ForumRef = db.collection<Forum>('Forum', (ref) =>
      ref.orderBy('datePosted', 'desc')
    );
  }

  getCurrentUser(): Observable<firebase.User | null> {
    return this.auth.authState;
  }

  getAllPosts(): Observable<Forum[]> {
    return this.ForumRef.valueChanges({ idField: 'id' });
  }

  addPost(post: Forum): Promise<any> {
    return this.ForumRef.add(post);
  }

  editPost(id: string, content: string): Promise<void> {
    return this.ForumRef.doc(id).update({ content });
  }

  deletePost(id: string): Promise<void> {
    return this.ForumRef.doc(id).delete();
  }

  async getCurrentUserEmail(): Promise<string | null> {
    const user = await this.auth.currentUser;
    return user ? user.email : null;
  }
}
