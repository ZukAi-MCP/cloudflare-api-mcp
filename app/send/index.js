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
var toUnit = require('lib/convert').toUnit;


module.exports = function(el) {
    var selectedFiat = '';
    var defaultFiat = 'USD';

    var ractive = new Ractive({
        el: el,
        template: require('./index.ract'),
        data: {
            currencies: [],
            selectedFiat: defaultFiat,
            exchangeRates: {},
            qrScannerAvailable: qrcode.isScanAvailable,
            isEthereum: false,
            validating: false,
            gasLimit: '',
            selectedDonation: { name: 'None', address: '' },
            orgList: [],
            selectedCoupon: { Name: 'None', Address: '', Location: '', Date: '' },
            couponList: [],
            storeAmount: '',
            emptyWalletToggle: false,
            underscoreToSpace: function(str) {
                let retstr = '';
                for (let i = 0; i < str.length; i++) {
                    retstr += (str[i] == '_' ? ' ' : str[i]);
                }
                return retstr;
            },
            beautifyDate: function(date) {
                return date.substring(0, 10) + ' ' + date.substring(10);
            } 
        }
    })

    emitter.on('prefill-wallet', function(address, context) {
        if (context !== 'send') return;
        ractive.set('to', address)
    })

    emitter.on('prefill-value', function(value, context) {
        if (context !== 'send') return;
        ractive.find('#bitcoin').value = value;
        ractive.fire('bitcoin-to-fiat')
    })

    ractive.on('before-show', function() {
        ractive.set('isEthereum', getTokenNetwork() === 'ethereum');
    });

    ractive.on('open-qr', function() {
        qrcode.scan({ context: 'send' });
    })

    ractive.on('open-geo', function() {
        var data = {
            overlay: 'geo',
            context: 'send'
        }
        emitter.emit('open-overlay', data)
    })

    emitter.on('header-fiat-changed', function(currency) {
        ractive.set('selectedFiat', currency)
    })

    ractive.on('open-send', function() {
        ractive.set('validating', true);
        var to = ractive.get('to');
        resolveTo(to, function(data) {
            fixBitcoinCashAddress(data);
            getDynamicFees(function(dynamicFees) {
                console.log("data.to: " + data.to);
                console.log("d.alias: " + data.alias);
                console.log("dynfees: ");
                console.log(dynamicFees);
                validateAndShowConfirm(data.to, data.alias, dynamicFees, null);
            });
        })
    })

    ractive.on('empty-amount', function() {
        console.log('Trying to empty wallet!');
        var wallet = getWallet();
        var balance = toUnit(wallet.getBalance()).minus(1);// mínus einn og klára css hjá bjarka
        if(balance < 1){
            return;
        }
        else if(!ractive.get('emptyWalletToggle')){
            ractive.set('storeAmount', ractive.find('#bitcoin').value);
            ractive.find('#bitcoin').value = balance;
        } else {
            ractive.find('#bitcoin').value = ractive.get('storeAmount');
        }
        ractive.set('emptyWalletToggle', !ractive.get('emptyWalletToggle'));
    })

    emitter.on('wallet-ready', function() {
        var wallet = getWallet();
        ractive.set('denomination', wallet.denomination);
        ractive.set('gasLimit', wallet.gasLimit);
        ractive.set('orgList', wallet.getAllOrgLists());
        var defDon = { name: 'None', address: '' };
        ractive.set('selectedDonation', defDon);
        ractive.set('couponList', wallet.getCouponLists().Coupons);
        var defCoup = { Name: 'None', Address: '', Location: '', Date: '' };
        ractive.set('selectedCoupon', defCoup);
    });

    emitter.once('ticker', function(rates) {
        var currencies = Object.keys(rates);
        initPreferredCurrency(currencies);
        ractive.set('currencies', currencies);
        ractive.set('exchangeRates', rates);
        ractive.fire('bitcoin-to-fiat');

        emitter.on('ticker', function(rates) {
            var currencies = Object.keys(rates);
            if (currencies.indexOf(selectedFiat) === -1) {
                selectedFiat = defaultFiat;
                ractive.set('selectedFiat', selectedFiat);
            }
            ractive.set('currencies', currencies);
            ractive.set('exchangeRates', rates);
            ractive.fire('bitcoin-to-fiat');
        });
    })

    emitter.once('wallet-ready', function() {
        checkUrlForPrefill()
    })

    function initPreferredCurrency(currencies) {
        var systemInfo = db.get('systemInfo');
        selectedFiat = systemInfo.preferredCurrency;
        if (currencies.indexOf(selectedFiat) === -1) {
            selectedFiat = defaultFiat;
        }
        ractive.set('selectedFiat', selectedFiat);
        ractive.observe('selectedFiat', setPreferredCurrency)
    }

    ractive.on('fiat-to-bitcoin', function() {
        var fiat = ractive.find('#fiat').value;
        if (!fiat) return;

        var exchangeRate = ractive.get('exchangeRates')[ractive.get('selectedFiat')];
        var bitcoin = '0';
        if (exchangeRate) {
            bitcoin = new Big(fiat).div(exchangeRate).toFixed(8)
        }
        ractive.find('#bitcoin').value = bitcoin;
    })

    ractive.on('bitcoin-to-fiat', function() {
        var bitcoin = ractive.find('#bitcoin').value;
        if (!bitcoin) return;

        var exchangeRate = ractive.get('exchangeRates')[ractive.get('selectedFiat')];
        if (typeof exchangeRate !== 'number') return;

        var fiat = new Big(bitcoin).times(exchangeRate).toFixed(2);
        ractive.find('#fiat').value = fiat;
    })

    ractive.on('clearTo', function() {
        var passfield = ractive.find('#to')
        ractive.set('to', '')
        passfield.focus()
    })

    ractive.on('focusAmountInput', function(context) {
        context.node.parentNode.style.zIndex = 5000
    })

    ractive.on('blurAmountInput', function(context) {
        context.node.parentNode.style.zIndex = ''
    })

    ractive.on('help-gas-limit', function() {
        showTooltip({
            message: 'Gas limit is the amount of gas to send with your transaction. ' +
                'Increasing this number will not get your transaction confirmed faster. ' +
                'Sending ETH is equal 21000. Sending Tokens is equal around 200000.'
        })
    })

    ractive.on('donate-to-address', function() {
            var donation = ractive.get('selectedDonation');
            ractive.set('to', donation);
    })

    ractive.on('buy-coupon', function() {
            var coupon = ractive.get('selectedCoupon');
            ractive.set('validating', true);
            var to = coupon.Address
            resolveTo(to, function(data) {
                fixBitcoinCashAddress(data);
                getDynamicFees(function(dynamicFees) {
                    console.log("data.to: " + data.to);
                    console.log("d.alias: " + data.alias);
                    console.log("dynfees: ");
                    console.log(dynamicFees);
                    validateAndShowConfirm(data.to, data.alias, dynamicFees, coupon.Price);
                });
            })
    })

    ractive.on('donation-info', function() {
        var donAdd = ractive.get('selectedDonation');
        if (donAdd !== ''){
            var URL = 'https://services.smileyco.in/';
            var donURL = URL.concat(donAdd, '.html');
            ractive.set('infoURL', donURL);
        }
        else { 
            ractive.set('infoURL', undefined);
        }
    })

    function validateAndShowConfirm(to, alias, dynamicFees, amount) {
        if (amount != null) {
            emitter.emit('prefill-value', amount, 'send');
        }
        var amount = ractive.find('#bitcoin').value;
        var wallet = getWallet();
        //ractive.find('#bitcoin').value = 20000
        if (wallet.networkName === 'ethereum') {
            wallet.gasLimit = ractive.find('#gas-limit').value;
        }
        validateSend(wallet, to, amount, dynamicFees, function(err) {
            ractive.set('validating', false);
            if (err) {
                var interpolations = err.interpolations
                if (err.message.match(/trying to empty your wallet/)) {
                    ractive.find('#bitcoin').value = interpolations.sendableBalance;
                    return showInfo({ message: err.message, interpolations: interpolations })
                }
                return showError({ title: 'Uh Oh...', message: err.message, fee: err.fee, href: err.href, linkText: err.linkText, interpolations: interpolations })
            }

            showConfirmation({
                to: to,
                alias: alias,
                amount: ractive.find('#bitcoin').value, // don't change this to amount. 'value' could be modified above
                denomination: ractive.get('denomination'),
                dynamicFees: dynamicFees,
                onSuccessDismiss: function() {
                    ractive.set({ to: '' });
                    ractive.find('#bitcoin').value = '';
                    ractive.find('#fiat').value = '';
                }
            })
        })
    }

    function setPreferredCurrency(currency, old) {
        if (old === undefined) return; // when loading wallet

        emitter.emit('send-fiat-changed', currency)
        ractive.fire('bitcoin-to-fiat')
    }

    function fixBitcoinCashAddress(data) {
        if (getTokenNetwork() !== 'bitcoincash') return;
        try {
            var legacy = bchaddr.toLegacyAddress(data.to);
            if (legacy !== data.to) {
                data.alias = data.to;
                data.to = legacy;
            }
        } catch (e) {}
    }

    function checkUrlForPrefill() {
        var loc = window.location.search.substring(1)
        let obj = JSON.parse('{"' + decodeURI(loc).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}');
        console.log(obj);
        if (obj.address) {
            ractive.set('to', obj.address);
        }
    }
    return ractive
}
