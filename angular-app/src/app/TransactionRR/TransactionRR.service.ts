import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';

import { Resident } from '../org.decentralized.energy.network';

import { Coins } from '../org.decentralized.energy.network';
import { Energy } from '../org.decentralized.energy.network';

import { ResidentToResident } from '../org.decentralized.energy.network';
import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class TransactionRRService {

	  private RESIDENT: string = 'Resident';
    private ENERGY: string = 'Energy';
    private COINS: string = 'Coins';
    private RESIDENT_TO_RESIDENT: string = 'ResidentToResident';

    constructor(private residentService: DataService<Resident>, private coinsService: DataService<Coins>, private energyService: DataService<Energy>, private transferRRService: DataService<ResidentToResident>) {
    };

    //get all Residents
    public getAllResidents(): Observable<Resident[]> {
        return this.residentService.getAll(this.RESIDENT);
    }

    //get Energy asset
    public getEnergy(id: any): Observable<Energy> {
      return this.energyService.getSingle(this.ENERGY, id);
    }

    //get Coins asset
    public getCoins(id: any): Observable<Coins> {
      return this.coinsService.getSingle(this.COINS, id);
    }
   
    //create Resident to Resident transaction
    public residentToResident(itemToAdd: any): Observable<ResidentToResident> {
      return this.transferRRService.add(this.RESIDENT_TO_RESIDENT, itemToAdd);
    }

}
