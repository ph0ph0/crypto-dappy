export const REMOVE_DAPPY_FROM_MARKET = `

    import DappyMarket from 0xDappy

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