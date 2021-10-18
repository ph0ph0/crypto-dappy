import { COMMON, RARE, ULTRARARE } from "../config/dappies.config"
import { parseDNA } from "./dappies.utils"

class DappyClass {
  constructor(id, dna, name, price, dappyID, listingResourceID, storefrontAddress) {
    this.id = id
    this.dna = dna
    this.name = name
    this.price = price || 0
    this.dappyID = dappyID || 0
    this.listingResourceID = listingResourceID || 0
    this.storefrontAddress = storefrontAddress || 0
  }

  get rarity() {
    switch (parseDNA(this.dna).length - 1) {
      case COMMON.stripes:
        return `${COMMON.emoji} ${COMMON.name}`
      case RARE.stripes:
        return `${RARE.emoji} ${RARE.name}`
      case ULTRARARE.stripes:
        return `${ULTRARARE.emoji} ${ULTRARARE.name}`
      default:
        return "Invalid"
    }
  }

  get type() {
    return "Dappy"
  }
}

export default DappyClass

