<?php
/*
Plugin Name: MN Yo-Yo Registration Add-On
Description: Registration customization for MN Yo-Yo (Uses Gravity Forms with PayPal)
Version: 2013.1
Author: justin@foell.org
*/

/**
 * Ladder has cost, except for Juniors
 * 1A + Open = same cost as either
 * Juniors can do 1A + Open for cost, or Ladder + Jr. Freestyle for free
 */

class MNYoYo_Registration {

	public function onInit() {
		//style sheet to hide certain elements
		wp_register_style( 'mnyoyo', plugins_url( 'mnyoyo.css', __FILE__ ) );
		wp_enqueue_style( 'mnyoyo' );
		
		//gravity forms custom dropdowns & save
		add_filter( 'gform_pre_render', array( $this, 'filterGFormPreRender' ) );
		add_filter( 'gform_validation', array( $this, 'filterGFormValidation' ) );
	}

	public function filterGFormPreRender( $form ) {		
		if( $form['cssClass'] == 'mnyoyo-registration' )
		{
			//die('<pre>' . print_r($form, true));
			
			//queue the custom form mods
			wp_register_script( 'mnyoyo', plugins_url( 'mnyoyo.js', __FILE__) , array( 'jquery' ) );
			add_action( 'wp_footer', array( $this, 'onFooter' ) );
			
			//relies on parameter name being set
			foreach( $form['fields'] as &$field ) {
				//custom age list
				if( $field['inputName'] == 'mnyoyo_age' ) {
					//Creating drop down item array, with a blank default
					$items = array( array( 'text' => 'Select Age', 'value' => '0' ) );
					for ( $i = 1; $i < 100; $i++ ) {
						$items[] = array( 'text' => $i,
										  'value' => $i );
					}
				
					$field['type'] = 'select';
					$field['choices'] = $items;				
				}
			}
		}
 
		return $form;
	}

	public function filterGFormValidation( $data ) {
		if ( $data['is_valid'] )
			return $data;

		$others_failed = false;
		foreach ( $data['form']['fields'] as &$field ) {
			if( $field['inputName'] == 'mnyoyo_age' &&
			    $_REQUEST['input_' . $field['id']] == '0' ) {
					$field['failed_validation'] = true;
					$field['validation_message'] = 'This field is required.';
					$others_failed = true;
			} else if( $field['cssClass'] == 'mnyoyo-options' ) {
				//hack to bypass validation due to checksum violations from changing the pricing
				if( $field['validation_message'] == 'Invalid selection. Please select one of the available choices.' ) {
					$field['failed_validation'] = false;
					unset($field['validation_message']);
				} else {
					$others_failed = true;
				}
			} else {
				if( $field['failed_validation'] )
					$others_failed = true;
			}			
		}
		if ( !$others_failed )
			$data['is_valid'] = true;
		//file_put_contents('/tmp/form.txt', print_r($_REQUEST, true) . print_r($data, true));
		return $data;
	}

	public function onFooter() {
		wp_print_scripts( 'mnyoyo' );
	}
}

$mnyoyo = new MNYoYo_Registration();
add_action( 'init', array( $mnyoyo, 'onInit' ) );