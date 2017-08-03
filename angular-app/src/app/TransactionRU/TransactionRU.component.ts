import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { TransactionRUService } from './TransactionRU.service';
import 'rxjs/add/operator/toPromise';

@Component({
	selector: 'app-TransactionRU',
	templateUrl: './TransactionRU.component.html',
	styleUrls: ['./TransactionRU.component.css'],
  	providers: [TransactionRUService]
})
export class TransactionRUComponent {

  //defined rate
  private utilityCoinsPerEnergy = 1;
  private utilityEnergyPerCoins = (1 / this.utilityCoinsPerEnergy).toFixed(3);  
  private coinsExchanged;
  
  private energyValue;


  myForm: FormGroup;
  private errorMessage;
  private transactionFrom;

  private allResidents;
  private allUtilityCompanys;

  private resident;
  private utiltyCompany;
  
  private energyToCoinsObj;

  private transactionID;

  private energyReceiverAsset;
  private energyProducerAsset;  
  private coinsCreditAsset;
  private coinsDebitAsset;

    formResidentID = new FormControl("", Validators.required);
	  formUtilityID = new FormControl("", Validators.required); 
    action = new FormControl("", Validators.required); 
	  value = new FormControl("", Validators.required);
  
  constructor(private serviceTransaction:TransactionRUService, fb: FormBuilder) {
      
	  this.myForm = fb.group({
		  
		  formResidentID:this.formResidentID,
		  formUtilityID:this.formUtilityID,
      action:this.action,
      value:this.value,
      
    });
    
  };

  ngOnInit(): void {
    this.transactionFrom  = true;
    this.loadAllResidents()
    .then(() => {                     
            this.loadAllUtilityCompanys();
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

  //get all Utility Companies
  loadAllUtilityCompanys(): Promise<any> {
    let tempList = [];
    return this.serviceTransaction.getAllUtilityCompanys()
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      result.forEach(utilityCompany => {
        tempList.push(utilityCompany);
      });
      this.allUtilityCompanys = tempList;
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
          
    console.log(this.allResidents)
    console.log(this.allUtilityCompanys)

    //get resident
    for (let resident of this.allResidents) {
      console.log(resident.residentID);       
      if(resident.residentID == this.formResidentID.value){
        this.resident = resident;
      }     
    }

    //get utility company
    for (let utilityCompany of this.allUtilityCompanys) {
        console.log(utilityCompany.utilityID); 
      
      if(utilityCompany.utilityID == this.formUtilityID.value){
        this.utiltyCompany = utilityCompany;
      }     
    }

    console.log('Action: ' + this.action.value)

    //depending on action, identify energy and coins assets to be debited/credited
    if(this.action.value == 'buyEnergy') {

        this.energyValue = this.value.value;

        this.energyReceiverAsset = this.resident.energy;
        this.energyProducerAsset = this.utiltyCompany.energy;  
        this.coinsCreditAsset = this.utiltyCompany.coins;
        this.coinsDebitAsset = this.resident.coins;
    }
    else if(this.action.value == 'sellEnergy') {

        this.energyValue = this.value.value;

        this.energyReceiverAsset = this.utiltyCompany.energy;
        this.energyProducerAsset = this.resident.energy;  
        this.coinsCreditAsset = this.resident.coins;
        this.coinsDebitAsset = this.utiltyCompany.coins;
    }
    

    console.log('Producer Energy ID ' + this.energyProducerAsset);
    console.log('Producer Coins ID ' + this.coinsCreditAsset);
    console.log('Consumer Energy ID ' + this.energyReceiverAsset);
    console.log('Consumer Coins ID ' + this.coinsDebitAsset);

    //identify energy and coins id which will be debited
    var splitted_energyID = this.energyProducerAsset.split("#", 2); 
    var energyID = String(splitted_energyID[1]);

    var splitted_coinsID = this.coinsDebitAsset.split("#", 2); 
    var coinsID = String(splitted_coinsID[1]);
        
    this.coinsExchanged = this.utilityCoinsPerEnergy * this.energyValue;

    //transaction object
    this.energyToCoinsObj = {
      $class: "org.decentralized.energy.network.EnergyToCoins",
      "energyRate": this.utilityCoinsPerEnergy,
      "energyValue": this.energyValue,
      "coinsInc": this.coinsCreditAsset,
      "coinsDec": this.coinsDebitAsset,
      "energyInc": this.energyReceiverAsset,
      "energyDec": this.energyProducerAsset
    };

    //check coins and energy assets for enough funds before creating transaction
    return this.serviceTransaction.getEnergy(energyID)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      if(result.value) {
        if ((result.value - this.energyValue) < 0 ){          
          this.errorMessage = "Insufficient energy in producer account";
          return false;
        }
        return true;
      }
    })
    .then((checkProducerEnergy) => {
      console.log('checkEnergy: ' + checkProducerEnergy)
      if(checkProducerEnergy)
      {        
        this.serviceTransaction.getCoins(coinsID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          if(result.value) {
            if ((result.value - this.coinsExchanged) < 0 ){
              
              this.errorMessage = "Insufficient coins in consumer account";
              return false;
            }
            return true;
          }
        })
        .then((checkConsumerCoins) => {
          console.log('checkConsumerCoins: ' + checkConsumerCoins)
          if(checkConsumerCoins)
          {
            this.serviceTransaction.energyToCoins(this.energyToCoinsObj)
            .toPromise()
            .then((result) => {
              this.errorMessage = null;
              this.transactionID = result.transactionId;
              console.log(result);
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
            }).then(() => {
              this.transactionFrom = false;
            });
          }
        });
      }        
    });
  }        
}
