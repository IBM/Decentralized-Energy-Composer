import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';
import { Resident } from '../org.decentralized.energy.network';


import { Cash } from '../org.decentralized.energy.network';
import { Coins } from '../org.decentralized.energy.network';
import { Energy } from '../org.decentralized.energy.network';


import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class ResidentService {

	
		private RESIDENT: string = 'Resident';  
    private COINS: string = 'Coins';
    private ENERGY: string = 'Energy';
    private CASH: string = 'Cash';
	
    constructor(private residentService: DataService<Resident>, private coinsService: DataService<Coins>, private energyService: DataService<Energy>, private cashService: DataService<Cash>) {
    };

    //resident functions
    public getAllResidents(): Observable<Resident[]> {
        return this.residentService.getAll(this.RESIDENT);
    }

    public getResident(id: any): Observable<Resident> {
      return this.residentService.getSingle(this.RESIDENT, id);
    }

    public addResident(itemToAdd: any): Observable<Resident> {
      return this.residentService.add(this.RESIDENT, itemToAdd);
    }

    public deleteResident(id: any): Observable<Resident> {
      return this.residentService.delete(this.RESIDENT, id);
    }

    public updateResident(id: any, itemToUpdate: any): Observable<Resident> {
      return this.residentService.update(this.RESIDENT, id, itemToUpdate);
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


    //energy functions
    public getAllEnergy(): Observable<Energy[]> {
        return this.energyService.getAll(this.ENERGY);
    }

    public getEnergy(id: any): Observable<Energy> {
      return this.energyService.getSingle(this.ENERGY, id);
    }

    public addEnergy(itemToAdd: any): Observable<Energy> {
      return this.energyService.add(this.ENERGY, itemToAdd);
    }

    public updateEnergy(id: any, itemToUpdate: any): Observable<Energy> {
      return this.energyService.update(this.ENERGY, id, itemToUpdate);
    }

    public deleteEnergy(id: any): Observable<Energy> {
      return this.energyService.delete(this.ENERGY, id);
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
