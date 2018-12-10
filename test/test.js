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

'use strict';

const AdminConnection = require('composer-admin').AdminConnection;
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const { BusinessNetworkDefinition, CertificateUtil, IdCard } = require('composer-common');
const path = require('path');

require('chai').should();

//declare namespace
const NS = 'org.decentralized.energy.network';

//describe test
describe('Decentralized Energy - check transactions, access', () => {

    // in-memory card store for testing so cards are not persisted to the file system
    const cardStore = require('composer-common').NetworkCardStoreManager.getCardStore( { type: 'composer-wallet-inmemory' } );

    // embedded connection used for local testing
    const connectionProfile = {
        name: 'embedded',
        'x-type': 'embedded'
    };

    // name of the business network card containing the administrative identity for the business network
    const adminCardName = 'admin';

    // admin connection to the blockchain, used to deploy the business network
    let adminConnection;

    // this is the business network connection the tests will use.
    let businessNetworkConnection;

    // these are the identities 
    const R1Identity = 'R1i';
    const R2Identity = 'R2i';
    const B1Identity = 'B1i';
    const U1Identity = 'U1i';

    let businessNetworkName;
    let factory;
    
    // these are a list of receieved events.
    let events;
        
    
    before(async () => {
        // generate certificates for use with the embedded connection
        const credentials = CertificateUtil.generate({ commonName: 'admin' });

        // identity used with the admin connection to deploy business networks
        const deployerMetadata = {
            version: 1,
            userName: 'PeerAdmin',
            roles: [ 'PeerAdmin', 'ChannelAdmin' ]
        };
        const deployerCard = new IdCard(deployerMetadata, connectionProfile);
        deployerCard.setCredentials(credentials);
        const deployerCardName = 'PeerAdmin';

        adminConnection = new AdminConnection({ cardStore: cardStore });

        await adminConnection.importCard(deployerCardName, deployerCard);
        await adminConnection.connect(deployerCardName);             
     });

     /**
     *
     * @param {String} cardName The card name to use for this identity
     * @param {Object} identity The identity details
     */
    async function importCardForIdentity(cardName, identity) {
        const metadata = {
            userName: identity.userID,
            version: 1,
            enrollmentSecret: identity.userSecret,
            businessNetwork: businessNetworkName
        };
        const card = new IdCard(metadata, connectionProfile);
        await adminConnection.importCard(cardName, card);
    }

    // this is called before each test is executed.
    beforeEach(async () => {

        // generate a business network definition from the project directory.
        const businessNetworkDefinition = await BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));

        businessNetworkName = businessNetworkDefinition.getName();
        await adminConnection.install(businessNetworkDefinition);

        const startOptions = {
            networkAdmins: [
                {
                    userName: 'admin',
                    enrollmentSecret: 'adminpw'
                }
            ]
        };
        const adminCards = await adminConnection.start(businessNetworkName, businessNetworkDefinition.getVersion(), startOptions);
        await adminConnection.importCard(adminCardName, adminCards.get('admin'));

        // create and establish a business network connection
        businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });
        events = [];
        businessNetworkConnection.on('event', event => {
            events.push(event);
        });
        await businessNetworkConnection.connect(adminCardName);

        // get the factory for the business network.
        factory = businessNetworkConnection.getBusinessNetwork().getFactory();

        // create 2 coins assets
        const producer_coins = factory.newResource(NS, 'Coins', 'CO_R1');
        producer_coins.value = 300;
        producer_coins.ownerID = 'R1';
        producer_coins.ownerEntity = 'Resident';

        const consumer_coins = factory.newResource(NS, 'Coins', 'CO_R2');
        consumer_coins.value = 450;
        consumer_coins.ownerID = 'R2';
        consumer_coins.ownerEntity = 'Resident';

        // create 2 energy assets
        const producer_energy = factory.newResource(NS, 'Energy', 'EN_R1');
        producer_energy.value = 35;
        producer_energy.units = 'kwH';
        producer_energy.ownerID = 'R1';
        producer_energy.ownerEntity = 'Resident';

        const consumer_energy = factory.newResource(NS, 'Energy', 'EN_R2');
        consumer_energy.value = 5;
        consumer_energy.units = 'kwH';
        consumer_energy.ownerID = 'R2';
        consumer_energy.ownerEntity = 'Resident';

        // create 2 cash assets
        const producer_cash = factory.newResource(NS, 'Cash', 'CA_R1');
        producer_cash.value = 150;
        producer_cash.currency = 'USD';
        producer_cash.ownerID = 'R1';
        producer_cash.ownerEntity = 'Resident';

        const consumer_cash = factory.newResource(NS, 'Cash', 'CA_R2');
        consumer_cash.value = 70;
        consumer_cash.currency = 'USD';
        consumer_cash.ownerID = 'R2';
        consumer_cash.ownerEntity = 'Resident';

        // create residents
        const R1 = factory.newResource(NS, 'Resident', 'R1');
        R1.firstName = 'Carlos';
        R1.lastName = 'Roca';
        R1.coins = factory.newRelationship(NS, 'Coins', producer_coins.$identifier);
        R1.cash = factory.newRelationship(NS, 'Cash', producer_energy.$identifier);
        R1.energy = factory.newRelationship(NS, 'Energy', producer_cash.$identifier);

        const R2 = factory.newResource(NS, 'Resident', 'R2');
        R2.firstName = 'James';
        R2.lastName = 'Jones';
        R2.coins = factory.newRelationship(NS, 'Coins', consumer_coins.$identifier);
        R2.cash = factory.newRelationship(NS, 'Cash', consumer_energy.$identifier);
        R2.energy = factory.newRelationship(NS, 'Energy', consumer_cash.$identifier);  
        
        // create bank coins asset
        const bank_coins = factory.newResource(NS, 'Coins', 'CO_B1');
        bank_coins.value = 5000;
        bank_coins.ownerID = 'B1';
        bank_coins.ownerEntity = 'Bank';            

        // create bank cash asset
        const bank_cash = factory.newResource(NS, 'Cash', 'CA_B1');
        bank_cash.value = 7000;
        bank_cash.currency = 'USD';
        bank_cash.ownerID = 'B1';
        bank_cash.ownerEntity = 'Bank';
        
        // create Bank
        const B1 = factory.newResource(NS, 'Bank', 'B1');
        B1.name = 'United Bank';            
        B1.coins = factory.newRelationship(NS, 'Coins', bank_coins.$identifier);
        B1.cash = factory.newRelationship(NS, 'Cash', bank_cash.$identifier);

        //confirm the original values                
        bank_coins.value.should.equal(5000);
        bank_cash.value.should.equal(7000);

        // create utility company coins asset
        const utility_coins = factory.newResource(NS, 'Coins', 'CO_U1');
        utility_coins.value = 5000;
        utility_coins.ownerID = 'U1';
        utility_coins.ownerEntity = 'UtilityCompany';            

        // create utility energy asset
        const utility_energy = factory.newResource(NS, 'Energy', 'EN_U1');
        utility_energy.value = 1000;
        utility_energy.units = 'kwh';
        utility_energy.ownerID = 'U1';
        utility_energy.ownerEntity = 'UtilityCompany';
        
        // create Utility Company
        const U1 = factory.newResource(NS, 'UtilityCompany', 'U1');
        U1.name = 'New Utility';            
        U1.coins = factory.newRelationship(NS, 'Coins', utility_coins.$identifier);
        U1.energy = factory.newRelationship(NS, 'Energy', utility_energy.$identifier);

        //confirm the original values                
        utility_coins.value.should.equal(5000);
        utility_energy.value.should.equal(1000);
        
        // Get the coins registry
        return businessNetworkConnection.getAssetRegistry(NS + '.Coins')
            .then((assetRegistry) => {
                // add coins to the coins asset registry.
                return assetRegistry.addAll([producer_coins, consumer_coins, bank_coins, utility_coins])
                
                .then(() => {
                    // Get the energy registry
                    return businessNetworkConnection.getAssetRegistry(NS + '.Energy');
                })
                .then((assetRegistry) => {
                    // add energy to the energy asset registry.
                    return assetRegistry.addAll([producer_energy, consumer_energy, utility_energy]);
                })
                .then(() => {
                    // Get the cash registry
                    return businessNetworkConnection.getAssetRegistry(NS + '.Cash');
                })
                .then((assetRegistry) => {
                    // add cash to the cash asset registry.
                    return assetRegistry.addAll([producer_cash, consumer_cash, bank_cash]);
                })                       
                .then(() => {
                    return businessNetworkConnection.getParticipantRegistry(NS + '.Resident');
                })
                .then((participantRegistry) => {
                    // add resident
                    return participantRegistry.addAll([R1, R2]);
                })
                .then(() => {
                    return businessNetworkConnection.getParticipantRegistry(NS + '.Bank');
                })
                .then((participantRegistry) => {
                    // add bank
                    return participantRegistry.add(B1);
                })
                .then(() => {
                    return businessNetworkConnection.getParticipantRegistry(NS + '.UtilityCompany');
                })
                .then((participantRegistry) => {
                    // add utility company
                    return participantRegistry.add(U1);
                })
                .then(() => {
                    return businessNetworkConnection.issueIdentity('org.decentralized.energy.network.Resident#R1', 'resident1');
                })
                .then((identity) => {
                    return importCardForIdentity(R1Identity, identity);
                })
                .then(() => {
                    return businessNetworkConnection.issueIdentity('org.decentralized.energy.network.Resident#R2', 'resident2');
                })
                .then((identity) => {
                    return importCardForIdentity(R2Identity, identity);
                })
                .then(() => {                        
                    return businessNetworkConnection.issueIdentity('org.decentralized.energy.network.Bank#B1', 'bank1');
                })
                .then((identity) => {
                    return importCardForIdentity(B1Identity, identity);
                })
                .then(() => {                        
                    return businessNetworkConnection.issueIdentity('org.decentralized.energy.network.UtilityCompany#U1', 'utility1');
                })
                .then((identity) => {
                    return importCardForIdentity(U1Identity, identity);                        
                });
            });
    });

    

    describe('#ResidentToResident Transaction', () => {

        it('Residents should be able to execute transactions with Residents' , () => {
            
            // create the resident to resident transaction
            const resident_to_resident = factory.newTransaction(NS, 'EnergyToCoins');
            resident_to_resident.energyRate = 4;
            resident_to_resident.energyValue = 10;
            resident_to_resident.coinsInc = factory.newRelationship(NS, 'Coins', 'CO_R1');
            resident_to_resident.coinsDec = factory.newRelationship(NS, 'Coins', 'CO_R2');
            resident_to_resident.energyInc = factory.newRelationship(NS, 'Energy', 'EN_R2');
            resident_to_resident.energyDec = factory.newRelationship(NS, 'Energy', 'EN_R1');

            return businessNetworkConnection.submitTransaction(resident_to_resident)                    
                    .then(() => {
                        return businessNetworkConnection.getAssetRegistry(NS + '.Coins');
                    })
                    .then((assetRegistry) => {
                        // re-get the producer_coins
                        return assetRegistry.get('CO_R1');
                    })
                    .then((updated_producer_coins) => {
                        // the updated values of coins
                        updated_producer_coins.value.should.equal(340);
                        return businessNetworkConnection.getAssetRegistry(NS + '.Coins');
                    })
                    .then((assetRegistry) => {
                        // re-get the consumer_coins
                        return assetRegistry.get('CO_R2');
                    })
                    .then((updated_consumer_coins) => {
                        // the updated values of coins
                        updated_consumer_coins.value.should.equal(410);
                        return businessNetworkConnection.getAssetRegistry(NS + '.Energy');
                    })
                    .then((assetRegistry) => {
                        // re-get the consumer_energy
                        return assetRegistry.get('EN_R2');
                    })
                    .then((updated_consumer_energy) => {
                        // the updated values of energy
                        updated_consumer_energy.value.should.equal(15);
                        return businessNetworkConnection.getAssetRegistry(NS + '.Energy');
                    })
                    .then((assetRegistry) => {
                        // re-get the producer_energy
                        return assetRegistry.get('EN_R1');
                    })
                    .then((updated_producer_energy) => {
                        // the updated values of energy
                        updated_producer_energy.value.should.equal(25);
                    });
                
        }); 
    });

    describe('#ResidentToBank Transaction', () => {

        it('Residents should be able to execute transactions with Banks' , () => {
            
            // create the resident to resident transaction
            const resident_to_bank = factory.newTransaction(NS, 'CashToCoins');
            resident_to_bank.cashRate = 2;
            resident_to_bank.cashValue = 20;
            resident_to_bank.coinsInc = factory.newRelationship(NS, 'Coins', 'CO_B1');
            resident_to_bank.coinsDec = factory.newRelationship(NS, 'Coins', 'CO_R1');
            resident_to_bank.cashInc = factory.newRelationship(NS, 'Cash', 'CA_R1');
            resident_to_bank.cashDec = factory.newRelationship(NS, 'Cash', 'CA_B1');
                           
             // submit the transaction        
            return businessNetworkConnection.submitTransaction(resident_to_bank)               
                .then(() => {
                    return businessNetworkConnection.getAssetRegistry(NS + '.Coins');
                })
                .then((assetRegistry) => {
                    // re-get the producer_coins
                    return assetRegistry.get('CO_R1');
                })
                .then((updated_resident_coins) => {
                    // the updated values of coins
                    updated_resident_coins.value.should.equal(260);
                    return businessNetworkConnection.getAssetRegistry(NS + '.Coins');
                })
                .then((assetRegistry) => {
                    // re-get the consumer_coins
                    return assetRegistry.get('CO_B1');
                })
                .then((updated_bank_coins) => {
                    // the updated values of coins
                    updated_bank_coins.value.should.equal(5040);
                    return businessNetworkConnection.getAssetRegistry(NS + '.Cash');
                })
                .then((assetRegistry) => {
                    // re-get the resident_cash
                    return assetRegistry.get('CA_R1');
                })
                .then((updated_resident_cash) => {
                    // the updated values of energy
                    updated_resident_cash.value.should.equal(170);
                    return businessNetworkConnection.getAssetRegistry(NS + '.Cash');
                })
                .then((assetRegistry) => {
                    // re-get the resident_cash
                    return assetRegistry.get('CA_B1');
                })
                .then((updated_bank_cash) => {
                    // the updated values ofenergyenergy
                    updated_bank_cash.value.should.equal(6980);
                });                
        }); 
    });


    describe('#ResidentToUtilityCompany Transaction', () => {

        it('Residents should be able to execute transactions with UtilityCompanies' , () => {
            
            
            // create the resident to utility company transaction
            const resident_to_utility = factory.newTransaction(NS, 'EnergyToCoins');
            resident_to_utility.energyRate = 4;
            resident_to_utility.energyValue = 10;
            resident_to_utility.coinsInc = factory.newRelationship(NS, 'Coins', 'CO_U1');
            resident_to_utility.coinsDec = factory.newRelationship(NS, 'Coins', 'CO_R2');
            resident_to_utility.energyInc = factory.newRelationship(NS, 'Energy', 'EN_R2');
            resident_to_utility.energyDec = factory.newRelationship(NS, 'Energy', 'EN_U1');
               
            return businessNetworkConnection.submitTransaction(resident_to_utility)                
                .then(() => {
                    return businessNetworkConnection.getAssetRegistry(NS + '.Coins');
                })
                .then((assetRegistry) => {
                    // re-get the utility_coins
                    return assetRegistry.get('CO_U1');
                })
                .then((updated_utility_coins) => {
                    // the updated values of coins
                    updated_utility_coins.value.should.equal(5040);
                    return businessNetworkConnection.getAssetRegistry(NS + '.Coins');
                })
                .then((assetRegistry) => {
                    // re-get the consumer_coins
                    return assetRegistry.get('CO_R2');
                })
                .then((updated_consumer_coins) => {
                    // the updated values of coins
                    updated_consumer_coins.value.should.equal(410);
                    return businessNetworkConnection.getAssetRegistry(NS + '.Energy');
                })
                .then((assetRegistry) => {
                    // re-get the consumer_energy
                    return assetRegistry.get('EN_R2');
                })
                .then((updated_consumer_energy) => {
                    // the updated values of energy
                    updated_consumer_energy.value.should.equal(15);
                    return businessNetworkConnection.getAssetRegistry(NS + '.Energy');
                })
                .then((assetRegistry) => {
                    // re-get the utility_energy
                    return assetRegistry.get('EN_U1');
                })
                .then((updated_utility_energy) => {
                    // the updated values of energy
                    updated_utility_energy.value.should.equal(990);
                    
                });                
        }); 
    });

    /**
     * Reconnect using a different identity.
     * @param {String} cardName The identity to use.
     * @return {Promise} A promise that will be resolved when complete.
     */
    function useIdentity(cardName) {
        
        return businessNetworkConnection.disconnect()
            .then(() => {                
                businessNetworkConnection = new BusinessNetworkConnection({ cardStore: cardStore });                                
                return businessNetworkConnection.connect(cardName);
            });
    }
    
        
    describe('#Residents Access', () => {
        
        it('Residents should have read access to all coins, energy and cash assets, read access to other Residents, Banks and Utility Companies, and update only their own Resident record' , () => {                        
            
            return useIdentity(R2Identity)
                .then(() => {
                    // use a query                    
                    return businessNetworkConnection.query('selectResidents');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(2); 
                    //results[0].getIdentifier().should.equal('R2');                           
                })                
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectBanks');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(1);                            
                })
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectUtilityCompanies');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(1);                            
                })
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectCoins');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(4);                            
                })
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectCash');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(3);                            
                })
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectEnergy');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(3);                            
                });
                
        });
    });

    describe('#Banks Access', () => {

        it('Banks should have read only access to all coins and cash assets, read access to other Banks and Residents, and update access to their own Bank record' , () => {
            
            return useIdentity(B1Identity)
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectResidents');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(2); 
                    //results[0].getIdentifier().should.equal('R2');                           
                })                
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectBanks');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(1);                            
                })
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectUtilityCompanies');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(0);                            
                })
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectCoins');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(4);                            
                })
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectCash');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(3);                            
                })
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectEnergy');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(0);                            
                });
                
        });
    });


    describe('#Utility Company Access', () => {

        it('Utility Company should have read only access to all coins, and energy assets, read access to other Utilty Companies and Residents, and update access to their own Bank record' , () => {
            
            return useIdentity(U1Identity)
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectResidents');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(2); 
                    //results[0].getIdentifier().should.equal('R2');                           
                })                
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectBanks');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(0);                            
                })
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectUtilityCompanies');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(1);                            
                })
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectCoins');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(4);                            
                })
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectCash');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(0);                            
                })
                .then(() => {
                    // use a query
                    return businessNetworkConnection.query('selectEnergy');
                })
                .then((results) => {
                    // check results
                    results.length.should.equal(3);                            
                });
                
        });
    });
    
});
