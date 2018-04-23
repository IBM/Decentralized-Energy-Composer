import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ResidentService } from './Resident.service';
import 'rxjs/add/operator/toPromise';

//provide associated components
@Component({
	selector: 'app-Resident',
	templateUrl: './Resident.component.html',
	styleUrls: ['./Resident.component.css'],
  	providers: [ResidentService]
})

//ResidentComponent class
export class ResidentComponent {

  //define variables
  myForm: FormGroup;

  private allResidents;
  private resident;
  private currentId;
  private errorMessage;

  private coins;
  private energy;
  private cash;

  //initialize form variables
  residentID = new FormControl("", Validators.required);
  firstName = new FormControl("", Validators.required);
  lastName = new FormControl("", Validators.required);
  coinsValue = new FormControl("", Validators.required);
  energyValue = new FormControl("", Validators.required);
  energyUnits = new FormControl("", Validators.required);
  cashValue = new FormControl("", Validators.required);
  cashCurrency = new FormControl("", Validators.required);
      
  constructor(private serviceResident:ResidentService, fb: FormBuilder) {
    //intialize form
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

  //on page initialize, load all residents
  ngOnInit(): void {
    this.loadAll();
  }

  //load all residents and the energy, coins and cash assets associated to it 
  loadAll(): Promise<any>  {
    
    //retrieve all residents in the residentList array
    let residentList = [];

    //call serviceResident to get all resident objects
    return this.serviceResident.getAllResidents()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      
      //append residentList with the resident objects returned
      result.forEach(resident => {
        residentList.push(resident);
      });     
    })
    .then(() => {

      //for each resident, get the associated coins, energy and cash asset
      for (let resident of residentList) {

        //get coinsID from the resident.coins string
        var splitted_coinsID = resident.coins.split("#", 2); 
        var coinsID = String(splitted_coinsID[1]);

        //call serviceResident to get coins asset
        this.serviceResident.getCoins(coinsID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          //update resident
          if(result.value){
            resident.coinsValue = result.value;
          }
        });

        //get energyID from the resident.energy string
        var splitted_energyID = resident.energy.split("#", 2); 
        var energyID = String(splitted_energyID[1]);
        
        //call serviceResident to get energy asset
        this.serviceResident.getEnergy(energyID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          //update resident
          if(result.value){
            resident.energyValue = result.value;
          }
          if(result.units){
            resident.energyUnits = result.units;
          }
        });

        //get cashID from the resident.cash string
        var splitted_cashID = resident.cash.split("#", 2); 
        var cashID = String(splitted_cashID[1]);
        
        //call serviceResident to get cash asset
        this.serviceResident.getCash(cashID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          //update resident
          if(result.value){
            resident.cashValue = result.value;
          }
          if(result.currency){
            resident.cashCurrency = result.currency;
          }
        });
      }

      //assign residentList to allResidents
      this.allResidents = residentList;
    });

  }

  //add Resident participant
  addResident(form: any): Promise<any> {

    //create assets for resisent and the resident on the blockchain network
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

    //create coins asset json
    this.coins = {
      $class: "org.decentralized.energy.network.Coins",
          "coinsID":"CO_" + this.residentID.value,
          "value":this.coinsValue.value,
          "ownerID":this.residentID.value,
          "ownerEntity":'Resident'
    };
    
    //create energy asset json
    this.energy = {
      $class: "org.decentralized.energy.network.Energy",
          "energyID":"EN_" + this.residentID.value,
          "units":this.energyUnits.value,
          "value":this.energyValue.value,
          "ownerID":this.residentID.value,
          "ownerEntity":'Resident'        
    };

    //create cash asset json
    this.cash = {
      $class: "org.decentralized.energy.network.Cash",
          "cashID":"CA_" + this.residentID.value,
          "currency":this.cashCurrency.value,
          "value":this.cashValue.value,
          "ownerID":this.residentID.value,
          "ownerEntity":'Resident'        
    };    
    
    //create resident participant json
    this.resident = {
      $class: "org.decentralized.energy.network.Resident",
          "residentID":this.residentID.value,
          "firstName":this.firstName.value,
          "lastName":this.lastName.value,
          "coins":"CO_" + this.residentID.value,
          "cash":"CA_" + this.residentID.value,
          "energy":"EN_" + this.residentID.value,
      };    

    //call serviceResident to add coins asset, pass created coins asset json as parameter
    return this.serviceResident.addCoins(this.coins)
    .toPromise()
		.then(() => {
      
      //call serviceResident to add energy asset, pass created energy asset json as parameter
			this.serviceResident.addEnergy(this.energy)
      .toPromise()
		  .then(() => {

        //call serviceResident to add cash asset, pass created cash asset json as parameter
        this.serviceResident.addCash(this.cash)
        .toPromise()
        .then(() => {
          
          //call serviceResident to add resident participant, pass created resident participant json as parameter
          this.serviceResident.addResident(this.resident)
          .toPromise()
          .then(() => {
            //reload page to display the created resident
            location.reload();
          });            
        });
		  });   
		});
  }

  //allow update name of Resident
  updateResident(form: any): Promise<any> {
    
    //create json of resident participant to update name
    this.resident = {
      $class: "org.decentralized.energy.network.Resident",          
      "firstName":this.firstName.value,          
      "lastName":this.lastName.value,
      "coins": "resource:org.decentralized.energy.network.Coins#CO_" + form.get("residentID").value,
      "cash": "resource:org.decentralized.energy.network.Cash#CA_" + form.get("residentID").value,
      "energy": "resource:org.decentralized.energy.network.Energy#EN_" + form.get("residentID").value
    };

    //call serviceResident to update resident, pass residentID of which resident to update as parameter
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

    //call serviceResident to delete resident, pass residentID as parameter
    return this.serviceResident.deleteResident(this.currentId)
		.toPromise()
		.then(() => {
      this.errorMessage = null;
      
      //call serviceResident to delete coins asset, pass coinsID as parameter
      this.serviceResident.deleteCoins("CO_"+this.currentId)
      .toPromise()
      .then(() => {

          //call serviceResident to delete energy asset, pass energyID as parameter
          this.serviceResident.deleteEnergy("EN_"+this.currentId)
          .toPromise()
          .then(() => {

              //call serviceResident to delete cash asset, pass cashID as parameter
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

  //set id
  setId(id: any): void{
    this.currentId = id;
  }

  //get form based on residentID
  getForm(id: any): Promise<any>{

    //call serviceResident to get resident participant object
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

      //update formObject
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

  //reset form
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

}
