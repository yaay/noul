import { HostListener, Injectable } from '@angular/core';
import PocketBase from 'pocketbase';
import { environment } from 'src/environments/environment';
import { note } from '../models/note';
import { loom } from '../models/loom';
import { Router } from '@angular/router';
import { ErrorHandlerService } from './error-handler.service';
import { LoadingService } from './loading.service';
import { ConnectionService, ConnectionState } from 'ng-connection-service';
import { BehaviorSubject, Observable } from 'rxjs';
import { SyncService } from './sync.service';
import { CacheService } from './cache.service';
interface ErrorData {
  [key: string]: {
    code: string;
    message: string;
  };
}

@Injectable({
  providedIn: 'root',
})

export class PocketbaseService {
  isOnline: boolean = true;
  
  constructor(
    private router: Router,
    private loadingService: LoadingService,
    private connectionService: ConnectionService,
    public errorHandler: ErrorHandlerService,
    private cacheService: CacheService
    ) {
      this.connectionService.monitor().subscribe(isOnline => {
        this.isOnline = isOnline.hasNetworkConnection
      });
    }

  pb = new PocketBase(environment.pbUrl);


  async signUp(userData: any) {
    this.loadingService.show();
    this.pb.collection('users').create(userData)
    .then((res) => {
      if (res) {
        this.router.navigate(['/login']);
        this.errorHandler.alert('Your account created successfully!', 10)
      } 
    })
    .catch((error) => {
      const errorData = error.data.data as ErrorData

      for (const [key, value] of Object.entries(errorData)) {
        this.errorHandler.alert(`${key}: ${value.message}`, 10)
      }
    })
    .finally(() => this.loadingService.hide());
  }

  async login(user: string, pass: string) {
    this.loadingService.show();
    this.pb
      .collection('users')
      .authWithPassword(user, pass)
      .then((res) => {
        if(res.record['verified']) {
          this.loadingService.hide();
          this.router.navigate(['/'])
        } else if (res.record['verified'] === false) {
          //handle this later!!!
          // this.logOut()
          this.loadingService.hide();
          // this.errorHandler.alert("Please verify your email")
          this.router.navigate(['/'])
        }
      })
      .catch(() => {
        // if (error.code === 400) {
          this.loadingService.hide();
          this.errorHandler.alert("Incorrect email or password")
        // }
      })
  }

  async googleLogin() {
    this.loadingService.show();
    this.pb.collection('users').authWithOAuth2({ provider: 'google' })
    .then(() => this.router.navigate(['/']))
    .catch(() => this.errorHandler.alert("Failed to connect to Google servers."))
    .finally(() => this.loadingService.hide());
  }

  async syncToPocketBase(notes: note[], looms: loom[]) {
    this.loadingService.show();
    for (const loom of looms) {
      try {
        await this.pb
          .collection('looms')
          .create({ ...loom, created_by: this.pb.authStore.model?.['id'] })
          .then(() => this.loadingService.hide())
      } catch(error: any) {
          this.errorHandler.alert(error)
          this.loadingService.hide();
      }
    }

    for (const note of notes) {
      await this.pb
        .collection('notes')
        .create({ ...note, created_by: this.pb.authStore.model?.['id'] });
    }
  }

  async addLoom(loom: loom) {
    // try {
    //   await this.pb.collection('looms').create({...loom, created_by: this.userId(), is_online: true}, { requestKey: null })
    // } catch (error: any) {
    //   this.errorHandler.alert(error)
    // }

    const newThread = {
      ...loom,
      created_by: this.userId(),
      is_online: true,
      created_at: new Date().toISOString()
    };

    return this.pb.collection('looms').create(newThread, { requestKey: null })
    .catch(error => {
      this.errorHandler.alert(error);
      throw error;
    });


  }

  async addNote(note: note) {
    
    const newNote = {
      ...note,
      created_by: this.userId()
    }

    return this.pb.collection('notes').create(newNote, { requestKey: null })
    .catch(error => {
      this.errorHandler.alert(error);
      throw error;
    });

  }
  
  getNotes() {
    try {
      const notes = this.pb.collection('notes').getFullList({ sort: 'created' });
      return notes
    } catch (error: any) {
      this.errorHandler.alert(error)
      throw new Error('Failed to retrieve notes. Please try again later.');
    }
  }

  getLooms() {
    try {
      const looms = this.pb.collection('looms').getFullList({ sort: 'created' });
      return looms
    } catch (error: any) {
      this.errorHandler.alert(error)
      throw new Error('Failed to retrieve looms. Please try again later.');
    }
  }

  async editLoom(thread: loom) {
    const updatedThread = {
      ...thread,
      created_by: this.userId()
    };


    return this.pb.collection('looms').update(String(thread.id), updatedThread)
    .catch(error => {
      this.errorHandler.alert(error);
      throw error;
    });

  }

  async editNote(note: note) { 
    const updatedNote = {
      ...note,
      created_by: this.userId()
    }

    return this.pb.collection('notes').update(String(note.id), updatedNote, { requestKey: null })
    .catch(error => {
      this.errorHandler.alert(error);
      throw error;
    });
  }

  async deleteLoom(loomId: number) {
    try {
      await this.pb.collection('looms').delete(String(loomId));
    } catch (error: any) {
      this.errorHandler.alert(error)
    }
  }

  async deleteNote(noteId: number) {
    try {
      await this.pb.collection('notes').delete(String(noteId));
    } catch (error: any) {
      this.errorHandler.alert(error)
    }
  }

  isAuthenticated() {
    return this.pb.authStore.isValid;
  }

  isAuthAndOnline() {
    return this.pb.authStore.isValid && this.isOnline;
  }

  userId() {
    return this.pb.authStore.model?.['id']
  }

  testS() {
    console.log(this.pb.authStore)
  }

  logOut() {
    this.pb.authStore.clear()
  }
}
