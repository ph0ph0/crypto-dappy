import React from "react";
import { useEffect } from "react";

import DappyList from "../components/DappyList";
import Header from "../components/Header";
import ErrorLoadingRenderer from "../components/ErrorLoadingRenderer";

import { useMarketContext } from "../providers/MarketProvider";
import { usePolling } from "../hooks/use-polling.hook";




export default function Market() {
  const {
    loadingMarketDappies,
    loadingUnlistedDappies,
    error,
    marketDappies,
    unlistedDappies,
    fetchMarketDappies,
  } = useMarketContext();

  useEffect(() => {
    fetchMarketDappies();
  }, [fetchMarketDappies]);

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
