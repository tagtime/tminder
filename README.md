This is a utility that tells you the probability that you'll get your requisite number of
emergency TagTime pings by midnight.

## The Math

The sum of n exponential random variables, each with rate parameter a, 
has gamma distribution with shape parameter n and scale parameter 1/a.

## Example

It also understands arithmetic, so you can ask, say, what are the chances of getting 3 pings by midnight if I start at 6:15pm. That's `3*:45` hours' worth by `+(24-18:15)h`.


## Porting to Gomix

This is running as a Meteor app at <http://tminder.meteorapp.com>

The code is at <http://github.com/dreeves/tminder>

Here's how to make Coffeescript work in Gomix:
<https://support.gomix.com/t/coffeescript-base-project/935/4>

I tried an automatic Meteor->Node conversion tool 
but didn't understand what it did:
<https://github.com/onmodulus/demeteorizer>