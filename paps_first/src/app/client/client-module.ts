import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

// Composant client simple
import { ClientComponent } from './client.component';

const routes: Routes = [
  {
    path: '',
    component: ClientComponent
  },
  {
    path: ':boutiqueId',
    component: ClientComponent
  }
];

@NgModule({
  declarations: [
    ClientComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule
  ]
})
export class ClientModule { }
