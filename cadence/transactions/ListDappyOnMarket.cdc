// NOTE: Add to tutorial


import DappyMarket from 0x29e893174dd9b963
import DappyContract from 0x29e893174dd9b963
import FUSD from 0xe223d8a629e49c68
import FungibleToken from 0x9a0766d93b6608b7

transaction(id: UInt64, name: String, dna: String, price: UFix64) {

    var storefrontRef: &DappyMarket.Storefront{DappyMarket.StorefrontManager}
    var dappyProviderCap: Capability<&{DappyContract.Provider, DappyContract.CollectionPublic}>
    var fusdVaultCap: Capability<&FUSD.Vault{FungibleToken.Receiver}>

    prepare(acct: AuthAccount) {

        if acct.borrow<&DappyMarket.Storefront{DappyMarket.StorefrontManager}>(from: DappyMarket.StorefrontStoragePath) == nil {
            // If we don't have a Storefront resource saved to storage, create, save and link one
            let storefront: @DappyMarket.Storefront <- DappyMarket.createStorefront()

            acct.save(<- storefront, to: DappyMarket.StorefrontStoragePath)

            acct.link<&DappyMarket.Storefront{DappyMarket.StorefrontPublic}>(DappyMarket.StorefrontPublicPath, target: DappyMarket.StorefrontStoragePath)
            log("Created new storefront for account and saved to storage")

        }

        // Set our reference and capabilities
        self.storefrontRef = acct.borrow<&DappyMarket.Storefront{DappyMarket.StorefrontManager}>(from: DappyMarket.StorefrontStoragePath) ?? panic("Couldn't borrow storefront reference from account")
        self.dappyProviderCap = acct.getCapability<&{DappyContract.CollectionPublic, DappyContract.Provider}>(DappyContract.CollectionPublicPath)
        self.fusdVaultCap = acct.getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)
    }

    execute {
        let saleCuts: [DappyMarket.SaleCut] = [DappyMarket.SaleCut(receiver: self.fusdVaultCap, amount: price)]
        self.storefrontRef.createListing(dappyProviderCapability: self.dappyProviderCap, dappyID: id, name: name, dna: dna, salePaymentVaultType: self.fusdVaultCap.getType(), saleCuts: saleCuts)

    }
}