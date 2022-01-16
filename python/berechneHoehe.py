from math import e

def berechne_hoehe(time):
  return 2-2*e**(-0.022907*time)

print ("Höhe von  0=", berechne_hoehe(0))
print ("Höhe von 40=", berechne_hoehe(40))