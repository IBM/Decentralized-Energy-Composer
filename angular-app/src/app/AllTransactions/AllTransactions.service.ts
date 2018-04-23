import { Injectable } from '@angular/core';
import { DataService } from '../data.service';
import { Observable } from 'rxjs/Observable';


import 'rxjs/Rx';

// Can be injected into a constructor
@Injectable()
export class AllTransactionsService {

    private SYSTEM: string = 'Syste,';
    private Transactions;

    constructor(private transactionService: DataService<Object> ) {
    };

    //get all transactions
    public getTransactions(): Observable<Object[]> {
        return this.transactionService.transactions();
    }

   

}
