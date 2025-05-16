'use strict';

var Ractive = require('lib/ractive');
var Big = require('big.js');
var emitter = require('lib/emitter');
var db = require('lib/db');
var getWallet = require('lib/wallet').getWallet;
var getTokenNetwork = require('lib/token').getTokenNetwork;
var showError = require('widgets/modals/flash').showError;
var showInfo = require('widgets/modals/flash').showInfo;
var showConfirmation = require('widgets/modals/confirm-send');
var showTooltip = require('widgets/modals/tooltip');
var validateSend = require('lib/wallet').validateSend;
var getDynamicFees = require('lib/wallet').getDynamicFees;
var resolveTo = require('lib/openalias/xhr.js').resolveTo;
var qrcode = require('lib/qrcode');
var bchaddr = require('bchaddrjs');

var bitcoin = require('bitcoinjs-lib');

module.exports = function(el){
  var selectedFiat = '';
  var defaultFiat = 'USD';
  var network = getTokenNetwork();

  var ractive = new Ractive({
    el: el,
    template: require('./index.ract'),
    data: {
      votes: [],
      selectedVote: -1,
      feeUnspents: [],
      to: '',
      loadingTx: true,
      validating: false,
    }
  })

  emitter.on('prefill-wallet', function(address, context) {
    if (context !== 'send') return;
    ractive.set('to', address)
  })

  emitter.on('set-transactions', function(txs) {
    var votes = [];
    var fees = [];

    var wallet = getWallet();

    txs.forEach(function(tx) {
      tx.outs.forEach(function(output, vout) {
        if (wallet.unspents.some((x) => (x.vout === vout && x.txId == tx.id))) {
          if (tx.ins[0].sequence == 178) {
            votes.push({
              address: output.address,
              amount: output.amount/1e8,
              txid: tx.id,
              vout: vout
            });
          }

          else if (output.amount >= 1e8) {
            fees.push({
              address: output.address,
              amount: output.amount/1e8,
              txid: tx.id,
              vout: vout
            });
          }
        }
      });
    });

    network = getTokenNetwork();
    ractive.set('feeUnspents', fees);
    ractive.set('votes', votes);
    ractive.set('loadingTx', false);
  })

  emitter.on('sync', function() {
    ractive.set('transactions', [])
    ractive.set('loadingTx', true)
  })

  ractive.on('open-vote', function() {
    var wallet = getWallet();

    var selectedVote = ractive.get('selectedVote');
    var voteUnspent = ractive.get('votes')[selectedVote]

    var feeUnspent = ractive.get('feeUnspents')[0]

    var voteKey = wallet.getPrivateKeyForAddress(voteUnspent.address);
    var feeKey = wallet.getPrivateKeyForAddress(feeUnspent.address);

    network = getTokenNetwork();

    bitcoin.networks = _.merge(bitcoin.networks, {
      smileycoin: {
        dustThreshold: 0,
        dustSoftThreshold: 0,
        feePerKb: 100000
      }
    });

    var network = bitcoin.networks[network];
    var builder = new bitcoin.TransactionBuilder(network)

    builder.addInput(voteUnspent.txid, voteUnspent.vout, 179);
    builder.addInput(feeUnspent.txid, feeUnspent.vout);

    builder.addOutput(ractive.get('to'), voteUnspent.amount*1e8);

    if (feeUnspent.amount > 1) {
      builder.addOutput(feeUnspent.address, (feeUnspent.amount-1)*1e8);
    }

    builder.sign(0, voteKey);
    builder.sign(1, feeKey);

    console.log(builder.build().toHex());

    wallet.sendTx(builder.build(), function (err, historyTx) {
      console.log(historyTx);
    });
 
  })

  return ractive
}
