// --------------------------------- 80chars ---------------------------------->
// Welcome to the H.M.S. Parsafore!
// This library provides functions to parse times of day & amounts of time. Like
// "8:30am" or "7h 30m 59s".
// * parseTOD takes a string like "3pm" and returns a time-of-day represented as
//   the number of seconds after midnight, eg, 0 for midnight or 86399 for 
//   11:59:59pm.
// * parseHMS takes a string like "1m" or "2:30" and returns the amount of time
//   in seconds. HMS for "hours, minutes, seconds", not "her majesty's ship".
// Also we have the inverse of those to generate/format times of day & amounts
// of time as strings.
// * genTOD is the inverse of parseTOD, generating a string representation of a
//   time of day like "3:30pm". Normally I prefer 24-hour time but the am/pm
//   nicely disambiguates that it's a time of day rather than amount of time.
// * genHMS is the inverse of parseHMS, generating a string representation of an
//   amount of time like "59m".
// Other handy functions this library makes available:
// * now() gives the current number of seconds since midnight
// * pumpkin(t) gives the amount of time till a deadline t
// * teatime(x) gives the time of day x seconds from now (inverse of pumpkin)

// Examples of parsing times of day:
//   parseTOD("3pm") -> 15*3600 seconds ie 15 hours after midnight
//   parseTOD() -> (whatever the current time is)
//   parseTOD("") -> NaN (for anything unparseable as a time)
// Examples of parsing amounts of time:
//   parseHMS("2h30m") -> 2.5*3600
//   parseHMS("11:39 - :45*8") -> 5.7*3600
// Examples of formatting times of day:
//   genTOD(0) -> "12am"
//   genTOD(86400/2+60) -> "12:01pm"
// Examples of formatting amounts of time:
//   genHMS(1) -> "1s"
//   genHMS(60) -> "1m"
//   genHMS(3600) -> "1h"
//   genHMS(86400+1) -> "24h" (by default, suppress seconds for times >= 60s)
//   genHMS(86460) -> "24h1m"

/******************************************************************************
 *                                  CONSTANTS                                 *
 ******************************************************************************/

const SID = 86400 // handy constant for seconds in a day

/******************************************************************************
 *                                  FUNCTIONS                                 *
 ******************************************************************************/

// Return the time-of-day right now, as a number of seconds after midnight
function now() {
  var d = new Date()
  return 3600*d.getHours() + 60*d.getMinutes() + d.getSeconds()
}

// Seconds remaining until the given time of day (default midnight) specified as
// a number of seconds after midnight. Pumpkin as in how long till you turn in
// to one, or "amount of time till the thing happens" or "t minus...".
// Also known as the pumpkin delta or time till d-day. Always a positive number
// because if you ask, eg, for the pumpkin delta for 2pm when it's already 3pm,
// the answer is 23 hours.
// Implementation note: we get that by adding a day and mod'ing by a day which
// is the same as adding a day if the pumpkin delta is negative. Eg, 3pm to 2pm
// is -1+24 = 23 hours.
function pumpkin(deadline=0) { return (deadline - now() + SID) % SID }

// The inverse of pumpkin(). Return the time of day (expressed as seconds after
// midnight) that's delta seconds in the future. Teatime is like t-time which is
// like d-day, as in "the time the thing will happen".
function teatime(delta) { return (now() + delta) % SID }

// Eval but just return null if syntax error. 
// Obviously don't use serverside with user-supplied input.
function laxeval(s) {
  try { 
    var x = eval(s)
    return typeof x === 'undefined' ? null : x
  } catch(e) { return null } 
}

// Turn a string like "2h30m" or "2:30" into a number of seconds.
// Also accepts arithmetical expressions like :45*2 (= 1.5h).
// WARNING: It does that with an eval so this is for clientside code only.
function parseHMS(s) {
  s = s.replace(/(\d*)\:(\d+)\:(\d+)/g, '($1+$2/60+$3/3600)') // "H:M:S"
  s = s.replace(/(\d*)\:(\d+)/g,        '($1+$2/60)') // "H:M" -> "(H+M/60)"
  s = s.replace(/:/, '') // get rid of further colons; i forget why
  s = s.replace(/\s/g, '') // nix whitespace eg "4h 5m" -> "4h5m"
  s = s.replace(/((?:[\d\.]+[dhms])+)/g, '($1)') // put parens around eg "4h5m"
  s = s.replace(/([\d\.\)])\s*([dhms])/g, '$1*$2') // eg "1h" -> "1*h"
  s = s.replace(/([dhms])\s*([\d\.\(])/g, '$1+$2') // eg "3h2m" -> "3h+2m"
  s = s.replace(/[dhms]/g, m=>({d:'24 ', h:'1 ', m:'1/60 ', s:'1/3600 '}[m]))
  var x = laxeval(s)
  return x===null ? NaN : 3600*x
}

// Parse a time-of-day string, return seconds after midnight.
// Also accepts arithmetical expressions like 2pm + 1h
// WARNING: It does that with an eval so this is for clientside code only.
// Since the output is number of seconds after midnight, we convert a time like
// "13:57" to "13h57m" and then do parseHMS of that.
function parseTOD(s) {
  // deal w/ spaces, dots, convert "AM"/"PM" to "A"/"P", convert military style
  s = s.replace(/\s/g, '')   // nix whitespace eg "1 PM" -> "1PM"
  s = s.replace(/([ap])\.m\.?/gi, '$1m')    // eg A.M. -> AM
  s = s.replace(/([ap])m/gi, '$1')          // ie AM -> A & PM -> P
  s = s.replace(/^(\d\d)(\d\d)$/, '$1:$2')  // eg 0600 -> 06:00 (military style)
  // next 3 lines: special case for 12something am -> something minutes
  s = s.replace(/\b12am?/gi, '0')           // eg 12A -> 0
  s = s.replace(/\b12:(\d\d?)am?/gi, '$1m') // eg 12:30A -> 30m
  s = s.replace(/\b12(\d\d)am?/gi, '$1m')   // eg 1230A -> 30m
  s = s.replace(/a/gi, '')                  // just strip other "AM"s
  // next 3 lines: "HH:MM pm"/"HH pm"/"HHMM pm" to "[HH+12]hMMm" eg 1PM -> 13h
  s = s.replace(/\b(0*[1-9]|1[01]):(\d\d?)p/gi, '($1+12)h$2m') // 1:09P -> 13h9m
  s = s.replace(/(?:^|[^:\d])(0*[1-9]|1[01])p/gi, '($1+12)h') // eg 1P -> 13h
  s = s.replace(/\b(0*[1-9]|1[01])(\d\d)p/gi, '($1+12)h$2m') // 1159P -> 23h59m
  s = s.replace(/([^:])p/gi, '$1') // strip other "PM"s if not preceded by colon
  return (parseHMS(s)+SID) % SID  // eg "12am-1m" = -60 which is really 86400-60
}

// Convenience function. What Jquery's isNumeric does, I guess. Javascript wat?
function isnum(x) { return x - parseFloat(x) + 1 >= 0 }

/* Table of what to output based on all possible h/m/s values:
h m s ? output (the "?" column is SYES, whether we care about seconds)
- - - - ------
0 0 0 0     0s
0 0 0 1     0s
0 0 1 0     1s
0 0 1 1     1s 
0 1 0 0   1m
0 1 0 1   1m
0 1 1 0   1m
0 1 1 1   1m1s
1 0 0 0 1h
1 0 0 1 1h
1 0 1 0 1h
1 0 1 1 1h0m1s
1 1 0 0 1h1m
1 1 0 1 1h1m
1 1 1 0 1h1m
1 1 1 1 1h1m1s
Thanks to Mathematica for turning that into: h===0 && m===0 || s>0 && syes
(Which, yes, in hindsight should've been obvious.)
*/

// Convert seconds to hours/minutes/seconds, like 65 -> "1m5s" or 3600 -> "1h"
// Note that by default this drops seconds. So 65 seconds would be formated as
// just "1m" and even 119s -> "1m" even though that's 1 second shy of 2 minutes.
function genHMS(t, syes=false) { // syes is whether we care about seconds
  if (!isnum(t)) { return 'NaNs' }
  if (t<0) { return '-' + genHMS(-t, syes) }
  t = Math.floor(t) // drop fractions of seconds
  var x = ""
  var h = Math.floor(t/3600)
  t %= 3600
  var m = Math.floor(t/60)
  t %= 60
  if (h>0)                           { x += h+'h' }
  if (m>0 || h>0 && t>0 && syes)     { x += m+'m' }
  if (h===0 && m===0 || t>0 && syes) { x += t+'s' }
  return x
}

// Take a number of seconds after midnight, return a time-of-day string like
// "3pm". And syes false means ignore seconds.
function genTOD(t, ampm=true, syes=false) {
  if (!isnum(t)) { return "NaN'o'clock" }
  if (t < 0 || t >= SID) { return '??:??' }
  
  var h, m, s
  if (syes) {
    h = Math.floor(t/3600)
    m = Math.floor(t%3600/60)
    s = Math.floor(t%60)
  } else {
    h = Math.floor(t/3600)
    m = Math.floor(t%3600/60)
    s = 0
  }
  if (s>59) { s -= 60; m += 1 }
  if (m>59) { m -= 60; h += 1 }

  var suf = '' // suffix, "am" or "pm" or nothing
  if (ampm) {
    if      (h===0 || h===24) { suf = 'am'; h = 12  }
    else if (h===12)          { suf = 'pm'          }
    else if (h>=13 && h<=23)  { suf = 'pm'; h -= 12 }
    else                      { suf = 'am'          }
  }
  //var out = `${h}:${m<10 ? '0'+m : m}:${s<10 ? '0'+s : s}${suf}` // ES6
  var out = '' + h + ':' + (m<10 ? '0'+m : m) + ':' + (s<10 ? '0'+s : s) + suf
  out = out.replace(/:00(?::00)?([ap]m)$/, '$1') // eg 3:00am -> 3am
  out = out.replace(/(:\d\d):00$/, '$1') // eg 3:21:00 -> 3:21
  return out
}

/******************************************************************************
 *                                 TEST SUITE                                 *
 ******************************************************************************/

const assert = console.assert // args are test and message string

// Canonicalize an amount of time / time of day by parsing it & regenerating it.
// Maybe useful in general but mainly just convenience functions for testsuite()
function canHMS(s) { return genHMS(parseHMS(s)) }
function canTOD(s) { return genTOD(parseTOD(s)) }

// Helper for testTOD() and testHMS(): assert orig canonicalizes to target
function testy(canonicalizer, orig, target=orig) { 
  var c = canonicalizer(orig)
  assert(c === target, `"${orig}" canonicalizes to "${c}" not "${target}"!`)
}

// Assert orig canonicalizes to target (or to itself if target not specified)
function testHMS(orig, target=orig) { testy(canHMS, orig, target) }
function testTOD(orig, target=orig) { testy(canTOD, orig, target) }

// Run this in the browser's javascript console and look for failed assertions
function testsuite() {
  assert(1===1, "sanity")
  assert(genTOD(teatime(pumpkin(parseTOD("9")))) === "9am", "pumpkin tea")
  assert(genHMS(119) === "1m", "2m-ish")
  assert(genTOD(0) === "12am", "midnight")
  assert(genTOD(86400/2+60) === "12:01pm", "86400/2+60")

  testTOD("12am"); testTOD("12:30am")
  testTOD("0am", "12am")
  testTOD("0", "12am")
  testTOD("1am"); testTOD("1:01am")
  testTOD("2am"); testTOD("2:20am")
  testTOD("3am"); testTOD("3:59am")
  testTOD("4a", "4am"); testTOD("4:30am")
  testTOD("5am"); testTOD("5:18am")
  testTOD("9am"); testTOD("9:48am")
  testTOD("10am"); testTOD("10:00am", "10am")
  testTOD("11am"); testTOD("11:03am")
  testTOD("12pm"); testTOD("12:19pm")
  testTOD("3pm"); testTOD("3:12pm")
  testTOD("7pm"); testTOD("7:28pm")
  testTOD("9pm"); testTOD("9:02pm")
  testTOD("10pm"); testTOD("10:50pm")
  testTOD("11pm"); testTOD("11:30pm")
  testTOD("312pm", "3:12pm")
  testTOD("03pm", "3pm")
  testTOD("03:12pm", "3:12pm")
  testTOD("0312pm", "3:12pm")
  testTOD("003pm", "3pm")
  testTOD("11:pm", "NaN'o'clock")
  testTOD("01:59am", "1:59am")
  testTOD("12:01", "12:01pm")
  testTOD("1 pm", "1pm")
  testTOD("3:10 p.m.", "3:10pm")
  testTOD("12am-1h", "11pm")
  testTOD("8PM - 7h30m", "12:30pm")
  testTOD("pm", "NaN'o'clock")
  testTOD("1259am", "12:59am")
  testTOD("12:3am", "12:03am")
  testTOD("12:3pm", "12:03pm")
  testTOD("1:3pm", "1:03pm")
  testTOD("8 p.m.", "8pm")
  testTOD("13:01", "1:01pm")
  testTOD("17", "5pm")
  testTOD("20:00", "8pm")
  testTOD("23:59", "11:59pm")
  testTOD("13:01:02", "1:01pm")
  testTOD("13:01:59", "1:01pm")
  testTOD("12 a", "12am")
  testTOD("-1pm", "1pm") // probably too forgiving there and should fail
  testTOD("", "NaN'o'clock")
  testTOD("abc", "NaN'o'clock")
  testTOD("3pm pm", "3pm")
  testTOD("3pm 4pm", "7pm")
  testTOD("11pm 11pm", "10am")
  testTOD("3a m + 1m", "3:01am")
  testTOD("4am + 59s + 1s", "4:01am")
  testTOD("3am + 3m * 4", "3:12am")

  testHMS("1s")
  testHMS("1m")
  testHMS("60s", "1m")
  testHMS("2h")
  testHMS("3600s", "1h")
  testHMS("3601s", "1h")
  testHMS("24h")
  testHMS("1d", "24h")
  testHMS("1w", "NaNs")
  testHMS("0", "0s")
  testHMS("22", "22h")
  testHMS("2h30m")
  testHMS("8.5h", "8h30m")
  testHMS("60s", "1m")
  testHMS("86400s", "24h")
  testHMS("11:39 - :45*8", "5h39m")
  testHMS("11:39 - :48*8", "5h15m")
  testHMS("4.5*1 + 45m*0", "4h30m")
  testHMS(".5 h", "30m")
  testHMS("0:45*3", "2h15m")
  testHMS(":45*4", "3h")
  testHMS(":25*-1", "-25m")
  testHMS("2+2", "4h")
  testHMS("1h59m59s", "1h59m")
  testHMS("86460s", "24h1m")
  testHMS("abc", "NaNs")
}
//testsuite() // uncomment when testing and look in the browser console!


/******************************************************************************
 *                    FUNCTIONS WE'RE NOT CURRENTLY USING                     *
 ******************************************************************************/

/*

// Helper functions for parseTOD_safe
function el(x, l) { return l.some(i => i===x) } // Whether x element of list l
function pi(s) { return parseInt(s, 10) }

// [Tested, works]
// Turn a string like "3pm" or "15:30" into a time of day represented as a
// number of seconds after midnight. This version doesn't handle arithmetic, ie,
// no eval(), so is safe to use server-side.
// Idea from http://stackoverflow.com/a/14787410/4234
function parseTOD_safe(time=null) {  
  if (time===null) {
    var d = new Date()
    return d.getHours()*3600 + d.getMinutes()*60 + d.getSeconds()
  }
  time += "" // make sure it's a string
  var pm = /p/i.test(time)               // whether it's PM
  var am = /a/i.test(time)               // whether it's AM
  var da = time.replace(/[^0-9]/g, '')   // digit array
  var nd = da.length                     // number of digits
  var h, m

  if (nd===0 || nd>4 || nd===2 && /:/.test(time)) { return [-1, -1] }

  if      (nd===4      ) { [h,m] = [pi(da[0]+da[1]),          pi(da[2]+da[3])] }
  else if (nd===3      ) { [h,m] = [pi(da[0]),                pi(da[1]+da[2])] }
  else if (el(nd,[1,2])) { [h,m] = [pi(da[0]+(da[1] || '')),  0              ] }

  if (m<0 || m>=60 || h>29) { return -1 }
  if (pm && h>0 && h<12) { h += 12 } // make sure it's 24-hour time
  if (am && h===12) { h = 0 }        // 12am means 0:00 (tho 12pm means 12:00)
  return (h%24)*3600 + m*60
}

// [I think I used this in the past so it probably works]
// Show time-of-day given a date object, like "3:00:00pm", default now
function showTOD(d=null, secs=true) {
  if (d===null) { d = new Date() }
  var x = d.toLocaleTimeString().replace(/\s/g, '').toLowerCase()
  if (!secs) { x = x.replace(/(\d+:\d\d):\d\d/, '$1') }
  return x
}

// Convert number of seconds to "H:M" (rounding to nearest minute)
function HMfromS(t) {
  var H = Math.floor(t/3600)
  var M = Math.round((t-H*3600)/60)
  return H + ":" + (M<10 ? "0"+M : M)
}

// [Definitely works]
// Take a Date object, set the time back to midnight, return new Date object
function dayfloor(d) {
  var x = new Date(d)
  x.setHours(0)
  x.setMinutes(0)
  x.setSeconds(0)
  return x
}

// Given a time of day expressed as seconds after midnight (default midnight),
// return a Date object corresponding to the soonest future timestamp that
// matches that time of day
function dateat(t=0) {
  if (isNaN(t)) { return null }
  var now = new Date()
  var d = new Date()
  d.setTime(dayfloor(d).getTime() + 1000*t)
  if (d < now) { d.setTime(d.getTime() + 1000*86400) }
  return d  
}

// Turn a Date object (default now) to unixtime in seconds
function unixtm(d=null) {
  if (d===null) { d = new Date() }
  return d.getTime()/1000
}

// Turn a unixtime in seconds to a Date object
function dob(t=null) {
  if (t===null) { return new Date() }
  return isnum(t) ? new Date(1000*t) : null
}

// [Tested, works, at least for current and future timestamps]
// Takes unixtime and returns time of day represented as seconds after midnight.
function TODfromUnixtime(t) {
  var offset = new Date().getTimezoneOffset()
  return (t - offset*60) % 86400
}

*/