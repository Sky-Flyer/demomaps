//"use strict";
var primeNumbers = [];
var maxValidBound = 1000000000;
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

function engage(){
    //document.getElementById('outDiv').innerHTML ='<img src="ajax-loader.gif" alt="activity indicator">';
    var startNumVal = document.getElementById('startNum').value;
	var output = "<table class='table-bordered table-striped'><tr>";
    var j;
    if(startNumVal>maxValidBound){
        document.getElementById('outDiv').innerHTML = "Zahl ist zu groß! Maximal "+maxValidBound+" erlaubt!";
        document.getElementById('startNum').value = maxValidBound;
        return;
    }
    if(startNumVal<0){
        document.getElementById('outDiv').innerHTML = "Zahl ist zu klein!";
        document.getElementById('startNum').value = 100;
        return;
    }
	
    for(j=2;j<10;j++){
		output+="<td class='valCell'>";
		output+=startNumVal
        output+="</td>"
		output+="<td> * "+j+"</td></tr><tr>";
        startNumVal*=j;
    }
	for(j=2;j<10;j++){
		output+="<td class='valCell'>";
		output+=startNumVal
        output+="</td>"
		output+="<td> : "+j+"</td></tr><tr>";
        startNumVal/=j;
    }
	output+="<td class='valCell'>";
		output+=startNumVal
        output+="</td>"
		output+="<td> </td>"
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