import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CoinsService } from './Coins.service';
import 'rxjs/add/operator/toPromise';

//provide associated components
@Component({
	selector: 'app-Coins',
	templateUrl: './Coins.component.html',
	styleUrls: ['./Coins.component.css'],
  providers: [CoinsService]
})

//CoinsComponent class
export class CoinsComponent implements OnInit {

  //define variables
  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
	private errorMessage;

  //initialize form variables
  coinsID = new FormControl("", Validators.required);
  value = new FormControl("", Validators.required);
  ownerID = new FormControl("", Validators.required);
  ownerEntity = new FormControl("", Validators.required);

  constructor(private serviceCoins:CoinsService, fb: FormBuilder) {
    //intialize form
    this.myForm = fb.group({
          coinsID:this.coinsID,
          value:this.value,
          ownerID:this.ownerID,
          ownerEntity:this.ownerEntity
    });
  };

  //on page initialize, load all coins assets
  ngOnInit(): void {
    this.loadAll();
  }

  //load all coins assets on the blockchain network
  loadAll(): Promise<any> {
    
    //retrieve all coins assets in the tempList array
    let tempList = [];

    //call serviceCoins to get all coins asset objects
    return this.serviceCoins.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      
      //append tempList with the coins asset objects returned
      result.forEach(asset => {
        tempList.push(asset);
      });

      //assign tempList to allAssets
      this.allAssets = tempList;
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

  //add coins asset
  addAsset(form: any): Promise<any> {

    //define coins asset object
    this.asset = {
      $class: "org.decentralized.energy.network.Coins",
          "coinsID":this.coinsID.value,
          "value":this.value.value,
          "ownerID":this.ownerID.value,
          "ownerEntity":this.ownerEntity.value
    };

    //update form
    this.myForm.setValue({
          "coinsID":null,
          "value":null,
          "ownerID":null,
          "ownerEntity":null
    });

    //call serviceCoins to add coins asset
    return this.serviceCoins.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      
      //update form
      this.myForm.setValue({
          "coinsID":null,
          "value":null,
          "ownerID":null,        
          "ownerEntity":null 
        
      });
    })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
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

  //get form based on coinsID
  getForm(id: any): Promise<any>{

    //call serviceCoins to get coins asset object
    return this.serviceCoins.getAsset(id)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      let formObject = {        
            "coinsID":null,
            "value":null,
            "ownerID":null,
            "ownerEntity":null 
      };
      
      //update formObject
      if(result.coinsID){
        formObject.coinsID = result.coinsID;
      }else{
        formObject.coinsID = null;
      }
    
      if(result.value){
        formObject.value = result.value;
      }else{
        formObject.value = null;
      }
    
      if(result.ownerID){
        formObject.ownerID = result.ownerID;
      }else{
        formObject.ownerID = null;
      }
    
      if(result.ownerEntity){
        formObject.ownerEntity = result.ownerEntity;
      }else{
        formObject.ownerEntity = null;
      }
      
      //set formObject
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
          "coinsID":null,
          "value":null,
          "ownerID":null,
          "ownerEntity":null         
      });
  }

}
