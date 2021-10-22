const dappyIDFoundInIDDictionary = (dict, dappyID, listingID) => {
  if (listingID === undefined) {
    // We want to check the dappyIDs
    const keys = Object.keys(dict).map((k) => parseInt(k));
    return keys.includes(dappyID);
  }
  if (dappyID === undefined) {
    // We want to check the listingIDs
    const values = Object.values(dict);
    return values.includes(listingID);
  }
};

const findDappyInArray = (arr, dappy) => {
  return arr.find((d) => parseInt(d.dappyID) === dappy.dappyID);
};

const getUniqueDappies = (arr1, arr2) => {
  return arr1.filter(
    (x) => !arr2.find((y) => parseInt(x.dappyID) === y.dappyID)
  );
};

export const sortDappies = ({
  userDappies,
  identifierDictionary,
  dappiesForMarket,
}) => {
  console.log(`userDappies in sortDappies: ${JSON.stringify(userDappies)}`)
  console.log(`identifierDictionary in sortDappies: ${JSON.stringify(identifierDictionary)}`)
  console.log(`dappiesForMarket in sortDappies: ${JSON.stringify(dappiesForMarket)}`)
  // Dappies 1 & 2
  const unlistedDappies = [];

  // Dappies 3 & 4
  const listedOwnedDappies = [];

  // Dappies 5
  const listedUnownedDappies = [];

  // Order of statements is important
  for (const index in dappiesForMarket) {
    if (
      dappyIDFoundInIDDictionary(
        identifierDictionary,
        undefined,
        dappiesForMarket[index].listingResourceID
      ) &&
      findDappyInArray(userDappies, dappiesForMarket[index]) &&
      !findDappyInArray(listedOwnedDappies, dappiesForMarket[index])
    ) {
      // 3 and 4:
      // a) Is the listingResourceID of dappy in dappiesForMarket NOT FOUND in the identifierDictionary?
      // b) Is the dappy of dappiesForMarket found in userDappies?
      //  && dappyFoundInDappyArray(userDappies, dappiesForMarket)
      listedOwnedDappies.push(dappiesForMarket[index]);
    } else if (
      findDappyInArray(userDappies, dappiesForMarket[index]) &&
      !dappyIDFoundInIDDictionary(
        identifierDictionary,
        undefined,
        dappiesForMarket[index].listingResourceID
      )
    ) {
      // 1
      // a) Is the dappy of dappiesForMarket found in userDappies
      // b) and its listingResourceID not found in identifierDictionary
      unlistedDappies.push(dappiesForMarket[index]);
    } else if (
      !findDappyInArray(userDappies, dappiesForMarket[index]) &&
      !dappyIDFoundInIDDictionary(
        identifierDictionary,
        parseInt(dappiesForMarket[index].dappyID),
        undefined
      )
    ) {
      // 5
      listedUnownedDappies.push(dappiesForMarket[index]);
    }
  }
  // Extracts userDappies that are not
  let uniqueUserDappies = getUniqueDappies(userDappies, dappiesForMarket);

  for (const index in userDappies) {
    // If we find a userDappy that is unique,
    if (
      findDappyInArray(uniqueUserDappies, userDappies[index]) &&
      !dappyIDFoundInIDDictionary(
        identifierDictionary,
        parseInt(userDappies[index].dappyID),
        undefined
      )
    ) {
      // 2
      unlistedDappies.push(userDappies[index]);
    } else if (
      dappyIDFoundInIDDictionary(
        identifierDictionary,
        parseInt(userDappies[index].dappyID),
        undefined
      ) &&
      !findDappyInArray(listedOwnedDappies, userDappies[index])
    )
      // 4
      listedOwnedDappies.push(userDappies[index]);
  }

  console.log(`unlistedDappies: ${JSON.stringify(unlistedDappies)}`);
  console.log(`listedOwnedDappies: ${JSON.stringify(listedOwnedDappies)}`);
  console.log(`listedUnownedDappies: ${JSON.stringify(listedUnownedDappies)}`);

  const marketDappies = listedOwnedDappies.concat(listedUnownedDappies);
  return { unlistedDappies, marketDappies };
};

// NOTE:
// This file sorts three datasets of dappies into two datasets;
// marketDappies and unlistedDappies. This is necessary to provide
// the user with a responsive UI that updates as soon as the
// blockchain updates after the user executes a transaction.
// Without this, the update would occur as soon as the backend updates,
//  which might not be quick enough, and could introduce other bugs
//  into the application.

// There are three datasets that we can use to deduce whether a
// dappy is unlisted or listed on the market.
// - userDappies: Comes from the blockchain, and so can be trusted,
// so long as the data is fresh.
// - identifierDictionary: This is a dictionary that maps the dappyID to
// the listingResourceID for dappies that are owned by the current user
// and currently listed on the market. Can be trusted so long as the
// data is fresh.
// - dappiesForMarket: Comes from the API, and could be outdated since
// the FlowEventMonitor runs on a schedule. Can't be trusted, but is
// our only datasource that tells us which dappies might be on the
// market, particularly those from other users.
//
// There are 5 types of Dappy, and three groups that they can fall into.
//  The groups are Unlisted, Market(owned) and Market(not owned). Owned refers
// to ownership by the current user.
// A description of the types of Dappies and which datasets
// they are found in follows:
//
// 1 = Unlisted: dappy owned, but appears on market
// Description: This happens when a user buys a dappy in the market.
// The blockchain updates instantly, but the backend hasn't yet
// updated. As a result, the dappiesForMarket array
// (which is provided by the API response) still
// contains the old Listing referenceing the dappy we just bought
// suggesting that it is still available in the market
//  - Found in userDappies √
//  - NOT found in identifierDictionary √
//  - (Found in dappiesForMarket) √

// 2 (1b) = Unlisted: dappy owned, doesnt appear on market
// Description: This happens when both the backend and the
// blockchain agree that they own the dappy, but haven't
// listed it on the market. Problem is that we can't check
// if the
//  - Found in userDappies only √
//  - NOT found in identifierDictionary √
//  - (NOT Found in dappiesForMarket) √

// 3 and 4 = Market(owned): dappy owned, on market
// Description: This ensures that only dappies that the user
// owns are on the market listed as owned. The blockchain
// is the truth, so if dappy is found in userDappies and
// ownedListings array, then it must be on the market.
// If the backend hasn't updated yet (example 4 here),
// then the dappy will be found in userDappies, but not
// in dappiesForMarket, as backend hasn't updated yet.
// This can occur when a user lists their dappy on the market.
// There is a delay between the blockchain updating and the
// backend updating, where the backend lags behind.
// userDappies doesnt give us a listingResourceID, but
// we can we can use the dappyID to compare to the
// identifier dictionary, and if it is found there,
// and
//  - Found in userDappies √
//  - Found in identifierDictionary √
//  - Found in dappiesForMarket (Not essential) √

// 5 = Market(unowned): dappy not owned, on market
// Description: If the dappy is not in the userDappies array,
// not in the ownedListings array, but found in the
// dappiesForMarket, then it must be on the market.
//  - NOT found in userDappies
//  - NOT found in identifierDictionary
//  - Found in dappies for market only.
