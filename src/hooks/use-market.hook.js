import { useReducer, useState, useCallback } from "react";
import { marketReducer } from "../reducer/marketReducer";
import DappyClass from "../utils/DappyClass";
import axios from "axios";

export default function useDappyMarket(userDappies) {
  const [state, dispatch] = useReducer(marketReducer, {
    loadingMarketDappies: false,
    loadingUnlistedDappies: false,
    error: false,
    marketDappies: [],
    unlistedDappies: [],
  });
  const [firstLoadDone, setFirstLoadDone] = useState(false)

  const fetchMarketDappies = useCallback(async () => {
    if (!firstLoadDone) {
      dispatch({ type: "PROCESSING MARKETDAPPIES" });
      dispatch({ type: "PROCESSING UNLISTEDDAPPIES" });
    }
    setFirstLoadDone(true)
    try {
      const res = await axios.get(
        "https://1c4mgqsjt2.execute-api.us-east-1.amazonaws.com/test/"
      );
      const dappiesForMarket = res?.data?.body?.Items;
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
      console.log(`response: ${JSON.stringify(res.data.body.Items)}`);
    } catch (error) {
      console.log(`Error: ${error}`);
      dispatch({
        type: "ERROR"
      });
    }
  },[userDappies, firstLoadDone]);

  return {
    ...state,
    fetchMarketDappies,
  };
}
