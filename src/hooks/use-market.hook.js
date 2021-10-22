import { useReducer, useState } from "react";
import { marketReducer } from "../reducer/marketReducer";
import DappyClass from "../utils/DappyClass";
import axios from "axios";
import { GET_DAPPYIDS_TO_LISTINGIDS } from "../flow/market/dappyIDs-to-listingIDs.script";
import { sortDappies } from "../utils/sortDappies.utils";

import { query } from "@onflow/fcl";

export default function useMarket() {
  const [marketState, dispatch] = useReducer(marketReducer, {
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
      console.log(`API response: ${JSON.stringify(res.data.body.Items)}`);
      return res?.data?.body?.Items;
    } catch (error) {
      throw new Error(`Error querying backend: ${error}`);
    }
  };

  const updateMarket = async (user, userDappies) => {
    if (!firstLoadDone) {
      dispatch({ type: "PROCESSING MARKETDAPPIES" });
      dispatch({ type: "PROCESSING UNLISTEDDAPPIES" });
      setFirstLoadDone(true);
    }
    await fetchMarketDappies(user, userDappies)
  };

  const getDappyIDsToListingIDs = async (user) => {
    try {
      let res = await query({
        cadence: GET_DAPPYIDS_TO_LISTINGIDS,
        args: (arg, t) => [arg(user?.addr, t.Address)],
      });
      console.log(`idDictionary in getDappyIDsToListingIDs fcl query: ${JSON.stringify(res)}`)
      return res;
    } catch (err) {
      throw new Error(`Error getting DappyIdsToListingIDs: ${err}`);
    }
  };

  const fetchMarketDappies = async (user, userDappies) => {
    // uD, dappyIDs, APIresponse
    console.log(`&&&&&&&&UPDATING MARKET`);
    let identifierDictionary = await getDappyIDsToListingIDs(user);
    const dappiesForMarket = await queryBackend();
    console.log(`userDappies passed to sortDappies: ${JSON.stringify(userDappies)}`);
    const { unlistedDappies, marketDappies } = sortDappies({
      userDappies,
      identifierDictionary,
      dappiesForMarket,
    });
    let marketDappiesObjects = Object.values(marketDappies).map((d) => {
      return new DappyClass(
        d.templateID,
        d?.dna,
        d?.name,
        d?.price,
        d?.dappyID,
        d?.listingResourceID,
        d?.storefrontAddress
      );
    });
    let unlistedDappiesObjects = Object.values(unlistedDappies).map((d) => {
      return new DappyClass(d?.id, d?.dna, d?.name, d?.price, d?.dappyID);
    });
    dispatch({
      type: "UPDATE MARKETDAPPIES",
      payload: marketDappiesObjects,
    });
    dispatch({
      type: "UPDATE UNLISTEDDAPPIES",
      payload: unlistedDappiesObjects,
    });
  };

  return {
    ...marketState,
    fetchMarketDappies,
    updateMarket,
  };
}
