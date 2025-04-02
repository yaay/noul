import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { note } from '../models/note';
import { loom } from '../models/loom';

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  private cachedNotes = new BehaviorSubject<note[]>([]);
  private cachedLooms = new BehaviorSubject<loom[]>([]);
  private lastFetchTime: number = 0;
  private cacheExpirationTime: number = 5 * 60 * 1000; // 5 minutes

  constructor() { }

  getNotes(): Observable<note[]> {
    return this.cachedNotes.asObservable();
  }

  getLooms(): Observable<loom[]> {
    return this.cachedLooms.asObservable();
  }

  setNotes(notes: note[]): void {
    this.cachedNotes.next(notes);
    this.lastFetchTime = Date.now();
  }

  setLooms(looms: loom[]): void {
    this.cachedLooms.next(looms);
    this.lastFetchTime = Date.now();
  }

  addNote(note: note): void {
    const currentNotes = this.cachedNotes.value;
    this.cachedNotes.next([...currentNotes, note]);
  }

  addLoom(loom: loom): void {
    const currentLooms = this.cachedLooms.value;
    this.cachedLooms.next([...currentLooms, loom]);
  }

  updateNote(updatedNote: note): void {
    const currentNotes = this.cachedNotes.value;
    const updatedNotes = currentNotes.map(n => n.id === updatedNote.id ? updatedNote : n);
    this.cachedNotes.next(updatedNotes);
  }

  updateLoom(updatedLoom: loom): void {
    const currentLooms = this.cachedLooms.value;
    const updatedLooms = currentLooms.map(l => l.id === updatedLoom.id ? updatedLoom : l);
    this.cachedLooms.next(updatedLooms);
  }

  deleteNote(noteId: number): void {
    const currentNotes = this.cachedNotes.value;
    this.cachedNotes.next(currentNotes.filter(n => n.id !== noteId));
  }

  deleteLoom(loomId: number): void {
    const currentLooms = this.cachedLooms.value;
    this.cachedLooms.next(currentLooms.filter(l => l.id !== loomId));
  }

  shouldFetchData(): boolean {
    return this.cachedNotes.value.length === 0 || 
           this.cachedLooms.value.length === 0 || 
           Date.now() - this.lastFetchTime > this.cacheExpirationTime;
  }
}
