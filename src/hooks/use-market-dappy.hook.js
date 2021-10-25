import { mutate, tx } from "@onflow/fcl";
import { useReducer, useState } from "react";
import { marketDappyReducer } from "../reducer/marketDappyReducer";

import { LIST_DAPPY_ON_MARKET } from "../flow/market/list-dappy-on-market.tx";
import { useTxs } from "../providers/TxProvider";

export default function useMarketDappy(fetchUserDappies) {
  const [state, dispatch] = useReducer(marketDappyReducer, {
    loading: false,
    error: false,
    success: false
  });

  const [listingPrice, setListingPrice] = useState("");

  const { addTx, runningTxs } = useTxs();

  const updatePrice = (event) => {
    const re = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
    // if value is not blank, test the regex
    if (event.target.value === "" || re.test(event.target.value)) {
      console.log(`newPrice: ${event.target.value}`);
      setListingPrice(event.target.value);
    }
  };

  const listDappyOnMarket = async (dappyID, id, name, dna, listingPrice) => {
    console.log(`list dappy`)
    const dappyPrice = parseFloat(listingPrice).toFixed(2).toString()
    const dappyID_int = parseInt(dappyID);
    if (listingPrice == "") {
      alert("Please provide a listing price")
      return
    }
    dispatch({type: "LOADING"})
    if (runningTxs) {
      alert("Transactions are still running. Please wait for them to finish first.")
      return
    }
    try {
      let res = await mutate({
        cadence: LIST_DAPPY_ON_MARKET,
        limit: 300,
        args: (arg, t) => [
          arg(dappyID_int, t.UInt64),
          arg(id, t.UInt32),
          arg(name, t.String),
          arg(dna, t.String),
          arg(dappyPrice, t.UFix64),
        ],
      })
      addTx(res);
      await tx(res).onceSealed()
      setListingPrice("")
      console.log("Success!")
      dispatch({type: "SUCCESS"})
      fetchUserDappies()
    } catch(error) {
      console.log(`Error: ${error}`)
      dispatch({type: "ERROR"})
    }
  };

  const removeDappyFromMarket = async () => {
   console.log(`remove dappy`)
  };

  const buyDappyOnMarket = async () => {
    console.log(`buy dappy`)
  };


  return {
    ...state,
    buyDappyOnMarket,
    removeDappyFromMarket,
    listDappyOnMarket,
    updatePrice,
    listingPrice,
  };
}