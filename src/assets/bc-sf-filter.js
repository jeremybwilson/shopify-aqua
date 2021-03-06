// Override Settings : Note, custom object can't be overriden and requires direct modification
var bcSfFilterSettings = {
    general: {
       limit: bcSfFilterConfig.custom.products_per_page,
        // Optional
        loadProductFirst: true,
        refineByHorizontalPosition: 'top'
    },
    selector: {
        products: '#product-loop'
    }
};
window.displayed_product_ids = [];

// FILTER TEMPLATES
var bcSfFilterTemplate = {

    // Grid Template
    'productGridItemHtml':  '<div id="{{itemProductId}}" class="product-index {{itemGridWidthClass}}" data-alpha="{{itemTitle}}" data-price="{{itemPriceAttr}}">' +
                                '<div class="prod-container">' +
                                    '{{itemBadge}}' +
                                    '<div class="prod-image">' +
                                        '<a href="{{itemUrl}}" title="{{itemTitle}}">' +
                                        '<div class="reveal">' +
                                            '<img id="product-image-{{itemProductId}}" src="{{itemThumbUrl}}" alt="{{itemTitle}}" />' +
                                            '{{itemFlipImage}}' +
                                        '</div>' +
                                    '</div>' +
                                '</div>' +

                                '<div class="product-info">' +
                                    '{{itemQuickview}}' +
                                    '<a class="product-title-wrap" href="{{itemUrl}}"> ' +
                                        '{{itemVendor}}' +
                                        '<h3 class="product-title">{{itemTitle}}</h3>' +
                                    '</a>' +
                                    '{{wishlistButton}}' +
                                    '<div id="pr-CategorySnippet-{{itemProductId}}" class="pr-CategorySnippet-cls"></div>' + 
                                    '<div class="product-price-wrap bfx-price">{{itemPrice}}</div>' +
                                    '{{itemSwatch}}' +
                                    '{{itemPersistentNote}}'+
                                '</div>' +
                            '</div>',

    // Badge Template
    'itemBadgeHtml': '<div class="react-badge" data-badge=\'{{badgeTags}}\'></div>',

    // Note Template
    'itemNoteHtml': '<h4 class="persistent-note">{{noteMsg}}</h4>',

    // Wishlist Heart Template
    'wishlistBtnHtml': '<button class="button-wishlist-product" data-on-wishlist="false" data-product-id="{{itemProductId}}" data-variant-id="{{itemVaraintId}}" aria-label="Wishlist Button">' +
        '<svg version="1.1" xmlns="https://www.w3.org/2000/svg" viewBox="0 0 64 60.833">' +
            '<path stroke="#000" stroke-width="5" stroke-miterlimit="10" d="M45.684,2.654c-6.057,0-11.27,4.927-13.684,10.073 c-2.417-5.145-7.63-10.073-13.687-10.073c-8.349,0-15.125,6.776-15.125,15.127c0,16.983,17.134,21.438,28.812,38.231 c11.038-16.688,28.811-21.787,28.811-38.231C60.811,9.431,54.033,2.654,45.684,2.654z"></path>' +
        '</svg>' +
    '</button>',

    // Pagination Template
    'previousHtml': '<a href="{{itemUrl}}" aria-label="Previous Page"><i class="fa fa-angle-left" aria-hidden="true"></i></a>',
    'nextHtml': '<a href="{{itemUrl}}" aria-label="Next Page"><i class="fa fa-angle-right" aria-hidden="true"></i></a>',
    'pageItemHtml': '<a href="{{itemUrl}}" aria-label="{{itemTitle}}">{{itemTitle}}</a>',
    'pageItemSelectedHtml': '<span class="current">{{itemTitle}}</span>',
    'pageItemRemainHtml': '{{itemTitle}}',
    'paginateHtml': '<span class="count"></span>{{previous}}{{pageItems}}{{next}}',
  
    // Sorting Template
    'sortingHtml': '<h4 class="sort-label">' + bcSfFilterConfig.label.sorting + '</h4><select class="styled-select" aria-label="Select Sort">{{sortingItems}}</select>',

    // Apply Btn Template (Mobile) : Filter constructor not exposed, so func binding close not available, hence this sad click..
    'mobileApplyBtnHtml': '<button class="mobile-apply-button" onClick="$(\'#bc-sf-filter-tree-mobile-button\').click()">Apply</button>'
};



BCSfFilter.prototype.buildProductGridItem = function(data, index, totalProduct) {
    /*** Prepare data ***/
    var images = data.images_info;
    
    // Displaying price base on the policy of Shopify, have to multiple by 100
    var soldOut = !data.available; // Check a product is out of stock
    var onSale = data.compare_at_price_min > data.price_min; // Check a product is on sale
    var priceVaries = data.price_min != data.price_max; // Check a product has many prices
    
    // Get First Variant (selected_or_first_available_variant)
    var firstVariant = data['variants'][0];
    if (getParam('variant') !== null && getParam('variant') != '') {
        var paramVariant = data.variants.filter(function(e) { return e.id == getParam('variant'); });
        if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0];
    
    } else {
        for (var i = 0; i < data['variants'].length; i++) {
            if (data['variants'][i].available) {
                firstVariant = data['variants'][i];
                break;
            }
        }
    }
    /*** End Prepare data ***/
  

    // TEMPLATE : Create unique tpl instance
    var itemHtml = bcSfFilterTemplate.productGridItemHtml;


    // CSS GRID : Add itemGridWidthClass to match row config
    var itemGridWidthClass = '';
    switch (bcSfFilterConfig.custom.products_per_row) {
        case 2: itemGridWidthClass = 'desktop-6 tablet-3 mobile-half'; break;
        case 3: itemGridWidthClass = 'desktop-4 tablet-2 mobile-half'; break;
        case 4: itemGridWidthClass = 'desktop-3 tablet-2 mobile-half'; break;
        default: break;
    }
    itemHtml = itemHtml.replace(/{{itemGridWidthClass}}/g, itemGridWidthClass);


    // BADGE : ITEM TYPE : Add Item Badge (Required Tags : item_badge_text_SOMETHING + item_badge_shape_SOMETHING)
    if ( data.tags ) {
        var findTag = function(searchString) {
            var foundTags = data.tags.filter( function( tag ) {
                return tag.indexOf( searchString ) >= 0; 
            });

            return foundTags || [];
        };

        // POPULATE : Build array of tags with only the ones we want
        var badgeTags = findTag( 'item_badge_' );
        if ( badgeTags.length > 0 ) {

            // RENDER : Drop populated badge template into itemHtml template
            var itemBadgeHtml = bcSfFilterTemplate.itemBadgeHtml; //Don't modify original :)
            itemBadgeHtml = itemBadgeHtml.replace( /{{badgeTags}}/g, JSON.stringify( badgeTags ) );
            itemHtml = itemHtml.replace( /{{itemBadge}}/g, itemBadgeHtml );
        
        } else {
            itemHtml = itemHtml.replace(/{{itemBadge}}/g, '' ); //No badge, remove block
        }
    }


    // THUMBNAIL : Add Thumbnail template
    var itemThumbUrl = images.length > 0 ? this.optimizeImage(images[0]['src']) : bcSfFilterConfig.general.no_image_url;
    itemHtml = itemHtml.replace(/{{itemThumbUrl}}/g, itemThumbUrl);
    

    // IMAGE : FLIP : Add Flip Image if enabled
    var itemFlipImageHtml = '';
    if (bcSfFilterConfig.custom.image_flip && images.length > 1) {
        itemFlipImageHtml = '<div class="hidden">';
        itemFlipImageHtml += '<img src="' + this.optimizeImage(images[1]['src']) + '" alt="{{itemTitle}}" />';
        itemFlipImageHtml += '</div>';
    }
    itemHtml = itemHtml.replace(/{{itemFlipImage}}/g, itemFlipImageHtml);


    // VENDOR : Display vendor if enabled
    var itemVendorHtml = bcSfFilterConfig.custom.vendor_enable ? bcSfFilterTemplate.vendorHtml.replace(/{{itemVendorLabel}}/g, data.vendor) : '';
    itemHtml = itemHtml.replace(/{{itemVendor}}/g, itemVendorHtml);


    // WISHLIST BUTTON : Add wishlist button to grid item (Needs ID, so fill this before "{{itemProductId}}" )
    itemHtml = itemHtml.replace(/{{wishlistButton}}/g, bcSfFilterTemplate.wishlistBtnHtml);


    // PRICE : CONFIG : Add price and original price if discounted
    var itemPriceHtml = '';
    var showRange = true;  // RANGE : Show "from $10 - $1,000" type displays for range pricing
    var showCents = false;  // CENTS : show the ".00" on a price
    var showSales = true;   // SALE : Show red strike through and discount price 

    // FORMAT : CENTS : Remove cents if `showCents` === false
    var formatPrice = function( price ) {
        if ( showCents ) {
            return price;
        } else {
            return price.replace( /\.[0-9]{2}/, '' );
        }  
    }

    // FORMAT : RANGE : Builds a range of price for min / max passed in
    var formatRange = function( minPrice, maxPrice, isSale ) {
        var fromPriceLabel = bcSfFilterConfig.label.from_price; //Not used but left for if they change mind
        var minClasses = "range-min-price";
        if ( isSale ) {
            minClasses += " onsale";
        }
        return '<div class="' + minClasses + '">' + minPrice + '</div> - <div class="range-max-price">' + maxPrice + '</div>';
    };


    // PRICE : VALUES : Store min value for reusable reference
    var minPrice = formatPrice( this.formatMoney(data.price_min, this.moneyFormat) );
    var maxPrice = formatPrice( this.formatMoney(data.price_max, this.moneyFormat) );

    // PRICE : SALE : Build sale priced item template
    if ( onSale ) {
        var compareAtPrice = formatPrice( this.formatMoney(data.compare_at_price_min, this.moneyFormat) );

        // RANGE : Multiple price points on this product
        if ( priceVaries && showRange ) {
            itemPriceHtml += formatRange( minPrice, maxPrice, false ); // Aqua doesn't want red sale price on ranges, set to false

        // SINGLE : Sale Price is only price
        } else {
            itemPriceHtml += '<div class="onsale">' + minPrice + '</div><div class="was">' + compareAtPrice + '</div>';
        }
        
    // PRICE : FULL : Build regularly priced item template
    } else {

        // RANGE : Prices vary and show range is enabled
        if ( priceVaries && showRange ) {
            itemPriceHtml += formatRange( minPrice, maxPrice, false );
        
        // SINGLE : Show single price point
        } else {
            itemPriceHtml += '<div class="prod-price">' + minPrice + '</div>';
        }
    }
    // PDM-868 : Patch for mobile Safari regex bug
    var itemPriceRegEx = new RegExp( '{{itemPrice}}', 'g'); 
    itemHtml = itemHtml.replace(itemPriceRegEx, function(match) { return itemPriceHtml }); 

    // QUICK VIEW : Add quickview template and setup for fancybox usage
    var itemQuickviewHtml = '';
    if (bcSfFilterConfig.custom.quick_view_enable) {
        itemQuickviewHtml += '<a class="fancybox.ajax product-modal product-quickview" href="{{itemUrl}}?view=quick">' + bcSfFilterConfig.label.quick_view + '</a>';
    }
    itemHtml = itemHtml.replace(/{{itemQuickview}}/g, itemQuickviewHtml);


    // SWATCHES : Build data object for usage in react-swatches
    itemHtml = itemHtml.replace(/{{itemProductId}}/g, data.id ); //Splice in product ID
    var itemSwatchHtml = '';
    if (bcSfFilterConfig.custom.alternate_colors) {
        var optionIndex = data.options_with_values.findIndex(function(e) { return (e.name).toLowerCase() == 'color' || (e.name).toLowerCase() == 'colour'; });
        var options = data.options_with_values.filter(function(e) { return (e.name).toLowerCase() == 'color' || (e.name).toLowerCase() == 'colour'; });

        // BUILD SWATCHES : React -> SwatchParent.js : render swatches if multiple colors
        if (typeof options[0] !== 'undefined' && options[0]['values'] && options[0]['values'].length > 1 ) {
            var swatchManifest = [];

            // MANIFEST : LOOP : Build Swatch List for the Swatch Component to Display
            for ( var k = 0; k < options[0]['values'].length; k++ ) {
                var option = options[0]['values'][k]; //One color in the list of variant colors

                // PRODUCT IMAGE : Parent image that is displayed by default (used by hover states to reset)
                var productImgUrl = images.length > 0 ? this.optimizeImage(images[0]['src']) : bcSfFilterConfig.general.no_image_url;
                
                // VARIANT IMAGE : Build Variant Product Image URL for hover display of that color's image
                var imageIndex = option['image'] - 1; //Doesn't count from 0, counts from 1
                var variantImgUrl = '';
                if (typeof data['images'][imageIndex] !== 'undefined') {
                    variantImgUrl = this.optimizeImage(data['images'][imageIndex]['src']);
                }

                // SKU : EXACT (for Swatch URL) : Try to use color name to ensure we grab the matching sku
                var sku = data.skus.find( function( sku ) {
                    return sku.indexOf( option[ 'title' ] ) > -1;
                });

                // SKU : FALLBACK (For Swatch URL) : If no match, use first sku. All color variant skus use same base ID it looks like
                if ( !sku ) {
                    sku = data.skus[0];
                }
                var skuId = sku.split( '-' )[0];


                // SWATCH IMAGE : Build swatch image, fallback to color setting in case that fails
                var colorName = this.slugify( option['title'] ).replace( /-/gi, '_' ); //Replace slug dash for _ to support photo studio tool format
                var swatchFileName = skuId + '_' + colorName + '_sw.gif';
                var swatchImgUrl = bcSfFilterConfig.general.file_url.replace( 'swatch_url_source_do_not_remove.png', swatchFileName.toLowerCase() );

                // SWATCH OBJ: Single swatch object for manifest
                var colorValueName = this.slugify( option['title'] );
                var swatch = {
                    colorDisplayName: option['title'],          // NAME : Color Name that user sees in tooltip
                    colorValueName: colorValueName,             // NAME : CSS name for color style fallback
                    productId: data.id,                         // ID : Product ID
                    productImgUrl: productImgUrl,               // IMAGE : Product image original (for restoring after hover)
                    swatchId: data.id + '-' + colorValueName,   // ID : Swatch : Swatch Color Unique ID
                    swatchImgUrl: swatchImgUrl,                 // SWATCH : Image url for swatch (fallback = name as color)    
                    variantImgUrl: variantImgUrl                // IMAGE : Product Variant Image for that color option
                }

                // MANIFEST : ADD : Add this swatch to the list
                swatchManifest.push( swatch );
            };

            // POPULATE : Render the react root element for each swatch list
            var swatchManifestString = JSON.stringify( swatchManifest );
            itemSwatchHtml = "<div class='react-swatch-list' data-swatches='" + swatchManifestString + "'></div>";
        
        // BUILD : Spacer : Only 1 color, render spacer instead of swatch list
        } else {
            itemSwatchHtml = "<div class='swatch-spacer'></div>";
        }
    }
    itemHtml = itemHtml.replace(/{{itemSwatch}}/g, itemSwatchHtml);

    // PERSISTENT NOTE

    if ( data.tags ) {
        var findTag = function(searchString) {
            var foundTags = data.tags.filter( function( tag ) {
                return tag.indexOf( searchString ) >= 0; 
            });

            return foundTags || [];
        };

        // POPULATE : Build array of tags with only the ones we want
        var noteTag = findTag( 'persistent_note_' );
        if ( noteTag.length > 0 ) {            

            noteTag = noteTag[0].replace('persistent_note_','');

            // RENDER : Drop populated note template into itemHtml template
            var itemNoteHtml = bcSfFilterTemplate.itemNoteHtml; //Don't modify original :)
            itemNoteHtml = itemNoteHtml.replace( /{{noteMsg}}/g, noteTag );
            itemHtml = itemHtml.replace( /{{itemPersistentNote}}/g, itemNoteHtml );
        
        } else {
            itemHtml = itemHtml.replace(/{{itemPersistentNote}}/g, '' ); //No tag, remove block
        }
    }
    


    // INFO : Add main attributes for product data
    itemHtml = itemHtml.replace(/{{itemPriceAttr}}/g, data.price_min);
    itemHtml = itemHtml.replace(/{{itemId}}/g, data.id);
    itemHtml = itemHtml.replace(/{{itemVaraintId}}/g, firstVariant.id);
    itemHtml = itemHtml.replace(/{{itemTitle}}/g, data.title);
    itemHtml = itemHtml.replace(/{{itemHandle}}/g, data.handle);
    itemHtml = itemHtml.replace(/{{itemUrl}}/g, this.buildProductItemUrl(data));


    // RENDER : Return out our built template!
    displayed_product_ids.push(data.id);
    // window.total_display_product = window.total_display_product+1;
    return itemHtml;
}

// Build Pagination
BCSfFilter.prototype.buildPagination = function(totalProduct) {
    // Get page info
    /*
    //Power Review Changes Start
    window.display_product = true;
    setTimeout(() => {
        displayed_product_ids.forEach(function(item){
            if($('#pr-CategorySnippet-'+item).length > 0){
                POWERREVIEWS.display.render({
                api_key: 'e4e06efc-e430-40a3-8203-97a9f625df88',
                locale: 'en_US',
                merchant_group_id: '77397',
                merchant_id: '450247',
                page_id: item,
                components: {
                    CategorySnippet: 'pr-CategorySnippet-'+item
                }
                });
            }
        });
    }, 3000);
    //Power Review Changes End
    */
    var currentPage = parseInt(this.queryParams.page);
    var totalPage = Math.ceil(totalProduct / this.queryParams.limit);

    // If it has only one page, clear Pagination
    if (totalPage == 1) {
        jQ(this.selector.pagination).html('');
        return false;
    }

    if (this.getSettingValue('general.paginationType') == 'default') {
        var paginationHtml = bcSfFilterTemplate.paginateHtml;

        // Build Previous
        var previousHtml = (currentPage > 1) ? bcSfFilterTemplate.previousHtml : '';
        previousHtml = previousHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage - 1));
        paginationHtml = paginationHtml.replace(/{{previous}}/g, previousHtml);

        // Build Next
        var nextHtml = (currentPage < totalPage) ? bcSfFilterTemplate.nextHtml : '';
        nextHtml = nextHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, currentPage + 1));
        paginationHtml = paginationHtml.replace(/{{next}}/g, nextHtml);

        // Create page items array
        var beforeCurrentPageArr = [];
        for (var iBefore = currentPage - 1; iBefore > currentPage - 3 && iBefore > 0; iBefore--) {
            beforeCurrentPageArr.unshift(iBefore);
        }
        if (currentPage - 4 > 0) {
            beforeCurrentPageArr.unshift('...');
        }
        if (currentPage - 4 >= 0) {
            beforeCurrentPageArr.unshift(1);
        }
        beforeCurrentPageArr.push(currentPage);

        var afterCurrentPageArr = [];
        for (var iAfter = currentPage + 1; iAfter < currentPage + 3 && iAfter <= totalPage; iAfter++) {
            afterCurrentPageArr.push(iAfter);
        }
        if (currentPage + 3 < totalPage) {
            afterCurrentPageArr.push('...');
        }
        if (currentPage + 3 <= totalPage) {
            afterCurrentPageArr.push(totalPage);
        }

        // Build page items
        var pageItemsHtml = '';
        var pageArr = beforeCurrentPageArr.concat(afterCurrentPageArr);
        for (var iPage in pageArr) {
            if (pageArr[iPage] == '...') {
                pageItemsHtml += bcSfFilterTemplate.pageItemRemainHtml;
            } else {
                pageItemsHtml += (pageArr[iPage] == currentPage) ? bcSfFilterTemplate.pageItemSelectedHtml : bcSfFilterTemplate.pageItemHtml;
            }
            pageItemsHtml = pageItemsHtml.replace(/{{itemTitle}}/g, pageArr[iPage]);
            pageItemsHtml = pageItemsHtml.replace(/{{itemUrl}}/g, this.buildToolbarLink('page', currentPage, pageArr[iPage]));
        }
        paginationHtml = paginationHtml.replace(/{{pageItems}}/g, pageItemsHtml);

        jQ(this.selector.pagination).html(paginationHtml);
    }
};

// Build Sorting
BCSfFilter.prototype.buildFilterSorting = function() {
    if (bcSfFilterTemplate.hasOwnProperty('sortingHtml')) {
        jQ(this.selector.topSorting).html('');

        var sortingArr = this.getSortingList();
        if (sortingArr) {
            // Build content 
            var sortingItemsHtml = '';
            for (var k in sortingArr) {
                sortingItemsHtml += '<option value="' + k +'">' + sortingArr[k] + '</option>';
            }
            var html = bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g, sortingItemsHtml);
            jQ(this.selector.topSorting).html(html);

            // Set current value
            jQ(this.selector.topSorting + ' select').val(this.queryParams.sort);
        }
    }
};

// Build additional attributes of product items
BCSfFilter.prototype.buildExtrasProductList = function(data) {
    
    // THE ONE IN THEME.JS SEEMS TO ACTUALLY DO SOMETHING, 
    // NOT SURE WHAT THIS IS DOING AS NOTHING BROKE COMMENTING IT OUT..
    
    // if ($(window).width() >= 769) {
    //     $('.prod-container').hover(function(){ 
    //         $(this).children('.product-modal').show();
    //     }, function(){ 
    //         $(this).children('.product-modal').hide(); 
    //     })

    //     // Call Fancybox for product modal + stop scroll to top 
    //     $('.product-modal').fancybox({
    //         helpers: {
    //             overlay: {
    //                 locked: false
    //             }
    //         }
    //     });    
    // }
};

// Build Additional Elements
BCSfFilter.prototype.buildAdditionalElements = function(data, eventType) {

    var ui = {
        filterHeaderText: '.bc-sf-filter-block-title span', // Text for filter headers, appending the count here
        filterSetWraps: '.bc-sf-filter-option-block-list',  //Generated by filter js, DON'T store jq dom references here
        filterTreeWrap: '#bc-sf-filter-tree',
        filterWrap: '.filter-wrap-desktop',
        resultsCount: 'results-count', // Using innerHTML, lack of # intentional
        selectedInputs: 'input.selected'
    };

    // RESULTS COUNT : Render number of results in current collection 
    var resultsDiv = document.getElementById( ui.resultsCount ) || {};
    resultsDiv.innerHTML = data.total_product + " Results";


    // Build number of products (BoostCommerce Code)
    var from = this.queryParams.page == 1 ? this.queryParams.page : (this.queryParams.page - 1) * this.queryParams.limit + 1;
    var to = from + data.products.length - 1;
    jQ(this.selector.bottomPagination).find('.count').html(bcSfFilterConfig.label.showing_items + ' ' + from + '-' + to + ' ' +  bcSfFilterConfig.label.pagination_of + ' ' + data.total_product);


    // APPLY (MOBILE) : Filters apply on selection, "Apply" closes menu on moble.  
    var filterTreeWrap = $( ui.filterTreeWrap );
    if ( filterTreeWrap ) {
        filterTreeWrap.append( bcSfFilterTemplate.mobileApplyBtnHtml );
    }

    // HIDE 1 OPTION FILTERS : Do not show filters with one option, app doesn't seem to handle this right
    var filterData = {};
    if ( data.filter ) {
        filterData = window.filter = data.filter; //Update filter data with latest from API
    
    // Fallback, only initial API calls have filter data since its for the whole set of paginated data.
    } else {
        filterData = window.filter;
    }
    // HIDE : 'activeFilters' builds array of populated filters with 2+ props
    var filters =  filterData && filterData.options ? filterData.options : [];
    var activeFilters = filters.filter( function( obj ) {
        return obj.status === 'active' && obj.values && obj.values.length > 1
    });

    // TOTAL : Add data attr to determine number of filters present currently (so ipad can adjust)
    var filterWrap = $( ui.filterWrap );
    if ( filterWrap.length > 0 ) {
        visibleFilters = activeFilters.filter( function( filter ) {
            return filter.values && filter.values.length > 1;
        });
        filterWrap.attr( 'data-total-filter-count', visibleFilters.length );
    }


    // SWATCH FILTERS : These are the color filters, the filter app is incorrectly building the urls!
    // EX: background-image: url(//cdn.shopify.com/s/files/1/0061/8532/0512/files/swatch_url_source_do_not_remove.pngcolor_tags-black.png?v=111111);
    var filterSwatches = $( '.bc-sf-filter-option-swatch-image' );
    if ( filterSwatches.length > 0 ) {

        // ITERATE : Read filter swatches in filter set
        for ( var i in filterSwatches ) {

            // SWATCH CHECK : Swatch has style obj, check its bg image url and clean its bug
            if ( filterSwatches[i] && filterSwatches[i].style ) {
                var bgUrl = filterSwatches[i].style.backgroundImage;
                
                // CLEAN : Remove misplaced file name rev from filter app
                if ( bgUrl && bgUrl.length > 0 ) {
                    var cleanBgUrl = bgUrl.replace( 'swatch_url_source_do_not_remove.png', '' );
                    filterSwatches[i].style.backgroundImage = cleanBgUrl;
                }
            }
            
        }
    }

    // FILTER SELECTION COUNTS : Indicates how many filters in each set are selected
    var updateFilterCounts = function() {
        
        // SETS : If we have them, find the selected items in each and set a data-attr for the current count
        var filterSets = $( ui.filterSetWraps ) || [];
        var hasSelections = false;

        // SELECTED : Calculate which filters have selections to display an indicator
        filterSets.each( function() {
            var selections = $(this).find( ui.selectedInputs ) || [];

            // COUNT : If selections, count & store to data-selected-filter-count prop
            if ( selections.length > 0 ) {
                hasSelections = true;
                $(this).attr( 'data-selected-filter-count', selections.length ); //SET : Parent Set Wrapper block, used by 'clear' button styles
                $(this).find( ui.filterHeaderText ).attr( 'data-selected-filter-count', selections.length ); // SET : Actual Span so CSS can read value to show
            }

            // PURGE : Remove any filter with only one value available
            var id = this.dataset.id;
            var hasMultipleValues = activeFilters.find( function(active) {
                return id && id === active.filterOptionId;
            });
            if ( !hasMultipleValues ) {
                $(this).remove(); // Removal means border setups on ":first-child" still behave properly
            }
        });

        // BUTTONS : ARRANGEMENT : Indicator to tel how to style "apply" button to sit with "Clear All", which admittedly had to be a bit strangely wired
        hasSelections ? ( 
            $( ui.filterTreeWrap ).addClass( 'selections-active' ) // Selections present
        ) : ( 
            $( ui.filterTreeWrap ).removeClass( 'selections-active' ) // No selections present
        );
    }
    updateFilterCounts(); //Invoke count update on filter update


    // SWATCHES : Trigger event emit to re-render swatches
    $.event.trigger({
        type: "collectionUpdated",
        time: new Date()
    });
};


// Build Default layout
function buildDefaultLink(a,b){var c=window.location.href.split("?")[0];return c+="?"+a+"="+b}BCSfFilter.prototype.buildDefaultElements=function(a){if(bcSfFilterConfig.general.hasOwnProperty("collection_count")&&jQ("#bc-sf-filter-bottom-pagination").length>0){var b=bcSfFilterConfig.general.collection_count,c=parseInt(this.queryParams.page),d=Math.ceil(b/this.queryParams.limit);if(1==d)return jQ(this.selector.pagination).html(""),!1;if("default"==this.getSettingValue("general.paginationType")){var e=bcSfFilterTemplate.paginateHtml,f="";f=c>1?bcSfFilterTemplate.hasOwnProperty("previousActiveHtml")?bcSfFilterTemplate.previousActiveHtml:bcSfFilterTemplate.previousHtml:bcSfFilterTemplate.hasOwnProperty("previousDisabledHtml")?bcSfFilterTemplate.previousDisabledHtml:"",f=f.replace(/{{itemUrl}}/g,buildDefaultLink("page",c-1)),e=e.replace(/{{previous}}/g,f);var g="";g=c<d?bcSfFilterTemplate.hasOwnProperty("nextActiveHtml")?bcSfFilterTemplate.nextActiveHtml:bcSfFilterTemplate.nextHtml:bcSfFilterTemplate.hasOwnProperty("nextDisabledHtml")?bcSfFilterTemplate.nextDisabledHtml:"",g=g.replace(/{{itemUrl}}/g,buildDefaultLink("page",c+1)),e=e.replace(/{{next}}/g,g);for(var h=[],i=c-1;i>c-3&&i>0;i--)h.unshift(i);c-4>0&&h.unshift("..."),c-4>=0&&h.unshift(1),h.push(c);for(var j=[],k=c+1;k<c+3&&k<=d;k++)j.push(k);c+3<d&&j.push("..."),c+3<=d&&j.push(d);for(var l="",m=h.concat(j),n=0;n<m.length;n++)"..."==m[n]?l+=bcSfFilterTemplate.pageItemRemainHtml:l+=m[n]==c?bcSfFilterTemplate.pageItemSelectedHtml:bcSfFilterTemplate.pageItemHtml,l=l.replace(/{{itemTitle}}/g,m[n]),l=l.replace(/{{itemUrl}}/g,buildDefaultLink("page",m[n]));e=e.replace(/{{pageItems}}/g,l),jQ(this.selector.pagination).html(e)}}if(bcSfFilterTemplate.hasOwnProperty("sortingHtml")&&jQ(this.selector.topSorting).length>0){jQ(this.selector.topSorting).html("");var o=this.getSortingList();if(o){var p="";for(var q in o)p+='<option value="'+q+'">'+o[q]+"</option>";var r=bcSfFilterTemplate.sortingHtml.replace(/{{sortingItems}}/g,p);jQ(this.selector.topSorting).html(r);var s=void 0!==this.queryParams.sort_by?this.queryParams.sort_by:this.defaultSorting;jQ(this.selector.topSorting+" select").val(s),jQ(this.selector.topSorting+" select").change(function(a){window.location.href=buildDefaultLink("sort_by",jQ(this).val())})}}};


// Customize data to suit the data of Shopify API
BCSfFilter.prototype.prepareProductData = function(data) {
    for (var k = 0; k < data.length; k++) {
        data[k]['images'] = data[k]['images_info'];
        if (data[k]['images'].length > 0) {
            data[k]['featured_image'] = data[k]['images'][0]
        } else {
            data[k]['featured_image'] = {
                src: bcSfFilterConfig.general.no_image_url,
                width: '',
                height: '',
                aspect_ratio: 0
            }
        }
        data[k]['url'] = '/products/' + data[k].handle;
        
        var optionsArr = [];
        for (var i = 0; i < data[k]['options_with_values'].length; i++) { 
            optionsArr.push(data[k]['options_with_values'][i]['name']) 
        } 

        data[k]['options'] = optionsArr;

        data[k]['price_min'] *= 100, 
        data[k]['price_max'] *= 100, 
        data[k]['compare_at_price_min'] *= 100, 
        data[k]['compare_at_price_max'] *= 100;

        data[k]['price'] = data[k]['price_min'];
        data[k]['compare_at_price'] = data[k]['compare_at_price_min'];
        data[k]['price_varies'] = data[k]['price_min'] != data[k]['price_max'];
        
        var firstVariant = data[k]['variants'][0];
        if (getParam('variant') !== null && getParam('variant') != '') { 
            var variantArr = data.variants ? data.variants : data[k]['variants']; //MODIFIED : This was breaking collection when ?variant=### query params were in url
            var paramVariant = variantArr.filter(
                function(e) { 
                    return e.id == getParam('variant') 
                }
            ); 

            if (typeof paramVariant[0] !== 'undefined') firstVariant = paramVariant[0] 
        } else { 
            for (var i = 0; i < data[k]['variants'].length; i++) { 
                if (data[k]['variants'][i].available) { 
                    firstVariant = data[k]['variants'][i]; 
                    break 
                } 
            } 
        } 

        data[k]['selected_or_first_available_variant'] = firstVariant;
        for (var i = 0; i < data[k]['variants'].length; i++) { 
            var variantOptionArr = []; 
            var count = 1; 
            var variant = data[k]['variants'][i]; 
            var variantOptions = variant['merged_options']; 
            if (Array.isArray(variantOptions)) { 
                for (var j = 0; j < variantOptions.length; j++) { 
                    var temp = variantOptions[j].split(':');
                    data[k]['variants'][i]['option' + (parseInt(j) + 1)] = temp[1];
                    data[k]['variants'][i]['option_' + temp[0]] = temp[1];
                    variantOptionArr.push(temp[1]) 
                } 
                data[k]['variants'][i]['options'] = variantOptionArr 
            } 

            data[k]['variants'][i]['compare_at_price'] = parseFloat(data[k]['variants'][i]['compare_at_price']) * 100;
            data[k]['variants'][i]['price'] = parseFloat(data[k]['variants'][i]['price']) * 100 
        } 

        data[k]['description'] = data[k]['content'] = data[k]['body_html']
    }
    return data;
};
