export interface Livraison {
    //  livreur     Livreur? @relation(fields: [livreurId], references: [id])
  //client      Client   @relation(fields: [clientId], references: [id])
  //produit     Produit  @relation(fields: [produitId], references: [id])
   _id?: any;        // optionnel car généré par MongoDB
  produit: string;
  quantite: number;
  prix: number;
  statut: 'en attente' | 'en cours' | 'livrée';
  clientId: string;
  livreurId?: string;  // optionnel car pas toujours assigné

}