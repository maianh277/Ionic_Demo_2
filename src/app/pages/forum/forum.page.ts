import { Component, OnInit } from '@angular/core';
import { FirebaseAuthService } from 'src/app/services/firebase-auth.service';
import {
  FirestoreDataService,
  Forum,
} from 'src/app/services/firestore-data.service';
import { AlertController } from '@ionic/angular';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { format } from 'date-fns';
import { isThisISOWeek } from 'date-fns/esm';
@Component({
  selector: 'app-forum',
  templateUrl: './forum.page.html',
  styleUrls: ['./forum.page.scss'],
})
export class ForumPage implements OnInit {
  ionProjects: Forum[] = [];
  pagedProjects: Forum[] = [];
  itemsPerPage = 5;
  currentPage = 1;
  currentUser: firebase.User | null = null;
  loginError?: string;
  isToastOpen = false;
  setOpen(isOpen: boolean) {
    this.isToastOpen = isOpen;
  }
  constructor(
    private alertCtrl: AlertController,
    private authService: FirebaseAuthService,
    private firestoreService: FirestoreDataService
  ) {}
  ngOnInit() {
    // this.fetchIonProjects();
    this.authService.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
      this.fetchIonProjects();
    });
  }

  fetchIonProjects() {
    this.firestoreService.getAllPosts().subscribe((projects) => {
      this.ionProjects = projects;
      this.pageChanged(this.currentPage);
    });
  }

  pageChanged(pageNumber: number) {
    this.currentPage = pageNumber;
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.pagedProjects = this.ionProjects.slice(startIndex, endIndex);
  }

  getTotalPages() {
    return Math.ceil(this.ionProjects.length / this.itemsPerPage);
  }

  goToNextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.pageChanged(this.currentPage + 1);
    }
  }

  goToPreviousPage() {
    if (this.currentPage > 1) {
      this.pageChanged(this.currentPage - 1);
    }
  }
  calculatedate(time: Date): string {
    const now = new Date();
    const timeDifference = now.getTime() - time.getTime();
    const seconds = Math.floor(timeDifference / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return days + 'days left';
    } else if (hours > 0) {
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return (hours % 24) + 'hours left';
      } else {
        return (hours % 24) + 'hours ' + remainingMinutes + 'minutes';
      }
    } else if (minutes > 0) {
      return minutes + '分前';
    }
    return '数秒前';
  }
  async addPost() {
    this.firestoreService.getCurrentUser().subscribe(async (user) => {
      if (!user) {
        console.error('No authenticated user found');
        return;
      }

      const alert = await this.alertCtrl.create({
        header: 'Add Post',
        inputs: [
          { name: 'content', placeholder: 'Enter content', type: 'textarea' },
        ],
        buttons: [
          { text: 'Cancel', role: 'cancel' },
          {
            text: 'Add',
            handler: async (res) => {
              const { content } = res;
              const author = user.email || '';
              const datePosted = this.calculatedate(new Date());

              const newPost: Forum = {
                id: '',
                author,
                content,
                datePosted,
              };

              if (!content) {
                this.loginError = 'Please input content';
                this.setOpen(true);
              } else
                try {
                  await this.firestoreService.addPost(newPost);
                  console.log('Post added successfully');
                  this.fetchIonProjects();
                } catch (error) {
                  console.error('Error adding post:', error);
                }
            },
          },
        ],
      });
      await alert.present();
    });
  }
  // async canEditPost(author: string): Promise<boolean> {
  //   const currentUserEmail = await this.firestoreService.getCurrentUserEmail();
  //   return currentUserEmail === author;
  // }

  // async editPostIfAllowed(author: string, postId: string) {
  //   const canEdit = await this.canEditPost(author);
  //   if (canEdit) {
  //     await this.editPost(postId);
  //   } else {
  //     this.setOpen(true);
  //   }
  // }

  isCurrentUserAuthor(author: string | undefined): boolean {
    return (
      !!author && this.currentUser !== null && author === this.currentUser.email
    );
  }
  async editPost(id: string, author: string | undefined) {
    if (!author) {
      console.error('Author information is missing.');
      return;
    }

    if (!this.isCurrentUserAuthor(author)) {
      this.setOpen(true);
      this.loginError = 'You can not edit this post';
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Edit Note',
      inputs: [
        { name: 'content', placeholder: 'Enter content', type: 'textarea' },
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Save',
          handler: async (res) => {
            const { content } = res;
            if (!content) {
              this.loginError = 'Please input content';
              this.setOpen(true);
            } else {
              try {
                await this.firestoreService.editPost(id, content);
                console.log('Post edited successfully');
                this.fetchIonProjects();
              } catch (error) {
                console.error('Error editing post:', error);
              }
            }
          },
        },
      ],
    });
    await alert.present();
  }

  deletePost(id: string) {
    this.firestoreService
      .deletePost(id)
      .then(() => {
        console.log('Post deleted successfully');
        this.fetchIonProjects();
      })
      .catch((error) => {
        console.error('Error deleting post:', error);
      });
  }

  async deleteAlert(id: string, author: string | undefined) {
    if (!author) {
      console.error('Author information is missing.');
      return;
    }
    if (!this.isCurrentUserAuthor(author)) {
      this.setOpen(true);
      this.loginError = 'You can not delete this post';
      return;
    }
    const confirmAlert = await this.alertCtrl.create({
      header: 'Confirm!',
      message: 'Do you want to delete this post?',
      buttons: [
        {
          text: 'Cancel',
          handler() {
            console.log('Confirm cancel');
          },
        },
        {
          text: 'OK',
          handler: () => {
            console.log('Confirm OK');
            this.deletePost(id);
          },
        },
      ],
    });
    await confirmAlert.present();
  }

  logout() {
    this.authService.logout();
  }
}
