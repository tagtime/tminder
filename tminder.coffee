gap = 3/4 # TagTime's frequency is 3/4 hours

# Singular or Plural: Pluralize the given noun properly, if n is not 1. 
# Provide the plural version if irregular.
# Eg: splur(3, "boy") -> "3 boys", splur(3, "man", "men") -> "3 men"
splur = (n, noun, nounp='') ->
  if nounp is '' then nounp = noun+'s'
  n.toString()+' '+(if n is 1 then noun else nounp)

# Show number (just rounds to like 9 places for now)
shn = (x) -> 
  if typeof x != 'number' then return x
  Math.round(x*1000000000)/1000000000 + ""

# Convert number of hours to ceiling of the number of pings
h2p = (h) -> Math.ceil(h/gap)

# Do whatever macro-expansions and syntactic sugar
prep = (s) -> s.replace(/(\d*)\:(\d+)/g, "($1+$2/60)") # "H:M" -> "(H+M/60)"

# Like eval but just return null if syntax error
laxeval = (s) ->
  try 
    eval(s) 
  catch e 
    null

# Compute time till deadline and probability
freshen = () ->
  xeh = $('#heep').val()  # contents of "hours needed" field
  xdl = $('#dead').val()  # contents of deadline field
  eh = laxeval(prep(xeh)) # number of eep hours (float)
  ep = h2p(eh)            # number of emergency pings
  now = new Date()
  if xdl.search(/^\+/) != -1 # starts w/ "+" so the deadline is a relative time
    xdl += '0'
    xdl = xdl.replace(/h/g, '*3600+')
    xdl = xdl.replace(/m/g, '*60+')
    xdl = xdl.replace(/s/g, '+')
    td = laxeval(xdl)
    if td == null then td = 0
    d = new Date(now.getTime() + td*1000)
    [h, m] = [d.getHours(), d.getMinutes()]
  else
    [h, m] = parseTime(xdl)
    td = pumpkin(h, m)      # seconds till deadline

  pr = GammaCDF(td/3600, ep, gap) # probability

  Session.set("eh", eh)   # emergency hours
  Session.set("ep", ep)   # emergency pings
  Session.set("h", h)     # hour of deadline
  Session.set("m", m)     # minute of deadline
  Session.set("td", td)   # time to deadline
  Session.set("pr", if h == -1 then "??%" else shn(pr*100)+"%") # probability
  Session.set("now", now.toLocaleTimeString())

if Meteor.isClient
  Template.main.heep = ->
    eh = Session.get("eh")
    ep = Session.get("ep")
    "#{shn(eh) ? "??"}h ⇒ #{splur(ep, "ping")}"

  Template.main.dead = ->
    h = Session.get("h")
    m = Session.get("m")
    td = Session.get("td")
    timeofday = (if h == -1 then "??:??" else h2hm(h+m/60))
    countdown = (if h == -1 then "??s"   else s2hms(td))
    "#{timeofday} (#{countdown})" # [debug #{xdl} -> #{td}]

  Template.main.prob = -> Session.get("pr")

  Template.main.post = -> 
    ep = Session.get("ep")
    d = new Date()
    h = d.getHours()
    m = d.getMinutes()
    s = d.getSeconds()
    now = Session.get("now")
    "Probability of #{splur(ep, "ping")} between now (#{now}) and deadline."

  Template.main.events {
    'keyup input': (e) ->
      if e.target.name is "heep" and e.type is 'keyup' #and e.which is 13
        freshen()
  }

  Meteor.setInterval(freshen, 1*1000)

if Meteor.isServer then Meteor.startup -> # code to run on server at startup


# Old snippet for having 2 field that convert between each other...
#Template.converter.events {
#  'keyup input': (e) -> 
#    if e.target.id is "pings" and e.type is 'keyup'
#      p = $('#pings').val()
#      $('#hours').val(h2hm(gap*parseFloat(p)))
#    else if e.target.id is "hours" and e.type is 'keyup'
#      h = $('#hours').val()
#      $('#pings').val(h2p(h).toString())
#}
