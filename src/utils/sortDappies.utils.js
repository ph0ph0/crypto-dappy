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
  // Dappies 1 & 2
  const unlistedDappies = [];

  // Dappies 3 & 4
  const listedOwnedDappies = [];

  // Dappies 5
  const listedUnownedDappies = [];

  // Order of if statements is important
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
      // console.log(`d: ${dappy.listingResourceID}`);
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
  // console.log(`uniqueUserDappies: ${JSON.stringify(uniqueUserDappies)}`);

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

  const marketDappies = listedOwnedDappies.push(listedUnownedDappies);
  return { unlistedDappies, marketDappies };
};
