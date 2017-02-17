# TagTime Minder

Canonical URL: mind.tagti.me

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

## Changelog

2013.12.13 dreeves writes original Meteor version at tminder.meteor.com
2014-2015  A bunch of commits at github.com/dreeves/tminder
2017.01.27 Alexander et al of ARGH! Team helped port from Meteor to Gomix  
2017.01.31 dreeves ported from coffeescript to javascript  
2017.01.31 Bethany Soule added css to make the layout nicer  
2017.02.01 Fedor of ARGH! Team made it mobile-friendly  
2017.02.06 dreeves refactors like mad trying to understand React  
2017.02.07 Accepts arithmetical expressions for time-of-day
2017.02.10 Bugfixes and tweaks
2017.02.13 More robust parsing 
2017.02.14 Tweaks and polish and refactoring
2017.02.15 Consistently treat blank fields as 0 hours and midnight, resp.
2017.02.16 The code is kinda elegant now and React is super nifty