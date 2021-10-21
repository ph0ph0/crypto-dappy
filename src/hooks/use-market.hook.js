import { useReducer, useState, useCallback } from "react";
import { marketReducer } from "../reducer/marketReducer";
import DappyClass from "../utils/DappyClass";
import axios from "axios";
import { GET_DAPPYIDS_TO_LISTINGIDS } from "../flow/market/GetDappyIDsToListingsIDs.script";
import { LIST_USER_DAPPIES } from "../flow/list-user-dappies.script";
import { sortDappies } from "../utils/sortDappies.utils";

import { mutate, query, tx } from "@onflow/fcl";
import { userDappyReducer } from "../reducer/userDappyReducer";

import { useUser } from '../providers/UserProvider';
import { useAuth } from '../providers/AuthProvider';

export default function useMarket() {
  const [marketState, dispatch] = useReducer(marketReducer, {
    loadingMarketDappies: false,
    loadingUnlistedDappies: false,
    error: false,
    marketDappies: [],
    unlistedDappies: [],
  });
  const { userDappies, fetchUserDappies } = useUser();
  const { user } = useAuth();
  const [firstLoadDone, setFirstLoadDone] = useState(false);

  const queryBackend = async () => {
    try {
      const res = await axios.get(
        "https://1c4mgqsjt2.execute-api.us-east-1.amazonaws.com/test/"
      );
      console.log(`response: ${JSON.stringify(res.data.body.Items)}`);
      return res?.data?.body?.Items;
    } catch (error) {
      throw new Error(`Error querying backend: ${error}`);
    }
  };

  const fetchMarketDappies = async () => {
    if (!firstLoadDone) {
      dispatch({ type: "PROCESSING MARKETDAPPIES" });
      dispatch({ type: "PROCESSING UNLISTEDDAPPIES" });
    }
    setFirstLoadDone(true);
    await updateMarket()
  };

  const getDappyIDsToListingIDs = async () => {
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

  const updateMarket = async () => {
    // uD, dappyIDs, APIresponse
    console.log(`&&&&&&&&UPDATING MARKET`);
    console.log(`userDappies1: ${JSON.stringify(userDappies)}`);
    let identifierDictionary = await getDappyIDsToListingIDs();
    console.log(`userDappies2: ${JSON.stringify(userDappies)}`);
    const dappiesForMarket = await queryBackend();
    console.log(`userDappies3: ${JSON.stringify(userDappies)}`);
    await fetchUserDappies()
    console.log(`DappyIDs dictionary: ${JSON.stringify(identifierDictionary)}`);
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
    console.log(`DONE!!!!!!!!!!!!!!DONE!!!!!!!!!!!!!!DONE!!!!!!!!!!!!!!DONE!!!!!!!!!!!!!!DONE!!!!!!!!!!!!!!`)
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
