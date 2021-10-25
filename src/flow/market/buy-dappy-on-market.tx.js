export const BUY_DAPPY_ON_MARKET = `

    import DappyContract, DappyMarket from 0xDappy
    import FUSD from 0xFUSD
    import FungibleToken from 0xFungibleToken

    transaction(listingResourceID: UInt64, storefrontAddress: Address) {

        let storefrontRef: &DappyMarket.Storefront{DappyMarket.StorefrontPublic}
        let listingRef: &DappyMarket.DappyListing{DappyMarket.DappyListingPublic}
        let paymentVault: @FungibleToken.Vault
        let collectionRef: &DappyContract.Collection{DappyContract.Receiver}

        prepare(acct: AuthAccount) {

            self.storefrontRef = getAccount(storefrontAddress)
                .getCapability<&DappyMarket.Storefront{DappyMarket.StorefrontPublic}>(DappyMarket.StorefrontPublicPath)
                .borrow()!

            self.listingRef = self.storefrontRef.borrowListing(listingResourceID: listingResourceID)
                ?? panic("No DappyListing with that ID exists")
            
            let price = self.listingRef.getDetails().salePrice

            let mainFUSDVault = acct.borrow<&FUSD.Vault>(from: /storage/fusdVault)
                ?? panic("Can't borrow FUSD Vault from account storage")

            self.paymentVault <- mainFUSDVault.withdraw(amount: price)

            self.collectionRef = acct.borrow<&DappyContract.Collection{DappyContract.Receiver}>(from: DappyContract.CollectionStoragePath)
                ?? panic("Cannot borrow dappy collection")
        }

        execute {
            let <- self.listingRef.purchase(payment: <- self.paymentVault)
            self.collectionRef.deposit(token: <- dappy)

            self.storefrontRef.cleanup(listingResourceID: listingResourceID)
        }

    }

`