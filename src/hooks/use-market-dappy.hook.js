import { useReducer, useState } from "react";
import { marketDappyReducer } from "../reducer/marketDappyReducer";

export default function useMarketDappy(fetchUserDappies) {
  const [state, dispatch] = useReducer(marketDappyReducer, {
    loading: false,
    error: false,
    success: false
  });

  const [listingPrice, setListingPrice] = useState("");

  const updatePrice = (event) => {
    const re = /^[+-]?([0-9]+\.?[0-9]*|\.[0-9]+)$/;
    // if value is not blank, test the regex
    if (event.target.value === "" || re.test(event.target.value)) {
      console.log(`newPrice: ${event.target.value}`);
      setListingPrice(event.target.value);
    }
  };

  const listDappyOnMarket = async () => {
    console.log(`list dappy`)
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