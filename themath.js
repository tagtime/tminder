// --------------------------------- 80chars ---------------------------------->
// Most of these are from Numerical Recipes.
// TagTime currently just uses GammaCDF() which gets the probability of getting
// a given number of pings in a given amount of time.

const log  = Math.log // Keep
const exp  = Math.exp // Mathematics
const abs  = Math.abs // Beautiful
const sqrt = Math.sqrt

function LogGamma(Z) {
  var S = 1 + 76.18009173    / Z     - 86.50532033   / (Z+1) +
              24.01409822    / (Z+2) - 1.231739516   / (Z+3) +
               0.00120858003 / (Z+4) - 0.00000536382 / (Z+5)
  return (Z-.5)*log(Z+4.5)-(Z+4.5)+log(S*2.50662827465)
}

// Continued fraction representation for approximating GammaCDF
function Gcf(X,A) { // Good for X > A+1
  var A0 = 0; var B0 = 1
  var A1 = 1; var B1 = X
  var Aold = 0
  var N = 0
  while (abs((A1-Aold)/A1) > .00001) {
    Aold = A1
    N += 1
    A0 = A1+(N-A)*A0
    B0 = B1+(N-A)*B0
    A1 = X*A0+N*A1
    B1 = X*B0+N*B1
    A0 = A0/B1
    B0 = B0/B1
    A1 = A1/B1
    B1 = 1
  }
  return 1 - exp(A*log(X)-X-LogGamma(A))*A1
}

// Series representation for approximating GammaCDF
function Gser(X,A) { // Good for X < A+1
  var G  = 1/A
  var T9 = 1/A
  var I  = 1
  while (T9 > G*.00001) {
    T9 *= X/(A+I)
    G  += T9
    I  += 1
  }
  return G*exp(A*log(X)-X-LogGamma(A))
}

// Standard erf function, from http://stackoverflow.com/questions/14846767
function erf(x) {
  var sign = (x >= 0 ? 1 : -1)
  x = abs(x)
  var a1 =  0.254829592
  var a2 = -0.284496736
  var a3 =  1.421413741
  var a4 = -1.453152027
  var a5 =  1.061405429
  var p  =  0.3275911
  var t  = 1/(1 + p*x)
  var y  = 1 - (((((a5*t + a4) * t) + a3) * t + a2) * t + a1) * t*exp(-x*x)
  return sign*y // erf(-x) = -erf(x)
}

function NormalCDF(x, mean = 0, variance = 1) {
  return 0.5 * (1 + erf((x - mean) / (sqrt(2*variance))))
}

// Found this one somewhere ("HASTINGS. MAX ERROR = .000001") Not currently used
function NormalCDF2(X) {
  var T = 1/(1+.2316419*abs(X))
  var D = .3989423*exp(-X*X/2)
  var P = D*T*(.3193815+T*(-.3565638+T*(1.781478+T*(-1.821256+T*1.330274))))
  return (X > 0 ? 1-P : P)
}

// Helper function for GammaCDF
function GammaCDF0(x, a) {
  if (a <= 0) { return 1 }
  if (x <= 0) { return 0 }
  if (a > 200) {
    var z = (x-a)/sqrt(a)
    var y = NormalCDF(z)
    var b1 = 2/sqrt(a)
    var phiz = .39894228*exp(-z*z/2)
    var w = y-b1*(z*z-1)*phiz/6  // Edgeworth1
    var b2 = 6/a
    var u = 3*b2*(z*z-3)+b1*b1*(z^4-10*z*z+15)
    return w-phiz*z*u/72         // Edgeworth2
  }
  return (x < a+1 ? Gser(x,a) : Gcf(x,a))
}

// CDF(x) of a gamma distribution with parameters alpha (A) and beta (B)
function GammaCDF(x, A, B) { return GammaCDF0(x/B, A) }

// Inverse of above: what x makes GammaCDF(x, A, B) == p
// For TagTime: hours to set aside so Pr(success) == p is ig(p, pings, gap)
function ig(p, A, B, min=0, max=8) {
  if (p<0) { p = 0 }
  if (p>1) { p = 1 }
  var m = (min+max)/2
  if (abs(min-max)<1/60) { return m } // accurate to within 1 minute
  var p2 = GammaCDF(max, A, B)
  //console.log(`${min} ${max} -> ${GammaCDF(min, A, B)} ${p2}`)
  if (p2 < p) { return ig(p, A, B, min, 2*max) }
  var p1 = GammaCDF(min, A, B)
  var pm = GammaCDF(m, A, B)
  if (pm<p) { return ig(p, A, B, m, max) }
  return ig(p, A, B, min, m)
}

/*
Above just does a simple binary search but below is some code that I guess
does something fancier? Ported from some C# code I found somewhere.

/ ********************************************************************
// Inverse of complemented imcomplete gamma integral
// Given p, the function finds x such that
// igamc( a, x ) = p.
// Starting with the approximate value
// x = a*t^3 where t = 1 - d - ndtri(p)*sqrt(d) and d = 1/(9*a),
// the routine performs up to 10 Newton iterations to find the
// root of igamc(a,x) - p = 0.
// ACCURACY:
// Tested at random a, p in the intervals indicated.
//                a        p                      Relative error:
// arithmetic   domain   domain     # trials      peak         rms
//    IEEE     0.5,100   0,0.5       100000       1.0e-14     1.7e-15
//    IEEE     0.01,0.5  0,0.5       100000       9.0e-14     3.4e-15
//    IEEE    0.5,10000  0,0.5        20000       2.3e-13     3.8e-14
// Cephes Math Library Release 2.8:  June, 2000
// Copyright 1984, 1987, 1995, 2000 by Stephen L. Moshier
********************************************************************* /
function invincompletegammac(a, y0) {
  var EPS = 0.000000000000001  // when browsers support es6 then const not var
  var MAX = 4503599627370496.0
  var x0 = 0
  var x1 = 0
  var x = 0
  var yl = 0
  var yh = 0
  var y = 0
  var d = 0
  var lgm = 0
  var dithresh = 0
  var i = 0
  var dir = 0
  var tmp = 0
  
  x0 = MAX
  yl = 0
  x1 = 0
  yh = 1
  dithresh = 5*EPS
  d = 1/(9*a)
  y = 1-d-normaldistr.invnormaldistribution(y0)*sqrt(d) // TODO
  x = a*y*y*y
  lgm = LogGamma(a)
  i = 0
  while (i<10) {
    if (x>x0 || x<x1) { d = 0.0625; break }
    y = incompletegammac(a, x) // TODO: translate to gammaCDF
    if (y<yl || y>yh) { d = 0.0625; break }
    if (y<y0) { x0 = x; yl = y }
    else      { x1 = x; yh = y }
    d = (a-1)*log(x)-x-lgm
    if (d<-709.78271289338399) { d = 0.0625; break }
    d = -exp(d)
    d = (y-y0)/d
    if (abs(d/x)<EPS) { return x }
    x = x-d
    i = i+1
  }
  if (x0===MAX) {
    if (x<=0) { x = 1 }
    while (x0===MAX) {
      x = (1+d)*x
      y = incompletegammac(a, x)
      if (y<y0) {
        x0 = x
        yl = y
        break
      }
      d = d+d
    }
  }
  d = 0.5
  dir = 0
  i = 0
  while (i<400 ) {
    x = x1+d*(x0-x1)
    y = incompletegammac(a, x) // TODO
    lgm = (x0-x1)/(x1+x0)
    if (abs(lgm)<dithresh) { break }
    lgm = (y-y0)/y0
    if (abs(lgm)<dithresh) { break }
    if (x<=0.0) { break }
    if (y>=y0) {
      x1 = x
      yh = y
      if (dir<0) {
        dir = 0
        d = 0.5
      }
      else {
        if (dir>1) { d = 0.5*d+0.5 }
        else       { d = (y0-yl)/(yh-yl) }
      }
      dir += 1
    }
    else {
      x0 = x
      yl = y
      if (dir>0) {
        dir = 0
        d = 0.5
      }
      else {
        if (dir < -1) { d *= 0.5 }
        else          { d = (y0-yl)/(yh-yl) }
      }
      dir -= 1
    }
    i += 1
  }
  return x
}

*/