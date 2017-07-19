import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';
import { Cash } from '../org.decentralized.energy.network';
import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class CashService {

	
		private NAMESPACE: string = 'Cash';
	



    constructor(private dataService: DataService<Cash>) {
    };

    public getAll(): Observable<Cash[]> {
        return this.dataService.getAll(this.NAMESPACE);
    }

    public getAsset(id: any): Observable<Cash> {
      return this.dataService.getSingle(this.NAMESPACE, id);
    }

    public addAsset(itemToAdd: any): Observable<Cash> {
      return this.dataService.add(this.NAMESPACE, itemToAdd);
    }

    public updateAsset(id: any, itemToUpdate: any): Observable<Cash> {
      return this.dataService.update(this.NAMESPACE, id, itemToUpdate);
    }

    public deleteAsset(id: any): Observable<Cash> {
      return this.dataService.delete(this.NAMESPACE, id);
    }

}
