<?php
/**
 * WordpressAuthenticator.php
 *
 * Copyright 2003-2013, Moxiecode Systems AB, All rights reserved.
 */

$mcOldCWD = getcwd();
chdir(MCMANAGER_ABSPATH . "../../../../../wp-admin/");
require_once("admin.php");
chdir($mcOldCWD);

/**
 * This class handles WordPress Blog platform
 */
class MOXMAN_WordpressAuthenticator_Plugin implements MOXMAN_Auth_IAuthenticator {
	public function authenticate(MOXMAN_Auth_User $user) {
		return user_can_richedit();
	}
}

MOXMAN::getAuthManager()->add("WordpressAuthenticator", new MOXMAN_WordpressAuthenticator_Plugin());
?>