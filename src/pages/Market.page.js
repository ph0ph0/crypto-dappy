import React from "react";
import { useEffect, useRef } from "react";

import DappyList from "../components/DappyList";
import Header from "../components/Header";
import ErrorLoadingRenderer from "../components/ErrorLoadingRenderer";

import { useUser } from "../providers/UserProvider";
import { usePolling, useX } from "../hooks/use-polling.hook";

import axios from "axios";
import useDappyMarket from "../hooks/use-dappy-market.hook";

export default function Market() {
  const { userDappies } = useUser()
  const {
    loadingMarketDappies,
    loadingUnlistedDappies,
    error,
    marketDappies,
    unlistedDappies,
    fetchMarketDappies,
  } = useDappyMarket(userDappies);

  useEffect(() => {
    fetchMarketDappies();
  }, []);
  // usePolling(fetchMarketDappies, 6000)

  return (
    <>
      <Header
        title={
          <>
            <span className="highlight">Market</span>Place
          </>
        }
        subtitle={
          <>
            Buy <span className="highlight">dappies</span> on the market andlist
            your own!
          </>
        }
      />
      <h4 className="app__subheader">Your Unlisted Dappies</h4>
      <ErrorLoadingRenderer loading={loadingUnlistedDappies} error={error}>
        {/* //   TODO: Remove below array functions on unlistedDappies */}
        <DappyList dappies={unlistedDappies} market />
      </ErrorLoadingRenderer>
      <hr className="app__hr"></hr>
      <h4 className="app__subheader">Dappies on the Market</h4>
      <ErrorLoadingRenderer loading={loadingMarketDappies} error={error}>
        <DappyList dappies={marketDappies} listed market />
      </ErrorLoadingRenderer>
    </>
  );
}
