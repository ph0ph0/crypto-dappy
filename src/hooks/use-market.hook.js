import { useReducer, useState, useEffect } from "react";
import { marketReducer } from "../reducer/marketReducer";
import DappyClass from "../utils/DappyClass";
import axios from "axios";
import { GET_DAPPYIDS_TO_LISTINGIDS } from "../flow/market/dappyIDs-to-listingIDs.script";
import { sortDappies } from "../utils/sortDappies.utils";
import { generateDappies } from "../utils/dappies.utils";

import { query } from "@onflow/fcl";

export default function useMarket() {
  const [marketState, dispatch] = useReducer(marketReducer, {
    loadingMarketDappies: false,
    loadingUnlistedDappies: false,
    error: false,
    marketDappies: [],
    unlistedDappies: [],
  });
  
  useEffect(() => {
    fetchMarketDappies()
    //eslint-disable-next-line
  }, [])
  const fetchMarketDappies = async (user, userDappies) => {
    dispatch({ type: "PROCESSING MARKETDAPPIES" });
    dispatch({ type: "PROCESSING UNLISTEDDAPPIES" });
    try {
      let res = generateDappies();
      let marketDappies = Object.values(res).map((d) => {
        return new DappyClass(d?.templateID, d?.dna, d?.name, d?.price);
      });
      console.log(`MARKET DAPPIES!: ${marketDappies}`)
      dispatch({
        type: "UPDATE MARKETDAPPIES",
        payload: marketDappies,
      });
    } catch (error) {
      console.log(error);
      dispatch({ type: "ERROR" });
    }
    try {
      let res = generateDappies();
      let unlistedDappies = Object.values(res).map((d) => {
        return new DappyClass(d?.templateID, d?.dna, d?.name, d?.price);
      });
      dispatch({ type: "UPDATE UNLISTEDDAPPIES", payload: unlistedDappies });
    } catch (err) {
      dispatch({ type: "ERROR" });
    }
  };

  return {
    ...marketState,
    fetchMarketDappies,
  };
}
