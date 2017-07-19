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

  myForm: FormGroup;
  private errorMessage;
  private transactionFrom;

  private allResidents;
  private allBanks;

  private resident;
  private bank;
  
  private residentToBankObj;

  private transactionID;

  private cashCreditAsset;
  private cashDebitAsset;  
  private coinsCreditAsset;
  private coinsDebitAsset;

    formResidentID = new FormControl("", Validators.required);
	  formBankID = new FormControl("", Validators.required); 

    action = new FormControl("", Validators.required); 

	  cashValue = new FormControl("", Validators.required);
	  coinsValue = new FormControl("", Validators.required);
  
  constructor(private serviceTransaction:TransactionRBService, fb: FormBuilder) {
      
	  this.myForm = fb.group({
		  
		  formResidentID:this.formResidentID,
		  formBankID:this.formBankID,

      action:this.action,

      cashValue:this.cashValue,
      coinsValue:this.coinsValue
    });
    
  };

  ngOnInit(): void {
    this.transactionFrom  = true;
    this.loadAllResidents()
    .then(() => {                     
            this.loadAllBanks();
    });
    
  }

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

  execute(form: any): Promise<any> {
      
    console.log('Cash quantiy ' + this.cashValue.value);
    console.log('Coins quantiy ' + this.coinsValue.value);
    console.log('Resident ' + this.formResidentID.value);
    console.log('UtilityCompany ' + this.formBankID.value);
    console.log(this.allResidents)

    for (let resident of this.allResidents) {
        console.log(resident.residentID); 
      
      if(resident.residentID == this.formResidentID.value){
        this.resident = resident;
      }     
    }

    for (let bank of this.allBanks) {
        console.log(bank.bankID); 
      
      if(bank.bankID == this.formBankID.value){
        this.bank = bank;
      }     
    }

    console.log('Action: ' + this.action.value)

    if(this.action.value == 'getCash') {
        this.cashCreditAsset = this.resident.cash;
        this.cashDebitAsset = this.bank.cash;  
        this.coinsCreditAsset = this.bank.coins;
        this.coinsDebitAsset = this.resident.coins;
    }
    else if(this.action.value == 'getCoins') {
        this.cashCreditAsset = this.bank.cash;
        this.cashDebitAsset = this.resident.cash;  
        this.coinsCreditAsset = this.resident.coins;
        this.coinsDebitAsset = this.bank.coins;
    }
    
    console.log('Cash Debit Asset: ' + this.cashDebitAsset);
    console.log('Coins Credit Asset: ' + this.coinsCreditAsset);
    console.log('Cash Credit Asset: ' + this.cashCreditAsset);
    console.log('Coins Debit Asset: ' + this.coinsDebitAsset);

  
    this.residentToBankObj = {
      $class: "org.decentralized.energy.network.ResidentToBank",
      "coinsValue": this.coinsValue.value,
      "cashValue": this.cashValue.value,
      "coinsInc": this.coinsCreditAsset,
      "coinsDec": this.coinsDebitAsset,
      "cashInc": this.cashCreditAsset,
      "cashDec": this.cashDebitAsset
    };
    return this.serviceTransaction.residentToBank(this.residentToBankObj)
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

    /*
    console.log("add cash");
    return this.addCash()    
		.then(() => {  
      console.log("deduct coins");
			this.deductCoins() 
		  .then(() => {
        console.log("add coins - crash");
        //this.poperror();
        this.addCoins()        
        .then(() => {
          console.log("deduct cash");
          this.deductCash()
          .then(() => {
           console.log("change form");
           this.transactionFrom = false; 
          });        
        });
		  });
    });
    */

  }

  /*
  poperror() {
    var piArray = new Array(3.14159);
  }

  addCash(): Promise<any> {
    
    this.transferCashObj = {
      $class: "org.decentralized.energy.network.TransferCash",
      "value": this.cashValue.value,
      "cash": this.cashCreditAsset,
      "transactionId": " "          
    };
    return this.serviceTransaction.transferCash(this.transferCashObj)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      this.cashCreditID = result.cashUpdateID;
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
    });
  }

  addCoins(): Promise<any> {
    
    this.transferCoinsObj = {
      $class: "org.decentralized.energy.network.TransferCoins",
      "value": this.coinsValue.value,
      "coins": this.coinsCreditAsset,
      "transactionId": " "          
    };
    return this.serviceTransaction.transferCoins(this.transferCoinsObj)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      this.coinsCreditID = result.coinsUpdateID;
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
    });

  }


  deductCoins(): Promise<any> {

    var subtractValue = 0 - this.coinsValue.value

    this.transferCoinsObj = {
      $class: "org.decentralized.energy.network.TransferCoins",
      "value": subtractValue,
      "coins": this.coinsDebitAsset,
      "transactionId": " "          
    };
    return this.serviceTransaction.transferCoins(this.transferCoinsObj)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      this.coinsDebitID = result.coinsUpdateID;
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
    });
    
  }


  deductCash(): Promise<any>  {

    var subtractValue = 0 - this.cashValue.value

    this.transferCashObj = {
      $class: "org.decentralized.energy.network.TransferCash",
      "value": subtractValue,
      "cash": this.cashDebitAsset,
      "transactionId": " "
    };
    return this.serviceTransaction.transferCash(this.transferCashObj)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      this.cashDebitID = result.cashUpdateID;
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
    });

  }
  */
        
}
