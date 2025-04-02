import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { LocalService } from './local.service';
import { OfflineChanges } from '../models/OfflineChanges';
import { note } from '../models/note';
import { loom } from '../models/loom';
import { ErrorHandlerService } from './error-handler.service';

@Injectable({
  providedIn: 'root',
})
export class SyncService {
  constructor(
    private pb: PocketbaseService,
    private localService: LocalService,
    private errorHandler: ErrorHandlerService
  ) {}

  addLoomLocally(newThread: loom) {
    this.localService.looms.add(newThread).catch((error) => {
      alert(`Error adding loom: ${error}`);
    });
  }

  async syncLocalData(threads: loom[], notes: note[]) {
    if (this.pb.isAuthAndOnline() && (threads || notes)) {
      for (const thread of threads) {
        if (thread.is_online) {
          if (thread.is_edit) {
            delete thread.is_edit;

            this.localService.looms.put(thread);
            await this.pb.editLoom(thread).catch((error) => {
              this.errorHandler.alert(`Error syncing threads: ${error}`);
            });
          }
        } else if (!thread.is_online) {
          delete thread.is_edit;

          this.localService.looms.put(thread);

          await this.pb.addLoom(thread).catch((error) => {
            this.errorHandler.alert(`Error syncing threads: ${error}`);
          });
        }
      }

      for (const note of notes) {
        if (note.is_online) {
          if (note.is_edit) {
            delete note.is_edit;
            this.localService.notes.put(note);
            this.pb.editNote(note).catch((error: any) => {
              this.errorHandler.alert(`Error syncing notes: ${error}`);
            });
          }
        } else {
          note.is_online = true;
          delete note.is_edit;
          this.localService.notes.put(note);
          this.pb.addNote(note).catch((error: any) => {
            this.errorHandler.alert(`Error syncing notes: ${error}`);
          });
        }
      }
    }
  }

  async syncPendingDeletes(pendingChanges: OfflineChanges[]) {
    if (this.pb.isAuthAndOnline() && pendingChanges) {
      for (const change of pendingChanges) {
        if (change.type === 'note') {
          this.pb.deleteNote(change.id);
        } else if (change.type === 'thread') {
          this.pb.deleteNote(change.id);
        }
        this.localService.offlineChanges.clear();
      }
    }
  }

  async syncServerData(notes: note[], threads: loom[]) {
    if (this.pb.isAuthAndOnline() && (threads || notes)) {
      this.localService.notes.clear();
      this.localService.looms.clear();

      for (const thread of threads) {
        this.localService.looms.add(thread).catch((error) => {
          this.errorHandler.alert(`Error syncing threads: ${error}`);
        });
      }

      for (const note of notes) {
        this.localService.notes.add(note).catch((error) => {
          this.errorHandler.alert(`Error syncing notes: ${error}`);
        });
      }
    }
  }
}
