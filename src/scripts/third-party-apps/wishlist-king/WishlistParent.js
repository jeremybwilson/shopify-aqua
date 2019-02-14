
// INITIAL LIKE STATE : Update liked state of wishlist buttons for initial renders
const setWishlistState = function( el, productId ) {
  var wishlistObj = Appmate.wk.getProduct( productId );
  if ( wishlistObj && wishlistObj.in_wishlist ) {
      el.dataset.onWishlist = true;
  }
};


// ATTACH EVENT : Wireup wishlist king toggle code from here
const attachClickHandler = function( el, productId, variantId ) {
  $( el ).click( ( e ) => {
    var buttonEl = e.target;
    var isOnWishlist = buttonEl.dataset.onWishlist || false;

    // CHANGE STATE : reflect button change immediately, rectify if error happens
    buttonEl.dataset.onWishlist = !JSON.parse( isOnWishlist );

    Appmate.wk.toggleProduct( productId, variantId )
      .then( function( productData ){
        // Can do something with product data here like perhaps a 
      })
      .catch( function( err ) {

        // RESET BUTTON : Put back to original state
        buttonEl.dataset.onWishlist = JSON.parse( isOnWishlist );

        // LOG ERROR :
        const theError = err && err.message ? err.message : JSON.stringify( err );
        console.log( `Wishlist Error: ${theError}` );
      });
  });
};



// BUILD : Calls the various util methods to setup the button
const buildButtons = function() {
  const elements = document.getElementsByClassName( 'button-wishlist-product' ) || [];
  [...elements].forEach( el => {
    
    // SAFETY : Ensure product ID exists
    if ( el.dataset && el.dataset.productId ) {
      const productId = el.dataset.productId;
      const variantId = el.dataset.variantId || '';

      try {
        setWishlistState( el, productId );
        attachClickHandler( el, productId, variantId );

      // SAFETY : Malformatted JSON = most common error
      } catch (err) {
        console.log( `Error building wishlist buttons, error info:\n  >${err.message || err}` );
      }
    }

  });
}



// RENDER : Find all swatch elements and render a SwatchList in each element
var buildWishlistButtons = function() {

  // ENSURE : Wishlist script ready before using its' methods
  var startTime = new Date().getTime();
  var interval = setInterval( function(){
    const isTimeUp = new Date().getTime() - startTime > 3000;
    const appmateMissing = !Appmate || !Appmate.wk || !Appmate.wk.getProduct;

    // TIME CHECK : Wait for wishlist for 3 secs, if time is up skip the wishlist buttons
    if( isTimeUp ){
      console.log( "::: WishlistParent.js -- Wishlist app failed to load, skipping event bindings..." );
      clearInterval( interval );
      return;
    }

    // APPMATE CHECK : Is the wishlist app ready for us?
    if ( !appmateMissing ) {
      buildButtons();
      clearInterval( interval );
      return;
    }
  }, 200);

};

module.exports = buildWishlistButtons;