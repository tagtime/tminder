gap = 3/4 # TagTime's frequency is 3/4 hours

# Singular or Plural: Pluralize the given noun properly, if n is not 1. 
# Provide the plural version if irregular.
# Eg: splur(3, "boy") -> "3 boys", splur(3, "man", "men") -> "3 men"
splur = (n, noun, nounp='') ->
  if nounp is '' then nounp = noun+'s'
  n.toString()+' '+(if n is 1 then noun else nounp)

# Number of seconds till midnight
pumpkin = () ->
  d = new Date()
  now = d.getTime()
  d.setHours(0)
  d.setMinutes(0)
  d.setSeconds(0)
  (d.getTime()+86400000 - now)/1000 # /3600

# Convert seconds to hours/minutes/seconds, like 65 -> "1m5s" or 3600 -> 1h0m0s
s2hms = (s) ->
  x = ""
  h = Math.floor(s/3600)
  if h > 0 then x += h+"h"
  s %= 3600
  m = Math.floor(s/60)
  if m > 0 then x += m+"m"
  s %= 60
  x + s+"s"

# Convert number of hours to "H:M"
h2hm = (h) ->
  H = Math.floor(h)
  M = (h-H)*60
  H + ":" + (if M<10 then "0"+M else M)

# Convert hours or "H:M" to ceiling of the number of pings
h2p = (h) ->
  if m = h.match(/:/)
    a = parseInt(h.substr(0, m.index))
    b = parseInt(h.substr(m.index+1))
  else
    a = parseFloat(h); b = 0
  Math.ceil((a+b/60)/gap)

# Compute time till midnight and compute probability based on epings text field
freshen = () ->
  t = pumpkin()
  n = parseInt($('#epings').val())
  Session.set("pumpkin", t)
  Session.set("pr", GammaCDF(t/3600, n, gap))

if Meteor.isClient
  Template.main.prop = -> 
    p = Session.get("pumpkin")
    "finishing between now and midnight (#{s2hms(p)})"
  Template.main.probability = -> 
    pr = Session.get("pr")
    Math.round(pr*1000000000)/10000000 + "%"
  Template.main.events {
    'keyup input': (e) ->
      if e.target.name is "epings" and e.type is 'keyup' #and e.which is 13
        freshen()
  }
  Template.converter.events {
    'keyup input': (e) -> 
      if e.target.id is "pings" and e.type is 'keyup'
        p = $('#pings').val()
        $('#hours').val(h2hm(gap*parseFloat(p)))
      else if e.target.id is "hours" and e.type is 'keyup'
        h = $('#hours').val()
        $('#pings').val(h2p(h).toString())
  }
  Meteor.setInterval(freshen, 1*1000)

if Meteor.isServer
  Meteor.startup ->
    # code to run on server at startup
