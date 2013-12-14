# Most of these are from Numerical Recipes
@LogGamma = (Z) ->
  S = 1+76.18009173/Z-86.50532033/(Z+1)+
        24.01409822/(Z+2)-1.231739516/(Z+3)+
        .00120858003/(Z+4)-.00000536382/(Z+5)
  (Z-.5)*Math.log(Z+4.5)-(Z+4.5)+Math.log(S*2.50662827465)

# Continued fraction representation for approximating GammaCDF
Gcf = (X,A) -> # Good for X > A+1
  A0 = 0
  B0 = 1
  A1 = 1
  B1 = X
  AOLD = 0
  N = 0
  while Math.abs((A1-AOLD)/A1) > .00001
    AOLD = A1
    N = N+1
    A0 = A1+(N-A)*A0
    B0 = B1+(N-A)*B0
    A1 = X*A0+N*A1
    B1 = X*B0+N*B1
    A0 = A0/B1
    B0 = B0/B1
    A1 = A1/B1
    B1 = 1
  Prob = Math.exp(A*Math.log(X)-X-LogGamma(A))*A1
  1-Prob

# Series representation for approximating GammaCDF
Gser = (X,A) -> # Good for X < A+1
  T9 = 1/A
  G = T9
  I = 1
  while T9 > G*.00001
    T9 = T9*X/(A+I)
    G = G+T9
    I = I+1
  G = G*Math.exp(A*Math.log(X)-X-LogGamma(A))
  G

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
  t = 1.0/(1.0 + p*x)
  y = 1.0 - (((((a5*t + a4) * t) + a3) * t + a2) * t + a1) * t*Math.exp(-x*x)
  sign*y # erf(-x) = -erf(x)

@NormalCDF = (x, mean, variance) ->
  0.5 * (1 + erf((x - mean) / (Math.sqrt(2 * variance))))

# Found this one somewhere. "HASTINGS. MAX ERROR = .000001". Not currently used.
NormalCDF2 = (X) ->
  T = 1/(1+.2316419*Math.abs(X))
  D = .3989423*Math.exp(-X*X/2)
  Prob = D*T*(.3193815+T*(-.3565638+T*(1.781478+T*(-1.821256+T*1.330274))))
  if X > 0 then Prob = 1-Prob
  Prob

# Helper function for GammaCDF
GammaCDF0 = (x, a) ->
  if x <= 0
    GI = 0
  else if a > 200
    z = (x-a)/Math.sqrt(a)
    y = NormalCDF(z)
    b1 = 2/Math.sqrt(a)
    phiz = .39894228*Math.exp(-z*z/2)
    w = y-b1*(z*z-1)*phiz/6  #Edgeworth1
    b2 = 6/a
    u = 3*b2*(z*z-3)+b1*b1*(z^4-10*z*z+15)
    GI = w-phiz*z*u/72       #Edgeworth2
  else if x < a+1
    GI = Gser(x,a)
  else
    GI = Gcf(x,a)
  GI

# CDF(x) of a gamma distribution with parameters alpha (A) and beta (B)
@GammaCDF = (x, A, B) -> 
  GammaCDF0(x/B, A)
