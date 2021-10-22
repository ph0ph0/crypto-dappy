export const REMOVE_DAPPY_FROM_MARKET = `
// NOTE: Add to tutorial

import DappyMarket from 0x29e893174dd9b963

transaction(listingResourceID: UInt64) {
    let storefrontRef: &DappyMarket.Storefront{DappyMarket.StorefrontManager}

    prepare(acct: AuthAccount) {
        self.storefrontRef = acct.borrow<&DappyMarket.Storefront{DappyMarket.StorefrontManager}>(from: DappyMarket.StorefrontStoragePath) 
            ?? panic("Couldn't borrow storefront reference")
    }

    execute {
        self.storefrontRef.removeListing(listingResourceID: listingResourceID)
    }
}
`