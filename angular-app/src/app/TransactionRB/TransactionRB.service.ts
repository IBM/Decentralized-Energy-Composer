import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';

import { Resident } from '../org.decentralized.energy.network';
import { Bank } from '../org.decentralized.energy.network';

import { Coins } from '../org.decentralized.energy.network';
import { Cash } from '../org.decentralized.energy.network';

import { ResidentToBank } from '../org.decentralized.energy.network';

import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class TransactionRBService {

	  private RESIDENT: string = 'Resident';
    private BANK: string = 'Bank'; 
    private CASH: string = 'Cash';
    private COINS: string = 'Coins';
    private RESIDENT_TO_BANK: string = 'ResidentToBank';

    constructor(private residentService: DataService<Resident>, private bankService: DataService<Bank>, private coinsService: DataService<Coins>, private cashService: DataService<Cash>, private transferRBService: DataService<ResidentToBank>) {
    };

    //Resident functions
    public getAllResidents(): Observable<Resident[]> {
        return this.residentService.getAll(this.RESIDENT);
    }

    //UtilityCompany functions
    public getAllBanks(): Observable<Bank[]> {
        return this.bankService.getAll(this.BANK);
    }

    //Energy functions
    public getCash(id: any): Observable<Cash> {
      return this.cashService.getSingle(this.CASH, id);
    }

    //Coins functions
    public getCoins(id: any): Observable<Coins> {
      return this.coinsService.getSingle(this.COINS, id);
    }
   
    //Resident to Bank function
    public residentToBank(itemToAdd: any): Observable<ResidentToBank> {
      return this.transferRBService.add(this.RESIDENT_TO_BANK, itemToAdd);
    }

}
