/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Places Maintenance Add-on.
 *
 * The Initial Developer of the Original Code is
 * Marco Bonardo <mak77@bonardo.net>.
 * Portions created by the Initial Developer are Copyright (C) 2011-2015
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s): ClearCode Inc. <info@clear-code.com>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */


////////////////////////////////////////////////////////////////////////////////
//// Constants.

const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;
const Cr = Components.results;

const PREF_BRANCH = "extensions.bonardonet.expire-history-by-days.";

const DAYS_PREF = PREF_BRANCH + "days";
const DISABLE_EXPIRATION_PREF = PREF_BRANCH + "disable_expiration";
const MIRROR_PREF = PREF_BRANCH + "max_pages_mirror";
const FREQUENCY_PREF = PREF_BRANCH + "frequency";

// Expire after 3 minutes of idle.
const IDLE_SECONDS = 180;

const FREQUENCY_EVERY_IDLE = 0;
const FREQUENCY_DAILY = 1;
const FREQUENCY_SESSION = 2;

////////////////////////////////////////////////////////////////////////////////
//// Globals.

Cu.import("resource://gre/modules/XPCOMUtils.jsm");
Cu.import("resource://gre/modules/Services.jsm");
Cu.import("resource://gre/modules/AddonManager.jsm");

XPCOMUtils.defineLazyModuleGetter(this, "PlacesUtils",
                                  "resource://gre/modules/PlacesUtils.jsm");

let observer = {
  observe: function (aSubject, aTopic, aData) {
    switch (aTopic) {
      case "idle":
        let frequency = Services.prefs.getIntPref(FREQUENCY_PREF, FREQUENCY_EVERY_IDLE);
        if (frequency == FREQUENCY_EVERY_IDLE ||
            (frequency == FREQUENCY_SESSION && !this.expired)) {
          this.expire();
        }
        break;
      case "idle-daily":
        if (Services.prefs.getIntPref(FREQUENCY_PREF, FREQUENCY_EVERY_IDLE) == FREQUENCY_DAILY) {
          this.expire();
        }
        break;
      case "nsPref:changed":
        let disableExpiration = false;
        try {
          disableExpiration = Services.prefs.getBoolPref(DISABLE_EXPIRATION_PREF);
        } catch (ex) {}
        if (disableExpiration) {
          Services.prefs.setIntPref("places.history.expiration.max_pages", 999999);
        }
        else {
          try {
            Services.prefs.clearUserPref("places.history.expiration.max_pages");
          } catch (ex) {}
        }
        break;
    }
  },

  expire: function () {
    let days = 0;
    try {
      days = Services.prefs.getIntPref(DAYS_PREF);
    } catch (ex) {}
    if (days) {
      let end = new Date(Date.now() - (days * 86400000));
      end.setHours(0);
      end.setMinutes(0);
      end.setSeconds(0);
      if (typeof PlacesUtils.history.removeVisitsByFilter === 'function') {
        // Firefox 51 and later
        // (after https://bugzilla.mozilla.org/show_bug.cgi?id=1261313 )
        PlacesUtils.history.removeVisitsByFilter({
          beginDate: 0,
          endDate:   end.getTime() * 1000
        });
      }
      else if (typeof PlacesUtils.history.removeVisitsByTimeframe === 'function') {
        // Firefox 50 and older
        PlacesUtils.history.removeVisitsByTimeframe(0, (end.getTime() * 1000));
      }
      else {
        throw new Error('PlacesUtils.history has no method to expire history by days!');
      }
      this.expired = true;
    }
  },

  expired: false,

  QueryInterface: XPCOMUtils.generateQI([
    Ci.nsIObserver
  ]),
};

////////////////////////////////////////////////////////////////////////////////
//// Restartless add-on boilerplate.
  
function startup({id}, reason) AddonManager.getAddonByID(id, function(addon)
{
  let idleService = Cc["@mozilla.org/widget/idleservice;1"].
                    getService(Ci.nsIIdleService);
  idleService.addIdleObserver(observer, IDLE_SECONDS);
  Services.obs.addObserver(observer, 'idle-daily', false);
  Services.prefs.addObserver(DISABLE_EXPIRATION_PREF, observer, false);
  observer.expired = false;
});

function shutdown({id}, reason) AddonManager.getAddonByID(id, function (addon)
{
  let idleService = Cc["@mozilla.org/widget/idleservice;1"].
                    getService(Ci.nsIIdleService);
  idleService.removeIdleObserver(observer, IDLE_SECONDS);
  Services.obs.removeObserver(observer, 'idle-daily');
  Services.prefs.removeObserver(DISABLE_EXPIRATION_PREF, observer);
});

function install({}, reason)
{
  if (reason == ADDON_INSTALL) {
    try {
      let max_pages = Services.prefs.getIntPref("places.history.expiration.max_pages");
      Services.prefs.setIntPref(MIRROR_PREF, max_pages);
    } catch (ex) {}
    Services.prefs.setBoolPref(DISABLE_EXPIRATION_PREF, false);
  }
}

function uninstall({}, reason)
{
  if (reason == ADDON_UNINSTALL) {
    try {
      Services.prefs.clearUserPref(DISABLE_EXPIRATION_PREF);
    } catch (ex) {}
    try {
      Services.prefs.clearUserPref(DAYS_PREF);
    } catch (ex) {}
    try {
      let max_pages = Services.prefs.getIntPref(MIRROR_PREF);
      Services.prefs.setIntPref("places.history.expiration.max_pages", max_pages);
      Services.prefs.clearUserPref(MIRROR_PREF);
    } catch (ex) {
      try {
        Services.prefs.clearUserPref("places.history.expiration.max_pages");
      } catch (ex) {}
    }
  }
}
