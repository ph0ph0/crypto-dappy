import React from 'react'
import { useHistory } from 'react-router-dom'
import useMarketDappy from '../hooks/use-market-dappy.hook'

import { useUser } from '../providers/UserProvider'
import { useMarketContext } from '../providers/MarketProvider'
import Dappy from './Dappy'
import './DappyCard.css'

export default function DappyCard({ dappy, store, designer, listed, market}) {
  console.log(`DAPPY LOADING!!!!: ${dappy.dappyID}`)
  const { userDappies, mintDappy, fetchUserDappies } = useUser()
  const history = useHistory()
  const {updateMarket} = useMarketContext()
  const {buyDappyOnMarket, removeDappyFromMarket, listDappyOnMarket, updatePrice, listingPrice} = useMarketDappy(fetchUserDappies, updateMarket)
  const { id, dna, image, name, rarity, price, type, dappyID, listingResourceID, storefrontAddress } = dappy
  const owned = userDappies.some(d => parseInt(d?.dappyID) === parseInt(dappy?.dappyID))
  const purchasedTemplate = userDappies.some(d => d?.id === dappy?.id)
  const ListOnMarketButton = () => (
    <div
      onClick={() => listDappyOnMarket(dappyID, id, name, dna, listingPrice)}
      className='btn btn-bordered btn-light btn-dappy'>
      <i className='ri-list-unordered btn-icon'></i>LIST 
    </div>
  )

  const RemoveFromMarketButton = () => (
    <div
      onClick={() => removeDappyFromMarket(listingResourceID)}
      className='btn btn-bordered btn-light btn-dappy'>
      <i className='ri-close-line btn-icon'></i>REMOVE
    </div>
  )

  const BuyFromMarketButton = () => (
    <div
      onClick={() => buyDappyOnMarket(listingResourceID, storefrontAddress)}
      className='btn btn-bordered btn-light btn-dappy'>
      <i className='ri-store-2-line btn-icon'></i>
      {parseInt(price)} FUSD
    </div>
  )

  const DappyButton = () => (
    <div
      onClick={() => mintDappy(id, price)}
      className='btn btn-bordered btn-light btn-dappy'>
      <i className='ri-shopping-cart-fill btn-icon'></i> {parseInt(price)} FUSD
    </div>
  )

  const PackButton = () => (
    <div
      onClick={() => history.push(`/packs/${id}`)}
      className='btn btn-bordered btn-light btn-dappy'>
      More
    </div>
  )

  const DesignerButton = () => (
    <div
      onClick={() => alert(`${dna} ${name}`)}
      className='btn btn-bordered btn-light btn-dappy'>
      <i className='ri-shopping-cart-fill btn-icon'></i> {parseInt(price)} FUSD
    </div>
  )

  return (
    <div className='dappy-card__border'>
      <div className={`dappy-card__wrapper ${purchasedTemplate && store && 'faded'}`}>
        {type === 'Dappy' ? <Dappy dna={dna} /> : 
          <img className={`dappy-card__image ${type === 'Pack' && 'img-large'}`} src={image} alt='Pack' />
        }
        <br />
        <h3 className='dappy-card__title'>{name}</h3>
        {!designer ? 
          <p className='dappy-card__info'> # {id} {purchasedTemplate && !store && ` / ${dappyID}`} </p>
         : <input className='dappy-card__info' value={dna} />
        }
        <p className='dappy-card__info'>{rarity}</p>
      </div>
      {market && owned && !listed &&  <input className='dappy-input__listing-price' placeholder='Price (FUSD)' value={listingPrice} onChange={updatePrice} ></input> }
      {designer ?  <DesignerButton /> : 
        <>
          {market && owned && !listed && <ListOnMarketButton />}
          {market && owned && listed && <RemoveFromMarketButton />}
          {market && !owned && <BuyFromMarketButton />}
          {!market && !purchasedTemplate && type === 'Dappy' && <DappyButton />}
          {!purchasedTemplate && type === 'Pack' && <PackButton />}
        </>
      }

      {store && purchasedTemplate && !designer && 
        <div className='collected'>Collected</div>
      }
    </div>
  )
}
