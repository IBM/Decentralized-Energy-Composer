import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';
import { UtilityCompany } from '../org.decentralized.energy.network';

import { Coins } from '../org.decentralized.energy.network';
import { Energy } from '../org.decentralized.energy.network';

import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class UtilityCompanyService {

    //define namespace strings for api calls
		private UTILITYCOMPANY: string = 'UtilityCompany';  
    private COINS: string = 'Coins';
    private ENERGY: string = 'Energy';
  
    //use data.service.ts to create services to make API calls
    constructor(private utilityCompanyService: DataService<UtilityCompany>, private coinsService: DataService<Coins>, private energyService: DataService<Energy>) {
    };

    //get all utility company objects on the blockchain network
    public getAllUtilityCompanys(): Observable<UtilityCompany[]> {
        return this.utilityCompanyService.getAll(this.UTILITYCOMPANY);
    }

    //get utility company by id
    public getUtilityCompany(id: any): Observable<UtilityCompany> {
      return this.utilityCompanyService.getSingle(this.UTILITYCOMPANY, id);
    }

    //add utility company
    public addUtilityCompany(itemToAdd: any): Observable<UtilityCompany> {
      return this.utilityCompanyService.add(this.UTILITYCOMPANY, itemToAdd);
    }

    //delete utility company
    public deleteUtilityCompany(id: any): Observable<UtilityCompany> {
      return this.utilityCompanyService.delete(this.UTILITYCOMPANY, id);
    }

    //update resident
    public updateUtilityCompany(id: any, itemToUpdate: any): Observable<UtilityCompany> {
      return this.utilityCompanyService.update(this.UTILITYCOMPANY, id, itemToUpdate);
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

}
