// TODO: Delete before submission

import DappyContract from 0x29e893174dd9b963
import DappyMarket from 0x29e893174dd9b963

transaction {
    prepare(acct: AuthAccount) {
        let DappyCollection = acct.getCapability<&DappyContract.Collection>(DappyContract.CollectionPublicPath)
        if !DappyCollection.check() {
            acct.unlink(DappyContract.CollectionPublicPath)
            destroy <- acct.load<@AnyResource>(from: DappyContract.CollectionStoragePath)
            destroy <- acct.load<@AnyResource>(from: DappyContract.AdminStoragePath) 
        }

        let DappyStorefront = acct.getCapability<&DappyMarket.Storefront>(DappyMarket.StorefrontPublicPath)
        if !DappyStorefront.check() {
            acct.unlink(DappyMarket.StorefrontPublicPath)
            destroy <- acct.load<@AnyResource>(from: DappyMarket.StorefrontStoragePath)
        }
    }
}
