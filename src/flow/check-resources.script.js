export const CHECK_RESOURCES = `

import DappyMarket from 0x29e893174dd9b963
import DappyContract from 0x29e893174dd9b963

pub fun main(): [Bool] {
  let ref = getAccount(0x40e5d5ecd0c81db0).getCapability<&{DappyContract.CollectionPublic}>(DappyContract.CollectionPublicPath).check()

  let dCap = getAccount(0x40e5d5ecd0c81db0).getCapability<&{DappyContract.CollectionPublic, DappyContract.Provider}>(DappyContract.CollectionPublicPath).check()
  let sCap = getAccount(0x40e5d5ecd0c81db0).getCapability<&DappyMarket.Storefront{DappyMarket.StorefrontPublic}>(DappyMarket.StorefrontPublicPath).check()
  return [ref, dCap, sCap]
}


`;
