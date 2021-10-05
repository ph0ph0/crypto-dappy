import DappyContract from 0x29e893174dd9b963
import FungibleToken from 0x9a0766d93b6608b7

// DappyMarket
//
// A sale support contract for Dappies, based on the NFTStorefront contract (https://github.com/onflow/nft-storefront).
// For another example of a modified NFTStorefront contract, see (https://github.com/versus-flow/versus-contracts/blob/main/contracts/Marketplace.cdc)
// 
// Each account that wants to list Dappies for sale installs a Storefront,
// and lists individual sales within that Storefront as Listings.
// There is one Storefront per account, it handles sales of Dappies
// for that account.

// Note that a Listing is a representation of the Dappy, and not the actual
// Dappy resource itself. 
//
// Each Listing can have one or more "cut"s of the sale price that
// goes to one or more addresses. Cuts can be used to pay listing fees
// or other considerations.
// Each NFT may be listed in one or more Listings, the validity of each
// Listing can easily be checked.
// 
// The CryptoDappies frontend populates the Market page by employing an
// AWS serverless tech stack. For more information, see here: (TODO:)
// 
// Marketplaces and other aggregators can watch for Listing events
// and list Dappies of interest.
//
// In order to enhance this contract as a learning aid, here are the differences
// between the DappyMarket contract and the NFTStorefront contract:
// - The DappyContract.cdc does not employ the NonfungibleToken standard 
//   (https://github.com/onflow/flow-nft/blob/master/contracts/NonFungibleToken.cdc). 
//   As such, it does not have access to the restricted types of the NFT standard contract,
//   and so all restricted types had to be updated to the equivalent in the DappyContract.
//   For example, in the NFTStorefront contract, on line 207, the `nftProviderCapability` 
//   constant has a restricted type of {NonFungibleToken.Provider, NonFungibleToken.CollectionPublic}.
//   The equivalent in the DappyMarket contract is {DappyContract.Provider, DappyContract.CollectionPublic}.
// - Where approporiate, the term 'NFT' was replaced with 'Dappy'.
// - The term 'Listing' was replaced with 'DappyListing'. This was to clarify that a Listing resource
//   in the original NFTStorefront contract is not quite the same as a DappyListing (different properties).
// - Events TODO: 
//      - dappyID, dappyName and dappyDNA were added to the DappyListingAvailable (ListingAvailable equivalent) event.
//        nftType was removed, since the type will always be DappyContract.Dappy
// - Listing resource/ListingDetails struct TODO:
//      - dappyID, dappyName and dappyDNA were added to the ListingDetails struct. nftType was removed, since
//        the type will always be DappyContract.Dappy.
//      - nftProviderCapability changed to dappyProviderCapability, and the restricted types updated.
//      - In the Listing resource of the NFTStorefront contract, there is a borrowNFT() method associated with
//        the CollectionPublic and Provider interfaces in the NonFungibleToken standard (L213). This is used to check that the user
//        still owns the NFT in question. It achieves this through calling the .borrowNFT() function defined 
//        in the NonFungibleToken standard contract (L130). There is no equivalent method to borrowNFT in the Dappy contract, however,
//        we can use the listDappies() method of the DappyContract CollectionPublic interface to achieve the 
//        same outcome (DappyContract, L191). Since we are not borrowing a reference to the Dappy (the listDappies() method returns a 
//        {UInt64: DappyContract.Template} dictionary, so this is not possible anyway), the name of this method
//         was changed to `ownsDappy()`. It returns a boolean that indicates if the account owns the Dappy. To 
//        achieve the same effect, the getIDs() method of the DappyContract CollectionPublic (L187) could have also been
//        used. However, this returns an array, and dictionary lookup using the ID would be more efficient than
//        iterating through an array of IDs. 
//      - The assertion at the end of the DappyListing initialization function was updated to use listDappies() (L380).
// - Storefront resource/interfaces:
//      - A dictionary mapping the DappyIDs to the ListingIDs called dappyIDsToListingIDs was added to the Storefront resource. This was necessary
//        to prevent multiple Listings being created for the same Dappy. A getDappyIDs() function was added to the 
//        StorefrontPublic interface and thus to the Storefront resource. Using these additions, it was now possible
//        to check if a Dappy had already been listed. This was achieved in the precondition of the createListing()
//        function in the Storefront resource. If the DappyID exists in the dappyIDsToListingIDs dictionary, then the
//        function is aborted. A dappyID is added to the dictionary during the Listing creation process in createListing(),
//        and removed from the dictionary in removeListing() and cleanup(). It is important to note that the NFTStorefront
//        contract allows Listings to remain in a Storefront after they have been purchased, their `purchased` Bool flag
//        set to true (see ListingDetails struct and purchase() function in Listing resource). This is also the case with the DappyMarket contract.
//        Thus, it's possible that
//        a DappyListing could be purchased, but remain in the Storefront resource (with its `purchased` property set to true). 
//        This should not be an issue, because if
//        the DappyListing was purchased, then the underlying Dappy will have been moved to the new owner and thus cannot
//        be relisted by the previous owner, since they no longer own the Dappy. 
//      - A getDappyIDs() function was added to the StorefrontPublic interface and the Storefront resource. This returns the keys of the 
//        dappyIDsToResourceIDs dictionary.
//      - When a Listing is created in createListing, we add the dappyID to the dappyIDToListingIDs dictionary.
//      - When a DappyListing is destroyed in removeListing() and cleanup(), it is also removed from the dappyIDsToListingIDs dictionary.
//      - Added the dappyIDToListingIDs dictionary initialization to the Storefront resource init function.


pub contract DappyMarket {
    // DappyMarketInitialized
    // This contract has been deployed.
    // Event consumers can now expect events from this contract.
    //
    pub event DappyMarketInitialized()

    // StorefrontInitialized
    // A Storefront resource has been created.
    // Event consumers can now expect events from this Storefront.
    // Note that we do not specify an address: we cannot and should not.
    // Created resources do not have an owner address, and may be moved
    // after creation in ways we cannot check.
    // DappyListingAvailable events can be used to determine the address
    // of the owner of the Storefront (...its location) at the time of
    // the listing but only at that precise moment in that precise transaction.
    // If the seller moves the Storefront while the listing is valid, 
    // that is on them.
    //
    pub event StorefrontInitialized(storefrontResourceID: UInt64)

    // StorefrontDestroyed
    // A Storefront has been destroyed.
    // Event consumers can now stop processing events from this Storefront.
    // Note that we do not specify an address.
    //
    pub event StorefrontDestroyed(storefrontResourceID: UInt64)

    // DappyListingAvailable
    // A listing has been created and added to a Storefront resource.
    // The Address values here are valid when the event is emitted, but
    // the state of the accounts they refer to may be changed outside of the
    // DappyStorefront workflow, so be careful to check when using them.
    //
    pub event DappyListingAvailable(
        storefrontAddress: Address,
        listingResourceID: UInt64,
        dappyID: UInt64,
        name: String,
        dna: String,
        ftVaultType: Type,
        price: UFix64
    )

    // DappyListingCompleted
    // The listing has been resolved. It has either been purchased, or removed and destroyed.
    //
    pub event DappyListingCompleted(listingResourceID: UInt64, storefrontResourceID: UInt64, purchased: Bool)

    // StorefrontStoragePath
    // The location in storage that a Storefront resource should be located.
    pub let StorefrontStoragePath: StoragePath

    // StorefrontPublicPath
    // The public location for a Storefront link.
    pub let StorefrontPublicPath: PublicPath


    // SaleCut
    // A struct representing a recipient that must be sent a certain amount
    // of the payment when a token is sold.
    //
    pub struct SaleCut {
        // The receiver for the payment.
        // Note that we do not store an address to find the Vault that this represents,
        // as the link or resource that we fetch in this way may be manipulated,
        // so to find the address that a cut goes to you must get this struct and then
        // call receiver.borrow()!.owner.address on it.
        // This can be done efficiently in a script.
        pub let receiver: Capability<&{FungibleToken.Receiver}>

        // The amount of the payment FungibleToken that will be paid to the receiver.
        pub let amount: UFix64

        // initializer
        //
        init(receiver: Capability<&{FungibleToken.Receiver}>, amount: UFix64) {
            self.receiver = receiver
            self.amount = amount
        }
    }


    // DappyListingDetails
    // A struct containing a Dappy Listing's data.
    //
    pub struct DappyListingDetails {
        // The Storefront that the Listing is stored in.
        // Note that this resource cannot be moved to a different Storefront,
        // so this is OK. If we ever make it so that it *can* be moved,
        // this should be revisited.
        pub var storefrontID: UInt64
        // Whether this listing has been purchased or not.
        pub var purchased: Bool
        // The ID of the Dappy within that type.
        pub let dappyID: UInt64
        // The name of the dappy associated with this listing
        pub let name: String
        // The dna of the dappy associated with this listing
        pub let dna: String
        // The Type of the FungibleToken that payments must be made in.
        pub let salePaymentVaultType: Type
        // The amount that must be paid in the specified FungibleToken.
        pub let salePrice: UFix64
        // This specifies the division of payment between recipients.
        pub let saleCuts: [SaleCut]

        // setToPurchased
        // Irreversibly set this listing as purchased.
        //
        access(contract) fun setToPurchased() {
            self.purchased = true
        }

        // initializer
        //
        init (
            dappyID: UInt64,
            name: String,
            dna: String,
            salePaymentVaultType: Type,
            saleCuts: [SaleCut],
            storefrontID: UInt64
        ) {
            self.storefrontID = storefrontID
            self.purchased = false
            self.dappyID = dappyID
            self.name = name
            self.dna = dna
            self.salePaymentVaultType = salePaymentVaultType

            // Store the cuts
            assert(saleCuts.length > 0, message: "Listing must have at least one payment cut recipient")
            self.saleCuts = saleCuts

            // Calculate the total price from the cuts
            var salePrice = 0.0
            // Perform initial check on capabilities, and calculate sale price from cut amounts.
            for cut in self.saleCuts {
                // Make sure we can borrow the receiver.
                // We will check this again when the token is sold.
                cut.receiver.borrow()
                    ?? panic("Cannot borrow receiver")
                // Add the cut amount to the total price
                salePrice = salePrice + cut.amount
            }
            assert(salePrice > 0.0, message: "Listing must have non-zero price")

            // Store the calculated sale price
            self.salePrice = salePrice
        }
    }


    // DappyListingPublic
    // An interface providing a useful public interface to a Listing.
    //
    pub resource interface DappyListingPublic {
        // ownsDappy
        // This will assert in the same way as the NFT standard borrowNFT()
        // if the Dappy is absent, for example if it has been sold via another listing.
        //
        pub fun ownsDappy(dappyID: UInt64): Bool

        // purchase
        // Purchase the listing, buying the Dappy.
        // This pays the beneficiaries and returns the Dappy to the buyer.
        //
        pub fun purchase(payment: @FungibleToken.Vault): @DappyContract.Dappy

        // getDetails
        //
        pub fun getDetails(): DappyListingDetails
    }


    // Listing
    // A resource that allows a Dappy to be sold for an amount of a given FungibleToken,
    // and for the proceeds of that sale to be split between several recipients.
    // 
    pub resource DappyListing: DappyListingPublic {
        // The simple (non-Capability, non-complex) details of the sale
        access(self) let details: DappyListingDetails

        // A capability allowing this resource to withdraw the NFT with the given ID from its collection.
        // This capability allows the resource to withdraw *any* NFT, so you should be careful when giving
        // such a capability to a resource and always check its code to make sure it will use it in the
        // way that it claims.
        access(contract) let dappyProviderCapability: Capability<&{DappyContract.Provider, DappyContract.CollectionPublic}>

        // ownsDappy
        // This will assert in the same way as the NFT standard borrowNFT()
        // if the Dappy is absent, for example if it has been sold via another listing.
        // The NFTStorefront contract achieves this by calling the borrowNFT() method on the
        // CollectionPublic interface. The DappyContract CollectionPublic interface does not
        // have this method. However, it does have a listDappies() method which returns a 
        // dictionary of references to the templates of the Dappies that the owner owns. We can use this
        // to check if they still own the Dappy in question. 
        //
        pub fun ownsDappy(dappyID: UInt64): Bool {
            let refDict: {UInt64: DappyContract.Template} = self.dappyProviderCapability.borrow()!.listDappies()
            return refDict.containsKey(dappyID)
        }

        // getDetails
        // Get the details of the current state of the Listing as a struct.
        // This avoids having more public variables and getter methods for them, and plays
        // nicely with scripts (which cannot return resources).
        //
        pub fun getDetails(): DappyListingDetails {
            return self.details
        }

        // purchase
        // Purchase the listing, buying the Dappy.
        // This pays the beneficiaries and returns the token to the buyer.
        //
        pub fun purchase(payment: @FungibleToken.Vault): @DappyContract.Dappy {
            pre {
                self.details.purchased == false: "dappy has already been purchased"
                payment.isInstance(self.details.salePaymentVaultType): "payment vault is not requested fungible token"
                payment.balance == self.details.salePrice: "payment vault does not contain requested price"
            }

            // Make sure the listing cannot be purchased again.
            self.details.setToPurchased()

            // Fetch the dappy to return to the purchaser.
            let dappy <-self.dappyProviderCapability.borrow()!.withdraw(withdrawID: self.details.dappyID)
            // Neither receivers nor providers are trustworthy, they must implement the correct
            // interface but beyond complying with its pre/post conditions they are not gauranteed
            // to implement the functionality behind the interface in any given way.
            // Therefore we cannot trust the Collection resource behind the interface,
            // and we must check the NFT resource it gives us to make sure that it is the correct one.
            assert(dappy.id == self.details.dappyID, message: "withdrawn Dappy does not have specified ID")

            // Rather than aborting the transaction if any receiver is absent when we try to pay it,
            // we send the cut to the first valid receiver.
            // The first receiver should therefore either be the seller, or an agreed recipient for
            // any unpaid cuts.
            var residualReceiver: &{FungibleToken.Receiver}? = nil

            // Pay each beneficiary their amount of the payment.
            for cut in self.details.saleCuts {
                if let receiver = cut.receiver.borrow() {
                   let paymentCut <- payment.withdraw(amount: cut.amount)
                    receiver.deposit(from: <-paymentCut)
                    if (residualReceiver == nil) {
                        residualReceiver = receiver
                    }
                }
            }

            assert(residualReceiver != nil, message: "No valid payment receivers")

            // At this point, if all recievers were active and availabile, then the payment Vault will have
            // zero tokens left, and this will functionally be a no-op that consumes the empty vault
            residualReceiver!.deposit(from: <-payment)

            // If the listing is purchased, we regard it as completed here.
            // Otherwise we regard it as completed in the destructor.
            emit DappyListingCompleted(
                listingResourceID: self.uuid,
                storefrontResourceID: self.details.storefrontID,
                purchased: self.details.purchased
            )

            return <-dappy
        }

        // destructor
        //
        destroy () {
            // If the listing has not been purchased, we regard it as completed here.
            // Otherwise we regard it as completed in purchase().
            // This is because we destroy the listing in Storefront.removeListing()
            // or Storefront.cleanup() .
            // If we change this destructor, revisit those functions.
            if !self.details.purchased {
                emit DappyListingCompleted(
                    listingResourceID: self.uuid,
                    storefrontResourceID: self.details.storefrontID,
                    purchased: self.details.purchased
                )
            }
        }

        // initializer
        //
        init (
            dappyProviderCapability: Capability<&{DappyContract.Provider, DappyContract.CollectionPublic}>,
            dappyID: UInt64,
            name: String,
            dna: String,
            salePaymentVaultType: Type,
            saleCuts: [SaleCut],
            storefrontID: UInt64
        ) {
            // Store the sale information
            self.details = DappyListingDetails(
                dappyID: dappyID,
                name: name,
                dna: dna,
                salePaymentVaultType: salePaymentVaultType,
                saleCuts: saleCuts,
                storefrontID: storefrontID
            )

            // Store the NFT provider
            self.dappyProviderCapability = dappyProviderCapability

            // Check that the provider contains the Dappy.
            // We will check it again when the token is sold.
            // We cannot move this into a function because initializers cannot call member functions.
            let provider = self.dappyProviderCapability.borrow()
            assert(provider != nil, message: "cannot borrow dappyProviderCapability")

            // This will precondition assert if the Dappy is not available.
            let refDict: {UInt64: DappyContract.Template} = self.dappyProviderCapability.borrow()!.listDappies()
            assert(refDict.containsKey(dappyID), message: "Dappy does not have specified ID")
        }
    }

    // StorefrontManager
    // An interface for adding and removing DappyListings within a Storefront,
    // intended for use by the Storefront's owner
    //
    pub resource interface StorefrontManager {
        // createListing
        // Allows the Storefront owner to create and insert Listings.
        //
        pub fun createListing(
            dappyProviderCapability: Capability<&{DappyContract.Provider, DappyContract.CollectionPublic}>,
            dappyID: UInt64,
            name: String,
            dna: String,
            salePaymentVaultType: Type,
            saleCuts: [SaleCut]
        ): UInt64
        // removeListing
        // Allows the Storefront owner to remove any sale listing, accepted or not.
        //
        pub fun removeListing(listingResourceID: UInt64)
    }

    // StorefrontPublic
    // An interface to allow listing and borrowing Listings, and purchasing items via Listings
    // in a Storefront.
    //
    pub resource interface StorefrontPublic {
        pub fun getListingIDs(): [UInt64]
        pub fun getDappyIDs(): [UInt64]
        pub fun borrowListing(listingResourceID: UInt64): &DappyListing{DappyListingPublic}?
        pub fun cleanup(listingResourceID: UInt64)
   }

    // Storefront
    // A resource that allows its owner to manage a list of Listings, and anyone to interact with them
    // in order to query their details and purchase the NFTs that they represent.
    //
    pub resource Storefront : StorefrontManager, StorefrontPublic {
        // The dictionary of Listing uuids to Listing resources.
        access(self) var listings: @{UInt64: DappyListing}
        
        // Dictionary matching DappyIDs that have been listed to their ListingIDs
        access(self) var dappyIDsToListingIDs: {UInt64: UInt64}

        // insert
        // Create and publish a Listing for an NFT.
        //
         pub fun createListing(
            dappyProviderCapability: Capability<&{DappyContract.Provider, DappyContract.CollectionPublic}>,
            dappyID: UInt64,
            name: String,
            dna: String,
            salePaymentVaultType: Type,
            saleCuts: [SaleCut]
         ): UInt64 {

             pre {
                 self.dappyIDsToListingIDs[dappyID] == nil: "DappyListing for this Dappy already exists!"
             }

            let listing <- create DappyListing(
                dappyProviderCapability: dappyProviderCapability,
                dappyID: dappyID,
                name: name,
                dna: dna,
                salePaymentVaultType: salePaymentVaultType,
                saleCuts: saleCuts,
                storefrontID: self.uuid
            )

            let listingResourceID = listing.uuid
            let listingPrice = listing.getDetails().salePrice

            self.dappyIDsToListingIDs[dappyID] = listingResourceID

            // Add the new listing to the dictionary.
            let oldListing <- self.listings[listingResourceID] <- listing
            // Note that oldListing will always be nil, but we have to handle it.
            destroy oldListing

            emit DappyListingAvailable(
                storefrontAddress: self.owner?.address!,
                listingResourceID: listingResourceID,
                dappyID: dappyID,
                name: name,
                dna: dna,
                ftVaultType: salePaymentVaultType,
                price: listingPrice
            )

            return listingResourceID
        }

        // removeListing
        // Remove a Listing that has not yet been purchased from the collection and destroy it.
        //
        pub fun removeListing(listingResourceID: UInt64) {
            let listing <- self.listings.remove(key: listingResourceID)
                ?? panic("missing Listing")
    
            // This will emit a DappyListingCompleted event.
            destroy listing

            // Remove from dappyIDsToListingIDs dictionary
            for key in self.dappyIDsToListingIDs.keys {
                if self.dappyIDsToListingIDs[key] == listingResourceID {
                    self.dappyIDsToListingIDs.remove(key: listingResourceID)
                    break
                }
            }
        }

        // getListingIDs
        // Returns an array of the Listing resource IDs that are in the collection
        //
        pub fun getListingIDs(): [UInt64] {
            return self.listings.keys
        }
        
        pub fun getDappyIDs(): [UInt64] {
            return self.dappyIDsToListingIDs.keys
        }

        // borrowSaleItem
        // Returns a read-only view of the SaleItem for the given listingID if it is contained by this collection.
        //
        pub fun borrowListing(listingResourceID: UInt64): &DappyListing{DappyListingPublic}? {
            if self.listings[listingResourceID] != nil {
                return &self.listings[listingResourceID] as! &DappyListing{DappyListingPublic}
            } else {
                return nil
            }
        }

        // cleanup
        // Remove a listing *if* it has been purchased.
        // Anyone can call, but at present it only benefits the account owner to do so.
        // Kind purchasers can however call it if they like.
        //
        pub fun cleanup(listingResourceID: UInt64) {
            pre {
                self.listings[listingResourceID] != nil: "could not find listing with given id"
            }

            let listing <- self.listings.remove(key: listingResourceID)!
            assert(listing.getDetails().purchased == true, message: "listing is not purchased, only admin can remove")
            destroy listing
            
            // Remove from dappyIDsToListingIDs dictionary
            for key in self.dappyIDsToListingIDs.keys {
                if self.dappyIDsToListingIDs[key] == listingResourceID {
                    self.dappyIDsToListingIDs.remove(key: listingResourceID)
                    break
                }
            }

        }

        // destructor
        //
        destroy () {
            destroy self.listings

            // Let event consumers know that this storefront will no longer exist
            emit StorefrontDestroyed(storefrontResourceID: self.uuid)
        }

        // constructor
        //
        init () {
            self.listings <- {}
            self.dappyIDsToListingIDs = {}

            // Let event consumers know that this storefront exists
            emit StorefrontInitialized(storefrontResourceID: self.uuid)
        }
    }

    // createStorefront
    // Make creating a Storefront publicly accessible.
    //
    pub fun createStorefront(): @Storefront {
        return <-create Storefront()
    }

    init () {
        self.StorefrontStoragePath = /storage/NFTStorefront
        self.StorefrontPublicPath = /public/NFTStorefront

        emit DappyMarketInitialized()
    }
}