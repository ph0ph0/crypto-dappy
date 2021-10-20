import { useReducer, useState, useCallback } from "react";
import { marketReducer } from "../reducer/marketReducer";
import DappyClass from "../utils/DappyClass";
import axios from "axios";
import { GET_DAPPYIDS_TO_LISTINGIDS } from "../flow/market/GetDappyIDsToListingsIDs.script";
import { sortDappies } from "../utils/sortDappies.utils";

import { LIST_USER_DAPPIES } from "../flow/list-user-dappies.script";
import { mutate, query, tx } from "@onflow/fcl";

export default function useMarket(user, userDappies) {
  const [state, dispatch] = useReducer(marketReducer, {
    loadingMarketDappies: false,
    loadingUnlistedDappies: false,
    error: false,
    marketDappies: [],
    unlistedDappies: [],
  });
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  const queryBackend = async () => {
    try {
      const res = await axios.get(
        "https://1c4mgqsjt2.execute-api.us-east-1.amazonaws.com/test/"
      );
      console.log(`****Called queryBackend for response`)
      return res?.data?.body?.Items;
    } catch (error) {
      throw new Error(`Error querying backend: ${error}`);
    }
  };

  const fetchMarketDappies = useCallback(async () => {
    if (!firstLoadDone) {
      dispatch({ type: "PROCESSING MARKETDAPPIES" });
      dispatch({ type: "PROCESSING UNLISTEDDAPPIES" });
    }
    setFirstLoadDone(true);
    updateMarket()
  }, [firstLoadDone]);

  const getDappyIDsToListingIDs = async () => {
    try {
      let res = await query({
        cadence: GET_DAPPYIDS_TO_LISTINGIDS,
        args: (arg, t) => [arg(user?.addr, t.Address)],
      });
      console.log(`***Called identityDictionary`)
      return res;
    } catch (err) {
      throw new Error(`Error getting DappyIdsToListingIDs${err}`);
    }
  };

  // const updateUserDappies = async () => {
  //   console.log(`!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!UPDATING USER DAPPIES`)
  //     try {
  //       let res = await query({
  //         cadence: LIST_USER_DAPPIES,
  //         args: (arg, t) => [arg(user?.addr, t.Address)],
  //       });
  //       let mappedDappies = [];

  //       for (let key in res) {
  //         const element = res[key];
  //         let dappy = new DappyClass(
  //           element.templateID,
  //           element.dna,
  //           element.name,
  //           element.price,
  //           key
  //         );
  //         mappedDappies.push(dappy);
  //       }
  //       console.log(`updating userDappies!!!!!: ${JSON.stringify(mappedDappies)}`)
  //       dispatch({ type: "SUCCESS", payload: mappedDappies });
  //     } catch (err) {
  //       dispatch({ type: "ERROR" });
  //     }
  //   };

  const updateMarket = async () => {
    try {
      // uD, dappyIDs, APIresponse
    console.log(`&&&&&&&&UPDATING MARKET`);
    let identifierDictionary = await getDappyIDsToListingIDs();
    const dappiesForMarket = await queryBackend();
    // await updateUserDappies()
    // console.log(`dappiesForMarket: ${dappiesForMarket}`)
    const { unlistedDappies, marketDappies } = sortDappies({
      userDappies,
      identifierDictionary,
      dappiesForMarket,
    });
    console.log(`^^^^^^^^^^MarketDappeis: ${JSON.stringify(marketDappies)}`)
    console.log(`^^^^^^^^^^UnlistedDappeis: ${JSON.stringify(unlistedDappies)}`)
    let marketDappiesObjects = Object.values(marketDappies).map((d) => {
      return new DappyClass(
        d?.templateID || d?.id,
        d?.dna,
        d?.name,
        d?.price,
        d?.dappyID,
        d?.listingResourceID,
        d?.storefrontAddress
      );
    });
    let unlistedDappiesObjects = Object.values(unlistedDappies).map((d) => {
      return new DappyClass(d?.templateID || d?.id, d?.dna, d?.name, d?.price, d?.dappyID);
    });
    dispatch({
      type: "UPDATE MARKETDAPPIES",
      payload: marketDappiesObjects,
    });
    dispatch({
      type: "UPDATE UNLISTEDDAPPIES",
      payload: unlistedDappiesObjects,
    });
    } catch(error) {
      console.log(`Error: ${error}`);
      dispatch({
        type: "ERROR",
      });
    }
    
  };

  return {
    ...state,
    fetchMarketDappies,
    updateMarket,
  };
}
