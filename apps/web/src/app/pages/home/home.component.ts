import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  ViewChild,
} from '@angular/core';
import { note } from 'src/app/core/models/note';
import { loom } from 'src/app/core/models/loom';
import {
  MatDialog,
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogTitle,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { LocalService } from 'src/app/core/services/local.service';
import { PocketbaseService } from 'src/app/core/services/pocketbase.service';
import { DomSanitizer, HammerModule, SafeUrl } from '@angular/platform-browser';
import { ErrorHandlerService } from 'src/app/core/services/error-handler.service';
import { MaterialModule } from 'src/app/shared/material/material.module';
import { CommonModule, Location } from '@angular/common';
import { HourMinutePipe } from 'src/app/shared/pipes/hour-minute.pipe';
import { HeaderComponent } from '../header/header.component';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SyncService } from 'src/app/core/services/sync.service';
import { OfflineChanges } from 'src/app/core/models/OfflineChanges';
import { LoadingService } from 'src/app/core/services/loading.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HourMinutePipe,
    MaterialModule,
    HeaderComponent,
    HammerModule
  ],
})
export class HomeComponent {
  constructor(
    private pb: PocketbaseService,
    public dialog: MatDialog,
    private cdR: ChangeDetectorRef,
    private localService: LocalService,
    private sanitizer: DomSanitizer,
    private errorHandler: ErrorHandlerService,
    private syncService: SyncService,
    private loadingService: LoadingService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
  ) {}
  @ViewChild('loomsView') loomsView?: ElementRef<HTMLDivElement>;
  @ViewChild('notesView') notesView?: ElementRef<HTMLDivElement>;

  newLoomStatus = false;
  moreMenuClicked = false;

  newThreadName: string = '';
  newNoteContext: string = '';

  looms!: loom[];
  localThreads!: loom[];

  notes!: note[];
  localNotes!: note[];
  currentNotes!: note[];
  groupedNotes: { date: string; notes: note[] }[] = [];


  offlineChanges!: OfflineChanges[];

  selectedLoom!: loom;
  isLoomSelected: boolean = false;

  currentThreadId!: number;
  appInit: boolean = false;

  userStatus!: 'signedIn' | 'offline';

  userId = this.pb.userId();

  async ngOnInit() {

    this.appInit = true


    this.loadingService.show();
    this.pb.isAuthenticated() ? (this.userStatus = 'signedIn') : 'offline';
    this.getOfflineChanges();
    await this.fetchLocalThreads();
    await this.getLocalNotes();
    await this.syncService.syncLocalData(this.localThreads, this.localNotes);
    await this.syncService.syncPendingDeletes(this.offlineChanges);
    await this.fetchNotes();
    await this.fetchLooms();
  

    await this.syncService.syncServerData(this.notes, this.looms);
    this.getNoteByRoute();
    this.loadingService.hide();
  }

  getNoteByRoute() {
    this.route.paramMap.subscribe((params) => {
      const threadId = params.get('threadId');

      if (threadId) {
        const paramThread = this.looms.find(
          (loom) => String(loom.id) === threadId
        );
        if (paramThread) {
          this.selectThread(paramThread);
        }
      } else {
        this.isLoomSelected = false
      }
    });
  }

  generateUniqueId(): number {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return Number((timestamp * 1000 + random).toString().substring(0, 15));
  }

  //Sync Logic//
  syncOffline(looms: loom[], notes: note[]) {
    for (const loom of looms) {
      this.localService.looms.add(loom).catch((error) => {
        alert(`Error adding loom: ${error}`);
      });
    }

    for (const note of notes) {
      this.localService.notes.add(note).catch((error) => {
        alert(`Error adding note: ${error}`);
      });
    }
  }

  sync() {
    if (this.pb.isAuthenticated()) {
      this.pb.syncToPocketBase(this.localNotes, this.localThreads);
    }
  }

  //Common Logic//

  getIndex(idToFind: number, type: "note" | "thread"): number {
    if (type === "note") {
      return this.currentNotes.findIndex(note => note.id === idToFind);
    } else if (type === "thread") {
      return this.looms.findIndex(thread => thread.id === idToFind);
    } else return -1
  }

  //Looms logic//

  async fetchLocalThreads() {
    const threads = await this.localService.looms.toArray();
    if (this.pb.isAuthenticated()) {
      this.localThreads = threads;
    } else {
      this.looms = threads;
    } 
  }
  
  async getOfflineChanges() {
    this.offlineChanges = await this.localService.offlineChanges.toArray().catch(() => []);
  }

  async fetchLooms() {
    if (this.pb.isAuthenticated()) {
      await this.pb
        .getLooms()
        .then((res: any) => (this.looms = res))
        .catch(() =>
          this.errorHandler.alert(
            'Failed to retrieve looms. Please try again later.'
          )
        );
      await this.fetchLocalThreads();
    }
    // else {
    //   this.fetchLocalThreads().then(() => (this.looms = this.localThreads));
    // }
  }

  sortedThreads(threads: loom[]) {
    if (threads) {
      return [...this.looms].sort((a, b) => 
        new Date(b.created).getTime() - new Date(a.created).getTime()
      );
    } else return []
  }

  addLoomLocally(newThread: any) {

      this.localService.looms
      .add(newThread)
      .catch((error) => {
        alert(`Error adding loom: ${error}`);
      });

  }

  addLoom() {

    this.toggleNewLoom();

    if (this.newThreadName.trim() !== '') {

      const newLoom: loom = {
        id: this.generateUniqueId(),
        title: this.newThreadName,
        created: new Date().toISOString().replace('T', ' '),
        is_online: this.pb.isAuthAndOnline() ? true : false
      };

      
      this.looms.push(newLoom);

      if (this.pb.isAuthAndOnline()) {

        this.pb.addLoom(newLoom)
        .then((resThread) => this.addLoomLocally(resThread))
        .then(() => {
          const threadIndex = this.getIndex(newLoom.id, 'thread');
          this.looms[threadIndex] = newLoom;
        })
      } else {
        this.addLoomLocally(newLoom);
      }

      this.newThreadName = '';
    }
  }

  editLocalThread(updatedThread: any) {    

    this.localService.looms
    .update(updatedThread.id, {...updatedThread, is_edit: true})
    .catch((error) => {
      alert(`Error adding loom: ${error}`);
    });

  }

  editLoom(updatedThread: loom) {

    if (this.pb.isAuthenticated()) {
      this.pb.editLoom(updatedThread)
      .then((resThread) => this.editLocalThread(resThread))
      .then(() => this.fetchLooms());
    } else {
      this.editLocalThread(updatedThread);
      this.fetchLooms();
    }
  }

  onEditLoom(loom: loom) {


    const dialogRef = this.dialog.open(DialogWindow, {
      data: { title: loom.title, type: 'loom' },
      width: '20rem',
    });

    dialogRef.afterClosed().subscribe((updatedName) => {
      if (updatedName.trim() != '') {
        loom.title = updatedName;
        this.editLoom(loom);
        this.errorHandler.alert(`Renamed to "${updatedName}".`);
      }
    });

    this.cdR.detectChanges();
  }
  


  deleteLoom(loom: loom) {
    if (this.pb.isAuthAndOnline()) {
      this.pb.deleteLoom(loom.id);
    } else {
      // this.localService.looms.delete(loomId)
      if(loom.is_online) {
        this.localService.offlineChanges
        .delete(loom.id)
        .then(() => {
          if(loom.is_online) {
            this.localService.offlineChanges.add({
              id: loom.id,
              type: 'thread',
              changeType: 'delete',
              updatedAt: new Date(),
            })
          }
        } 
      );
      }
      
    }
    
    this.deselectThread();
    const threadIndex = this.getIndex(loom.id, 'thread');
    this.looms.splice(threadIndex, 1);
    this.errorHandler.alert('Thread deleted.')

  }

  selectThread(thread: loom) {
    this.newNoteContext = '';
    this.currentThreadId = thread.id;
    // const loom: loom = {
    //   id: id,
    //   title: name,
    //   created: created,
    //   is_online: true,
    // };

    this.selectedLoom = thread;
    
    // this.fetchNotes();
    this.getNotesById(thread.id);
    this.isLoomSelected = true;
    // this.location.replaceState(`thread/${this.selectedLoom.id}`);
    this.router.navigate([`/thread/${thread.id}`]);
    setTimeout(() => {
      this.scrollNotesDown();
    }, 100);
  }

  deselectThread() {
    this.isLoomSelected = false;
    // this.router.navigate(['']);
  }

  // Looms logic end

  scrollNotesDown() {
    const maxScroll = this.notesView?.nativeElement.scrollHeight;
    this.notesView?.nativeElement.scrollTo({
      top: maxScroll,
      behavior: 'smooth',
    });
  }

  /////////////////////
  //   Notes logic   //
  /////////////////////

  getNotesById(threadId: number) {
    // return (this.currentNotes = this.notes.filter(
    //   (note) => note.threadId == this.currentThreadId
    // ));
    const filteredNotes = this.notes.filter(
      (note) => note.threadId == threadId
    );
    this.currentNotes = filteredNotes;
    this.groupedNotes = this.groupNotesByDate(this.currentNotes);
  }

  getNotes() {
    this.pb
      .getNotes()
      .then((res) => {
        const NotesServerData = res.map((note: any) => ({
          id: note.id,
          threadId: note.threadId,
          content: note.content,
          created: note.created,
          is_local: note.is_local,
          is_online: note.is_online,
        }));

        this.notes = NotesServerData;
      })
      .then(() => this.getNotesById(this.currentThreadId))
      .catch(() =>
        this.errorHandler.alert(
          'Failed to retrieve notes. Please try again later.'
        )
      );
  }

  groupNotesByDate(notes: note[]) {
    const groupedByDate = notes.reduce((groups, note) => {
      const date = new Date(note.created).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(note);
      return groups;
    }, {} as { [key: string]: note[] });

    return Object.keys(groupedByDate).map(date => ({
      date,
      notes: groupedByDate[date].sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime())
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  

  async getLocalNotes() {
    const notes = await this.localService.notes.toArray();

    if (this.pb.isAuthenticated()) {
      this.localNotes = notes;
    } else this.notes = notes
  }

  async fetchNotes() {
    if (this.pb.isAuthenticated()) {
      await this.pb
      .getNotes()
      .then((res) => {
        const NotesServerData = res.map((note: any) => ({
          id: note.id,
          threadId: note.threadId,
          content: note.content,
          created: note.created,
          is_local: note.is_local,
          is_online: note.is_online,
        }));

        this.notes = NotesServerData;
      })
      .then(() => this.getNotesById(this.currentThreadId))
      .catch(() =>
        this.errorHandler.alert(
          'Failed to retrieve notes. Please try again later.'
        )
      );
      await this.getLocalNotes();
    }
  }

  addNoteLocally(note: any, severResNote: boolean = false) {

    // this.localService.looms
    // .add(newThread)
    // .catch((error) => {
    //   alert(`Error adding loom: ${error}`);
    // });

    if (severResNote) {
      
      this.localService.notes.add(note);

    } else {
      
      const newNote: note = {
        ...note,
        is_local: false,
        is_online: false,
      };
  
      this.currentNotes.push(newNote);
      this.groupedNotes = this.groupNotesByDate(this.currentNotes);
      this.localService.notes.add(newNote);

      setTimeout(() => {
        this.scrollNotesDown();
      }, 400);

      this.getLocalNotes();
    }
      
  }

  addNote() {

    const newNote: note = {
      created: new Date(),
      id: this.generateUniqueId(),
      threadId: this.currentThreadId,
      content: this.newNoteContext,
      is_local: false,
      is_online: true,
    };

    if (this.newNoteContext.trim() !== '' && this.currentThreadId !== 0) {
      if (this.pb.isAuthAndOnline()) {

        this.currentNotes.push({ ...newNote, is_local: true, is_online: false });
        this.groupedNotes = this.groupNotesByDate(this.currentNotes);

        setTimeout(() => {
          this.scrollNotesDown();
        }, 400);

        this.pb.addNote(newNote)
        .then((resNote) => {
          this.addNoteLocally(resNote, true)
          this.fetchNotes();
        })
      } else {
        this.addNoteLocally(newNote);
      }
      this.newNoteContext = '';
    }
  }

  editLocalNote(updatedNote: any) {
    this.localService.notes
    .update(updatedNote.id, updatedNote)
    .catch((error) => {
      alert(`Error adding note: ${error}`);
    });
}

  editNote(updatedNote: note) {
    if (this.pb.isAuthAndOnline()) {
      this.pb.editNote(updatedNote)
      .then((resNote) => this.editLocalNote(resNote))
      .then(() => this.fetchNotes())
    } else {
      this.editLocalNote({ ...updatedNote, is_edit: true  })
      this.fetchNotes()
    }
  }

  onEditNote(note: note) {
    const dialogRef = this.dialog.open(DialogWindow, {
      data: { title: note.content, type: 'note' },
      width: '25rem',
    });

    dialogRef.afterClosed().subscribe((updatedNote) => {
      if (updatedNote != '') {
        note.content = updatedNote;
        this.editNote(note);
      }
    });

    this.cdR.detectChanges();
  }

  convertUrlsToLinks(text: string): SafeUrl {
    const urlRegex =
      /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const newHtml = text.replace(urlRegex, (url) => {
      return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });

    return this.sanitizer.bypassSecurityTrustHtml(newHtml);
  }

  toggleNewLoom() {
    this.newLoomStatus = !this.newLoomStatus;
  }

  onInputKeyDown(event: KeyboardEvent, type: 'loom' | 'note') {
    if (event.key === 'Enter') {
      event.preventDefault();
      if (type === 'loom') {
        this.addLoom();
      } else if (type === 'note') {
        this.addNote();
      }
    }
  }

  handleMenuItemClick(event: MouseEvent) {
    event.stopPropagation();
  }


  onDeleteNote(note: note) {

    if (this.pb.isAuthAndOnline()) {
      this.pb.deleteNote(note.id);
    } else {
      this.localService.notes
        .delete(note.id)
        .then(() => {
          if(note.is_online) {
            this.localService.offlineChanges.add({
              id: note.id,
              type: 'note',
              changeType: 'delete',
              updatedAt: new Date(),
            });
          }
        })
    }

    const noteIndex = this.getIndex(note.id, 'note');
    this.currentNotes.splice(noteIndex, 1);
    this.notes.splice(noteIndex, 1);
    this.groupedNotes = this.groupNotesByDate(this.currentNotes);
    this.errorHandler.alert('Note deleted.');
    this.fetchNotes();
  }


}


@Component({
  selector: 'dialog-window',
  templateUrl: 'dialog-window.html',
  standalone: true,
  imports: [
    MatButtonModule,
    MatInputModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
  ],
})
export class DialogWindow {
  constructor(
    public dialogRef: MatDialogRef<DialogWindow>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}
