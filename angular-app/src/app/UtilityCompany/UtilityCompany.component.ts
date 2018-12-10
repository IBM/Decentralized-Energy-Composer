import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { UtilityCompanyService } from './UtilityCompany.service';
import 'rxjs/add/operator/toPromise';

//provide associated components
@Component({
	selector: 'app-UtilityCompany',
	templateUrl: './UtilityCompany.component.html',
	styleUrls: ['./UtilityCompany.component.css'],
  	providers: [UtilityCompanyService]
})

//UtilityCompanyComponent class
export class UtilityCompanyComponent {

  //define variables
  myForm: FormGroup;

  private allUtilityCompanys;
  private utilityCompany;
  private currentId;
  private errorMessage;

  private coins;
  private energy;
  
  //initialize form variables
  utilityID = new FormControl("", Validators.required);
  name = new FormControl("", Validators.required);
  coinsValue = new FormControl("", Validators.required);
  energyValue = new FormControl("", Validators.required);
  energyUnits = new FormControl("", Validators.required);
      
  constructor(private serviceUtilityCompany:UtilityCompanyService, fb: FormBuilder) {
    //intialize form
    this.myForm = fb.group({         
          utilityID:this.utilityID,
          name:this.name,      
          coinsValue:this.coinsValue,
          energyValue:this.energyValue,
          energyUnits:this.energyUnits,
    });
  };

  //on page initialize, load all utility companies
  ngOnInit(): void {
    this.loadAll();
  }

  //load all Utility Companies and the coins and energy assets associated to it 
  loadAll(): Promise<any>  {
    
    //retrieve all utilityCompanys in the utilityCompanyList array
    let utilityCompanyList = [];

    //call serviceUtilityCompany to get all utility company objects
    return this.serviceUtilityCompany.getAllUtilityCompanys()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      
      //append utilityCompanyList with the utility company objects returned
      result.forEach(utilityCompany => {
        utilityCompanyList.push(utilityCompany);
      });     
    })
    .then(() => {

      //for each utility company, get the associated coins and energy asset
      for (let utilityCompany of utilityCompanyList) {

        //get coinsID from the utilityCompany.coins string
        var splitted_coinsID = utilityCompany.coins.split("#", 2); 
        var coinsID = String(splitted_coinsID[1]);

        //call serviceUtilityCompany to get coins asset
        this.serviceUtilityCompany.getCoins(coinsID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;

          //update utilityCompany
          if(result.value){
            utilityCompany.coinsValue = result.value;
          }
        });

        //get energyID from the utilityCompany.energy string
        var splitted_energyID = utilityCompany.energy.split("#", 2); 
        var energyID = String(splitted_energyID[1]);
        
        //call serviceUtilityCompany to get energy asset
        this.serviceUtilityCompany.getEnergy(energyID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;

          //update utilityCompany
          if(result.value){
            utilityCompany.energyValue = result.value;
          }
          if(result.units){
            utilityCompany.energyUnits = result.units;
          }
        });
        
      }

      //assign utilityCompanyList to allUtilityCompanys
      this.allUtilityCompanys = utilityCompanyList;
    });

  }

  //add Utility Company participant
  addUtilityCompany(form: any): Promise<any> {

    //create assets for utility company and the utility company on the blockchain network
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

    //create coins asset json
    this.coins = {
      $class: "org.decentralized.energy.network.Coins",
          "coinsID":"CO_" + this.utilityID.value,
          "value":this.coinsValue.value,
          "ownerID":this.utilityID.value,
          "ownerEntity":'UtilityCompany'
    };
    
    //create energy asset json
    this.energy = {
      $class: "org.decentralized.energy.network.Energy",
          "energyID":"EN_" + this.utilityID.value,
          "units":this.energyUnits.value,
          "value":this.energyValue.value,
          "ownerID":this.utilityID.value,
          "ownerEntity":'UtilityCompany'        
    };
    
    //create utility company participant json
    this.utilityCompany = {
      $class: "org.decentralized.energy.network.UtilityCompany",
          "utilityID":this.utilityID.value,
          "name":this.name.value,
          "coins":"CO_" + this.utilityID.value,
          "energy":"EN_" + this.utilityID.value,
    };    

    //call serviceUtilityCompany to add coins asset, pass created coins asset json as parameter
    return this.serviceUtilityCompany.addCoins(this.coins)
    .toPromise()
		.then(() => {
      
      //call serviceUtilityCompany to add energy asset, pass created energy asset json as parameter
			this.serviceUtilityCompany.addEnergy(this.energy)      
      .toPromise()
      .then(() => {
        
        //call serviceUtilityCompany to add utility participant, pass created utility participant json as parameter
        this.serviceUtilityCompany.addUtilityCompany(this.utilityCompany)
        .toPromise()
        .then(() => {
          //reload page to display the created utility company
          location.reload();                  
        });
		  });   
		});
  }

  //allow update name of Utility Company
  updateUtilityCompany(form: any): Promise<any> {
    
    //create json of utility company participant to update name
    this.utilityCompany = {
      $class: "org.decentralized.energy.network.UtilityCompany",          
              "name":this.name.value,                    
              "coins": "resource:org.decentralized.energy.network.Coins#CO_" + form.get("utilityID").value,
              "energy": "resource:org.decentralized.energy.network.Energy#EN_" + form.get("utilityID").value
    };

    //call serviceUtilityCompany to update utility company, pass utilityID of which utility company to update as parameter
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

    //call serviceUtilityCompany to delete utilty company, pass utilityID as parameter
    return this.serviceUtilityCompany.deleteUtilityCompany(this.currentId)
		.toPromise()
		.then(() => {
			this.errorMessage = null;

      //call serviceUtilityCompany to delete coins asset, pass coinsID as parameter
      this.serviceUtilityCompany.deleteCoins("CO_"+this.currentId)
      .toPromise()
      .then(() => {

          //call serviceUtilityCompany to delete energy asset, pass energyID as parameter
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

  //set id
  setId(id: any): void{
    this.currentId = id;
  }

  //get form based on utilityID
  getForm(id: any): Promise<any>{

    //call serviceUtilityCompany to get utility company participant object
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

      //update formObject
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

  //reset form
  resetForm(): void{
    this.myForm.setValue({           
          "utilityID":null, 
          "name":null,                 

          "coinsValue":null,
          "energyValue":null,
          "energyUnits":null,
      });
  }

}





