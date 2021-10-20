import React, { createContext, useContext } from 'react'
import useMarket from "../hooks/use-market.hook";
import { useUser } from './UserProvider';
import { useAuth } from './AuthProvider';

const MarketContext = createContext()

export const MarketProvider = ({children}) => {
  const { userDappies, fetchUserDappies } = useUser();
  const { user } = useAuth();
  const {
    loadingMarketDappies,
    loadingUnlistedDappies,
    error,
    marketDappies,
    unlistedDappies,
    fetchMarketDappies,
    updateMarket,
  } = useMarket(user, userDappies, fetchUserDappies);

  return (
    <MarketContext.Provider value={{
        loadingMarketDappies,
        loadingUnlistedDappies,
        error,
        marketDappies,
        unlistedDappies,
        fetchMarketDappies,
        updateMarket,
    }}>
      {children}
    </MarketContext.Provider>
  )

}

export const useMarketContext = () => {
    return useContext(MarketContext)
  }