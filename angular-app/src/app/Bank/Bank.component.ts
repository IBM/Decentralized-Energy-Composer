import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { BankService } from './Bank.service';
import 'rxjs/add/operator/toPromise';

@Component({
	selector: 'app-Bank',
	templateUrl: './Bank.component.html',
	styleUrls: ['./Bank.component.css'],
  	providers: [BankService]
})
export class BankComponent {

  myForm: FormGroup;

  private allBanks;
  private bank;
  private currentId;
  private errorMessage;

  private coins;
  private energy;
  private cash;
      
      bankID = new FormControl("", Validators.required);
      name = new FormControl("", Validators.required);      
      coinsValue = new FormControl("", Validators.required);      
      cashValue = new FormControl("", Validators.required);
      cashCurrency = new FormControl("", Validators.required);
      
  constructor(private serviceBank:BankService, fb: FormBuilder) {
    this.myForm = fb.group({
         
          bankID:this.bankID,
          name:this.name,      

          coinsValue:this.coinsValue,
          cashValue:this.cashValue,
          cashCurrency:this.cashCurrency
          
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  

  resetForm(): void{
    this.myForm.setValue({           
          "bankID":null, 
          "name":null,       

          "coinsValue":null,
          "cashValue":null,
          "cashCurrency":null
      });
  }

  //allow update name of Bank
  updateBank(form: any): Promise<any> {
    
    console.log("update check");
    this.bank = {
      $class: "org.decentralized.energy.network.Bank",          
            "name":this.name.value,                      

             "coins": "resource:org.decentralized.energy.network.Coins#CO_" + form.get("bankID").value,
             "cash": "resource:org.decentralized.energy.network.Cash#CA_" + form.get("bankID").value,
    };
    console.log(this.bank);
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

    return this.serviceBank.deleteBank(this.currentId)
		.toPromise()
		.then(() => {
			this.errorMessage = null;
      var coinsID = "CO_"+this.currentId;
      this.serviceBank.deleteCoins(coinsID)
      .toPromise()
      .then(() => {       
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

  setId(id: any): void{
    this.currentId = id;
  }

  getForm(id: any): Promise<any>{

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
  
  loadAll_OnlyBanks(): Promise<any> {
    let tempList = [];
    return this.serviceBank.getAllBanks()
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      result.forEach(bank => {
        tempList.push(bank);
      });
      this.allBanks = tempList;
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

  //load all Banks and the coins and cash assets associated to it 
  loadAll(): Promise<any>  {
    
    //retrieve all banks
    let bankList = [];
    return this.serviceBank.getAllBanks()
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      result.forEach(bank => {
        bankList.push(bank);
      });     
    })
    .then(() => {

      for (let bank of bankList) {
        console.log("in for loop")
        console.log(bank.coins)

        var splitted_coinsID = bank.coins.split("#", 2); 
        var coinsID = String(splitted_coinsID[1]);
        this.serviceBank.getCoins(coinsID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          if(result.value){
            bank.coinsValue = result.value;
          }
        });
        
        var splitted_cashID = bank.cash.split("#", 2); 
        var cashID = String(splitted_cashID[1]);
        console.log(cashID);
        this.serviceBank.getCash(cashID)
        .toPromise()
        .then((result) => {
          this.errorMessage = null;
          if(result.value){
            bank.cashValue = result.value;
          }
          if(result.currency){
            bank.cashCurrency = result.currency;
          }
        });
      }

      this.allBanks = bankList;
    });
  }

  //add Bank participant
  addBank(form: any): Promise<any> {

    return this.createAssetsBank()
      .then(() => {           
        this.errorMessage = null;
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

    this.coins = {
      $class: "org.decentralized.energy.network.Coins",
          "coinsID":"CO_" + this.bankID.value,
          "value":this.coinsValue.value,
          "ownerID":this.bankID.value,
          "ownerEntity":'Bank'
    };    

    this.cash = {
      $class: "org.decentralized.energy.network.Cash",
          "cashID":"CA_" + this.bankID.value,
          "currency":this.cashCurrency.value,
          "value":this.cashValue.value,
          "ownerID":this.bankID.value,
          "ownerEntity":'Bank'        
    };
        
    this.bank = {
      $class: "org.decentralized.energy.network.Bank",
          "bankID":this.bankID.value,
          "name":this.name.value,

          "coins":"CO_" + this.bankID.value,
          "cash":"CA_" + this.bankID.value
    };
    
    return this.serviceBank.addCoins(this.coins)
    .toPromise()
		.then(() => {    
      console.log("create cash");
      this.serviceBank.addCash(this.cash)
      .toPromise()
      .then(() => {
        console.log("create banks");
        this.serviceBank.addBank(this.bank)
        .toPromise()
        .then(() => {
            console.log("created assets");
            location.reload();
        })
		  })   
		});
  }

}





