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

    //Resident functions
    public getAllResidents(): Observable<Resident[]> {
        return this.residentService.getAll(this.RESIDENT);
    }

    //Energy functions
    public getEnergy(id: any): Observable<Energy> {
      return this.energyService.getSingle(this.ENERGY, id);
    }

    //Coins functions
    public getCoins(id: any): Observable<Coins> {
      return this.coinsService.getSingle(this.COINS, id);
    }
   
    //Resident to Resident function
    public residentToResident(itemToAdd: any): Observable<ResidentToResident> {
      return this.transferRRService.add(this.RESIDENT_TO_RESIDENT, itemToAdd);
    }

}
