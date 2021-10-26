# CryptoDappy CLI Commands

Here are some useful CLI commands for testing the CryptoDappy app

## General

1. flow transactions send ./cadence/transactions/MintDappy.cdc {templateID} {price} --network testnet --signer testnet-account
* params - templateID: UInt32, price: UFix64

2. flow transactions send ./cadence/transactions/CreateTemplate.cdc {dna} {name} --network testnet --signer testnet-account
* **_Admin Only_** params -  dna: String, name: String

3. flow scripts execute ./cadence/scripts/ListUserDappies.cdc {address} --network testnet
* params -  address: Address

## Market

1. flow transactions send ./cadence/transactions/market/ListDappyOnMarket.cdc {dappyID} {templateID} {name} {dna} {price} --network testnet --signer testnet-account
* params -  dappyID: UInt64, templateID: UInt32, name: String, dna: String, price: UFix64

2. flow transactions send ./cadence/transactions/market/RemoveDappyFromMarket.cdc {listingResourceID}  --network testnet --signer testnet-account
* params - listingResourceID: UInt64

3. flow transactions send ./cadence/transactions/market/BuyDappyOnMarket.cdc {listingResourceID} {storefrontAddress} --network testnet --signer testnet-account
* params -  listingResourceID: UInt64, storefrontAddress: Address

4. flow scripts execute ./cadence/scripts/market/GetDappyIDsToListingIDs.cdc {address}  --network testnet
* params -  address: Address

5. flow scripts execute ./cadence/scripts/CheckResources.cdc {address}  --network testnet
* params -  address: Address