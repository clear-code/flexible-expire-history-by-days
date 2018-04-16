/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const FREQUENCY_EVERY_IDLE = 0;
const FREQUENCY_DAILY      = 1;
const FREQUENCY_SESSION    = 2;

var configs;
var gExpiredOnThisSession = false;

function log(aMessage, ...aArgs) {
  if (!configs || !configs.logging)
    return;
  console.log('flexible-expire: ' + aMessage, ...aArgs);
};

configs = new Configs({
  days: 1,
  frequency: FREQUENCY_EVERY_IDLE,
  logging: false,
  lastExpired: 0,
});
