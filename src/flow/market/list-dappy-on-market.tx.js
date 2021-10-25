export const LIST_DAPPY_ON_MARKET = `

import DappyContract, DappyMarket from 0xDappy
import FUSD from 0xFUSD
import FungibleToken from 0xFungibleToken

transaction(dappyID: UInt64, templateID: UInt32, name: String, dna: String, price: UFix64) {
    var storefrontRef: &DappyMarket.Storefront{DappyMarket.StorefrontManager}
    var dappyProviderCap: Capability<&{DappyContract.Provider, DappyContract.CollectionPublic}>
    var fusdVaultCap: Capability<&FUSD.Vault{FungibleToken.Receiver}>

    prepare(acct: AuthAccount) {
        if acct.borrow<&DappyMarket.Storefront{DappyMarket.StorefrontManager}>(from: DappyMarket.StorefrontStoragePath) == nil {
            // If we dont have a Storefront resource saved to storage, create, save and link one

            let storefront: @DappyMarket.Storefront <- DappyMarket.createStorefront()

            acct.save(<- storefront, to: DappyMarket.StorefrontStoragePath)

            acct.link<&DappyMarket.Storefront{DappyMarket.StorefrontPublic}>(DappyMarket.StorefrontPublicPath, target: DappyMarket.StorefrontStoragePath)
            log("Created a new storefront for account and saved to storage")
        }

        // Set our reference and capabilities
        self.storefrontRef = acct.borrow<&DappyMarket.Storefront{DappyMarket.StorefrontManager}>(from: DappyMarket.StorefrontStoragePath)
            ?? panic("Couldnt borrow the storefront reference from account")
        self.dappyProviderCap = acct.getCapability<&{DappyContract.Provider, DappyContract.CollectionPublic}>(DappyContract.CollectionPublicPath)
        self.fusdVaultCap = acct.getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)
    }

    execute {
        let saleCuts: [DappyMarket.SaleCut] = [DappyMarket.SaleCut(receiver: self.fusdVaultCap, amount: price)]
        self.storefrontRef.createListing(
            dappyProviderCapability: self.dappyProviderCap,
            dappyID: dappyID,
            templateID: templateID,
            name: name,
            dna: dna,
            salePaymentVaultType: Type<@FUSD.Vault>(),
            saleCuts: saleCuts
        )
    }

}

`