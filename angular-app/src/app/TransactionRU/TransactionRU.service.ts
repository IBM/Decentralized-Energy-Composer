import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';

import { Resident } from '../org.decentralized.energy.network';
import { UtilityCompany } from '../org.decentralized.energy.network';

import { Coins } from '../org.decentralized.energy.network';
import { Energy } from '../org.decentralized.energy.network';

import { EnergyToCoins } from '../org.decentralized.energy.network';
import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class TransactionRUService {

	  private RESIDENT: string = 'Resident';
    private UTILITYCOMPANY: string = 'UtilityCompany'; 
    private ENERGY: string = 'Energy';
    private COINS: string = 'Coins';
    private ENERGY_TO_COINS: string = 'EnergyToCoins';

    constructor(private residentService: DataService<Resident>, private utilityCompanyService: DataService<UtilityCompany>, private coinsService: DataService<Coins>, private energyService: DataService<Energy>, private energyToCoinsService: DataService<EnergyToCoins>) {
    };

    //get all Residents
    public getAllResidents(): Observable<Resident[]> {
        return this.residentService.getAll(this.RESIDENT);
    }

    //get all Utility Companies
    public getAllUtilityCompanys(): Observable<UtilityCompany[]> {
        return this.utilityCompanyService.getAll(this.UTILITYCOMPANY);
    }

    //get Energy asset
    public getEnergy(id: any): Observable<Energy> {
      return this.energyService.getSingle(this.ENERGY, id);
    }

    //get Coins asset
    public getCoins(id: any): Observable<Coins> {
      return this.coinsService.getSingle(this.COINS, id);
    }
   
    //create Energy to Coins transaction
    public energyToCoins(itemToAdd: any): Observable<EnergyToCoins> {
      return this.energyToCoinsService.add(this.ENERGY_TO_COINS, itemToAdd);
    }
 

}
