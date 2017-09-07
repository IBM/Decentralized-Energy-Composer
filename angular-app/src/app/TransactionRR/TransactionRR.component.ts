import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { TransactionRRService } from './TransactionRR.service';
import 'rxjs/add/operator/toPromise';

@Component({
	selector: 'app-TransactionRR',
	templateUrl: './TransactionRR.component.html',
	styleUrls: ['./TransactionRR.component.css'],
  	providers: [TransactionRRService]
})
export class TransactionRRComponent {

  //defined rate
  private residentCoinsPerEnergy = 1;
  private residentEnergyPerCoin = (1 / this.residentCoinsPerEnergy).toFixed(2);  
  private coinsExchanged;
  private checkResultProducerEnergy = true;
  private checkResultConsumerCoins = true;

  myForm: FormGroup;
  private errorMessage;
  private transactionFrom;

  private allResidents;
  private producerResident;
  private consumerResident;
  
  private energyToCoinsObj;
  private transactionID;

    producerResidentID = new FormControl("", Validators.required);
	  consumerResidentID = new FormControl("", Validators.required); 

	  energyValue = new FormControl("", Validators.required);
	  coinsValue = new FormControl("", Validators.required);
  
  constructor(private serviceTransaction:TransactionRRService, fb: FormBuilder) {
      
	  this.myForm = fb.group({
		  
		  producerResidentID:this.producerResidentID,
		  consumerResidentID:this.consumerResidentID,

      energyValue:this.energyValue,
      coinsValue:this.coinsValue,
    });
    
  };

  ngOnInit(): void {
    this.transactionFrom  = false;
    this.loadAllResidents()
    .then(() => {                     
            this.transactionFrom  = true;
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

  //execute transaction
  execute(form: any): Promise<any> {
          
    console.log(this.allResidents)

    //get producer and consumer resident
    for (let resident of this.allResidents) {
      console.log(resident.residentID); 
      
      if(resident.residentID == this.producerResidentID.value){
        this.producerResident = resident;
      }
      if(resident.residentID == this.consumerResidentID.value){
        this.consumerResident = resident;
      }
    }

    console.log('Producer Energy ID ' + this.producerResident.energy);
    console.log('Producer Coins ID ' + this.producerResident.coins);
    console.log('Consumer Energy ID ' + this.consumerResident.energy);
    console.log('Consumer Coins ID ' + this.consumerResident.coins);
    
    //identify energy and coins id which will be debited
    var splitted_energyID = this.producerResident.energy.split("#", 2); 
    var energyID = String(splitted_energyID[1]);

    var splitted_coinsID = this.consumerResident.coins.split("#", 2); 
    var coinsID = String(splitted_coinsID[1]);
        
    this.coinsExchanged = this.residentCoinsPerEnergy * this.energyValue.value;

    //transaction object
    this.energyToCoinsObj = {
      $class: "org.decentralized.energy.network.EnergyToCoins",
      "energyRate": this.residentCoinsPerEnergy,
      "energyValue": this.energyValue.value,
      "coinsInc": this.producerResident.coins,
      "coinsDec": this.consumerResident.coins,
      "energyInc": this.consumerResident.energy,
      "energyDec": this.producerResident.energy,         
    };

    //chech consumer coins and producer energy assets for enough balance before creating transaction
    return this.serviceTransaction.getEnergy(energyID)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      if(result.value) {
        if ((result.value - this.energyValue.value) < 0 ){
          this.checkResultProducerEnergy = false;
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
              this.checkResultConsumerCoins = false;
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
            }).then(() => {
              this.transactionFrom = false;
            });
          }
        });
      }        
    });

  }
          
}
