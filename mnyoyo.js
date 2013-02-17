var mnYoYo;

(function($) {

mnYoYo = {

	//customize these for your form (currently 2013)
	ageCutoff : 14,
	idPrefix : 'choice_3_',
	idLadder : 2,
	id1A : 3,
	idOpen : 4,
	idJrFreestyle : 5,

	//don't touch anything below here
	ladderCost : 0,
	oneACost : 0,
	openCost : 0,
	ageId : '.mnyoyo-age select',
	oneAId : '',
	openId : '',
	jrId : '',
	ladderId : '',

	init : function() {
		//skip everything on the thank you 'page'
		if( $('[id^="gform_submit_button_"]') ) {
			this.setupVariables();
			this.attachListeners();

			//set up some stuff incase the form was invalidated
			this.onAgeChange($(this.ageId));
			this.onUpperDivisionChange( $(this.oneAId) );
			this.onUpperDivisionChange( $(this.openId) );
		}
	},

	setupVariables : function () {
		this.oneAId = this.getJqId( this.id1A );
		this.openId = this.getJqId( this.idOpen );
		this.jrId = this.getJqId( this.idJrFreestyle );
		this.ladderId = this.getJqId( this.idLadder );

		this.oneACost = this.getCost(this.oneAId);
		this.openCost = this.getCost(this.openId);
		this.ladderCost = this.getCost(this.ladderId);
	},

	getJqId : function( id ) {
		return '#' + this.idPrefix + id;
	},

	attachListeners : function() {
		var that = this;

		$(this.ageId).change(function() {
			that.onAgeChange($(this));
		});

		$(this.oneAId).change(function() {
			that.onUpperDivisionChange($(this));
		});

		$(this.openId).change(function() {
			that.onUpperDivisionChange($(this));
		});

		$(this.ladderId).change(function() {
			that.onLadderChange($(this));
		});

		$(this.jrId).change(function() {
			that.onJrFreestyleChange($(this));
		});
		
		$('[id^="gform_submit_button_"]').click(function() {
			$(that.ladderId).removeAttr('disabled');
			$(that.oneAId).removeAttr('disabled');			
			$(that.openId).removeAttr('disabled');	
			return true;
		});
	},

	onLadderChange : function ( jq_element ) {
		if ( jq_element.is(':checked') ) {
			$(this.oneAId).removeAttr('checked').attr('disabled', 'disabled');
			$(this.openId).removeAttr('checked').attr('disabled', 'disabled');
			if ( $(this.jrId).is(':checked') ) {
				this.setCost(this.idLadder, 0);
			}
		} else {
			$(this.oneAId).removeAttr('disabled');
			$(this.openId).removeAttr('disabled');
			//in 2012 juniors required ladder
			//$(this.jrId).removeAttr('checked');			
			this.setCost(this.idLadder, this.ladderCost);
		}
		this.calcTotal();
	},

	onAgeChange : function ( jq_element ) {
		if ( jq_element.val() == 0 ) { //nothing selected
			$(this.oneAId).removeAttr('disabled').removeAttr('checked');
			$(this.openId).removeAttr('disabled').removeAttr('checked');
			$(this.ladderId).removeAttr('disabled').removeAttr('checked');
			$(this.jrId).removeAttr('disabled');
		} else if ( jq_element.val() < this.ageCutoff ) { //juniors
			//$(this.ladderId).attr('checked', 'checked').attr('disabled', 'disabled');
			$(this.oneAId).removeAttr('checked').attr('disabled', 'disabled');
			$(this.openId).removeAttr('checked').attr('disabled', 'disabled');
			$(this.ladderId).removeAttr('disabled');
			$(this.jrId).removeAttr('disabled');
		} else { //not junior
			$(this.oneAId).removeAttr('disabled');
			$(this.openId).removeAttr('disabled');
			$(this.jrId).removeAttr('checked').attr('disabled', 'disabled');
			this.setCost(this.idLadder, this.ladderCost);
			//$(this.ladderId).removeAttr('checked').removeAttr('disabled');
		}
		this.setCost(this.id1A, this.oneACost);
		this.setCost(this.idOpen, this.openCost);
		this.onLadderChange($(this.ladderId));
		this.calcTotal();
	},

	onJrFreestyleChange : function( jq_element ) {
		if(jq_element.is(':checked')) {
			this.setCost(this.idLadder, '0');
			//in 2012 ladder was required for all juniors
			//$(this.ladderId).attr('checked', 'checked');
		} else {
			this.setCost(this.idLadder, this.ladderCost);
		}
		//in 2012 ladder was required for all juniors
		//this.onLadderChange($(this.ladderId));
		this.calcTotal();
	},

	//recalculates the total and also redraws price changes
	calcTotal : function() {
		var form_id = $('.mnyoyo-registration').attr('id');
		gformCalculateTotalPrice(form_id.substring(6)); //just the id w/o 'gform_'
	},

	onUpperDivisionChange : function ( jq_element ) {
		var cost1A = this.getCost(this.oneAId),
			costOpen = this.getCost(this.openId);

		if ( jq_element.attr('id') == this.idPrefix + this.id1A )
			this.upperDivisionChange( this.id1A, this.idOpen, cost1A, costOpen, this.oneACost, this.openCost );
		else
			this.upperDivisionChange( this.idOpen, this.id1A, costOpen, cost1A, this.openCost, this.oneACost );

		this.calcTotal();
	},

	upperDivisionChange : function ( id1, id2, cost1, cost2, origCost1, origCost2 ) {
		var jq_id1 = this.getJqId(id1),
			jq_id2 = this.getJqId(id2);

		if ( ! $(jq_id1).is(':checked') && ! $(jq_id2).is(':checked') ) {
			$(this.ladderId).removeAttr('disabled');
			if ( $(this.ageId).val()  < this.ageCutoff )
				$(this.jrId).removeAttr('disabled');
		} else {
			$(this.ladderId).attr('disabled', 'disabled').removeAttr('checked');
			$(this.jrId).attr('disabled', 'disabled').removeAttr('checked');
		}

		if ( $(jq_id1).is(':checked') ) {
			if( $(jq_id2).is(':checked') )
				this.setCost( id1, '0' );
			else
				this.setCost( id2, '0' );
		} else {
			if( $(jq_id2).is(':checked') && cost2 != '0' ) {
					this.setCost( id1, '0' );
			} else {
				if( cost1 == '0' ) {
					this.setCost( id1, origCost2 );
				} else {
					this.setCost( id2, origCost1 );
					//some reset stuff
					if ( ! $(jq_id1).is(':checked') && ! $(jq_id2).is(':checked') )
						this.setCost( id1, origCost1 );
					else
						this.setCost( id1, '0' );
				}
			}
		}
	},
	
	setCost : function( id_num, value ) {
		var element = $(this.getJqId( id_num )),
			values = element.val().split('|');

		element.val(values[0] + '|' + value);
	},

	getCost : function( jq_id ) {
		var values = $(jq_id).val().split('|');

		return values[1];
	}
};

$(document).ready(function($){ mnYoYo.init(); });

})(jQuery);
