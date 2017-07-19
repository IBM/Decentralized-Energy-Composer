import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';
import { Coins } from '../org.decentralized.energy.network';
import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class CoinsService {

	
		private NAMESPACE: string = 'Coins';
	



    constructor(private dataService: DataService<Coins>) {
    };

    public getAll(): Observable<Coins[]> {
        return this.dataService.getAll(this.NAMESPACE);
    }

    public getAsset(id: any): Observable<Coins> {
      return this.dataService.getSingle(this.NAMESPACE, id);
    }

    public addAsset(itemToAdd: any): Observable<Coins> {
      return this.dataService.add(this.NAMESPACE, itemToAdd);
    }

    public updateAsset(id: any, itemToUpdate: any): Observable<Coins> {
      return this.dataService.update(this.NAMESPACE, id, itemToUpdate);
    }

    public deleteAsset(id: any): Observable<Coins> {
      return this.dataService.delete(this.NAMESPACE, id);
    }

}
