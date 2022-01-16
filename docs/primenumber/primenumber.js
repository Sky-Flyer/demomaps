//"use strict";
var primeNumbers = [];
var maxValidBound = 1000000;
var self=this;

this.myIsNaN = function(n){
    if (typeof Number.isNaN == 'function')
    {
        return Number.isNaN(n);
    }
    if(typeof isNaN == 'function'){
        return isNaN(n);
    }
    if(typeof n == 'number'){
        return false;
    }
    else{
        return true;
    }
}

this.isPrimeSimple = function(n){
    if(myIsNaN(n) || n<=1 ) {return false;}
    var i;
    for(i=2;i<n;i++){
        if(n%i==0){
            return false;
        }
    }
    return true;
}
this.isPrimeOpt = function(n){
    if(myIsNaN(n) || n<=1 ) {return false;}
    var i;
    
    for(i=2;i*i<=n;i++){
        if(n%i==0){
            return false;
        }
    }
    //primeNumbers.push(n);
    return true;			
}

function engage(){
    //document.getElementById('outDiv').innerHTML ='<img src="ajax-loader.gif" alt="activity indicator">';
    var maxBoundVal = document.getElementById('maxBound').value;
    var output = "<table class='table-bordered'><tr>";
    var j;
    if(maxBoundVal>maxValidBound){
        document.getElementById('outDiv').innerHTML = "Zahl ist zu groß! Maximal "+maxValidBound+" erlaubt!";
        document.getElementById('maxBound').value = maxValidBound;
        return;
    }
    if(maxBoundVal<1){
        document.getElementById('outDiv').innerHTML = "Zahl ist zu klein!";
        document.getElementById('maxBound').value = 100;
        return;
    }
    for(j=1;j<=maxBoundVal;j++){
        if(isPrimeOpt(j)){
            output+="<td class='primeNumCell'>";
        }
        else{
            output+="<td class='nonPrimeNumCell'>";
        }
        output+=j+"</td>"
        if(j%10==0){
            output+="</tr><tr>";
        }
    }
    output+="</tr></table>";
    document.getElementById('outDiv').innerHTML = output;
}

function clearDiv(){
    document.getElementById('outDiv').innerHTML = "";
}

module.exports = function() { 
     this.sum=function(a,b) { return a+b };
     this.multiply= function(a,b) { return a*b };
     this.isPrimeOpt=self.isPrimeOpt;
}