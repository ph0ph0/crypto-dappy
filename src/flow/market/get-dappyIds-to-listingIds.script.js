export const GET_DAPPYIDS_TO_LISTINGIDS = `

    import DappyMarket from 0xDappy

    pub fun main(addr: Address): {UInt64: UInt64} {

        let account = getAccount(addr)

        if (account.getCapability<&{DappyMarket.StorefrontPublic}>(DappyMarket.StorefrontPublicPath).check() != false) {
            let ref = account.getCapability<&{DappyMarket.StorefrontPublic}>(DappyMarket.StorefrontPublicPath).borrow()
                ?? panic("Couldn't borrow the public storefront")
            let dappyDict = ref.getDappyToListingIDs()
            return dappyDict
        }
        return {}
    }

`