/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

"use strict";

browser.storage.local.get("days").then(({ days = -1 } = {}) => {
  if (days == -1) {
    browser.runtime.sendMessage("import-legacy-pref").then(days => {
      if (days) {
        browser.storage.local.set(days);
      }
    });
  }
});

const FREQUENCY_EVERY_IDLE = 0;
const FREQUENCY_DAILY      = 1;
const FREQUENCY_SESSION    = 2;

const ONE_DAY_IN_MSEC = 1000 * 60 * 60 * 24;

let gExpiredOnThisSession = false;
let lastExpired           = 0;

browser.idle.setDetectionInterval(180); // 3 minutes.
browser.idle.onStateChanged.addListener(async (idleState) => {
  if (!["idle", "locked"].includes(idleState)) {
    return;
  }

  const configs = await browser.storage.local.get({
    frequency: FREQUENCY_EVERY_IDLE,
    logging:   false,
    lastExpired
  });

  if (configs.logging)
    console.log('Handle idle event, configs = ', configs);

  switch (configs.frequency) {
    default:
    case FREQUENCY_EVERY_IDLE:
      break;

    case FREQUENCY_SESSION:
      if (gExpiredOnThisSession) {
        if (configs.logging)
          console.log('History is already expired on this session');
        return;
      }
      break;

    case FREQUENCY_DAILY:
      if (Date.now() - configs.lastExpired < ONE_DAY_IN_MSEC) {
        if (configs.logging)
          console.log('History is already expired in 24 hours');
        return;
      }
      break;
  }

  if (configs.logging)
    console.log('Ready to expire history');

  browser.storage.local.get("days").then(({ days = 1 } = {}) => {
    if (days) {
      let endTime = new Date();
      endTime.setHours(0);
      endTime.setMinutes(0);
      endTime.setSeconds(0);
      endTime.setMilliseconds(0);
      endTime.setDate(endTime.getDate() - days);
      browser.history.deleteRange({ startTime: 0, endTime });
      gExpiredOnThisSession = true;
      browser.storage.local.set({ lastExpired: Date.now() });
      if (configs.logging)
        console.log('History is expired');
    }
  });
});
