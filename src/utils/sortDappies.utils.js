// NOTE: See bottom of file for detailed notes

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
      // Dappy 3:
      listedOwnedDappies.push(dappiesForMarket[index]);
    } else if (
      findDappyInArray(userDappies, dappiesForMarket[index]) &&
      !dappyIDFoundInIDDictionary(
        identifierDictionary,
        undefined,
        dappiesForMarket[index].listingResourceID
      )
    ) {
      // Dappy 1
      unlistedDappies.push(dappiesForMarket[index]);
    } else if (
      !findDappyInArray(userDappies, dappiesForMarket[index]) &&
      !dappyIDFoundInIDDictionary(
        identifierDictionary,
        parseInt(dappiesForMarket[index].dappyID),
        undefined
      )
    ) {
      // Dappy 5
      listedUnownedDappies.push(dappiesForMarket[index]);
    }
  }
  // Returns Dappies that are found only in userDappies
  let uniqueUserDappies = getUniqueDappies(userDappies, dappiesForMarket);

  for (const index in userDappies) {
    if (
      findDappyInArray(uniqueUserDappies, userDappies[index]) &&
      !dappyIDFoundInIDDictionary(
        identifierDictionary,
        parseInt(userDappies[index].dappyID),
        undefined
      )
    ) {
      // Dappy 2
      unlistedDappies.push(userDappies[index]);
    } else if (
      dappyIDFoundInIDDictionary(
        identifierDictionary,
        parseInt(userDappies[index].dappyID),
        undefined
      ) &&
      !findDappyInArray(listedOwnedDappies, userDappies[index])
    )
      // Dappy 4
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
// Without this, the update would occur the next time the frontend polls
// the backend AFTER the backend has updated.
// This not be quick enough to provide a responsive interface,
//  and could introduce other bugs into the application.

// There are three datasets that we can use to deduce whether a
// dappy is unlisted or listed on the market. In the context of this
// application, unlistedDappies are Dappies owned by the current user,
// and marketDappies are Dappies listed on the market that may be owned
// by the current user or someone else.
// The three datasets that we can use to populate unlistedDappies and
// marketDappies are:
// 
// - userDappies: This data is obtained from a script and thus from the blockchain.
// So long as the data is fresh, it can be trusted to be up-to-date.
// - identifierDictionary: This is a dictionary that maps the dappyIDs to
// the listingResourceIDs for dappies that are owned by the current user
// and currently listed on the market. This be trusted so long as the
// data is fresh.
// - dappiesForMarket: This comes from the API, and could be outdated since
// the FlowEventMonitor runs on a schedule. It can't be trusted to be accurate, 
// but is our only datasource that gives us a global picture of the market. 
//
// In the context of this sortDappies function, there are 5 'states' that Dappies
// can be classed as, and three groups that they can fall into. Two of these three
// groups are then combined, resulting in the final unlistedDappies and marketDappies
// arrays.
// The three groups are:
// - unlistedDappies
// - listedOwnedDappies
// - listedUnownedDappies
// 'Owned' here refers to the fact that the Dappies are owned by the current user,
// and 'unowned' is used to indicate that the Dappies are not owned by the current
// user. 

// As mentioned above, there are 5 'states' of Dappy that fall into the aforementioned
// groups. These are:
//
// 1 = unlistedDappies: Dappy owned by current user, 
// but appears to the front end to be listed on the market still.
// Description: This happens when a user buys a dappy in the market.
// The blockchain updates instantly, but the backend hasn't yet
// updated. As a result, the dappiesForMarket array
// (which is provided by the API response) still
// contains the old Listing referenceing the dappy we just bought,
// suggesting that it is still available in the market
//  - Found in userDappies √
//  - NOT found in identifierDictionary √
//  - Found in dappiesForMarket √

// 2 (1b) = unlistedDappies: Dappy owned by current user, and not listed
// on the market.
// Description: If the Dappy is not in the response from the backend
// (dappiesForMarket), not in the identifierDictionary (and therefore
// not listed on the market), and only found in userDappies, then
// it must be unlisted.
//  - Found in userDappies only √
//  - NOT found in identifierDictionary √
//  - NOT Found in dappiesForMarket √

// 3 and 4 = listedOwnedDappies: The Dappy is owned
// by the current user, and by using fresh blockchain data,
// is confirmed to be on the market. 
// Description: This ensures that only dappies that the user
// owns are on the market listed as owned. The blockchain
// is the truth, so if Dappy is found in userDappies AND
// identifierDictionary, then it MUST be on the market.
// If the backend hasn't updated yet,
// then the dappy will be found in userDappies, but not
// in dappiesForMarket, as backend hasn't caught up.
// This can occur when a user lists their dappy on the market.
// There is a delay between the blockchain updating and the
// backend updating, where the backend lags behind.
// userDappies doesnt give us a listingResourceID, but
// we can we can use the dappyID to compare to the
// identifier dictionary, and if it is found there,
// then it is on the market.
//  - Found in userDappies √
//  - Found in identifierDictionary √
//  - Found in dappiesForMarket (Not essential) √

// 5 = listedUnownedDappies: Dappy is not owned by current user, and is
//  on the market.
// Description: If the dappy is not in the userDappies array,
// not in the ownedListings array, but found in the
// dappiesForMarket, then it must be on the market, listed by someone else.
//  - NOT found in userDappies
//  - NOT found in identifierDictionary
//  - Found in dappies for market only.

// Using the three groups, unlistedDappies, listedOwnedDappies,
// and listedUnownedDappies, we can combine listedOwnedDappies and 
// listedUnownedDappies into a single array. This gives us
// the final marketDappies and unlistedDappies.

