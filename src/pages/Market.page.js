import React from "react";

import DappyList from "../components/DappyList";
import Header from "../components/Header";
import ErrorLoadingRenderer from "../components/ErrorLoadingRenderer";

import useMarket from "../hooks/use-market.hook"

import { useUser } from '../providers/UserProvider';

export default function Market() {

  const {
    loadingMarketDappies,
    loadingUnlistedDappies,
    error,
    marketDappies,
    unlistedDappies,
  } = useMarket();

  const { userDappies, loading } = useUser();


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
      <ErrorLoadingRenderer loading={loading} error={error}>
        <DappyList dappies={userDappies} market />
      </ErrorLoadingRenderer>
      <hr className="app__hr"></hr>
      <h4 className="app__subheader">Dappies on the Market</h4>
      <ErrorLoadingRenderer loading={loading} error={error}>
        <DappyList dappies={marketDappies} listed market />
      </ErrorLoadingRenderer>
    </>
  );
}
