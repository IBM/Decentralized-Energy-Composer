/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */



/**
 * Resident to resident transaction
 * @param {org.decentralized.energy.network.ResidentToResident} UpdateValues - update coins and energy values
 * @transaction
 */
function ResidentToResident(UpdateValues) {
    UpdateValues.coinsInc.value = UpdateValues.coinsInc.value + UpdateValues.coinsValue;
    UpdateValues.coinsDec.value = UpdateValues.coinsDec.value - UpdateValues.coinsValue;
    UpdateValues.energyInc.value = UpdateValues.energyInc.value + UpdateValues.energyValue;
    UpdateValues.energyDec.value = UpdateValues.energyDec.value - UpdateValues.energyValue;

     var me = getCurrentParticipant();
     console.log('identity of the caller: ' + me);

    return getAssetRegistry('org.decentralized.energy.network.Coins')
        .then(function (assetRegistry) {
            return assetRegistry.update(UpdateValues.coinsInc);
        })                
        .then(function () {
            return  getAssetRegistry('org.decentralized.energy.network.Energy')
            .then(function (assetRegistry) {
                return assetRegistry.update(UpdateValues.energyInc);
            });            
        })
        .then(function () {
            return  getAssetRegistry('org.decentralized.energy.network.Coins')
            .then(function (assetRegistry) {
                return assetRegistry.update(UpdateValues.coinsDec);
            });            
        })
        .then(function () {
            return  getAssetRegistry('org.decentralized.energy.network.Energy')
            .then(function (assetRegistry) {
                return assetRegistry.update(UpdateValues.energyDec);
            });            
        });
   
}


/**
 * Resident to bank transaction
 * @param {org.decentralized.energy.network.ResidentToBank} UpdateValues - update coins and cash values
 * @transaction
 */
function ResidentToBank(UpdateValues) {
    UpdateValues.coinsInc.value = UpdateValues.coinsInc.value + UpdateValues.coinsValue;
    UpdateValues.coinsDec.value = UpdateValues.coinsDec.value - UpdateValues.coinsValue;
    UpdateValues.cashInc.value = UpdateValues.cashInc.value + UpdateValues.cashValue;
    UpdateValues.cashDec.value = UpdateValues.cashDec.value - UpdateValues.cashValue;

    var me = getCurrentParticipant();
    console.log('identity of the caller: ' + me.getIdentifier());

    return getAssetRegistry('org.decentralized.energy.network.Coins')
        .then(function (assetRegistry) {
            return assetRegistry.update(UpdateValues.coinsInc);
        })                
        .then(function () {
            return  getAssetRegistry('org.decentralized.energy.network.Cash')
            .then(function (assetRegistry) {
                return assetRegistry.update(UpdateValues.cashInc);
            });            
        })
        .then(function () {
            return  getAssetRegistry('org.decentralized.energy.network.Coins')
            .then(function (assetRegistry) {
                return assetRegistry.update(UpdateValues.coinsDec);
            });            
        })
        .then(function () {
            return  getAssetRegistry('org.decentralized.energy.network.Cash')
            .then(function (assetRegistry) {
                return assetRegistry.update(UpdateValues.cashDec);
            });            
        });
   
}


/**
 * Resident to utiliyu transaction
 * @param {org.decentralized.energy.network.ResidentToUtility} UpdateValues - update coins and energy values
 * @transaction
 */
function ResidentToUtility(UpdateValues) {
    UpdateValues.coinsInc.value = UpdateValues.coinsInc.value + UpdateValues.coinsValue;
    UpdateValues.coinsDec.value = UpdateValues.coinsDec.value - UpdateValues.coinsValue;
    UpdateValues.energyInc.value = UpdateValues.energyInc.value + UpdateValues.energyValue;
    UpdateValues.energyDec.value = UpdateValues.energyDec.value - UpdateValues.energyValue;

    var me = getCurrentParticipant();
    console.log('identity of the caller: ' + me.getIdentifier());

    return getAssetRegistry('org.decentralized.energy.network.Coins')
        .then(function (assetRegistry) {
            return assetRegistry.update(UpdateValues.coinsInc);
        })                
        .then(function () {
            return  getAssetRegistry('org.decentralized.energy.network.Energy')
            .then(function (assetRegistry) {
                return assetRegistry.update(UpdateValues.energyInc);
            });            
        })
        .then(function () {
            return  getAssetRegistry('org.decentralized.energy.network.Coins')
            .then(function (assetRegistry) {
                return assetRegistry.update(UpdateValues.coinsDec);
            });            
        })
        .then(function () {
            return  getAssetRegistry('org.decentralized.energy.network.Energy')
            .then(function (assetRegistry) {
                return assetRegistry.update(UpdateValues.energyDec);
            });            
        });
   
}


