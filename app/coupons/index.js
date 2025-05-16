'use strict';

var Ractive = require('lib/ractive')
var emitter = require('lib/emitter')
var toUnitString = require('lib/convert').toUnitString
var getTokenNetwork = require('lib/token').getTokenNetwork;
var getWallet = require('lib/wallet').getWallet
var strftime = require('strftime')
var showTransactionDetail = require('widgets/modals/transaction-detail')
var bitcoin = require('bitcoinjs-lib')

var jeeq = require('./jeeq.js')
var long_business_names = require('./businesses.json')

function txToDecrypted(tx) {
    var wallet = getWallet();

    var network = getTokenNetwork();
    bitcoin.networks = _.merge(bitcoin.networks, {
      smileycoin: {
        dustThreshold: 0,
        dustSoftThreshold: 0,
        feePerKb: 100000
      }
    });

    var network = bitcoin.networks[network];

    let n = findEncryptedOutput(tx)

    let encrypted_coupon = tx.outs[n].scriptPubKey.hex.slice(4)
    // pubkey/privkey of address where the transaction was sent
    let pair
    for (let i = 0; i < tx.outs.length; i++) {
        try {
            pair = wallet.getPrivateKeyForAddress(tx.outs[i].address);
            continue;
        } catch (error) {
        }
    }
    let dec = jeeq.decryptMessage(pair.d, pair.getPublicKeyBuffer(), Buffer.from(encrypted_coupon, 'hex'))
    let string = new TextDecoder().decode(dec);

    return {coupon: string, timestamp: tx.timestamp, confirmations: tx.confirmations};
}

// 6a49 is OP_RETURN, 6a6a0000 is the prefix for encrypted data
function findEncryptedOutput(tx) {
    return tx.outs.findIndex(out => out.scriptPubKey.hex.slice(0,12) === '6a496a6a0000')
}

function isDecryptedCoupon(obj) {
    return obj.coupon[0] == 'C';
}

// a coupon is on the from "COUP $SHORTNAME $COUPON_CODE" where
// short name is an abbrevation for the organization
function decryptedToCoupon(obj) {
    return {'business': obj.coupon.slice(1,4), 'code': obj.coupon.slice(4), 
            'timestamp': obj.timestamp, 'confirmations': obj.confirmations};
}

module.exports = function(el){
  var network = getTokenNetwork();
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract'),
    data: {
      coupons: [],
      formatTimestamp: function(timestamp){
        var date = new Date(timestamp)
        return strftime('%b %d %l:%M %p', date)
      },
      formatConfirmations: function(number){
        if (number === 1) {
          return number + ' confirmation'
        } else {
          return number + ' confirmations'
        }
      },
      isConfirmed: function(confirmations) {
        return confirmations >= getWallet().minConf;
      },
      getLongBusinessName: function(business) {
          return long_business_names[business]
      },
      toUnitString: toUnitString,
      loadingTx: true,
    }
  })

  emitter.on('append-transactions', newTxs => {
    newTxs.filter(tx => findEncryptedOutput(tx) != -1)
          .map(tx => txToDecrypted(tx, findEncryptedOutput(tx)))
          .filter(isDecryptedCoupon)
          .map(decryptedToCoupon)
          .forEach(coupon => ractive.unshift('coupons', coupon));
    ractive.set('loadingTx', false);
  })
  

  emitter.on('set-transactions', function(txs) {
    network = getTokenNetwork();
    // get all txs that have some encrypted outputs
    const encrypted_txs = txs.filter(tx => findEncryptedOutput(tx) != -1)
    // decrypt those txs but keep timestamp and confirmation number
    const decrypted_txs = encrypted_txs.map(tx => txToDecrypted(tx, findEncryptedOutput(tx)))
    // take those decrypted tx and check whether they are actually coupons, and if so 
    // parse them into a coupon object
    const coupons = decrypted_txs.filter(isDecryptedCoupon).map(decryptedToCoupon);
    ractive.set('coupons', coupons)
    ractive.set('loadingTx', false)
  })

  emitter.on('sync', function() {
    ractive.set('coupons', [])
    ractive.set('loadingTx', true)
  })

  return ractive
}

