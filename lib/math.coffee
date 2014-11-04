# Most of these are from Numerical Recipes

@LogGamma = (Z) ->
  S = 1 + 76.18009173    / Z     - 86.50532033   / (Z+1) +
          24.01409822    / (Z+2) - 1.231739516   / (Z+3) +
           0.00120858003 / (Z+4) - 0.00000536382 / (Z+5)
  (Z-.5)*Math.log(Z+4.5)-(Z+4.5)+Math.log(S*2.50662827465)

# Continued fraction representation for approximating GammaCDF
Gcf = (X,A) -> # Good for X > A+1
  A0 = 0; B0 = 1
  A1 = 1; B1 = X
  AOLD = 0
  N = 0
  while Math.abs((A1-AOLD)/A1) > .00001
    AOLD = A1
    N += 1
    A0 = A1+(N-A)*A0
    B0 = B1+(N-A)*B0
    A1 = X*A0+N*A1
    B1 = X*B0+N*B1
    A0 = A0/B1
    B0 = B0/B1
    A1 = A1/B1
    B1 = 1
  1 - Math.exp(A*Math.log(X)-X-LogGamma(A))*A1

# Series representation for approximating GammaCDF
Gser = (X,A) -> # Good for X < A+1
  G = T9 = 1/A
  I = 1
  while T9 > G*.00001
    T9 *= X/(A+I)
    G  += T9
    I  += 1
  G*Math.exp(A*Math.log(X)-X-LogGamma(A))

# Standard erf function, from http://stackoverflow.com/questions/14846767/std-n
@erf = (x) ->
  sign = (if x >= 0 then 1 else -1)
  x = Math.abs(x)
  a1 =  0.254829592
  a2 = -0.284496736
  a3 =  1.421413741
  a4 = -1.453152027
  a5 =  1.061405429
  p  =  0.3275911
  t = 1/(1 + p*x)
  y = 1 - (((((a5*t + a4) * t) + a3) * t + a2) * t + a1) * t*Math.exp(-x*x)
  sign*y # erf(-x) = -erf(x)

@NormalCDF = (x, mean, variance) ->
  0.5 * (1 + erf((x - mean) / (Math.sqrt(2*variance))))

# Found this one somewhere. "HASTINGS. MAX ERROR = .000001". Not currently used.
NormalCDF2 = (X) ->
  T = 1/(1+.2316419*Math.abs(X))
  D = .3989423*Math.exp(-X*X/2)
  P = D*T*(.3193815+T*(-.3565638+T*(1.781478+T*(-1.821256+T*1.330274))))
  if X > 0 then 1-P else P

# Helper function for GammaCDF
GammaCDF0 = (x, a) ->
  if x <= 0 then 0
  else if a > 200
    z = (x-a)/Math.sqrt(a)
    y = NormalCDF(z)
    b1 = 2/Math.sqrt(a)
    phiz = .39894228*Math.exp(-z*z/2)
    w = y-b1*(z*z-1)*phiz/6  # Edgeworth1
    b2 = 6/a
    u = 3*b2*(z*z-3)+b1*b1*(z^4-10*z*z+15)
    w-phiz*z*u/72       # Edgeworth2
  else if x < a+1 then Gser(x,a) else Gcf(x,a)

# CDF(x) of a gamma distribution with parameters alpha (A) and beta (B)
@GammaCDF = (x, A, B) -> GammaCDF0(x/B, A)



# csharp code for inverse of gammaCDF...
# Should be straightforward to port this to js/coffeescript and then we can
# compute how much time is needed to get a given number of pings to have, say,
# only a 1% chance of failing, like in the static table in tminder.

# /********************************************************************
# Inverse of complemented imcomplete gamma integral
#
# Given p, the function finds x such that
#
#  igamc( a, x ) = p.
#
# Starting with the approximate value
#
#  x = a*t^3 where t = 1 - d - ndtri(p)*sqrt(d) and d = 1/(9*a),
#
# the routine performs up to 10 Newton iterations to find the
# root of igamc(a,x) - p = 0.
#
# ACCURACY:
#
# Tested at random a, p in the intervals indicated.
#
#                a        p                      Relative error:
# arithmetic   domain   domain     # trials      peak         rms
#    IEEE     0.5,100   0,0.5       100000       1.0e-14     1.7e-15
#    IEEE     0.01,0.5  0,0.5       100000       9.0e-14     3.4e-15
#    IEEE    0.5,10000  0,0.5        20000       2.3e-13     3.8e-14
#
# Cephes Math Library Release 2.8:  June, 2000
# Copyright 1984, 1987, 1995, 2000 by Stephen L. Moshier
# *********************************************************************/
# public static double invincompletegammac(double a, double y0) {
#   double igammaepsilon = 0;
#   double iinvgammabignumber = 0;
#   double x0 = 0;
#   double x1 = 0;
#   double x = 0;
#   double yl = 0;
#   double yh = 0;
#   double y = 0;
#   double d = 0;
#   double lgm = 0;
#   double dithresh = 0;
#   int i = 0;
#   int dir = 0;
#   double tmp = 0;
#   
#   igammaepsilon = 0.000000000000001;
#   iinvgammabignumber = 4503599627370496.0;
#   x0 = iinvgammabignumber;
#   yl = 0;
#   x1 = 0;
#   yh = 1;
#   dithresh = 5*igammaepsilon;
#   d = 1/(9*a);
#   y = 1-d-normaldistr.invnormaldistribution(y0)*Math.Sqrt(d);
#   x = a*y*y*y;
#   lgm = gammafunc.lngamma(a, ref tmp);
#   i = 0;
#   while( i<10 ) {
#     if( (double)(x)>(double)(x0) || (double)(x)<(double)(x1) ) {
#       d = 0.0625;
#       break;
#     }
#     y = incompletegammac(a, x);
#     if( (double)(y)<(double)(yl) || (double)(y)>(double)(yh) ) {
#       d = 0.0625;
#       break;
#     }
#     if( (double)(y)<(double)(y0) ) { x0 = x; yl = y; }
#     else                           { x1 = x; yh = y; }
#     d = (a-1)*Math.Log(x)-x-lgm;
#     if( (double)(d)<(double)(-709.78271289338399) ) {
#       d = 0.0625;
#       break;
#     }
#     d = -Math.Exp(d);
#     d = (y-y0)/d;
#     if( (double)(Math.Abs(d/x))<(double)(igammaepsilon) ) { return x; }
#     x = x-d;
#     i = i+1;
#   }
#   if( (double)(x0)==(double)(iinvgammabignumber) ) {
#     if( (double)(x)<=(double)(0) ) { x = 1; }
#     while( (double)(x0)==(double)(iinvgammabignumber) ) {
#       x = (1+d)*x;
#       y = incompletegammac(a, x);
#       if( (double)(y)<(double)(y0) ) {
#         x0 = x;
#         yl = y;
#         break;
#       }
#       d = d+d;
#     }
#   }
#   d = 0.5;
#   dir = 0;
#   i = 0;
#   while( i<400 ) {
#     x = x1+d*(x0-x1);
#     y = incompletegammac(a, x);
#     lgm = (x0-x1)/(x1+x0);
#     if( (double)(Math.Abs(lgm))<(double)(dithresh) ) { break; }
#     lgm = (y-y0)/y0;
#     if( (double)(Math.Abs(lgm))<(double)(dithresh) ) { break; }
#     if( (double)(x)<=(double)(0.0) ) { break; }
#     if( (double)(y)>=(double)(y0) ) {
#       x1 = x;
#       yh = y;
#       if( dir<0 ) {
#         dir = 0;
#         d = 0.5;
#       }
#       else {
#         if( dir>1 ) { d = 0.5*d+0.5; }
#         else        { d = (y0-yl)/(yh-yl); }
#       }
#       dir = dir+1;
#     }
#     else {
#       x0 = x;
#       yl = y;
#       if( dir>0 ) {
#         dir = 0;
#         d = 0.5;
#       }
#       else {
#         if( dir<-1 ) { d = 0.5*d; }
#         else         { d = (y0-yl)/(yh-yl); }
#       }
#       dir = dir-1;
#     }
#     i = i+1;
#   }
#   return x;
# }
