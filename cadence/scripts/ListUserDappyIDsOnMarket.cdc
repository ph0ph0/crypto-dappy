// Returns an array of the Dappy IDs that have been listed by this user on the market

import DappyMarket from 0x29e893174dd9b963


pub fun main(addr: Address): [UInt64] {
    let account = getAccount(addr)

    let ref = account.getCapability<&{DappyMarket.StorefrontPublic}>(DappyMarket.StorefrontPublicPath).borrow() 
        ?? panic("Couldn't borrow public storefront")
    let dappyIDs = ref.getListingIDs()
    return dappyIDs
}