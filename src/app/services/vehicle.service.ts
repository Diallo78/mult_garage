import { Injectable } from '@angular/core';
import { orderBy, where } from '@angular/fire/firestore';
import { FirestoreService } from './firestore.service';
import { Vehicle } from '../models/client.model';
import { GarageDataService } from './garage-data.service';

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private readonly collectionName = 'vehicles';

  constructor(
    private readonly garageService: GarageDataService
  ) {}

  // Obtenir tous les achats
  async getAllVehicles(): Promise<Vehicle[]> {
    return await this.garageService.getAll<Vehicle>(this.collectionName, [
      orderBy('createdAt', 'desc'),
    ]);
  }

}
