import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { BankService } from './Bank.service';   //from Bank.service.ts
import 'rxjs/add/operator/toPromise';

//provide associated components
@Component({
	selector: 'app-Bank',
	templateUrl: './Bank.component.html',
	styleUrls: ['./Bank.component.css'],
  	providers: [BankService]
})

//BankComponent class
export class BankComponent {

  //define variables
  myForm: FormGroup;
  
  private allBanks;
  private bank;
  private currentId;
  private errorMessage;

  private coins;
  private energy;
  private cash;
  
  //initialize form variables
  bankID = new FormControl("", Validators.required);
  name = new FormControl("", Validators.required);      
  coinsValue = new FormControl("", Validators.required);      
  cashValue = new FormControl("", Validators.required);
  cashCurrency = new FormControl("", Validators.required);
      
  constructor(private serviceBank:BankService, fb: FormBuilder) {
    //intialize form
    this.myForm = fb.group({         
          bankID:this.bankID,
          name:this.name,      
          coinsValue:this.coinsValue,
          cashValue:this.cashValue,
          cashCurrency:this.cashCurrency          
    });
  };

  //on page initialize, load all banks
  ngOnInit(): void {
    this.loadAll();
  }  

  //load all banks and the coins and cash assets associated to it 
  loadAll(): Promise<any>  {
    
    //retrieve all banks in the bankList array
    let bankList = [];

    //call serviceBank to get all bank objects
    return this.serviceBank.getAllBanks()
    .toPromise()
    .then((result) => {
      this.errorMessage = null;
      
      //append bankList with the bank objects returned
      result.forEach(bank => {
        bankList.push(bank);
      });     
    })
    .then(() => {

      //for each bank, get the associated coins and cash asset
      for (let bank of bankList) {

        //get coinsID from the string
        var splitted_coinsID = bank.coins.split("#", 2); 
        var coinsID = String(splitted_coinsID[1]);

        //call serviceBank to get coins asset
        this.serviceBank.getCoins(coinsID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          //update bank
          if(result.value){
            bank.coinsValue = result.value;
          }
        });
        
        //get cashID from the string
        var splitted_cashID = bank.cash.split("#", 2); 
        var cashID = String(splitted_cashID[1]);
        
        //call serviceBank to get cash asset
        this.serviceBank.getCash(cashID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          //update bank
          if(result.value){
            bank.cashValue = result.value;
          }
          if(result.currency){
            bank.cashCurrency = result.currency;
          }
        });
      }

      //assign bankList to allBanks
      this.allBanks = bankList;
    });
  }

  //add bank participant
  addBank(form: any): Promise<any> {

    //create assets for bank and the bank on the blockchain network
    return this.createAssetsBank()
      .then(() => {           
        this.errorMessage = null;

        //set form values to null
        this.myForm.setValue({
            "bankID":null,
            "name":null,
            "coinsValue":null,
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

  //create coins and cash assets associated with the Bank, followed by the Bank
  createAssetsBank(): Promise<any> {

    //create coins asset json
    this.coins = {
      $class: "org.decentralized.energy.network.Coins",
          "coinsID":"CO_" + this.bankID.value,
          "value":this.coinsValue.value,
          "ownerID":this.bankID.value,
          "ownerEntity":'Bank'
    };    

    //create cash asset json
    this.cash = {
      $class: "org.decentralized.energy.network.Cash",
          "cashID":"CA_" + this.bankID.value,
          "currency":this.cashCurrency.value,
          "value":this.cashValue.value,
          "ownerID":this.bankID.value,
          "ownerEntity":'Bank'        
    };
    
    //create bank participant json
    this.bank = {
      $class: "org.decentralized.energy.network.Bank",
          "bankID":this.bankID.value,
          "name":this.name.value,
          "coins":"CO_" + this.bankID.value,
          "cash":"CA_" + this.bankID.value
    };
    
    //call serviceBank to add coins asset, pass created coins asset json as parameter
    return this.serviceBank.addCoins(this.coins)
    .toPromise()
		.then(() => {    
      
      //call serviceBank to add cash asset, pass created cash asset json as parameter
      this.serviceBank.addCash(this.cash)
      .toPromise()
      .then(() => {

        //call serviceBank to add bank participant, pass created bank participant json as parameter
        this.serviceBank.addBank(this.bank)
        .toPromise()
        .then(() => {
            //reload page to display the created bank
            location.reload();
        });
		  });
		});
  }
 
  //allow update name of Bank
  updateBank(form: any): Promise<any> {
    
    //create json of bank participant to update name
    this.bank = {
      $class: "org.decentralized.energy.network.Bank",          
              "name":this.name.value,                      
              "coins": "resource:org.decentralized.energy.network.Coins#CO_" + form.get("bankID").value,
              "cash": "resource:org.decentralized.energy.network.Cash#CA_" + form.get("bankID").value,
    };
    //call serviceBank to update bank, pass bankID of which bank to update as parameter
    return this.serviceBank.updateBank(form.get("bankID").value,this.bank)
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

  //delete Bank and the coins and cash assets associated to it
  deleteBank(): Promise<any> {

    //call serviceBank to delete bank, pass bankID as parameter
    return this.serviceBank.deleteBank(this.currentId)
		.toPromise()
		.then(() => {
      this.errorMessage = null;
      
      //call serviceBank to delete coins asset, pass coinsID as parameter
      this.serviceBank.deleteCoins("CO_"+this.currentId)
      .toPromise()
      .then(() => {
            
            //call serviceBank to delete cash asset, pass cashID as parameter
            this.serviceBank.deleteCash("CA_"+this.currentId)
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

  //get form based on bankID
  getForm(id: any): Promise<any>{

    //call serviceBank to get bank participant object
    return this.serviceBank.getBank(id)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      let formObject = {        
            "bankID":null,                  
            "name":null,
            "coinsValue":null,                      
            "cashValue":null,          
            "cashCurrency":null 
      };

      //update formObject
      if(result.bankID){
        formObject.bankID = result.bankID;
      }else{
        formObject.bankID = null;
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
          "bankID":null, 
          "name":null,       
          "coinsValue":null,
          "cashValue":null,
          "cashCurrency":null
      });
  }  

}





