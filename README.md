# Welcome to Decentralized Energy journey on Hyperledger Composer!

In this developer journey, we will create a decentralized energy network using Hyperledger Composer.  The application demonstrates Blockchain transaction among participants.  The network consists of Residents, Banks and Utility Company.  The Residents can exchange coins for energy among each other.  The application assumes a pre-paid system where transactions occur after the energy is consumed and the values are updated.  The Resident can exchange coins for Fiat money (cash) with Banks on the network.  The Residents can transact coins for energy also with a Utility company on the network. 

# Running the Application
Follow these steps to setup and run this developer journey. The steps are described in detail below.

## Prerequisite
- [npm](https://www.npmjs.com/)
- [Hyperledger Composer](https://hyperledger.github.io/composer/installing/development-tools.html)


## Steps
1. [Clone the repo](#1-clone-the-repo)
2. [Setup Fabric](#2-setup-fabric)
3. [Generate the Business Network Archive](#3-generate-the-business-network-archive)
4. [Deploy to Fabric](#4-deploy-to-fabric)
5. [Run Application](#5-run-application)
6. [Create Participants](#6-create-participants)
7. [Execute Transactions](#7-execute-transactions)

## 1. Clone the repo

Clone the `Decentralized-Energy-Composer code` locally. In a terminal, run:

`git clone https://github.com/raheelzubairy/Decentralized-Energy-Composer`

## 2. Setup Fabric

These commands will kill and remove all running containers, and should remove all previously created Hyperledger Fabric chaincode images:

```none
docker kill $(docker ps -q)
docker rm $(docker ps -aq)
docker rmi $(docker images dev-* -q)
```

Set Hyperledger Fabric version to v1.0-beta: 

`export FABRIC_VERSION=hlfv1`

All the scripts will be in the directory `/fabric-tools`.  Start fabric and create profile:

```
cd /fabric-tools
./downloadFabric.sh
./startFabric.sh
./createComposerProfile.sh
```


## 3. Generate the Business Network Archive

Next generate the Business Network Archive (BNA) file from the root directory:

```
cd ../
npm install
composer archive create -a dist/decentralized-energy-network.bna --sourceType dir --sourceName .
```

The `composer archive create` command has created a file called `decentralized-energy-network.bna` in the `dist` folder.


## 4. Deploy to Fabric

Now, we are ready to deploy the BNA file to Hyperledger Fabric:

```
cd dist
composer network deploy -a decentralized-energy-network.bna -p hlfv1 -i PeerAdmin -s randomString
```

You can verify that the network has been deployed by typing:

```
composer network ping -n decentralized-energy-network -p hlfv1 -i admin -s adminpw
```

## 5. Run Application

First, go into the `angular-app` folder and install the dependency:

```
cd angular-app
npm install
```

To start the application:
```
npm start
```

The application should now be running at:
`http://localhost:4200`

The REST server to communicate with network is available here:
`http://localhost:3000/explorer/`


## 6. Create Participants

Once the application opens, create participants and fill in dummy data.  Create Residents, Banks and Utility Companies.


## 7. Execute Transactions

Execute transactions manually between Residents, Resident and Bank, and Resident and Utility Company.  After executing transactions, ensure the participants account values are updated.


At the end of your session, stop fabric:

```
cd ~/fabric-tools
./stopFabric.sh
./teardownFabric.sh
```
