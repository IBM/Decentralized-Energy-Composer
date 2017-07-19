import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';

import { Resident } from '../org.decentralized.energy.network';
import { UtilityCompany } from '../org.decentralized.energy.network';

import { Coins } from '../org.decentralized.energy.network';
import { Energy } from '../org.decentralized.energy.network';

import { ResidentToUtility } from '../org.decentralized.energy.network';
import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class TransactionRUService {

	  private RESIDENT: string = 'Resident';
    private UTILITYCOMPANY: string = 'UtilityCompany'; 
    private ENERGY: string = 'Energy';
    private COINS: string = 'Coins';
    private RESIDENT_TO_UTILITY: string = 'ResidentToUtility';

    constructor(private residentService: DataService<Resident>, private utilityCompanyService: DataService<UtilityCompany>, private coinsService: DataService<Coins>, private energyService: DataService<Energy>, private transferRRService: DataService<ResidentToUtility>) {
    };

    //Resident functions
    public getAllResidents(): Observable<Resident[]> {
        return this.residentService.getAll(this.RESIDENT);
    }

    //UtilityCompany functions
    public getAllUtilityCompanys(): Observable<UtilityCompany[]> {
        return this.utilityCompanyService.getAll(this.UTILITYCOMPANY);
    }

    //Energy functions
    public getEnergy(id: any): Observable<Energy> {
      return this.energyService.getSingle(this.ENERGY, id);
    }

    //Coins functions
    public getCoins(id: any): Observable<Coins> {
      return this.coinsService.getSingle(this.COINS, id);
    }
   
    //Resident to Utility function
    public residentToUtility(itemToAdd: any): Observable<ResidentToUtility> {
      return this.transferRRService.add(this.RESIDENT_TO_UTILITY, itemToAdd);
    }
 

}
