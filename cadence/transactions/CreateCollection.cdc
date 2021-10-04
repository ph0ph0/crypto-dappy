import DappyContract from "../contracts/DappyContract.cdc"

transaction {
  prepare(acct: AuthAccount) {
    let collection <- DappyContract.createEmptyCollection()
    acct.save<@DappyContract.Collection>(<-collection, to: DappyContract.CollectionStoragePath)
    // NOTE: Added in DappyContract.Provider type restriction so that it will work with the CreateListing() call in DappyMarket
    acct.link<&{DappyContract.CollectionPublic, DappyContract.Provider}>(DappyContract.CollectionPublicPath, target: DappyContract.CollectionStoragePath)
  }
}