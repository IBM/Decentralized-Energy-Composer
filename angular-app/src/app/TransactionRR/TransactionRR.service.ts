import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';

import { Resident } from '../org.decentralized.energy.network';
import { Coins } from '../org.decentralized.energy.network';
import { Energy } from '../org.decentralized.energy.network';
import { EnergyToCoins } from '../org.decentralized.energy.network';

import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class TransactionRRService {

    //define namespace strings for api calls
	  private RESIDENT: string = 'Resident';
    private ENERGY: string = 'Energy';
    private COINS: string = 'Coins';
    private ENERGY_TO_COINS: string = 'EnergyToCoins';

    //use data.service.ts to create services to make API calls
    constructor(private residentService: DataService<Resident>, private coinsService: DataService<Coins>, private energyService: DataService<Energy>, private energyToCoinsService: DataService<EnergyToCoins>) {
    };

    //get all resident objects on the blockchain network
    public getAllResidents(): Observable<Resident[]> {
        return this.residentService.getAll(this.RESIDENT);
    }

    //get energy asset by id
    public getEnergy(id: any): Observable<Energy> {
      return this.energyService.getSingle(this.ENERGY, id);
    }

    //get coins asset by id
    public getCoins(id: any): Observable<Coins> {
      return this.coinsService.getSingle(this.COINS, id);
    }
   
    //create energy to coins transaction
    public energyToCoins(itemToAdd: any): Observable<EnergyToCoins> {
      return this.energyToCoinsService.add(this.ENERGY_TO_COINS, itemToAdd);
    }

}
