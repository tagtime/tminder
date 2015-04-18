This is a utility that tells you the probability that you'll get your requisite number of
emergency TagTime pings by midnight.

## The Math

The sum of n exponential random variables, each with rate parameter a, 
has gamma distribution with shape parameter n and scale parameter 1/a.

## Example

It also understands arithmetic, so you can ask, say, what are the chances of getting 3 pings by midnight if I start at 6:15pm. That's `3*:45` hours' worth by `+(24-18:15)h`.
