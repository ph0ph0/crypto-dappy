import DappyContract from "./DappyContract.cdc"
import FungibleToken from "./FungibleToken.cdc"

// DappyMarket
//
// A sale support contract for Dappies, based on the NFTStorefront contract (https://github.com/onflow/nft-storefront).
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
//   The equivalent in this contract is {DappyContract.Provider, DappyContract.CollectionPublic}.
// - Events TODO: