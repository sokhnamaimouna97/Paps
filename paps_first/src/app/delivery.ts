import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Delivery {
   private apiUrl = 'http://localhost:5000/api';

  constructor(private http: HttpClient) {}

  getCommandes(livreurId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${livreurId}/livraisons`);
  }

  updateStatutCommande(commandeId: number, statut: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/commande/${commandeId}/statut`, { statut });
  }
  
}
