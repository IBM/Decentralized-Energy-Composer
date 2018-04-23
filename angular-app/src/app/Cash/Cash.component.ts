import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { CashService } from './Cash.service';
import 'rxjs/add/operator/toPromise';

//provide associated components
@Component({
	selector: 'app-Cash',
	templateUrl: './Cash.component.html',
	styleUrls: ['./Cash.component.css'],
  providers: [CashService]
})

//CashComponent class
export class CashComponent implements OnInit {

  //define variables
  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
	private errorMessage;

  //initialize form variables
  cashID = new FormControl("", Validators.required);
  currency = new FormControl("", Validators.required);
  value = new FormControl("", Validators.required);
  ownerID = new FormControl("", Validators.required);
  ownerEntity = new FormControl("", Validators.required);
  
  constructor(private serviceCash:CashService, fb: FormBuilder) {
    //intialize form
    this.myForm = fb.group({
          cashID:this.cashID,
          currency:this.currency,
          value:this.value,
          ownerID:this.ownerID,
          ownerEntity:this.ownerEntity
        
    });
  };

  //on page initialize, load all cash assets
  ngOnInit(): void {
    this.loadAll();
  }

  //load all cash assets on the blockchain network
  loadAll(): Promise<any> {

    //retrieve all cash assets in the tempList array
    let tempList = [];

    //call serviceCash to get all cash asset objects
    return this.serviceCash.getAll()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      
      //append tempList with the cash asset objects returned
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

  //add cash asset
  addAsset(form: any): Promise<any> {

    //define cash asset object
    this.asset = {
      $class: "org.decentralized.energy.network.Cash",
          "cashID":this.cashID.value,
          "currency":this.currency.value,
          "value":this.value.value,
          "ownerID":this.ownerID.value,
          "ownerEntity":this.ownerEntity.value
    };

    //update form
    this.myForm.setValue({
          "cashID":null,
          "currency":null,
          "value":null,
          "ownerID":null,
          "ownerEntity":null
    });

    //call serviceCash to add cash asset
    return this.serviceCash.addAsset(this.asset)
    .toPromise()
    .then(() => {
      this.errorMessage = null;
      
      //update form
      this.myForm.setValue({
          "cashID":null,
          "currency":null,
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

    //call serviceCash to get cash asset object
    return this.serviceCash.getAsset(id)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      let formObject = {
            "cashID":null,
            "currency":null,
            "value":null,
            "ownerID":null,
            "ownerEntity":null 
      };
      
      //update formObject
      if(result.cashID){
        formObject.cashID = result.cashID;
      }else{
        formObject.cashID = null;
      }
    
      if(result.currency){
        formObject.currency = result.currency;
      }else{
        formObject.currency = null;
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
          "cashID":null,
          "currency":null,
          "value":null,
          "ownerID":null,
          "ownerEntity":null 
        
      });
  }

}
