gap = 3/4 # TagTime's frequency is 3/4 hours

# Singular or Plural: Pluralize the given noun properly, if n is not 1. 
# Provide the plural version if irregular.
# Eg: splur(3, "boy") -> "3 boys", splur(3, "man", "men") -> "3 men"
splur = (n, noun, nounp='') ->
  if nounp is '' then nounp = noun+'s'
  n.toString()+' '+(if n is 1 then noun else nounp)

# Number of hours till midnight
pumpkin = () ->
  d = new Date()
  now = d.getTime()
  d.setHours(0)
  d.setMinutes(0)
  d.setSeconds(0)
  (d.getTime()+86400000 - now)/1000/3600

if Meteor.isClient
  Template.main.prop = -> 
    "finishing between now and midnight (#{splur(pumpkin(), 'hour')})"
  Template.main.probability = -> Session.get("n")
  Template.main.events {
    'keyup input': (e) ->
      if e.type is 'keyup' #and e.which is 13
        n = parseInt(e.target.value)
        t = pumpkin()
        Session.set("n", GammaCDF(t, n, gap))
  }

if Meteor.isServer
  Meteor.startup ->
    # code to run on server at startup
