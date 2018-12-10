import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';
import { Coins } from '../org.decentralized.energy.network';
import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class CoinsService {

    //define namespace for api calls
		private NAMESPACE: string = 'Coins';
	
    //use data.service.ts to create services to make API calls
    constructor(private dataService: DataService<Coins>) {
    };

    //get all coins asset objects on the blockchain network
    public getAll(): Observable<Coins[]> {
        return this.dataService.getAll(this.NAMESPACE);
    }

    //get coins asset by id
    public getAsset(id: any): Observable<Coins> {
      return this.dataService.getSingle(this.NAMESPACE, id);
    }

    //add coins asset
    public addAsset(itemToAdd: any): Observable<Coins> {
      return this.dataService.add(this.NAMESPACE, itemToAdd);
    }

}
