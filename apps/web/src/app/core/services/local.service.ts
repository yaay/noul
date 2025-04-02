import { Injectable } from '@angular/core';
import Dexie from 'dexie';
import { note } from '../models/note';
import { loom } from '../models/loom';
import { OfflineChanges } from '../models/OfflineChanges';

@Injectable({
  providedIn: 'root'
})
export class LocalService extends Dexie {
  looms: Dexie.Table<loom, number>;
  notes: Dexie.Table<note, number>;
  offlineChanges: Dexie.Table<OfflineChanges, number>;

  constructor() {
    super('localDB')

    this.version(1).stores({
      looms:'++id, title, created',
      notes: '++id, created, content, threadId, is_local',
      offlineChanges: '++id, type, changeType, updatedAt'
    });

    this.looms = this.table('looms')
    this.notes = this.table('notes')
    this.offlineChanges = this.table('offlineChanges')
  }
}


