import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { TransactionRBService } from './TransactionRB.service';
import 'rxjs/add/operator/toPromise';

//provide associated components
@Component({
	selector: 'app-TransactionRB',
	templateUrl: './TransactionRB.component.html',
	styleUrls: ['./TransactionRB.component.css'],
  	providers: [TransactionRBService]
})

//TransactionRBComponent class
export class TransactionRBComponent {
  
  //define rate of conversion
  private bankCoinsPerCash = 10;
  private bankCashPerCoins = (1 / this.bankCoinsPerCash).toFixed(3);
  
  //define variables
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

  //initialize form variables
  formResidentID = new FormControl("", Validators.required);
  formBankID = new FormControl("", Validators.required); 
  action = new FormControl("", Validators.required); 
  value = new FormControl("", Validators.required);	  
  
  constructor(private serviceTransaction:TransactionRBService, fb: FormBuilder) {
    //intialize form
	  this.myForm = fb.group({		  
		  formResidentID:this.formResidentID,
		  formBankID:this.formBankID,
      action:this.action,
      value:this.value,      
    });   
  };

  //on page initialize, load all residents and banks
  ngOnInit(): void {
    this.transactionFrom  = true;
    this.loadAllResidents()
    .then(() => {                     
            this.loadAllBanks();
    });    
  }
  
  //get all Residents
  loadAllResidents(): Promise<any> {

    //retrieve all residents in the tempList array
    let tempList = [];

    //call serviceTransaction to get all resident objects
    return this.serviceTransaction.getAllResidents()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      
      //append tempList with the resident objects returned
      result.forEach(resident => {
        tempList.push(resident);
      });
      
      //assign tempList to allResidents
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
    
    //retrieve all banks in the tempList array
    let tempList = [];
    
    //call serviceTransaction to get all bank objects
    return this.serviceTransaction.getAllBanks()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      
      //append tempList with the bank objects returned
      result.forEach(bank => {
        tempList.push(bank);
      });

      //assign tempList to allBanks
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
    
    //loop through all residents to find match with user provided resident
    for (let resident of this.allResidents) {   
      if(resident.residentID == this.formResidentID.value){
        this.resident = resident;
      }     
    }

    //loop through all banks to find match with user provided bank
    for (let bank of this.allBanks) {    
      if(bank.bankID == this.formBankID.value){
        this.bank = bank;
      }     
    }

    //depending on user action, identify cash and coins assets to be debited/credited
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

    //identify cash and coins id which will be debited from the string
    var splitted_cashID = this.cashDebitAsset.split("#", 2); 
    var cashID = String(splitted_cashID[1]);

    var splitted_coinsID = this.coinsDebitAsset.split("#", 2); 
    var coinsID = String(splitted_coinsID[1]);

    //calculate coins exchanges from the rate
    this.coinsExchanged = this.bankCoinsPerCash * this.cashValue;
  
    //create transaction object
    this.cashToCoinsObj = {
      $class: "org.decentralized.energy.network.CashToCoins",
      "cashRate": this.bankCoinsPerCash,
      "cashValue": this.cashValue,
      "coinsInc": this.coinsCreditAsset,
      "coinsDec": this.coinsDebitAsset,
      "cashInc": this.cashCreditAsset,
      "cashDec": this.cashDebitAsset
    };

    //check coins and cash assets to be debited for enough funds before creating transaction
    //call serviceTransaction to get cash asset
    return this.serviceTransaction.getCash(cashID)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      //check if enough value
      if(result.value) {
        if ((result.value - this.cashValue) < 0 ){          
          this.errorMessage = "Insufficient Cash!";
          return false;
        }
        return true;
      }
    })
    .then((checkCash) => {
      //if positive on sufficient cash, then check for coins asset for sufficient coins
      if(checkCash)
      {        
        //call serviceTransaction to get coins asset
        this.serviceTransaction.getCoins(coinsID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          //check if enough value
          if(result.value) {
            if ((result.value - this.coinsExchanged) < 0 ){              
              this.errorMessage = "Insufficient Coins!";
              return false;
            }
            return true;
          }
        })
        .then((checkCoins) => {
          //if positive on sufficient coins, then call transaction
          if(checkCoins)
          {           
            //call serviceTransaction call the cashToCoins transaction with cashToCoinsObj as parameter 
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
