import { useReducer, useState, useCallback } from "react";
import { marketReducer } from "../reducer/marketReducer";
import DappyClass from "../utils/DappyClass";
import axios from "axios";
import { GET_DAPPYIDS_TO_LISTINGIDS } from "../flow/market/GetDappyIDsToListingsIDs.script";

import { mutate, query, tx } from "@onflow/fcl";

export default function useMarket(user, userDappies) {
  const [state, dispatch] = useReducer(marketReducer, {
    loadingMarketDappies: false,
    loadingUnlistedDappies: false,
    error: false,
    marketDappies: [],
    unlistedDappies: [],
  });
  const [firstLoadDone, setFirstLoadDone] = useState(false)

  const queryBackend = async () => {
    try {
      const res = await axios.get(
        "https://1c4mgqsjt2.execute-api.us-east-1.amazonaws.com/test/"
      );
      console.log(`response: ${JSON.stringify(res.data.body.Items)}`);
      return res?.data?.body?.Items;
    } catch (error) {
      throw new Error(`Error querying backend: ${error}`)
    }
    
  }

  const fetchMarketDappies = useCallback(async () => {
    if (!firstLoadDone) {
      dispatch({ type: "PROCESSING MARKETDAPPIES" });
      dispatch({ type: "PROCESSING UNLISTEDDAPPIES" });
    }
    setFirstLoadDone(true)
    try {
      const dappiesForMarket = await queryBackend()
      let marketDappies = Object.values(dappiesForMarket).map((d) => {
        return new DappyClass(d.templateID, d?.dna, d?.name, d?.price, d?.dappyID, d?.listingResourceID, d?.storefrontAddress);
      });
      console.log(`uD: ${JSON.stringify(userDappies)}`)
      const dappiesUnlisted = userDappies.filter(
        (x) => !dappiesForMarket.find((y) => y.dappyID === parseInt(x.dappyID)));
      console.log(`****dUL: ${JSON.stringify(dappiesUnlisted)}`)
      let unlistedDappies = Object.values(dappiesUnlisted).map((d) => {
        return new DappyClass(d?.id, d?.dna, d?.name, d?.price, d?.dappyID);
      });
      dispatch({ type: "UPDATE UNLISTEDDAPPIES", payload: unlistedDappies });
      dispatch({
        type: "UPDATE MARKETDAPPIES",
        payload: marketDappies,
      });
    } catch (error) {
      console.log(`Error: ${error}`);
      dispatch({
        type: "ERROR"
      });
    }
  },[userDappies, firstLoadDone]);

  const getDappyIDsToListingIDs = async () => {
    try {
      let res = await query({ 
        cadence: GET_DAPPYIDS_TO_LISTINGIDS, 
        args: (arg, t) => [arg(user?.addr, t.Address)] })
      return res
    } catch (err) {
      throw new Error(`Error getting DappyIdsToListingIDs${err}`)
    }
}

  const updateMarket = async () => {
    // uD, dappyIDs, APIresponse
    console.log(`&&&&&&&&UPDATING MARKET`)
    let dappyIDs = getDappyIDsToListingIDs()
    const dappiesForMarket = await queryBackend()
    console.log(`DappyIDs dictionary: ${JSON.stringify(dappyIDs)}`)
  }

  return {
    ...state,
    fetchMarketDappies,
  };
}
