import React, { useEffect } from "react";

import DappyList from "../components/DappyList";
import Header from "../components/Header";
import ErrorLoadingRenderer from "../components/ErrorLoadingRenderer";

import useMarket from "../hooks/use-market.hook"

import { useUser } from '../providers/UserProvider';
import { useAuth } from "../providers/AuthProvider";
import {usePolling} from "../hooks/use-polling.hook"

export default function Market() {

  const {
    loadingMarketDappies,
    loadingUnlistedDappies,
    error,
    marketDappies,
    unlistedDappies,
    updateMarket
  } = useMarket();

  const { userDappies, loading, fetchUserDappies } = useUser();
  const { user } = useAuth()

  const loadMarket = async () => {
    if (!loading) {
      await updateMarket(user, userDappies)
    }
  }

  useEffect(() => {
    loadMarket()
    // eslint-disable-next-line
  }, [loading])

  // usePolling(fetchUserDappies, 6000)


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
