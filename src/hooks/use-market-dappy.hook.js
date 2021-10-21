import { useEffect, useReducer, useState, useRef } from "react";
import { mutate, query, tx } from "@onflow/fcl";
import { useTxs } from "../providers/TxProvider";
import { marketDappyReducer } from "../reducer/marketDappyReducer";
import { generateDappies } from "../utils/dappies.utils";
import { LIST_DAPPY_ON_MARKET } from "../flow/market/list-dappy-on-market.tx";
import { REMOVE_DAPPY_FROM_MARKET } from "../flow/market/remove-dappy-from-market.tx";
import DappyClass from "../utils/DappyClass";
import { CHECK_RESOURCES } from "../flow/check-resources.script";
import { BUY_DAPPY_ON_MARKET } from "../flow/market/buy-dappy-on-market.tx";

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

  const listDappyOnMarket = async (
    dappyID,
    templateID,
    name,
    dna,
    price
  ) => {
    const dappyPrice = parseFloat(price).toFixed(2).toString();
    const dappyID_int = parseInt(dappyID);
    if (listingPrice == "") {
      alert("Please provide a listing price");
      return;
    }
    dispatch({ type: "LOADING" });
    if (runningTxs) {
      alert(
        "Transactions are still running. Please wait for them to finish first."
      );
      return;
    }
    try {
      let res = await mutate({
        cadence: LIST_DAPPY_ON_MARKET,
        limit: 300,
        args: (arg, t) => [
          arg(dappyID_int, t.UInt64),
          arg(templateID, t.UInt32),
          arg(name, t.String),
          arg(dna, t.String),
          arg(dappyPrice, t.UFix64),
        ],
      });
      addTx(res);
      await tx(res).onceSealed();
      setListingPrice("");
      console.log(`Success!`);
      dispatch({ type: "SUCCESS" });
      fetchUserDappies()
    } catch (error) {
      console.log(`Error: ${error}`);
      dispatch({ type: "ERROR" });
    }
  };

  const removeDappyFromMarket = async (listingResourceID) => {
    console.log(`Remove dappy`);
    // TODO: Update dappy state
    if (listingResourceID === 0) return;
    dispatch({ type: "LOADING" });
    try {
      let res = await mutate({
        cadence: REMOVE_DAPPY_FROM_MARKET,
        limit: 300,
        args: (arg, t) => [
          arg(listingResourceID, t.UInt64)
        ],
      });
      addTx(res);
      await tx(res).onceSealed();
      console.log(`Success!`);
      dispatch({ type: "SUCCESS" });
      fetchUserDappies()
    } catch (error) {
      console.log(`Error: ${error}`);
      dispatch({ type: "ERROR" });
    }
  };

  const buyDappyOnMarket = async (listingResourceID, storefrontAddress) => {
    console.log(`Buy dappy on market: ${listingResourceID}, storefrontAddress: ${storefrontAddress}`);
    // TODO: Update dappy state
    if (listingResourceID === 0) return;
    dispatch({ type: "LOADING" });
    try {
      let res = await mutate({
        cadence: BUY_DAPPY_ON_MARKET,
        limit: 300,
        args: (arg, t) => [
          arg(listingResourceID, t.UInt64),
          arg(storefrontAddress, t.Address)
        ],
      });
      addTx(res);
      await tx(res).onceSealed();
      console.log(`Success!`);
      dispatch({ type: "SUCCESS" });
      fetchUserDappies()
    } catch (error) {
      console.log(`Error: ${error}`);
      dispatch({ type: "ERROR" });
    }
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