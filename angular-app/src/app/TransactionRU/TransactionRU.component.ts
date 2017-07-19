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

  myForm: FormGroup;
  private errorMessage;
  private transactionFrom;

  private allResidents;
  private allUtilityCompanys;

  private resident;
  private utiltyCompany;
  
  private residentToUtilityObj;

  private transactionID;

  private energyReceiverAsset;
  private energyProducerAsset;  
  private coinsCreditAsset;
  private coinsDebitAsset;

    formResidentID = new FormControl("", Validators.required);
	  formUtilityID = new FormControl("", Validators.required); 

    action = new FormControl("", Validators.required); 

	  energyValue = new FormControl("", Validators.required);
	  coinsValue = new FormControl("", Validators.required);
  
  constructor(private serviceTransaction:TransactionRUService, fb: FormBuilder) {
      
	  this.myForm = fb.group({
		  
		  formResidentID:this.formResidentID,
		  formUtilityID:this.formUtilityID,

      action:this.action,

      energyValue:this.energyValue,
      coinsValue:this.coinsValue
    });
    
  };

  ngOnInit(): void {
    this.transactionFrom  = true;
    this.loadAllResidents()
    .then(() => {                     
            this.loadAllUtilityCompanys();
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

  execute(form: any): Promise<any> {
      
    console.log('Energy quantiy ' + this.energyValue.value);
    console.log('Coins quantiy ' + this.coinsValue.value);
    console.log('Resident ' + this.formResidentID.value);
    console.log('UtilityCompany ' + this.formUtilityID.value);
    console.log(this.allResidents)

    for (let resident of this.allResidents) {
        console.log(resident.residentID); 
      
      if(resident.residentID == this.formResidentID.value){
        this.resident = resident;
      }     
    }

    for (let utilityCompany of this.allUtilityCompanys) {
        console.log(utilityCompany.utilityID); 
      
      if(utilityCompany.utilityID == this.formUtilityID.value){
        this.utiltyCompany = utilityCompany;
      }     
    }

    console.log('Action: ' + this.action.value)

    if(this.action.value == 'buyEnergy') {
        this.energyReceiverAsset = this.resident.energy;
        this.energyProducerAsset = this.utiltyCompany.energy;  
        this.coinsCreditAsset = this.utiltyCompany.coins;
        this.coinsDebitAsset = this.resident.coins;
    }
    else if(this.action.value == 'sellEnergy') {
        this.energyReceiverAsset = this.utiltyCompany.energy;
        this.energyProducerAsset = this.resident.energy;  
        this.coinsCreditAsset = this.resident.coins;
        this.coinsDebitAsset = this.utiltyCompany.coins;
    }
    

    console.log('Producer Energy ID ' + this.energyProducerAsset);
    console.log('Producer Coins ID ' + this.coinsCreditAsset);
    console.log('Consumer Energy ID ' + this.energyReceiverAsset);
    console.log('Consumer Coins ID ' + this.coinsDebitAsset);


    this.residentToUtilityObj = {
      $class: "org.decentralized.energy.network.ResidentToResident",
      "coinsValue": this.coinsValue.value,
      "energyValue": this.energyValue.value,
      "coinsInc": this.coinsCreditAsset,
      "coinsDec": this.coinsDebitAsset,
      "energyInc": this.energyReceiverAsset,
      "energyDec": this.energyProducerAsset
    };
    return this.serviceTransaction.residentToUtility(this.residentToUtilityObj)
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
      "energy": this.energyReceiverAsset,
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


  deductEnergy(): Promise<any>  {

    var subtractValue = 0 - this.energyValue.value

    this.transferEnergyObj = {
      $class: "org.decentralized.energy.network.TransferEnergy",
      "value": subtractValue,
      "energy": this.energyProducerAsset,
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
