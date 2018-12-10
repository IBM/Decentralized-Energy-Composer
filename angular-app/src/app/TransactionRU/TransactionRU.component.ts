import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { TransactionRUService } from './TransactionRU.service';
import 'rxjs/add/operator/toPromise';

//provide associated components
@Component({
	selector: 'app-TransactionRU',
	templateUrl: './TransactionRU.component.html',
	styleUrls: ['./TransactionRU.component.css'],
  	providers: [TransactionRUService]
})

//TransactionRRComponent class
export class TransactionRUComponent {

  //define rate of conversion
  private utilityCoinsPerEnergy = 1;
  private utilityEnergyPerCoins = (1 / this.utilityCoinsPerEnergy).toFixed(3);  
  
  //define variables
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

  //initialize form variables
  formResidentID = new FormControl("", Validators.required);
	formUtilityID = new FormControl("", Validators.required); 
  action = new FormControl("", Validators.required); 
	value = new FormControl("", Validators.required);
  
  constructor(private serviceTransaction:TransactionRUService, fb: FormBuilder) {
    //intialize form    
	  this.myForm = fb.group({		  
		  formResidentID:this.formResidentID,
		  formUtilityID:this.formUtilityID,
      action:this.action,
      value:this.value,      
    });    
  };

  //on page initialize, load all residents and utility companies
  ngOnInit(): void {
    this.transactionFrom  = true;
    this.loadAllResidents()
    .then(() => {                     
            this.loadAllUtilityCompanys();
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

  //get all Utility Companies
  loadAllUtilityCompanys(): Promise<any> {
    
    //retrieve all utility companies in the tempList array
    let tempList = [];

    //call serviceTransaction to get all utility company objects
    return this.serviceTransaction.getAllUtilityCompanys()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      
      //append tempList with the utilty company objects returned
      result.forEach(utilityCompany => {
        tempList.push(utilityCompany);
      });

      //assign tempList to allUtilityCompanys
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
          

    //loop through all residents to find match with user provided resident
    for (let resident of this.allResidents) {
      if(resident.residentID == this.formResidentID.value){
        this.resident = resident;
      }     
    }

    //loop through all utility companies to find match with user provided utility company
    for (let utilityCompany of this.allUtilityCompanys) {
        console.log(utilityCompany.utilityID); 
      
      if(utilityCompany.utilityID == this.formUtilityID.value){
        this.utiltyCompany = utilityCompany;
      }     
    }

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

    //identify energy and coins id which will be debited from the string
    var splitted_energyID = this.energyProducerAsset.split("#", 2); 
    var energyID = String(splitted_energyID[1]);

    var splitted_coinsID = this.coinsDebitAsset.split("#", 2); 
    var coinsID = String(splitted_coinsID[1]);

    //calculate coins exchanges from the rate
    this.coinsExchanged = this.utilityCoinsPerEnergy * this.energyValue;

    //create transaction object
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
    //call serviceTransaction to get energy asset
    return this.serviceTransaction.getEnergy(energyID)
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      //check if enough value
      if(result.value) {
        if ((result.value - this.energyValue) < 0 ){          
          this.errorMessage = "Insufficient energy in producer account";
          return false;
        }
        return true;
      }
    })
    .then((checkProducerEnergy) => {
      //if positive on sufficient energy, then check coins asset whether sufficient coins
      if(checkProducerEnergy)
      {        
        //call serviceTransaction to get coins asset
        this.serviceTransaction.getCoins(coinsID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          //check if enough value
          if(result.value) {
            if ((result.value - this.coinsExchanged) < 0 ){              
              this.errorMessage = "Insufficient coins in consumer account";
              return false;
            }
            return true;
          }
        })
        .then((checkConsumerCoins) => {
          //if positive on sufficient coins, then call transaction
          if(checkConsumerCoins)
          {
            //call serviceTransaction call the energyToCoins transaction with energyToCoinsObj as parameter
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
