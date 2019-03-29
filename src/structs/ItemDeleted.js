/**
 * @module structs
 */

// TODO: ItemBinary should be able to merge with right (similar to other items). Or the other items (ItemJSON) should not be able to merge - extra byte + consistency

import { AbstractItem, AbstractItemRef } from './AbstractItem.js'
import * as encoding from 'lib0/encoding.js'
import * as decoding from 'lib0/decoding.js'
import { ID } from '../utils/ID.js' // eslint-disable-line
import { ItemType } from './ItemType.js' // eslint-disable-line
import { Y } from '../utils/Y.js' // eslint-disable-line
import { getItemCleanEnd, getItemCleanStart, getItemType } from '../utils/StructStore.js'

export const structDeletedRefNumber = 2

export class ItemDeleted extends AbstractItem {
  /**
   * @param {ID} id
   * @param {AbstractItem | null} left
   * @param {AbstractItem | null} right
   * @param {AbstractType} parent
   * @param {string | null} parentSub
   * @param {number} length
   */
  constructor (id, left, right, parent, parentSub, length) {
    super(id, left, right, parent, parentSub)
    this.length = length
  }
  /**
   * @param {ID} id
   * @param {AbstractItem | null} left
   * @param {AbstractItem | null} right
   * @param {AbstractType} parent
   * @param {string | null} parentSub
   */
  copy (id, left, right, parent, parentSub) {
    return new ItemDeleted(id, left, right, parent, parentSub, this.length)
  }
  /**
   * @param {encoding.Encoder} encoder
   */
  write (encoder) {
    super.write(encoder, structDeletedRefNumber)
    encoding.writeVarUint(encoder, this.length)
  }
}

export class ItemDeletedRef extends AbstractItemRef {
  /**
   * @param {decoding.Decoder} decoder
   * @param {number} info
   */
  constructor (decoder, info) {
    super(decoder, info)
    /**
     * @type {number}
     */
    this.length = decoding.readVarUint(decoder)
  }
  /**
   * @param {Transaction} transaction
   * @return {ItemDeleted}
   */
  toStruct (transaction) {
    const y = transaction.y
    const store = y.store
    return new ItemDeleted(
      this.id,
      this.left === null ? null : getItemCleanEnd(store, transaction, this.left),
      this.right === null ? null : getItemCleanStart(store, transaction, this.right),
      // @ts-ignore
      this.parent === null ? y.get(this.parentYKey) : getItemType(store, this.parent).type,
      this.parentSub,
      this.length
    )
  }
}
