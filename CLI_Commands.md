# CryptoDappy CLI Commands

Here are some useful CLI commands for testing the CryptoDappy app

## General

1. flow transactions send ./cadence/transactions/MintDappy.cdc 1 0.5 --network testnet --signer testnet-account
* params: template, amount

2. flow transactions send ./cadence/transactions/CreateTemplate.cdc 252C04.8C0A84.828E6A.2 b963Dappy --network testnet --signer testnet-account

3. flow scripts execute ./cadence/scripts/ListUserDappies.cdc 0x29e893174dd9b963 --network testnet     

## Market

1. flow transactions send ./cadence/transactions/market/ListDappyOnMarket.cdc 3 1 DDappy 252C04.8C0A84.828E6A.2 1.0 --network testnet --signer testnet-account
* params: dappyID: UInt64, templateID: UInt32, name: String, dna: String, price: UFix64

2. flow transactions send ./cadence/transactions/market/RemoveDappyFromMarket.cdc 14251289  --network testnet --signer testnet-account

3. flow transactions send ./cadence/transactions/market/BuyDappyOnMarket.cdc 14251192 0x17f9f660add681e3 --network testnet --signer testnet-account
* params: listingResourceID, storefrontAddress

4. flow scripts execute ./cadence/scripts/market/GetDappyIDsToListingIDs.cdc 0x29e893174dd9b963  --network testnet

5. flow scripts execute ./cadence/scripts/CheckResources.cdc 0x17f9f660add681e3  --network testnet