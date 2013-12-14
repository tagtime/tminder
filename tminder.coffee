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

if Meteor.isClient
  Template.main.prop = -> 
    p = Session.get("pumpkin")
    "finishing between now and midnight (#{s2hms(p)})"
  Template.main.probability = -> 
    pr = Session.get("pr")
    Math.round(pr*1000000000)/10000000 + "%"
  Template.main.events {
    'keyup input': (e) ->
      if e.type is 'keyup' #and e.which is 13
        n = parseInt($('#pings').val())
        t = pumpkin()
        Session.set("pr", GammaCDF(t/3600, n, gap))
  }
  Meteor.setInterval((-> 
    t = pumpkin()
    n = parseInt($('#pings').val())
    Session.set("pumpkin", t)
    Session.set("pr", GammaCDF(t/3600, n, gap))),
    1*1000
  )

if Meteor.isServer
  Meteor.startup ->
    # code to run on server at startup
