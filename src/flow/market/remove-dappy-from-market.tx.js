export const REMOVE_DAPPY_FROM_MARKET = `
    import DappyMarket from 0x29e893174dd9b963
    import DappyContract from 0x29e893174dd9b963
    import FUSD from 0xe223d8a629e49c68
    import FungibleToken from 0x9a0766d93b6608b7

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