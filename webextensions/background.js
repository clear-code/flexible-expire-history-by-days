/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

const ONE_DAY_IN_MSEC = 1000 * 60 * 60 * 24;

browser.storage.local.get("days").then(({ days = -1 } = {}) => {
  if (days == -1) {
    browser.runtime.sendMessage("import-legacy-pref").then(days => {
      if (days) {
        browser.storage.local.set(days);
      }
    });
  }
});

browser.idle.setDetectionInterval(180); // 3 minutes.
browser.idle.onStateChanged.addListener(async (idleState) => {
  if (!["idle", "locked"].includes(idleState)) {
    return;
  }

  await configs.$loaded;

  log('Handle idle event, configs = ', configs);

  switch (configs.frequency) {
    default:
    case FREQUENCY_EVERY_IDLE:
      break;

    case FREQUENCY_SESSION:
      if (gExpiredOnThisSession) {
        log('History is already expired on this session');
        return;
      }
      break;

    case FREQUENCY_DAILY:
      if (Date.now() - configs.lastExpired < ONE_DAY_IN_MSEC) {
        log('History is already expired in 24 hours');
        return;
      }
      break;
  }

  log('Ready to expire history');

  if (configs.days) {
    gExpiredOnThisSession = true;
    deleteHistory(configs.days)
    configs.lastExpired = Date.now();
    log('History is expired');
  }
});

/* Delete the browser history upto N days before
 */
function deleteHistory(days) {
    let endTime = new Date();
    endTime.setHours(0);
    endTime.setMinutes(0);
    endTime.setSeconds(0);
    endTime.setMilliseconds(0);
    endTime.setDate(endTime.getDate() - days);
    browser.history.deleteRange({ startTime: 0, endTime });
}
