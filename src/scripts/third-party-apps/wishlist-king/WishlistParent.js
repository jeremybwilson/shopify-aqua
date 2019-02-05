// RENDER : Find all swatch elements and render a SwatchList in each element
var buildWishlistButtons = function() {
  const elements = document.getElementsByClassName( 'button-wishlist-product' ) || [];
  [...elements].forEach( el => {
    
    // SAFETY : Ensure product ID exists
    if ( el.dataset && el.dataset.productId ) {
      const productId = el.dataset.productId;
      const variantId = el.dataset.variantId || '';


      // ATTACH EVENT : Wireup wishlist king toggle code from here
      try {

        $( el ).click( ( event ) => {
          var buttonEl = event.target;
          var isOnWishlist = buttonEl.dataset.onWishlist || false;

          // CHANGE STATE : reflect button change immediately, rectify if error happens
          buttonEl.dataset.onWishlist = !JSON.parse( isOnWishlist );

          Appmate.wk.toggleProduct( productId, variantId )
            .then( function( productData ){
              // Can do something with product data here if desired, just
              // don't change button state in here as it will appear slow
            })
            .catch( function( err ) {

              // RESET BUTTON : Put back to original state
              buttonEl.dataset.onWishlist = JSON.parse( isOnWishlist );

              // LOG ERROR :
              const theError = err && err.message ? err.message : JSON.stringify( err );
              console.log( `Wishlist Error: ${theError}` );
            });
        })
        
        

      // SAFETY : Malformatted JSON = most common error
      } catch (err) {
        console.log(`Error building wishlist buttons, error info:\n  >${err.message || err}`);
      }
    }
  });
};

module.exports = buildWishlistButtons;