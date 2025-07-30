import { Injectable } from '@angular/core';
import {
    orderBy,
} from '@angular/fire/firestore';

import { GarageDataService } from './garage-data.service';
import { Vehicle } from '../models/client.model';

@Injectable({
  providedIn: 'root',
})
export class FirestoreService {
  private readonly collectionName = 'vehicles';

  constructor(
    private readonly firestoreService: FirestoreService,
    private readonly garageService: GarageDataService
  ) {}

  async getAllVehicles(): Promise<Vehicle[]> {
    return await this.garageService.getAll<Vehicle>(this.collectionName, [
      orderBy('createdAt', 'desc'),
    ]);
  }
}