# flexible-expire-history-by-days

Modified version of [Expire History by Days](https://addons.mozilla.org/firefox/addon/expire-history-by-days/), with an extra configuration of the frequency of cleanup.

## `extensions.bonardonet.expire-history-by-days.frequency`

This version includes a new preference to control frequency of expirations.

 * `0`: On every idle time
 * `1`: On the first idle time per a day
 * `2`: On the initial idle time per a session (don't do next expiration until Firefox is restarted)
