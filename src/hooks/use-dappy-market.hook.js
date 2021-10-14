import { useEffect, useReducer, useState } from "react";
import { mutate, query, tx } from "@onflow/fcl";
import { useTxs } from "../providers/TxProvider";
import { marketDappyReducer } from "../reducer/marketDappyReducer";
import { generateDappies } from "../utils/dappies.utils";
import { LIST_DAPPY_ON_MARKET } from "../flow/market/list-dappy-on-market.tx";
import DappyClass from "../utils/DappyClass";
import { CHECK_RESOURCES } from "../flow/check-resources.script";
// TODO: REMOVE useAuth import
import { useAuth } from "../providers/AuthProvider";

export default function useDappyMarket() {
  const [state, dispatch] = useReducer(marketDappyReducer, {
    loading: false,
    error: false,
    marketDappies: [],
    unlistedDappies: [],
  });

  // TODO: REMOVE user hook call
  const { user } = useAuth;

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

  useEffect(() => {
    fetchDappies();
  }, []);

  const fetchDappies = async () => {
    dispatch({ type: "PROCESSING MARKETDAPPIES" });
    dispatch({ type: "PROCESSING UNLISTEDDAPPIES" });
    try {
      let res = generateDappies();
      let marketDappies = Object.values(res).map((d) => {
        return new DappyClass(d?.templateID, d?.dna, d?.name, d?.price);
      });
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

  const listDappyOnMarket = async (serialNumber, name, dna, price) => {
    const dappyPrice = parseFloat(price).toFixed(2).toString();
    const dappyID = parseInt(serialNumber);
    if (listingPrice == "") {
      alert("Please provide a listing price");
      return;
    }
    dispatch({ type: "PROCESSING MARKETDAPPIES" });
    dispatch({ type: "PROCESSING UNLISTEDDAPPIES" });
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
          arg(dappyID, t.UInt64),
          arg(name, t.String),
          arg(dna, t.String),
          arg(dappyPrice, t.UFix64),
        ],
      });
      addTx(res);
      await tx(res).onceSealed();
      setListingPrice("");
      console.log(`Success!`)
      // Update dappy market!
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  };

  const removeDappyFromMarket = () => {
    console.log(`Remove dappy`);
    fetchDappies();
  };

  const buyDappyOnMarket = () => {
    console.log(`Buy dappy on market`);
    fetchDappies();
  };

  return {
    ...state,
    listDappyOnMarket,
    removeDappyFromMarket,
    buyDappyOnMarket,
    updatePrice,
    listingPrice,
  };
}
