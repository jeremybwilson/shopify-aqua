/* CHECKOUT CUSTOMIZATIONS : BOL
	  PURPOSE : To make customizations to the checkout experience

	  REQUIREMENTS :
	  	- Jquery added to layout/checkout.liquid (shoprunner needs, so prob already there)
*/

// IMPORT : Load in any modules you need here
const assignIn = require('lodash.assignin');


// GLOBAL : Setup our bolCheckout namespace for minimal footprint
window.bolCheckout = window.bolCheckout || {};


/*============================================================================
  SAIL THRU : Extra data piping for customer supporting analytics
==============================================================================*/
bolCheckout.SailThruCheckout = (function() {
  function SailThruCheckout() {
    const regexEmail = new RegExp(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/i);

    // UI : Elements for the UI interaction
    const ui = {
      formId:             $( '.edit_checkout' ),
      emailInput:         $( '#checkout_email' ),
      marketingCheckBox:  $( '#checkout_buyer_accepts_marketing' ),
      firstNameBox:       $( '#checkout_shipping_address_first_name' ),
      lastNameBox:        $( '#checkout_shipping_address_last_name' ),
      addressLine1:       $( '#checkout_shipping_address_address1'),
      addressLine2:       $( '#checkout_shipping_address_address2' ),
      city:               $( '#checkout_shipping_address_city' ),
      country:            $( '#checkout_shipping_address_country' ),
      state:              $( '#checkout_shipping_address_province' ),
      postalCode:         $( '#checkout_shipping_address_zip' )
    };

      // SAFETY : Ensure form is present
      if ( ui.formId ) {

        // SUBMIT : submit form event
        ui.formId.submit(function(e) {
          e.preventDefault();  // prevent form submission until Sailthru API returns success or error response

          // validation code
          let validEmail = regexEmail.test(ui.emailInput.val());
          let emailMarketingCheckbox = document.getElementById('checkout_buyer_accepts_marketing');

          if( validEmail && emailMarketingCheckbox.checked ) {

            Sailthru.integration("userSignUp",
            {
              "email" : ui.emailInput.val(),  // pulls in the value of the email text input
              "lists" : {
                "AQUA_Master_List" : 1 // list to add user to (must exist in Sailthru account)
                // "Anonymous" : 0 // list to remove user from (must exist in Sailthru account)
              },
              "vars" : {
                "first_name" : ui.firstNameBox.val(),   // pulls in the value of the first_name input field
                "last_name" : ui.lastNameBox.val(),      // pulls in the value of the last_name input field
                "address_1" : ui.addressLine1.val(),
                "address_2" : ui.addressLine2.val(),
                "city" : ui.city.val(),
                "country" : ui.country.val(),
                "state" : ui.state.val(),
                "zip" : ui.postalCode.val()
              },
              "source" : "checkout_flow",
              "onSuccess" : function() {
                // console.log(`Successfully added new user to Sailthru list!`);
                e.target.submit();

              },
              "onError" : function(error) {  // error state
                console.log(`We encountered an issue signing you up. Please try again`);
                console.log(error);
              }
            });

          } else {  // Allow checkout registration to continue without email and marketing checkbox to be checked

            e.target.submit();
          }

        });

      }
  }

  SailThruCheckout.prototype = assignIn({}, SailThruCheckout.prototype, {});
  return SailThruCheckout;
})();


/*============================================================================
  INITALIZER : Add all initalizers here
==============================================================================*/
bolCheckout.init = function() {
	// console.log( '::: DEBUG : [ bolCheckout.init() ] -- BOL Checkout Customization Initalized!' );
	//bolCheckout.SailThruCheckout();
};


/*============================================================================
  READY : Wait for DOM ready and then fire initalizer
==============================================================================*/
$(bolCheckout.init);
$(document).ready(function(){
  $('.order-summary-toggle').hide(); 
  $('div.order-summary').removeClass('order-summary--is-collapsed');
})