import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ResidentService } from './Resident.service';
import 'rxjs/add/operator/toPromise';

@Component({
	selector: 'app-Resident',
	templateUrl: './Resident.component.html',
	styleUrls: ['./Resident.component.css'],
  	providers: [ResidentService]
})
export class ResidentComponent {

  myForm: FormGroup;

  private allResidents;
  private resident;
  private currentId;
  private errorMessage;

  private coins;
  private energy;
  private cash;

  
      residentID = new FormControl("", Validators.required);
      firstName = new FormControl("", Validators.required);
      lastName = new FormControl("", Validators.required);
      coinsValue = new FormControl("", Validators.required);
      energyValue = new FormControl("", Validators.required);
      energyUnits = new FormControl("", Validators.required);
      cashValue = new FormControl("", Validators.required);
      cashCurrency = new FormControl("", Validators.required);
      
  

  constructor(private serviceResident:ResidentService, fb: FormBuilder) {
    this.myForm = fb.group({
         
          residentID:this.residentID,
          firstName:this.firstName,      
          lastName:this.lastName,

          coinsValue:this.coinsValue,
          energyValue:this.energyValue,
          energyUnits:this.energyUnits,
          cashValue:this.cashValue,
          cashCurrency:this.cashCurrency
          
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }


  resetForm(): void{
    this.myForm.setValue({           
          "residentID":null, 
          "firstName":null,       
          "lastName":null,

          "coinsValue":null,
          "energyValue":null,
          "energyUnits":null,
          "cashValue":null,
          "cashCurrency":null
      });
  }

  //allow update name of Resident
  updateResident(form: any): Promise<any> {
    
    console.log("update check");
    this.resident = {
      $class: "org.decentralized.energy.network.Resident",          
            "firstName":this.firstName.value,          
            "lastName":this.lastName.value,

             "coins": "resource:org.decentralized.energy.network.Coins#CO_" + form.get("residentID").value,
             "cash": "resource:org.decentralized.energy.network.Cash#CA_" + form.get("residentID").value,
             "energy": "resource:org.decentralized.energy.network.Energy#EN_" + form.get("residentID").value
    };
    console.log(this.resident);
    return this.serviceResident.updateResident(form.get("residentID").value,this.resident)
		.toPromise()
		.then(() => {
			this.errorMessage = null;
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

  //delete Resident and the coins and cash assets associated to it
  deleteResident(): Promise<any> {

    return this.serviceResident.deleteResident(this.currentId)
		.toPromise()
		.then(() => {
			this.errorMessage = null;
      var coinsID = "CO_"+this.currentId;
      this.serviceResident.deleteCoins(coinsID)
      .toPromise()
      .then(() => {
          this.serviceResident.deleteEnergy("EN_"+this.currentId)
          .toPromise()
          .then(() => {
              this.serviceResident.deleteCash("CA_"+this.currentId)
              .toPromise()
              .then(() => {
                  console.log("Deleted")
              });
          });
      });            
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

  setId(id: any): void{
    this.currentId = id;
  }

  getForm(id: any): Promise<any>{

    return this.serviceResident.getResident(id)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      let formObject = {        
            "residentID":null,          
            "firstName":null,          
            "lastName":null,

            "coinsValue":null,          
            "energyValue":null,          
            "energyUnits":null,          
            "cashValue":null,          
            "cashCurrency":null 
                      
      };

        if(result.residentID){
          formObject.residentID = result.residentID;
        }else{
          formObject.residentID = null;
        }
      
        if(result.firstName){
          formObject.firstName = result.firstName;
        }else{
          formObject.firstName = null;
        }
      
        if(result.lastName){
          formObject.lastName = result.lastName;
        }else{
          formObject.lastName = null;
        }

      this.myForm.setValue(formObject);

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


  loadAll_OnlyResidents(): Promise<any> {
    let tempList = [];
    return this.serviceResident.getAllResidents()
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

  //load all Resident and the enregy, coins and cash assets associated to it 
  loadAll(): Promise<any>  {
    
    //retrieve all residents
    let residentList = [];
    return this.serviceResident.getAllResidents()
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      result.forEach(resident => {
        residentList.push(resident);
      });     
    })
    .then(() => {

      for (let resident of residentList) {
        console.log("in for loop")
        console.log(resident.coins)

        var splitted_coinsID = resident.coins.split("#", 2); 
        var coinsID = String(splitted_coinsID[1]);
        this.serviceResident.getCoins(coinsID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          if(result.value){
            resident.coinsValue = result.value;
          }
        });

        var splitted_energyID = resident.energy.split("#", 2); 
        var energyID = String(splitted_energyID[1]);
        console.log(energyID);
        this.serviceResident.getEnergy(energyID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          if(result.value){
            resident.energyValue = result.value;
          }
          if(result.units){
            resident.energyUnits = result.units;
          }
        });

        var splitted_cashID = resident.cash.split("#", 2); 
        var cashID = String(splitted_cashID[1]);
        console.log(cashID);
        this.serviceResident.getCash(cashID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          if(result.value){
            resident.cashValue = result.value;
          }
          if(result.currency){
            resident.cashCurrency = result.currency;
          }
        });
      }

      this.allResidents = residentList;
    });

  }

  //add Resident participant
  addResident(form: any): Promise<any> {

    return this.createAssetsResident()
      .then(() => {           
        this.errorMessage = null;
        this.myForm.setValue({
            "residentID":null,
            "firstName":null,
            "lastName":null,
            "coinsValue":null,
            "energyValue":null,
            "energyUnits":null,
            "cashValue":null,
            "cashCurrency":null
        });
      })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
        }
        else if (error == '500 - Internal Server Error') {
          this.errorMessage = "Input error";
        }
        else{
            this.errorMessage = error;
        }
    });
  }

  //create coins, energy and cash assets associated with the Resident, followed by the Resident
  createAssetsResident(): Promise<any> {

    this.coins = {
      $class: "org.decentralized.energy.network.Coins",
          "coinsID":"CO_" + this.residentID.value,
          "value":this.coinsValue.value,
          "ownerID":this.residentID.value,
          "ownerEntity":'Resident'
    };
    
    this.energy = {
      $class: "org.decentralized.energy.network.Energy",
          "energyID":"EN_" + this.residentID.value,
          "units":this.energyUnits.value,
          "value":this.energyValue.value,
          "ownerID":this.residentID.value,
          "ownerEntity":'Resident'        
    };

    this.cash = {
      $class: "org.decentralized.energy.network.Cash",
          "cashID":"CA_" + this.residentID.value,
          "currency":this.cashCurrency.value,
          "value":this.cashValue.value,
          "ownerID":this.residentID.value,
          "ownerEntity":'Resident'        
    };    
    
    this.resident = {
      $class: "org.decentralized.energy.network.Resident",
          "residentID":this.residentID.value,
          "firstName":this.firstName.value,
          "lastName":this.lastName.value,

          "coins":"CO_" + this.residentID.value,
          "cash":"CA_" + this.residentID.value,
          "energy":"EN_" + this.residentID.value,

      };    

    return this.serviceResident.addCoins(this.coins)
    .toPromise()
		.then(() => {
      console.log("create energy");
			this.serviceResident.addEnergy(this.energy)
      .toPromise()
		  .then(() => {
        console.log("create cash");
        this.serviceResident.addCash(this.cash)
        .toPromise()
        .then(() => {
          console.log("create residents");
          this.serviceResident.addResident(this.resident)
          .toPromise()
          .then(() => {
           console.log("created assets");
           location.reload();
            });            
        });
		  });   
		});
  }
}





