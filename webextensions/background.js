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

browser.idle.setDetectionInterval(180); // 3 minutes.
browser.idle.onStateChanged.addListener(idleState => {
  if (!["idle", "locked"].includes(idleState)) {
    return;
  }
  browser.storage.local.get("days").then(({ days = 0 } = {}) => {
    if (days) {
      let endTime = new Date();
      endTime.setHours(0);
      endTime.setMinutes(0);
      endTime.setSeconds(0);
      endTime.setMilliseconds(0);
      endTime.setDate(endTime.getDate() - days);
      browser.history.deleteRange({ startTime: 0, endTime });
    }
  });
});
