import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { UtilityCompanyService } from './UtilityCompany.service';
import 'rxjs/add/operator/toPromise';

@Component({
	selector: 'app-UtilityCompany',
	templateUrl: './UtilityCompany.component.html',
	styleUrls: ['./UtilityCompany.component.css'],
  	providers: [UtilityCompanyService]
})
export class UtilityCompanyComponent {

  myForm: FormGroup;

  private allUtilityCompanys;
  private utilityCompany;
  private currentId;
  private errorMessage;

  private coins;
  private energy;
  
      utilityID = new FormControl("", Validators.required);
      name = new FormControl("", Validators.required);
      coinsValue = new FormControl("", Validators.required);
      energyValue = new FormControl("", Validators.required);
      energyUnits = new FormControl("", Validators.required);
      
  constructor(private serviceUtilityCompany:UtilityCompanyService, fb: FormBuilder) {
    this.myForm = fb.group({
         
          utilityID:this.utilityID,
          name:this.name,      

          coinsValue:this.coinsValue,
          energyValue:this.energyValue,
          energyUnits:this.energyUnits,
          
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  

  resetForm(): void{
    this.myForm.setValue({           
          "utilityID":null, 
          "name":null,                 

          "coinsValue":null,
          "energyValue":null,
          "energyUnits":null,
      });
  }

  //allow update name of Utility Company
  updateUtilityCompany(form: any): Promise<any> {
    
    console.log("update check");
    this.utilityCompany = {
      $class: "org.decentralized.energy.network.UtilityCompany",          
            "name":this.name.value,                    

             "coins": "resource:org.decentralized.energy.network.Coins#CO_" + form.get("utilityID").value,
             "energy": "resource:org.decentralized.energy.network.Energy#EN_" + form.get("utilityID").value
    };
    console.log(this.utilityCompany);
    return this.serviceUtilityCompany.updateUtilityCompany(form.get("utilityID").value,this.utilityCompany)
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

  //delete Utility Company and the coins and energy assets associated to it
  deleteUtilityCompany(): Promise<any> {

    return this.serviceUtilityCompany.deleteUtilityCompany(this.currentId)
		.toPromise()
		.then(() => {
			this.errorMessage = null;
      var coinsID = "CO_"+this.currentId;
      this.serviceUtilityCompany.deleteCoins(coinsID)
      .toPromise()
      .then(() => {
          this.serviceUtilityCompany.deleteEnergy("EN_"+this.currentId)
          .toPromise()
          .then(() => {
              console.log("Deleted")              
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

    return this.serviceUtilityCompany.getUtilityCompany(id)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      let formObject = {        
            "utilityID":null,          
            "name":null,          

            "coinsValue":null,          
            "energyValue":null,          
            "energyUnits":null                               
      };

        if(result.utilityID){
          formObject.utilityID = result.utilityID;
        }else{
          formObject.utilityID = null;
        }
      
        if(result.name){
          formObject.name = result.name;
        }else{
          formObject.name = null;
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


  loadAll_OnlyUtilityCompanys(): Promise<any> {
    let tempList = [];
    return this.serviceUtilityCompany.getAllUtilityCompanys()
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

  //load all Utility Companies and the coins and energy assets associated to it 
  loadAll(): Promise<any>  {
    
    //retrieve all utilityCompanys
    let utilityCompanyList = [];
    return this.serviceUtilityCompany.getAllUtilityCompanys()
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      result.forEach(utilityCompany => {
        utilityCompanyList.push(utilityCompany);
      });     
    })
    .then(() => {

      for (let utilityCompany of utilityCompanyList) {
        console.log("in for loop")
        console.log(utilityCompany.coins)

        var splitted_coinsID = utilityCompany.coins.split("#", 2); 
        var coinsID = String(splitted_coinsID[1]);
        this.serviceUtilityCompany.getCoins(coinsID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          if(result.value){
            utilityCompany.coinsValue = result.value;
          }
        });

        var splitted_energyID = utilityCompany.energy.split("#", 2); 
        var energyID = String(splitted_energyID[1]);
        console.log(energyID);
        this.serviceUtilityCompany.getEnergy(energyID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          if(result.value){
            utilityCompany.energyValue = result.value;
          }
          if(result.units){
            utilityCompany.energyUnits = result.units;
          }
        });
        
      }
      this.allUtilityCompanys = utilityCompanyList;
    });

  }

  //add Utility Company participant
  addUtilityCompany(form: any): Promise<any> {

    return this.createAssetsUtility()
      .then(() => {           
        this.errorMessage = null;
        this.myForm.setValue({
            "utilityID":null,
            "name":null,
            "coinsValue":null,
            "energyValue":null,          
            "energyUnits":null
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

  //create coins and energy assets associated with the Resident, followed by the Resident
  createAssetsUtility(): Promise<any> {

    this.coins = {
      $class: "org.decentralized.energy.network.Coins",
          "coinsID":"CO_" + this.utilityID.value,
          "value":this.coinsValue.value,
          "ownerID":this.utilityID.value,
          "ownerEntity":'UtilityCompany'
    };
    
    this.energy = {
      $class: "org.decentralized.energy.network.Energy",
          "energyID":"EN_" + this.utilityID.value,
          "units":this.energyUnits.value,
          "value":this.energyValue.value,
          "ownerID":this.utilityID.value,
          "ownerEntity":'UtilityCompany'        
    };
    
    this.utilityCompany = {
      $class: "org.decentralized.energy.network.UtilityCompany",
          "utilityID":this.utilityID.value,
          "name":this.name.value,

          "coins":"CO_" + this.utilityID.value,
          "energy":"EN_" + this.utilityID.value,
    };    

    return this.serviceUtilityCompany.addCoins(this.coins)
    .toPromise()
		.then(() => {
      console.log("create energy");
			this.serviceUtilityCompany.addEnergy(this.energy)      
      .toPromise()
      .then(() => {
        console.log("create utilityCompanys");
        this.serviceUtilityCompany.addUtilityCompany(this.utilityCompany)
        .toPromise()
        .then(() => {
          console.log("created assets");  
          location.reload();                  
        })
		  })   
		})

  }

 
}





