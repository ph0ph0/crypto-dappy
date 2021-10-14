import React from "react";

import DappyList from "../components/DappyList";
import Header from "../components/Header";
import ErrorLoadingRenderer from "../components/ErrorLoadingRenderer";
import useDappyMarket from "../hooks/use-dappy-market.hook";
import { useUser } from "../providers/UserProvider";
import {usePolling} from "../hooks/use-polling.hook"

export default function Market() {
  const {
    marketDappies,
    unlistedDappies,
    loadingMarketDappies,
    loadingUnlistedDappies,
    error,
  } = useDappyMarket();

  //   TODO: Remove after implementing useDappyMarket hook
  const { userDappies } = useUser();

  usePolling(() => {
    console.log("&&&Polling....")
  }, 3000)

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
        <DappyList dappies={userDappies} market />
      </ErrorLoadingRenderer>
      <hr className="app__hr"></hr>
      <h4 className="app__subheader">Dappies on the Market</h4>
      <ErrorLoadingRenderer loading={loadingMarketDappies} error={error}>
        <DappyList dappies={marketDappies} listed market />
      </ErrorLoadingRenderer>
    </>
  );
}
