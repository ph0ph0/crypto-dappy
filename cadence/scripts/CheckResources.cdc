
import DappyMarket from 0x29e893174dd9b963
import DappyContract from 0x29e893174dd9b963

pub fun main(addr: Address): [Bool] {
  let collectionRef = getAccount(addr).getCapability<&{DappyContract.CollectionPublic}>(DappyContract.CollectionPublicPath).check()

  let dCap = getAccount(addr).getCapability<&{DappyContract.CollectionPublic, DappyContract.Provider}>(DappyContract.CollectionPublicPath).check()
  let storefrontCap = getAccount(addr).getCapability<&DappyMarket.Storefront{DappyMarket.StorefrontPublic}>(DappyMarket.StorefrontPublicPath).check()
  return [collectionRef, dCap, storefrontCap]
}
