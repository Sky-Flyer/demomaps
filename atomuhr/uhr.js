
(function () {	// private space

 // MVVM 
 var timeViewModel={
  hourHand: ko.observable(),
  minuteHand: ko.observable(),
  secondHand: ko.observable(),
  connected: ko.observable(),
  deltaShow: ko.observable(),
  clickDelta: function () {
   var self=this;
   this.deltaShow(!self.deltaShow());},
  offset: ko.observable(),
  accuracy: ko.observable(),
  ptbtime: ko.observable(),
  localtimezone: ko.observable(),
  svgWidth: ko.observable(),
  svgHeight: ko.observable(),
  leap: ko.observable(),
  leapSec: ko.observable()
  }
 // Activates knockout.js
 ko.applyBindings(timeViewModel);

 // remove knockout attribute (not necessary)
 $("[data-bind]").removeAttr('data-bind');

 // Set PTB time
 var wsock=io('https://uhr.ptb.de'),   // document.location.origin	//    '<<----CFG.url---->>'),     //SOCKET
     redo=60000,      // duration in ms when clock is resetted with PTB time
     n=5,     // Sample to calculate the delay
     ad=Array(),      // series of time requests results (ping-pong)
     timeDelta,       // Difference between local time tick an server time
     leapDelta=0;	// Leap ms correction

 // Add official German time format function to Date-Object. Caution! Methods work only on this site regard to leap second!
 Date.prototype.PTBTime=function() {
  // letzten Sonntag im März um 2 Uhr mitteleuropäischer Zeit auf 3 Uhr vorstellen. D.h. ab 1 Uhr UTC im letzten Sonntag im März UTC+2 verwenden.
  // letzten Sonntag im Oktober um 3 Uhr mitteleuropäischer Sommerzeit auf 2 Uhr zurück stellen. D.h. ab 1 Uhr UTC im letzten Sonntag im Oktober UTC+1 verwenden.
  var mth=this.getUTCMonth(),
      dt=this.getUTCDate(),
      dy=this.getUTCDay(),
      hr=this.getUTCHours();
  // PTB: German time: Don't use any libary. Calculate CEST by the script:
  this.utc2ptb=1;     //CET
  if ((mth>2 && mth<9) ||     // April-September
      (mth===2 &&    // march
       (dt>24) && 
       ((dy==0 && hr>=1) ||  // on sunday in the last 7 days at more then 1 o'clock utc
        (dy>0 && (dt-dy)>24))) ||      // Days after the last sunday in march
      (mth===9 &&    // october
       !((dt>24) &&     // not after the last Sunday at 1 o'clock in october
         ((dy==0 && hr>=1) ||  // on sunday in the last 7 days at more then 1 o'clock utc
          (dy>0 && (dt-dy)>24))))      // Days after the last sunday in october
     ) {
   this.utc2ptb=2;}	// CEST!
  // Calculate leap second correction and show leap info in display! 
  var notYet=0;
  if (timeViewModel.leap()==1 || timeViewModel.leap()==2) {
   var mdys=[0,0,31,0,0,30,0,0,30,0,0,31],	// possible days/months for leap second
       leapTmp=0;
   if (timeViewModel.leap()==1) leapTmp=-1000;	// last second of month ticks two times
   if (timeViewModel.leap()==2) leapTmp=1000;		// last second of month don't tick
   if (leapTmp!==0 && mdys[mth]) {
    if (dt===mdys[mth] && hr===23 && this.getUTCMinutes()===59 && this.getUTCSeconds()===59) {
     leapDelta=leapTmp;
     notYet=timeViewModel.leap()==1;
     timeViewModel.leap(0);
     timeViewModel.leapSec('');}	// hide leap second text
    else if (!timeViewModel.leapSec()) {	// set leap second text
     var lsTmp=new Date(Date.UTC(this.getUTCFullYear(),mth,mdys[mth],23+this.utc2ptb,59,59));
     timeViewModel.leapSec(
      ('0'+lsTmp.getUTCDate()).substr(-2)+'.'+
      ('0'+(lsTmp.getUTCMonth()+1)).substr(-2)+'.'+
      lsTmp.getUTCFullYear()+' '+
      ('0'+lsTmp.getUTCHours()).substr(-2)+':'+
      ('0'+lsTmp.getUTCMinutes()).substr(-2)+':'+
      ('0'+lsTmp.getUTCSeconds()).substr(-2));}}}
  // make leap second and timezone correction:
  this.ptbtime=new Date(this.valueOf()+(notYet ? 0 : leapDelta)+(this.utc2ptb*60*60*1000));	// if leap = 1 set leapDelta beginning with next tick.
  return this.ptbtime;}
 Date.prototype.getPTBHours=function() {
  return this.ptbtime.getUTCHours();};
 Date.prototype.getPTBMinutes=function() {
  return this.ptbtime.getUTCMinutes();}
 Date.prototype.getPTBSeconds=function() {
  return this.ptbtime.getUTCSeconds();}
 Date.prototype.getPTBTimezone=function() {
  return 'UTC+0'+this.utc2ptb+':00 ('+(this.utc2ptb==1 ? 'MEZ' : 'MESZ')+')';}

 // e.g. Safari doesn't support window.performance, so build anything related, good enough as workaround until Safari supports the method
 if (typeof window.performance === 'undefined') {
  window.performance={};}
 if (typeof window.performance.now !== 'function') {
  window.performance.now=function now(){
   if ('function'===typeof Date.now) {
    return Date.now();}
   else {
    return new Date().valueOf();}}}

 // Nice offset format
 function timeDiff(p) {
  var locTm = new Date();
  d=locTm.getTime()-(locTm.getTimezoneOffset()*60*1000)-p;
  var n=(d<0);
  if (n) d*=-1;
  var mi={
   d: [24*60*60*1000],
   h: [60*60*1000],
   min: [60*1000],
   s: [1000],
   ms: [1]},
   b=[];
  for (x in mi) {
   mi[x][1]=Math.floor(d/mi[x][0]);
   d=d%mi[x][0];}
  for (x in mi) {
   if (mi[x][1]!=0) b.push(mi[x][1]+' '+x);}
  b.push((b.length==0 ? '0 ms' : (n ? 'nach' : 'vor')));
  timeViewModel.offset(b.join(' '));}

 // Reset Clock
 function resetClock(err) {
  timeViewModel.connected(false).hourHand(0).minuteHand(0).secondHand(0).ptbtime('--:--:--').localtimezone('--');};

 var ppTimeout,
     cbTimeout,
     ppActiv=false;  // force only one activ pingpong

 // Calculate median of delay to server and time offset to server
 wsock.on('po!', function(pong) {
  // Calculate difference in ms between returned server time an performance.now();
  var dtB=performance.now()-pong.ct,	// roundtrip to server 
      tmDlt=performance.now()-pong.st-(dtB/2);	// how many milliseconds is performance.now() away from UTC
  ad.push([tmDlt,dtB,pong.rd]);
  if (ad.length>n) {
   ad.shift();}
  ad.sort(function(a,b){return a[1]-b[1]});	// sort by dtb
  timeDelta=ad[0][0];		// use tmDlt of fastest dtb as time correction value
  leapDelta=0;		// reset calculated leap second correction because server gives correct time
  // console.log('dtB:', ad[0][1], 'tmDlt:', ad[0][0], 'rootdelay:', ad[0][2], 'ad.len:', ad.length);
  timeViewModel.accuracy('±'+Math.round((ad[0][1]+ad[0][2])/2)+' ms');	// use (dtB+rootdelay)/2 as uncertainty-value
  pong.i+=1;
  if (pong.i<n) {
   wsock.emit('pi!', {i:pong.i, ct: performance.now()});}
  else {
   ppActiv=false;
   if (pong.l==3) {	// leap=3 Server clock not syncronized
    timeViewModel.connected(false);}
   else {
    timeViewModel.leap(pong.l);
    if (!pong.l) {
     timeViewModel.leapSec('');}}	// leap
   // Redo PingPong after "redo" ms.
   ppTimeout=setTimeout(function() {
    if (wsock.connected) {
     ad=Array();
     ppActiv=true;
     wsock.emit('pi!', {i:0, ct: performance.now()});}},redo);}});
 wsock.on('connect',function() {
  if (!ppActiv) {
   // console.log('Neuer Connect', wsock);
   clearTimeout(ppTimeout);
   clearTimeout(cbTimeout);
   ad=Array();  
   ppActiv=true;
   wsock.emit('pi!', {i:0, ct: performance.now()});
   timeViewModel.connected(true);
   cbTimeout=setTimeout(clockBeat, 1000);}});
 wsock.on('disconnect',function () {
  clearTimeout(ppTimeout);
  timeViewModel.connected(false);});
 wsock.on('error',resetClock);

 // format svg rotate
 function transRotFormat(angle) {
  return 'rotate(' + angle + ', 100, 100)';};

 // clock ticker
 function clockBeat() {
  if (typeof clockBeat.prevClock == 'undefined') clockBeat.prevClock=new Date();
  // What UTC time is it?
  var clock=new Date(performance.now()-timeDelta);
  if ((clock.valueOf()-clockBeat.prevClock.valueOf()) > 2200) {	// clock runs more then 1200ms not steadily (standby, sleep-mode etc.)-> run correction
   if (!timeViewModel.connected()) {	// not connected
    resetClock();	// Stop watch
    return;}
   else {
    clearTimeout(ppTimeout);
    ad=Array();
    wsock.emit('pi!', {i:0, ct: performance.now()});}}
  else {
   timeDiff(clock.PTBTime());
   var hours=clock.getPTBHours(),
       minutes=clock.getPTBMinutes(),
       seconds=clock.getPTBSeconds();
   timeViewModel.hourHand(transRotFormat(hours * 30 + minutes * 0.5)); // jeweils Zeigerwinkel setzen
   timeViewModel.minuteHand(transRotFormat(minutes * 6));
   timeViewModel.secondHand(transRotFormat(seconds * 6));
   timeViewModel.ptbtime(('0'+hours).substr(-2)+':'+('0'+minutes).substr(-2)+':'+('0'+seconds).substr(-2));
   timeViewModel.localtimezone(clock.getPTBTimezone());}
  clockBeat.prevClock.setTime(clock.valueOf());
  cbTimeout=setTimeout(clockBeat, 1000-clock.getMilliseconds());}

 })();
