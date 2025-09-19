import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardDelivery } from './delivery/dashboard-delivery/dashboard-delivery';

const routes: Routes = [
   { path: 'courier/orders', component: DashboardDelivery },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
