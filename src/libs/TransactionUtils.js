import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import DateUtils from './DateUtils';
import * as NumberUtils from './NumberUtils';
import * as CollectionUtils from './CollectionUtils';

const allTransactions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    callback: (transaction, key) => {
        if (!key || !transaction) {
            return;
        }

        const transactionID = CollectionUtils.extractCollectionItemID(key);
        allTransactions[transactionID] = transaction;
    },
});

/**
 * Optimistically generate a transaction.
 *
 * @param {Number} amount – in cents
 * @param {String} currency
 * @param {String} reportID
 * @param {String} [comment]
 * @param {String} [source]
 * @param {String} [originalTransactionID]
 * @param {String} [merchant]
 * @returns {Object}
 */
function buildOptimisticTransaction(amount, currency, reportID, comment = '', source = '', originalTransactionID = '', merchant = CONST.REPORT.TYPE.IOU) {
    // transactionIDs are random, positive, 64-bit numeric strings.
    // Because JS can only handle 53-bit numbers, transactionIDs are strings in the front-end (just like reportActionID)
    const transactionID = NumberUtils.rand64();

    const commentJSON = {comment};
    if (source) {
        commentJSON.source = source;
    }
    if (originalTransactionID) {
        commentJSON.originalTransactionID = originalTransactionID;
    }

    return {
        transactionID,
        amount,
        currency,
        reportID,
        comment: commentJSON,
        merchant,
        created: DateUtils.getDBTime(),
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}

/**
 * Retrieve the particular transaction object given its ID.
 *
 * @param {String} transactionID
 * @returns {Object}
 */
function getTransaction(transactionID) {
    return lodashGet(allTransactions, [transactionID], {});
}

export default {
    buildOptimisticTransaction,
    getTransaction,
};
