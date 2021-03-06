/*
 * BADGES : REACT
 *  - Displays a badge on the item's image (or whever you like really..)
 *
 * REQUIRED DATA:
 *  - Root EL(s) need 'data-badge' as stringified JSON array of swatch objects
 *  - Badge HTML Snippet for Usage:
 *      <div class="react-badge" data-badge='{{BADGE DATA ARRAY}}'></div>
 *
 *  - Badge Data Sample:
 *      [ 
 *          "item_badge_shape_diamond",
 *          "item_badge_color_#0FF0FF",
 *          "item_badge_text_BACK IN STOCK",
 *          "item_badge_bg_#999999",
 *          "item_badge_border_#000000"
 *      ]
 *********************************************/
const ReactDOM = require('../../vendor/react-dom.min.js');
const BadgeItem = require('./BadgeItem.js');
const BadgeIcon = require('./BadgeIcon.js');
var badgeData = []; // Top level so findTag() can use it also



// HELPER : Tag Finder
const findTag = (searchString) => {
  var foundTag = badgeData.find( function( tag ) {
    return tag.indexOf( searchString ) >= 0; 
  });
  return foundTag;
};


// HELPER : Builds Proper data object to pass to component
const prepData = () => {
  const badgeTextTag = findTag( 'item_badge_text_' );     // Required
  const badgeShapeTag = findTag( 'item_badge_shape_' );   // Optional, default is square
  const badgeColorTag = findTag( 'item_badge_color_' );   // Optional
  const badgeBgTag = findTag( 'item_badge_bg_' );         // Optional
  const badgeBorderTag = findTag( 'item_badge_border_' ); // Optional
  const badgeIconTag = findTag( 'item_badge_icon_' );     // Special badge: Makes all other options obsolete

  if (badgeIconTag) {
    return {
      icon: badgeIconTag.split('item_badge_icon_').slice(-1)[0],
      Component: BadgeIcon,
    }
  }

  // ADD BADGE : text tag content required
  if ( badgeTextTag ) {

    // MAP : Parse + Build needed info
    return {
      text : badgeTextTag.split( 'item_badge_text_' )[1],
      shape : badgeShapeTag ? badgeShapeTag.split( 'item_badge_shape_' )[1] : null,
      color : badgeColorTag ? badgeColorTag.split( 'item_badge_color_' )[1] : null,
      bg : badgeBgTag ? badgeBgTag.split( 'item_badge_bg_' )[1] : null,
      border: badgeBorderTag ? badgeBorderTag.split( 'item_badge_border_' )[1] : null,
      Component : BadgeItem,
    };
  

  // ERROR : Required badge data missing
  } else {
    return { 
      error: true,
      msg: 'The badge text is empty, please supply a tag in the format of "item_badge_text_MY TEXT".'
    }; 
  }
};



// BUILD : Parses Badge Data + Builds Component
var buildBadges = function() {
  const elements = document.getElementsByClassName('react-badge') || [];
  [...elements].forEach( el => {  //htmlCollection isn't a true array, use spread operator to convert

    // SAFETY : Ensure data exists
    if ( el.dataset && el.dataset.badge ) {


      // PARSE : Read + Pass data to component if valid JSON
      try {
        badgeData = JSON.parse(el.dataset.badge);

        // PREP : Build data for component render
        if ( badgeData.length > 0 ) {
          const preparedData = prepData();

          // BUILD : No errors, Render badge component
          if ( !preparedData.error ) {
            const { bg, border, color, text, shape, icon, Component } = preparedData;
            ReactDOM.render( <Component bg={bg} border={border} color={color} shape={shape} text={text} icon={icon} />, el );
          
          } else {
            console.log( preparedData.msg );
          }
        }


      // SAFETY : Malformatted JSON = most common error
      } catch (err) {
        console.log(`Badge Data malformed (JSON.parse failed), please check 'data-badge' prop on element.\n  >${err.message || err}`);
      }
    }

  });
}

module.exports = buildBadges;
