import { useEffect, useReducer, useState, useRef } from "react";
import { mutate, query, tx } from "@onflow/fcl";
import { useTxs } from "../providers/TxProvider";
import { marketDappyReducer } from "../reducer/marketDappyReducer";
import { generateDappies } from "../utils/dappies.utils";
import { LIST_DAPPY_ON_MARKET } from "../flow/market/list-dappy-on-market.tx";
import DappyClass from "../utils/DappyClass";
import { CHECK_RESOURCES } from "../flow/check-resources.script";

export default function useMarketDappy() {
  const [state, dispatch] = useReducer(marketDappyReducer, {
    loading: false,
    error: false,
    marketDappies: [],
    unlistedDappies: [],
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
    serialNumber,
    templateID,
    name,
    dna,
    price
  ) => {
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
      // Update dappy market!
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  };

  const removeDappyFromMarket = () => {
    console.log(`Remove dappy`);
  };

  const buyDappyOnMarket = () => {
    console.log(`Buy dappy on market`);
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
