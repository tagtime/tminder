# TagTime Minder

Hosted at <https://mind.tagti.me> via GitHub Pages.

TagTime Minder, or Tminder, is a utility that tells you the probability that 
you'll get your requisite number of emergency TagTime pings by your Beeminder 
deadline.

## The Math

TagTime pings you according to a Poisson distribution.
That means that the length of the gaps between pings has an exponential
distribution.
It's true. Look it up!
Another fun fact:
The sum of n exponential random variables, each with rate parameter a, 
has gamma distribution with shape parameter n and scale parameter 1/a.

That means that if you need n pings we know the probability distribution on the 
amount of time it will take to get them all.

So if you specify the number of pings (or hours, which we can translate to a 
number of pings -- like if you need 1 hour's worth of pings and your ping gap 
is 45 minutes then you need 2 pings) and your deadline then we can compute the 
probability that you'll get that many pings in that amount of time.

Going the other way -- like how much time do you need to get the risk of 
failure below, say, 1%? -- is also possible.
There's a function in math.js to compute that but it's not included in the UI
currently.

## The Interface

It understands arithmetic, so you can ask what are the chances of getting, 
say, 3 pings by midnight if you start at 6:15pm.
That's `3*:45` hours' worth by `+(24-18:15)h` (the answer is 98%).

## The Backstory

This is explained in index.html, i.e., the "What's going on?" section of the 
front page of this app.

## Technical/Implementation Note

This is all client-side Javascript.
It currently uses React.
Which makes no sense and it ought to be in vanilla Javascript.
I just didn't know better when I originally made it.

## Changelog

* 2013.12.13 dreeves writes original Meteor version at tminder.meteor.com  
* 2014-2015  A bunch of commits at github.com/dreeves/tminder  
* 2017.01.27 Alexander et al of ARGH! Team helped port from Meteor to Gomix  
* 2017.01.31 dreeves ported from coffeescript to javascript  
* 2017.01.31 Bethany Soule added css to make the layout nicer  
* 2017.02.01 Fedor of ARGH! Team made it mobile-friendly  
* 2017.02.06 dreeves refactors like mad trying to understand React  
* 2017.02.07 Accepts arithmetical expressions for time-of-day  
* 2017.02.10 Bugfixes and tweaks  
* 2017.02.13 More robust parsing  
* 2017.02.14 Tweaks and polish and refactoring  
* 2017.02.15 Consistently treat blank fields as 0 hours and midnight, resp.  
* 2017.02.16 The code is kinda elegant now and React is super nifty  
* 2017.02.17 Fixed bug w/ parsing "12am-1h" (yielded negative time not 11pm)  
* 2017.02.24 Make deadline time auto-refresh for relative deadlines  
* 2017.03.23 Bugfix: parsed eg "8pm - 7h30m" as "8pm - 7h + 30m"  
* 2017.04.12 Bugfixes: failed to parse "11:30pm" or "1 pm"
* 2017.04.12 Mini test suite for parsing times of day
* 2017.04.13 Bugfix of last bugfix and improved test suite
* 2017.06.08 Bugfix for case of more than 200 pings needed
* 2018.01.11 Stripped out the Node.js parts; pure clientside now
* 2018.01.11 Added 95% and 98% confidence intervals to the table
* 2018.01.13 Added confidence intervals up top too based on probability
* 2018.04.06 Bugfix in genTOD(), renamed pgtime to hmsparsafore
* 2018.04.06 Robustified, refactored the H.M.S. Parsafore
* 2018.04.07 Bugfix: parse "8 p.m."
* 2018.04.09 Bugfix: parse "03pm"
* 2018.04.14 Tiny improvements to the H.M.S. Parsafore
* 2019.05.15 Prettier display of things like "1h 30m"
* 2025.05.29 Change hosting from Glitch to GitHub Pages
* 2025.06.26 Better html header and other tweaks
