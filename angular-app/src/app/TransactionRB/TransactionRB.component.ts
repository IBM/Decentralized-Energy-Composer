import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { TransactionRBService } from './TransactionRB.service';
import 'rxjs/add/operator/toPromise';

@Component({
	selector: 'app-TransactionRB',
	templateUrl: './TransactionRB.component.html',
	styleUrls: ['./TransactionRB.component.css'],
  	providers: [TransactionRBService]
})
export class TransactionRBComponent {
  
  //defined rate
  private bankCoinsPerCash = 10;
  private bankCashPerCoins = (1 / this.bankCoinsPerCash).toFixed(3);  
  private coinsExchanged;
  private cashValue;
  
  myForm: FormGroup;
  private errorMessage;
  private transactionFrom;

  private allResidents;
  private allBanks;

  private resident;
  private bank;
  
  private cashToCoinsObj;
  private transactionID;

  private cashCreditAsset;
  private cashDebitAsset;  
  private coinsCreditAsset;
  private coinsDebitAsset;

    formResidentID = new FormControl("", Validators.required);
	  formBankID = new FormControl("", Validators.required); 
    action = new FormControl("", Validators.required); 
	  value = new FormControl("", Validators.required);	  
  
  constructor(private serviceTransaction:TransactionRBService, fb: FormBuilder) {
      
	  this.myForm = fb.group({
		  
		  formResidentID:this.formResidentID,
		  formBankID:this.formBankID,
      action:this.action,
      value:this.value,
      
    });   
  };

  ngOnInit(): void {
    this.transactionFrom  = true;
    this.loadAllResidents()
    .then(() => {                     
            this.loadAllBanks();
    });    
  }
  
  //get all Residents
  loadAllResidents(): Promise<any> {
    let tempList = [];
    return this.serviceTransaction.getAllResidents()
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      result.forEach(resident => {
        tempList.push(resident);
      });
      this.allResidents = tempList;
    })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
        }
        else if(error == '404 - Not Found'){
				this.errorMessage = "404 - Could not find API route. Please check your available APIs."
        }
        else{
            this.errorMessage = error;
        }
    });
  }

  //get all Banks
  loadAllBanks(): Promise<any> {
    let tempList = [];
    return this.serviceTransaction.getAllBanks()
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      result.forEach(bank => {
        tempList.push(bank);
      });
      this.allBanks = tempList;
    })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
        }
        else if(error == '404 - Not Found'){
				this.errorMessage = "404 - Could not find API route. Please check your available APIs."
        }
        else{
            this.errorMessage = error;
        }
    });
  }

  //execute transaction
  execute(form: any): Promise<any> {
    
    console.log(this.allResidents);
    console.log(this.allBanks);

    //get resident
    for (let resident of this.allResidents) {
      console.log(resident.residentID);       
      if(resident.residentID == this.formResidentID.value){
        this.resident = resident;
      }     
    }

    //get bank
    for (let bank of this.allBanks) {
      console.log(bank.bankID);       
      if(bank.bankID == this.formBankID.value){
        this.bank = bank;
      }     
    }

    console.log('Action: ' + this.action.value)

    //depending on action, identify cash and coins assets to be debited/credited
    if(this.action.value == 'getCash') {

        this.cashValue = this.value.value;

        this.cashCreditAsset = this.resident.cash;
        this.cashDebitAsset = this.bank.cash;  
        this.coinsCreditAsset = this.bank.coins;
        this.coinsDebitAsset = this.resident.coins;
    }
    else if(this.action.value == 'getCoins') {      

        this.cashValue = this.value.value;

        this.cashCreditAsset = this.bank.cash;
        this.cashDebitAsset = this.resident.cash;  
        this.coinsCreditAsset = this.resident.coins;
        this.coinsDebitAsset = this.bank.coins;
    }
    
    console.log('Cash Debit Asset: ' + this.cashDebitAsset);
    console.log('Coins Credit Asset: ' + this.coinsCreditAsset);
    console.log('Cash Credit Asset: ' + this.cashCreditAsset);
    console.log('Coins Debit Asset: ' + this.coinsDebitAsset);

    //identify cash and coins id which will be debited
    var splitted_cashID = this.cashDebitAsset.split("#", 2); 
    var cashID = String(splitted_cashID[1]);

    var splitted_coinsID = this.coinsDebitAsset.split("#", 2); 
    var coinsID = String(splitted_coinsID[1]);

    this.coinsExchanged = this.bankCoinsPerCash * this.cashValue;
  
    //transaction object
    this.cashToCoinsObj = {
      $class: "org.decentralized.energy.network.CashToCoins",
      "cashRate": this.bankCoinsPerCash,
      "cashValue": this.cashValue,
      "coinsInc": this.coinsCreditAsset,
      "coinsDec": this.coinsDebitAsset,
      "cashInc": this.cashCreditAsset,
      "cashDec": this.cashDebitAsset
    };

    //chech coins and cash assets for enough funds before creating transaction
    return this.serviceTransaction.getCash(cashID)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      if(result.value) {
        if ((result.value - this.cashValue) < 0 ){          
          this.errorMessage = "Insufficient Cash!";
          return false;
        }
        return true;
      }
    })
    .then((checkCash) => {
      console.log('check cash: ' + checkCash)
      if(checkCash)
      {        
        this.serviceTransaction.getCoins(coinsID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          if(result.value) {
            if ((result.value - this.coinsExchanged) < 0 ){              
              this.errorMessage = "Insufficient Coins!";
              return false;
            }
            return true;
          }
        })
        .then((checkCoins) => {
          console.log('check coins: ' + checkCoins)
          if(checkCoins)
          {           
            this.serviceTransaction.cashToCoins(this.cashToCoinsObj)
            .toPromise()
            .then((result) => {
              this.errorMessage = null;
              this.transactionID = result.transactionId;
              console.log(result)     
            })
            .catch((error) => {
                if(error == 'Server error'){
                    this.errorMessage = "Could not connect to REST server. Please check your configuration details";
                }
                else if(error == '404 - Not Found'){
                this.errorMessage = "404 - Could not find API route. Please check your available APIs."
                }
                else{
                    this.errorMessage = error;
                }
            })
            .then(() => {
              this.transactionFrom = false;
            });
          }
        });
      }        
    });
  }
        
}
