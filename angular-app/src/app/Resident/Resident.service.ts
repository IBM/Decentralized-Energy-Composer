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

    //define namespace strings for api calls
		private RESIDENT: string = 'Resident';  
    private COINS: string = 'Coins';
    private ENERGY: string = 'Energy';
    private CASH: string = 'Cash';

    //use data.service.ts to create services to make API calls
    constructor(private residentService: DataService<Resident>, private coinsService: DataService<Coins>, private energyService: DataService<Energy>, private cashService: DataService<Cash>) {
    };

    //get all resident objects on the blockchain network
    public getAllResidents(): Observable<Resident[]> {
        return this.residentService.getAll(this.RESIDENT);
    }

    //get resident by id
    public getResident(id: any): Observable<Resident> {
      return this.residentService.getSingle(this.RESIDENT, id);
    }

    //add resident
    public addResident(itemToAdd: any): Observable<Resident> {
      return this.residentService.add(this.RESIDENT, itemToAdd);
    }

    //delete resident
    public deleteResident(id: any): Observable<Resident> {
      return this.residentService.delete(this.RESIDENT, id);
    }

    //update resident
    public updateResident(id: any, itemToUpdate: any): Observable<Resident> {
      return this.residentService.update(this.RESIDENT, id, itemToUpdate);
    }

    
    //similar functions for coins asset
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


    //similar functions for energy asset
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


    //similar functions for cash asset
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
