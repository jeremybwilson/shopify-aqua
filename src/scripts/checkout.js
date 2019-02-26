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
		const sailthruApiEndpoint = 'https://api.sailthru.com/user';
    
    // UI : Elements for the UI interaction
    const ui = {
			formId:       $( '.edit_checkout' ),
			emailInput:   $( '#checkout_email_or_phone' ),
			firstNameBox: $( '#checkout_shipping_address_first_name' ),
			lastNameBox:  $( '#checkout_shipping_address_last_name' )
		};


		// SAFETY : Ensure form is present
		if ( ui.formId ) {

			// SUBMIT : submit form event
			ui.formId.submit(function(e) {
			  e.preventDefault();  // prevent form submission until Sailthru API returns success or error response

			  $.ajax({
			    callback: callback,
			    url: sailthruApiEndpoint,
			    type: 'POST',
			    data: {
			      id: ui.emailInput.val(),
			      lists: {
			        "AQUA_Master_List"  : 1   // list to add user to (must exist in Sailthru account)
			        // "Anonymous"      : 0   // list to remove user from (must exist in Sailthru account)
			      },
			      vars: {
			        "first_name" : ui.firstNameBox.val(),   // pulls in the value of the first_name input field
			        "last_name" : ui.lastNameBox.val()      // pulls in the value of the last_name input field
			      }
			    },
			    dataType: 'json',
			    success: function(){
			      console.log(`Successfully added new user to Sailthru list!`);
			      e.target.submit();
			    },
			    // error: function(xhr, error){
			    error: function(xhr, error) {  // error state
			      console.log(`We encountered an issue signing you up. Please try again`);
			      console.log(xhr); console.log(error);
			      debugger;
			    }
			  });
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
	bolCheckout.SailThruCheckout();
};



/*============================================================================
  READY : Wait for DOM ready and then fire initalizer
==============================================================================*/
$(bolCheckout.init);
