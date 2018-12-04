const PropTypes = require( 'prop-types' );
const fetch = require( 'isomorphic-fetch' );
const ModalList = require( './ModalList.js' );
const ModalRemoved = require( './ModalRemoved.js' );

class DiscountModal extends React.Component {
	constructor( props ) {
		super( props );
		this.state = {
			disableButtons: false,
			showModal: false
		}

		this.addItemToCart = this.addItemToCart.bind( this );
		this.getDiscountById = this.getDiscountById.bind( this );
		this.handleSelection = this.handleSelection.bind( this );
		this.modalShowHide = this.modalShowHide.bind( this );
		this.onAddItemError = this.onAddItemError.bind( this );
		this.toggleButtonEnable = this.toggleButtonEnable.bind( this );
	}

	componentDidMount() {
		this.modalShowHide();
	}

	componentDidUpdate() {
		this.modalShowHide();
	}



	addItemToCart( discount ) {
		// SUCCESS : Callback for success handling
		const markUsedOnSuccess = () => {
			this.props.markDiscountUsed( discount.discountId );
			this.toggleButtonEnable( true ); // re-enable the UI buttons in case there are more items for user to add

			// The /Cart route page itself is a shitshow and doesn't play nice with the ajax cart, so lets just refresh it to reflect the added item
			if ( window.location.pathname.indexOf( '/cart' ) > -1 ) {
				window.location.reload();
			}
		};

		// ADD : Use API from ajax-cart.js.liquid to add item to cart!
		ShopifyAPI.addItemById( 
			discount.giftId, 		// Gift ID (must be a Variant ID)
			markUsedOnSuccess,		// Success Callback
			this.onAddItemError, 	// Error Callback
			true					// isGift Flag (adds note property to item so we can hide things like cart quantity modifiers)
		);
	}

	getDiscountById( discountId ) {
		const { discountsToApply } = this.props;
		return discountsToApply.find( rule => rule.discountId === discountId );
	}

	handleSelection( discountIds, addToCart = false ) {
		// ADD : If user clicked "Add to Cart"
		if ( addToCart ) {
			discountIds.forEach( discountId => {
				const discount = this.getDiscountById( discountId );
				this.addItemToCart( discount ); //Cart marks as used once added successfully
			});
		
		// NO THANKS : Mark discount as used
		} else {
			this.props.rejectDiscount( discountIds );
		}
	}

	modalShowHide() {
		const { discountsToApply, doNotShowAgain, removedDiscounts } = this.props;
		
		let showHide = !doNotShowAgain && ( discountsToApply.length > 0 || removedDiscounts.length > 0 ) ? true : false;
		if ( this.state.showModal !== showHide ) {
			this.setState({ showModal: showHide });
		}
	}

	onAddItemError( err ) {
		console.log( `Looks like adding to cart failed, error message:\n${JSON.stringify( err )}` );
		// TODO : Handle errors better here! -- Probably want to set up a message into the template that shows error message
	}

	toggleButtonEnable( passedValue ) {
		const newState = passedValue ? passedValue : !this.state.disableButtons;
		this.setState({
			disableButtons: newState
		});
	}



	render() {
		const {
			confirmRemoval,
			discountsToApply,
			removedDiscounts
		} = this.props;


		// CHECK : OFFER DISCOUNT : Do we have any discounts to offer the user?
		var modalList = null;
		if ( discountsToApply.length > 0 ) {
			modalList = (
				<ModalList 
					discountsToApply={ discountsToApply }
					handleSelection={ this.handleSelection }
					toggleButtonEnable={ this.toggleButtonEnable } />
			);
		}

		// CHECK : ALERT REMOVAL : Were any discounts removed for not meeting the requirements? 
		//		   (Hide if offering discounts at same time, subsequent render will kick us into here)
		var removedItems = null;
		if ( !modalList && removedDiscounts.length > 0 ) {
			removedItems = (
				<ModalRemoved
					confirmRemoval={ confirmRemoval }
					removedDiscounts={ removedDiscounts } />
			);
		}  

		//TODO : Add a div so the user can tap black area to close as well

		return (
			<div id="react-discount-modal" 
				data-component="DiscountModal" 
				className={ this.state.showModal ? 'show-modal' : '' }>

				<div id="react-discount-modal-content">
					
					{ modalList }
					{ removedItems }

					<div id="react-discount-do-not-show" 
						 onClick={ this.props.enableDoNotShowAgain }>Do not show deals again</div>
				</div>
			</div>
		);
	}
}

DiscountModal.propTypes = {
	cartTotal: PropTypes.number.isRequired,
	discountsToApply: PropTypes.array,
	doNotShowAgain: PropTypes.bool.isRequired,
	enableDoNotShowAgain: PropTypes.func.isRequired,
	markDiscountUsed: PropTypes.func.isRequired,
	rejectDiscount: PropTypes.func.isRequired,
	removedDiscounts: PropTypes.array
}

module.exports = DiscountModal;