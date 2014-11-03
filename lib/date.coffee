# Adapted from http://stackoverflow.com/a/14787410/4234

pi = (s) -> parseInt(s, 10)

# Turn a string like "3pm" or "15:30" into [H,M]
@parseTime = (time) ->
  pm = time.search(/p/i) != -1 # whether the time is PM
  da = time.replace(/[^0-9]/g, '') # digit array

  switch da.length  # parse the hour and minute
    when 4
      h = pi(da[0] + da[1])
      m = pi(da[2] + da[3])
    when 3
      h = pi(da[0], 10)
      m = pi(da[1] + da[2])
    when 2, 1
      h = pi(da[0] + (da[1] or ''))
      m = 0
    else return [-1, -1]

  if pm and 0 < h < 12 then h += 12  # make sure it's 24-hour time

  if h < 0 or h >= 24 then h = 0  # not sure if/when these are needed...
  if m < 0 or m >  59 then m = 0

  [h, m]

# (Not currently used)
# Convert hours as a string (possible like "H:M") to a float
parseHM = (h) ->
  if m = h.match(/:/)
    a = pi(h.substr(0, m.index))
    b = pi(h.substr(m.index+1))
    a+b/60
  parseFloat(h)

# Number of seconds till the given time of day (default midnight)
@pumpkin = (hour=0, minute=0) ->
  d = new Date()
  now = d.getTime()
  d.setHours(hour)
  d.setMinutes(minute)
  d.setSeconds(0)
  x = (d.getTime() - now)/1000
  if x < 0 then x + 86400 else x

# Convert seconds to hours/minutes/seconds, like 65 -> "1m5s" or 3600 -> 1h0m0s
@s2hms = (s) ->
  x = ""
  h = Math.floor(s/3600)
  if h > 0 then x += h+"h"
  s %= 3600
  m = Math.floor(s/60)
  if m > 0 then x += m+"m"
  s %= 60
  x + s+"s"

# Convert number of hours to "H:M:S"
@h2hm = (h) ->
  H = Math.floor(h)
  M = Math.round((h-H)*60)
  H + ":" + (if M<10 then "0"+M else M)

