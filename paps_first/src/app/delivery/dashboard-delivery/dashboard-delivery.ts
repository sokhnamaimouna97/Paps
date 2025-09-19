import { Component } from '@angular/core';
import { Delivery } from '../../delivery';

@Component({
  selector: 'app-dashboard-delivery',
  templateUrl: './dashboard-delivery.html',
  styleUrl: './dashboard-delivery.css'
})
export class DashboardDelivery {
  commandes: any[] = [];
  livreurId = "688ba370b4f321a0e5e29cdc"; // ⚡ à remplacer par l'ID connecté (JWT plus tard)

  constructor(private deliveryService: Delivery) {}

  ngOnInit(): void {
    this.deliveryService.getCommandes(this.livreurId).subscribe(data => {
      this.commandes = data;
    });
  }

  changerStatut(id: number, statut: string) {
    //this.deliveryService.updateStatutCommande(id, statut).subscribe(updated: any=> {
     // this.commandes = this.commandes.map(c => c.id === updated.id ? updated : c);
   // });
  }


}
