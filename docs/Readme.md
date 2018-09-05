# Demomap / Multimap

 <script>
    function openUrl() {
      var urlToOpenVal = document.getElementById("urlToOpen").value;
      if (urlToOpenVal.length < 1) {
        alert('Bitte Url angeben!')
        return;
      }
      if (urlToOpenVal.indexOf("http://") == -1 && urlToOpenVal.indexOf("https://") == -1) {
        urlToOpenVal = "http://" + urlToOpenVal;
      }
      window.open(urlToOpenVal);
    }

    function doSearch(searchUrl) {
      var searchStringVal = document.getElementById("searchString").value;
      window.open(searchUrl + searchStringVal);
    }
  </script>
 <div class="well well-lg">
      <div class="row margin-bootom-xs">
        <label>Gehe zu URL:</label>
      </div>
      <div class="row margin-bootom-xs">
        <div class="col-lg-11 col-md-10 col-sm-10 col-xs-9">
          <input id="urlToOpen" name="urlToOpen" type="url" class="form-control" required>
        </div>
        <div class="col-lg-1 col-md-2 col-sm-2 col-xs-3">
          <input type="button" value="Öffne URL" onclick="openUrl()">
        </div>
      </div>
      <div class="clearfix"></div>
      <div class="row martin-top-xs">
        <label>Online Suche:</label>
      </div>
      <div class="row">
        <div class="col-lg-8 col-md-7 col-sm-6 col-xs-5">
          <input class="form-control" id="searchString" name="searchString" type="text" class="" size="120" required>
        </div>
        <div class="col-lg-4 col-md-5 col-sm-6 col-xs-7">
          <div class="btn-group pull-right">
          <!-- <div class="container"> -->
              <input type="button" value="QWant" onclick="doSearch('https://www.qwant.com/?t=all&q=')">
              <input type="button" value="DDG" onclick="doSearch('https://duckduckgo.com/?q=')">
              <input type="button" value="Google" onclick="doSearch('https://www.google.at/search?q=')">
              <input type="button" value="Bing" onclick="doSearch('https://www.bing.com/search?q=')">
          </div>
        </div>
      </div>
    </div>

- [Index auf Chello.at](http://members.chello.at/aschweitzer/index.html)

- [Index AUF github](./myindex.html)

- [Multimap](./multimap)

- [Mulitmap (chello hosted)](http://members.chello.at/~aschweitzer/multimap)

- [Zapfenrechner (Github)](./zapfen/)

- [Multiwetter (chello hosted)](http://members.chello.at/~aschweitzer/multiweather/)

- [Bahnhofsuhr (chello hosted)](http://members.chello.at/~aschweitzer/bahnhofsuhr/)

- [PTB Atomuhr (chello hosted)](http://members.chello.at/~aschweitzer/atomuhr/)

- [PTB Atomuhr (direkt)](https://uhr.ptb.de/)


<script>var pfHeaderImgUrl = '';var pfHeaderTagline = '';var pfdisableClickToDel = 0;var pfHideImages = 0;var pfImageDisplayStyle = 'right';var pfDisablePDF = 0;var pfDisableEmail = 0;var pfDisablePrint = 0;var pfCustomCSS = '';var pfBtVersion='1';(function(){var js,pf;pf=document.createElement('script');pf.type='text/javascript';pf.src='//cdn.printfriendly.com/printfriendly.js';document.getElementsByTagName('head')[0].appendChild(pf)})();<a href="https://www.printfriendly.com" style="color:#6D9F00;text-decoration:none;" class="printfriendly" onclick="window.print();return false;" title="Printer Friendly and PDF"><img style="border:none;-webkit-box-shadow:none;box-shadow:none;" src="//cdn.printfriendly.com/buttons/printfriendly-pdf-email-button-notext.png" alt="Print Friendly and PDF"/></a>
</script>

----

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
