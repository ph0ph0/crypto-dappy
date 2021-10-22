// Returns a dictionary mapping DappyIDsToListingIDs that the user owns.

import DappyMarket from "../../contracts/DappyMarket.cdc"


pub fun main(addr: Address): {UInt64: UInt64} {
    let account = getAccount(addr)

    let ref = account.getCapability<&{DappyMarket.StorefrontPublic}>(DappyMarket.StorefrontPublicPath).borrow()
        ?? panic("Couldn't borrow public storefront")
    let dappyDict = ref.getDappyToListingIDs()
    return dappyDict
}