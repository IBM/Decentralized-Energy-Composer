import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';

import { Resident } from '../org.decentralized.energy.network';
import { Bank } from '../org.decentralized.energy.network';
import { Coins } from '../org.decentralized.energy.network';
import { Cash } from '../org.decentralized.energy.network';
import { CashToCoins } from '../org.decentralized.energy.network';

import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class TransactionRBService {

    //define namespace strings for api calls
	  private RESIDENT: string = 'Resident';
    private BANK: string = 'Bank'; 
    private CASH: string = 'Cash';
    private COINS: string = 'Coins';
    private CASH_TO_COINS: string = 'CashToCoins';

    //use data.service.ts to create services to make API calls
    constructor(private residentService: DataService<Resident>, private bankService: DataService<Bank>, private coinsService: DataService<Coins>, private cashService: DataService<Cash>, private cashToCoinsService: DataService<CashToCoins>) {
    };

    //get all resident objects on the blockchain network
    public getAllResidents(): Observable<Resident[]> {
        return this.residentService.getAll(this.RESIDENT);
    }

    //get all bank objects
    public getAllBanks(): Observable<Bank[]> {
        return this.bankService.getAll(this.BANK);
    }

    //get cash asset by id
    public getCash(id: any): Observable<Cash> {
      return this.cashService.getSingle(this.CASH, id);
    }

    //get coins asset by id
    public getCoins(id: any): Observable<Coins> {
      return this.coinsService.getSingle(this.COINS, id);
    }
   
    //create cash to coins transaction
    public cashToCoins(itemToAdd: any): Observable<CashToCoins> {
      return this.cashToCoinsService.add(this.CASH_TO_COINS, itemToAdd);
    }

}
