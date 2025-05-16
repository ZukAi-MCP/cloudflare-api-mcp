'use strict';

var Ractive = require('lib/ractive')
var emitter = require('lib/emitter')
var CS = require('lib/wallet')

module.exports = function(el){
  var ractive = new Ractive({
    el: el,
    template: require('./index.ract'),
    data: {
      // address: '',
      // ip: '',
      // date: '',
      get_perks_show: false,
      isPhonegap: process.env.BUILD_TYPE === 'phonegap'
    }
  })


  // Not needed when all the things below are not implemented
  emitter.on('wallet-ready', function(){
    // ractive.set('address', getAddress())
    // getIP()
    // ractive.set('date', getDate())
    ractive.set('nextAddress', "wallet:"+CS.getWallet().getNextAddress());
  })

  ractive.on('get-smly-from-faucet', function(){
    ractive.set('validatingFaucet', true);
    CS.getCoinsFromFaucet();
    setTimeout(function(){
      ractive.set('validatingFaucet', false);
    }, 9000)
  })

  /*
  // Not needed unless we want to display address in html
  function getAddress(){
    return "wallet:" + CS.getWallet().getNextAddress()
  }
  */

  /*
  // Not needed unless we want to use date for some checks later
  function getDate(){
    return "date:" + new Date().getTime();
  }
  */

  /*
  // Not needed unless we want to use ip for some identifying later
  function getIP() {
    jQuery.getJSON('https://api.ipify.org?format=json', function(data){
      ractive.set('ip', "ip:"+data.ip)
    });
  }
  */
  
  

  // just send the wallet address with the form, if perks is selected
  // Enable/Disable perk for donating. If enabled add wallet address to the forms. 
  ractive.on('perks-check', function(){

    ractive.set('get_perks_show', !ractive.get('get_perks_show'));

    var list = document.getElementsByClassName('donate_form_info');
    console.log(list);
    for (var n = 0; n < list.length; ++n) {
      if ( ractive.get('get_perks_show') === true) {
      list[n].value = ractive.get('nextAddress');
          console.log(list[n].value);
      } else {
        list[n].value = "";
      }
    }
  }); 

  return ractive
}
