export const CHECK_RESOURCES = `

import DappyMarket from 0xDappyMarket
import DappyContract from 0xDappyContract

pub fun main(address: Address): [Bool] {
  let ref = getAccount(address).getCapability<&{DappyContract.CollectionPublic}>(DappyContract.CollectionPublicPath).check()

  let dCap = getAccount(address).getCapability<&{DappyContract.CollectionPublic, DappyContract.Provider}>(DappyContract.CollectionPublicPath).check()
  let sCap = getAccount(address).getCapability<&DappyMarket.Storefront{DappyMarket.StorefrontPublic}>(DappyMarket.StorefrontPublicPath).check()
  return [ref, dCap, sCap]
}


`;
