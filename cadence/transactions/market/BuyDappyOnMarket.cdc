import DappyMarket from 0x29e893174dd9b963
import DappyContract from 0x29e893174dd9b963
import FUSD from 0xe223d8a629e49c68
import FungibleToken from 0x9a0766d93b6608b7

transaction(listingResourceID: UInt32) {

    var dappyRef: &DappyMarket.Storefront{DappyMarket.StorefrontPublic}
    var listingRef: &DappyMarket.DappyListing{DappyMarket.DappyListingPublic}
    var vaultRef: &FUSD.Vault{FungibleToken.Provider}

    prepare(acct: AuthAccount) {
        var storefrontRef: &DappyMarket.Storefront{DappyMarket.StorefrontPublic} = acct.borrow<&DappyMarket.Storefront{DappyMarket.StorefrontManager}>(from: DappyMarket.StorefrontStoragePath) 
            ?? panic("Couldn't borrow storefront reference from account")
    }


}