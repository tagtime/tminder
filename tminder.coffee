gap = 3/4 # TagTime's frequency is 3/4 hours



if Meteor.isClient
  Template.main.now = "now"
  Template.main.probability = -> Session.get("n")
  Template.main.events {
    'keyup input': (e) ->
      if e.type is 'keyup' #and e.which is 13
        n = parseInt(e.target.value)
        t = 1   # hours till midnight
        Session.set("n", GammaCDF(t, n, gap))
  }

if Meteor.isServer
  Meteor.startup ->
    # code to run on server at startup
