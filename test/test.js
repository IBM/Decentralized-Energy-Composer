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
const BrowserFS = require('browserfs/dist/node/index');
const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const BusinessNetworkDefinition = require('composer-common').BusinessNetworkDefinition;
const path = require('path');

require('chai').should();

const bfs_fs = BrowserFS.BFSRequire('fs');
const NS = 'org.decentralized.energy.network';


describe('Decentralized Energy - Admin Identity', () => {

    // let adminConnection;
    let businessNetworkConnection;

    // This is the factory for creating instances of types.
    let factory;

    // These are the identities for Alice and Bob.
    //let R1Identity;
    //let R2Identity;

    beforeEach(() => {
        BrowserFS.initialize(new BrowserFS.FileSystem.InMemory());
        const adminConnection = new AdminConnection({ fs: bfs_fs });
        return adminConnection.createProfile('defaultProfile', {
            type: 'embedded'
        })
            .then(() => {
                return adminConnection.connect('defaultProfile', 'admin', 'adminpw');
            })
            .then(() => {
                return BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));
            })
            .then((businessNetworkDefinition) => {
                return adminConnection.deploy(businessNetworkDefinition);
            })
            .then(() => {
                businessNetworkConnection = new BusinessNetworkConnection({ fs: bfs_fs });
                return businessNetworkConnection.connect('defaultProfile', 'decentralized-energy-network', 'admin', 'adminpw');
            })
            .then(() => {

                // Get the factory for the business network.
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
                
                //confirm the original four  value
                producer_coins.value.should.equal(300);
                consumer_coins.value.should.equal(450);
                consumer_energy.value.should.equal(5);
                producer_energy.value.should.equal(35);

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
                        });                        
                    });

            });
    });

            
    describe('#ResidentToResident Transaction', () => {

        it('Resident should be able to exchange energy for coins through a transaction with fellow Resident', () => {
            
                                    
            // create the resident to resident transaction
            const resident_to_resident = factory.newTransaction(NS, 'EnergyToCoins');
            resident_to_resident.energyRate = 1;
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
                        updated_producer_coins.value.should.equal(310);
                        return businessNetworkConnection.getAssetRegistry(NS + '.Coins');
                    })
                    .then((assetRegistry) => {
                        // re-get the consumer_coins
                        return assetRegistry.get('CO_R2');
                    })
                    .then((updated_consumer_coins) => {
                        // the updated values of coins
                        updated_consumer_coins.value.should.equal(440);
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

        it('Resident should be able to exchange coins for cash through a transaction with Bank', () => {
                                                
            // create the resident to bank transaction
            const resident_to_bank = factory.newTransaction(NS, 'CashToCoins');
            resident_to_bank.cashRate = 10;
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
                    updated_resident_coins.value.should.equal(100);
                    return businessNetworkConnection.getAssetRegistry(NS + '.Coins');
                })
                .then((assetRegistry) => {
                    // re-get the consumer_coins
                    return assetRegistry.get('CO_B1');
                })
                .then((updated_bank_coins) => {
                    // the updated values of coins
                    updated_bank_coins.value.should.equal(5200);
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

        it('Resident should be able to exchange coins for energy through a transaction with Utility', () => {        
            
            // create the resident to utility company transaction
            const resident_to_utility = factory.newTransaction(NS, 'EnergyToCoins');
            resident_to_utility.energyRate = 1;
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
                        updated_utility_coins.value.should.equal(5010);
                        return businessNetworkConnection.getAssetRegistry(NS + '.Coins');
                    })
                    .then((assetRegistry) => {
                        // re-get the consumer_coins
                        return assetRegistry.get('CO_R2');
                    })
                    .then((updated_consumer_coins) => {
                        // the updated values of coins
                        updated_consumer_coins.value.should.equal(440);
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


});



describe('Resident Identity', () => {

    // This is the business network connection the tests will use.
    let businessNetworkConnection;

    // This is the factory for creating instances of types.
    let factory;

    // These are the identities for Alice and Bob.
    //let R1Identity;
    let R2Identity;
    let B1Identity;
    let U1Identity;

    // This is called before each test is executed.
    beforeEach(() => {

        // Initialize an in-memory file system, so we do not write any files to the actual file system.
        BrowserFS.initialize(new BrowserFS.FileSystem.InMemory());

        // Create a new admin connection.
        const adminConnection = new AdminConnection({
            fs: bfs_fs
        });

        // Create a new connection profile that uses the embedded (in-memory) runtime.
        return adminConnection.createProfile('defaultProfile', {
            type: 'embedded'
        })
            .then(() => {

                // Establish an admin connection. The user ID must be admin. The user secret is
                // ignored, but only when the tests are executed using the embedded (in-memory)
                // runtime.
                return adminConnection.connect('defaultProfile', 'admin', 'adminpw');

            })
            .then(() => {

                // Generate a business network definition from the project directory.
                return BusinessNetworkDefinition.fromDirectory(path.resolve(__dirname, '..'));

            })
            .then((businessNetworkDefinition) => {

                // Deploy and start the business network defined by the business network definition.
                return adminConnection.deploy(businessNetworkDefinition);

            })
            .then(() => {

                // Create and establish a business network connection
                businessNetworkConnection = new BusinessNetworkConnection({
                    fs: bfs_fs
                });                
                return businessNetworkConnection.connect('defaultProfile', 'decentralized-energy-network', 'admin', 'adminpw');

            })
            .then(() => {

                // Get the factory for the business network.
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
                        });
                        
                    });

            })
            .then(() => {

                // Issue the identities.
                return businessNetworkConnection.issueIdentity('org.decentralized.energy.network.Resident#R1', 'resident1')
                    .then((identity) => {
                        //R1Identity = identity;
                        return businessNetworkConnection.issueIdentity('org.decentralized.energy.network.Resident#R2', 'resident2');
                    })
                    .then((identity) => {
                        R2Identity = identity;
                        return businessNetworkConnection.issueIdentity('org.decentralized.energy.network.Bank#B1', 'bank1');
                    })
                    .then((identity) => {
                        B1Identity = identity;
                        return businessNetworkConnection.issueIdentity('org.decentralized.energy.network.UtilityCompany#U1', 'utility1');
                    })
                    .then((identity) => {
                        U1Identity = identity;
                    });
            });

    });

    /**
     * Reconnect using a different identity.
     * @param {Object} identity The identity to use.
     * @return {Promise} A promise that will be resolved when complete.
     */
    function useIdentity(identity) {
        return businessNetworkConnection.disconnect()
            .then(() => {
                businessNetworkConnection = new BusinessNetworkConnection({
                    fs: bfs_fs
                });                
                return businessNetworkConnection.connect('defaultProfile', 'decentralized-energy-network', identity.userID, identity.userSecret);
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
/*
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

            return useIdentity(R2Identity)
                    .then(() => {                                        
                        return businessNetworkConnection.submitTransaction(resident_to_resident);
                    })
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
            return useIdentity(R1Identity)
                .then(() => {  
                    return businessNetworkConnection.submitTransaction(resident_to_bank);
                })
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
                    updated_resident_cash.value.should.equal(270);
                    return businessNetworkConnection.getAssetRegistry(NS + '.Cash');
                })
                .then((assetRegistry) => {
                    // re-get the resident_cash
                    return assetRegistry.get('CA_B1');
                })
                .then((updated_bank_cash) => {
                    // the updated values ofenergyenergy
                    updated_bank_cash.value.should.equal(6880);
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
               
            return useIdentity(R2Identity)
                .then(() => {
                    return businessNetworkConnection.submitTransaction(resident_to_utility);
                })
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
*/
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


