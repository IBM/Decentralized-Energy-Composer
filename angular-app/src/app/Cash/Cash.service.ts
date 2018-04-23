import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';
import { Cash } from '../org.decentralized.energy.network';
import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class CashService {

    //define namespace for api calls
		private NAMESPACE: string = 'Cash';
  
    //use data.service.ts to create services to make API calls
    constructor(private dataService: DataService<Cash>) {
    };

    //get all cash asset objects on the blockchain network
    public getAll(): Observable<Cash[]> {
        return this.dataService.getAll(this.NAMESPACE);
    }

    //get cash asset by id
    public getAsset(id: any): Observable<Cash> {
      return this.dataService.getSingle(this.NAMESPACE, id);
    }

    //add cash asset
    public addAsset(itemToAdd: any): Observable<Cash> {
      return this.dataService.add(this.NAMESPACE, itemToAdd);
    }

}
