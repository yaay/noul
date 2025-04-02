import { NgModule, importProvidersFrom } from '@angular/core';
import { RouterModule, Routes, provideRouter } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { SignupComponent } from './pages/signup/signup.component';
import { SigninComponent } from './pages/signin/signin.component';
import { StartComponent } from './pages/start/start.component';
import { AppComponent } from './app.component';
import { bootstrapApplication } from '@angular/platform-browser';

export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'thread/:threadId', component: HomeComponent},
  {path: 'signup', component: SignupComponent},
  {path: 'login', component: SigninComponent},
  {path: '**', component: HomeComponent}
];
