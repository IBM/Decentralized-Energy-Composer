import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';
import { Bank } from '../org.decentralized.energy.network';

import { Cash } from '../org.decentralized.energy.network';
import { Coins } from '../org.decentralized.energy.network';

import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class BankService {

	
		private BANK: string = 'Bank';  
    private COINS: string = 'Coins';   
    private CASH: string = 'Cash';
	
    constructor(private residentService: DataService<Bank>, private coinsService: DataService<Coins>, private cashService: DataService<Cash>) {
    };

    //get bank functions
    public getAllBanks(): Observable<Bank[]> {
        return this.residentService.getAll(this.BANK);
    }

    public getBank(id: any): Observable<Bank> {
      return this.residentService.getSingle(this.BANK, id);
    }

    public addBank(itemToAdd: any): Observable<Bank> {
      return this.residentService.add(this.BANK, itemToAdd);
    }

    public deleteBank(id: any): Observable<Bank> {
      return this.residentService.delete(this.BANK, id);
    }

    public updateBank(id: any, itemToUpdate: any): Observable<Bank> {
      return this.residentService.update(this.BANK, id, itemToUpdate);
    }


    //coins functions
    public getAllCoins(): Observable<Coins[]> {
        return this.coinsService.getAll(this.COINS);
    }

    public getCoins(id: any): Observable<Coins> {
      return this.coinsService.getSingle(this.COINS, id);
    }

    public addCoins(itemToAdd: any): Observable<Coins> {
      return this.coinsService.add(this.COINS, itemToAdd);
    }

    public updateCoins(id: any, itemToUpdate: any): Observable<Coins> {
      return this.coinsService.update(this.COINS, id, itemToUpdate);
    }

    public deleteCoins(id: any): Observable<Coins> {
      console.log(id)
      return this.coinsService.delete(this.COINS, id);
    }

    //cash functions
    public getAllCash(): Observable<Cash[]> {
        return this.cashService.getAll(this.CASH);
    }

    public getCash(id: any): Observable<Cash> {
      return this.cashService.getSingle(this.CASH, id);
    }

    public addCash(itemToAdd: any): Observable<Cash> {
      return this.cashService.add(this.CASH, itemToAdd);
    }

    public updateCash(id: any, itemToUpdate: any): Observable<Cash> {
      return this.cashService.update(this.CASH, id, itemToUpdate);
    }

    public deleteCash(id: any): Observable<Cash> {
      console.log(id)
      return this.cashService.delete(this.CASH, id);
    }

}
