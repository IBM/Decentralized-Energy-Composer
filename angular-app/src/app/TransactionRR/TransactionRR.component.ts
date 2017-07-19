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

  myForm: FormGroup;
  private errorMessage;
  private transactionFrom;

  private allResidents;
  private producerResident;
  private consumerResident;
  
  private residentToResidentObj;

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

  execute(form: any): Promise<any> {
      
    console.log('Energy quantiy ' + this.energyValue.value);
    console.log('Coins quantiy ' + this.coinsValue.value);
    console.log('Producer resident ' + this.producerResidentID.value);
    console.log('Consumer resident ' + this.consumerResidentID.value);
    console.log(this.allResidents)

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

    
    this.residentToResidentObj = {
      $class: "org.decentralized.energy.network.ResidentToResident",
      "coinsValue": this.coinsValue.value,
      "energyValue": this.energyValue.value,
      "coinsInc": this.producerResident.coins,
      "coinsDec": this.consumerResident.coins,
      "energyInc": this.consumerResident.energy,
      "energyDec": this.producerResident.energy,         
    };
    return this.serviceTransaction.residentToResident(this.residentToResidentObj)
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


    /*
    console.log("add energy");
    return this.addEnergy()    
		.then(() => {  
      console.log("deduct coins");
			this.deductCoins() 
		  .then(() => {
        console.log("add coins");
        this.addCoins()        
        .then(() => {
          console.log("deduct energy");
          this.deductEnergy()
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
  addEnergy(): Promise<any> {
    
    this.transferEnergyObj = {
      $class: "org.decentralized.energy.network.TransferEnergy",
      "value": this.energyValue.value,
      "energy": this.consumerResident.energy,
      "transactionId": " "          
    };
    return this.serviceTransaction.transferEnergy(this.transferEnergyObj)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      this.energyReceivedID = result.energyUpdateID;
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
      "coins": this.producerResident.coins,
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

    var subtractValue = 0 - this.energyValue.value

    this.transferCoinsObj = {
      $class: "org.decentralized.energy.network.TransferCoins",
      "value": subtractValue,
      "coins": this.consumerResident.coins,
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


  deductEnergy(): Promise<any>  {

    var subtractValue = 0 - this.energyValue.value

    this.transferEnergyObj = {
      $class: "org.decentralized.energy.network.TransferEnergy",
      "value": subtractValue,
      "energy": this.producerResident.energy,
      "transactionId": " "
    };
    return this.serviceTransaction.transferEnergy(this.transferEnergyObj)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      this.energyProvidedID = result.energyUpdateID;
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
