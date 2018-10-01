# Demomap / Multimap

- [Index auf github](./myindex.html)

- [Multimap (Github)](./multimap)

- [Zapfenrechner (Github)](./zapfen/)

- [Primzahlenrechner (Github)](./primenumber/)

---

- [Index auf Chello.at](http://members.chello.at/aschweitzer/index.html)

- [Mulitmap (Chello)](http://members.chello.at/~aschweitzer/multimap)

- [Zapfenrechner (Chello)](http://members.chello.at/~aschweitzer/zapfen/)

- [Primzahlenrechner (Chello)](http://members.chello.at/~aschweitzer/primenumber/)

- [Multiwetter (Chello)](http://members.chello.at/~aschweitzer/multiweather/)

- [Bahnhofsuhr (Chello)](http://members.chello.at/~aschweitzer/bahnhofsuhr/)

- [PTB Atomuhr (Chello)](http://members.chello.at/~aschweitzer/atomuhr/)

---

- [PTB Atomuhr (direkt)](https://uhr.ptb.de/)

---

<iframe src="https://freesecure.timeanddate.com/clock/i6fu7f2q/n259/szw210/szh210/hoc000/hbw2/cf100/hnccff/fdi76/mqc000/mql10/mqw4/mqd98/mhc000/mhl10/mhw4/mhd98/mmc000/mml10/mmw1/mmd98/hss1" frameborder="0" width="210" height="210"></iframe>

---

<script>
var nVer = navigator.appVersion;
var nAgt = navigator.userAgent;
var browserName  = navigator.appName;
var fullVersion  = ''+parseFloat(navigator.appVersion); 
var majorVersion = parseInt(navigator.appVersion,10);
var nameOffset,verOffset,ix;

// In Opera, the true version is after "Opera" or after "Version"
if ((verOffset=nAgt.indexOf("Opera"))!=-1) {
 browserName = "Opera";
 fullVersion = nAgt.substring(verOffset+6);
 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
   fullVersion = nAgt.substring(verOffset+8);
}
// In MSIE, the true version is after "MSIE" in userAgent
else if ((verOffset=nAgt.indexOf("MSIE"))!=-1) {
 browserName = "Microsoft Internet Explorer";
 fullVersion = nAgt.substring(verOffset+5);
}
// In Chrome, the true version is after "Chrome" 
else if ((verOffset=nAgt.indexOf("Chrome"))!=-1) {
 browserName = "Chrome";
 fullVersion = nAgt.substring(verOffset+7);
}
// In Safari, the true version is after "Safari" or after "Version" 
else if ((verOffset=nAgt.indexOf("Safari"))!=-1) {
 browserName = "Safari";
 fullVersion = nAgt.substring(verOffset+7);
 if ((verOffset=nAgt.indexOf("Version"))!=-1) 
   fullVersion = nAgt.substring(verOffset+8);
}
// In Firefox, the true version is after "Firefox" 
else if ((verOffset=nAgt.indexOf("Firefox"))!=-1) {
 browserName = "Firefox";
 fullVersion = nAgt.substring(verOffset+8);
}
// In most other browsers, "name/version" is at the end of userAgent 
else if ( (nameOffset=nAgt.lastIndexOf(' ')+1) < 
          (verOffset=nAgt.lastIndexOf('/')) ) 
{
 browserName = nAgt.substring(nameOffset,verOffset);
 fullVersion = nAgt.substring(verOffset+1);
 if (browserName.toLowerCase()==browserName.toUpperCase()) {
  browserName = navigator.appName;
 }
}
// trim the fullVersion string at semicolon/space if present
if ((ix=fullVersion.indexOf(";"))!=-1)
   fullVersion=fullVersion.substring(0,ix);
if ((ix=fullVersion.indexOf(" "))!=-1)
   fullVersion=fullVersion.substring(0,ix);

majorVersion = parseInt(''+fullVersion,10);
if (isNaN(majorVersion)) {
 fullVersion  = ''+parseFloat(navigator.appVersion); 
 majorVersion = parseInt(navigator.appVersion,10);
}

document.write(''
 +'Browser name  = '+browserName+'<br>'
 +'Full version  = '+fullVersion+'<br>'
 +'Major version = '+majorVersion+'<br>'
 +'navigator.appName = '+navigator.appName+'<br>'
 +'navigator.userAgent = '+navigator.userAgent+'<br>'
 +'navigator.platform = '+navigator.platform+'<br>'
 +'navigator.oscpu = '+navigator.oscpu+'<br>'
 +'navigator.appVersion = '+navigator.appVersion+'<br>'
 
)
</script>

---

&copy; 2018 by SkyFlyer

---
