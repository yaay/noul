import { NgModule } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatDialogModule } from '@angular/material/dialog';
import { DialogContentComponent } from './dialog-content/dialog-content.component'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatCardModule} from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';


const MaterialComponents = [
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatMenuModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    MatRippleModule,
    MatProgressBarModule
]


@NgModule({
  imports: [MaterialComponents],
  exports: [MaterialComponents],
  declarations: [
    DialogContentComponent
  ]
})
export class MaterialModule { }