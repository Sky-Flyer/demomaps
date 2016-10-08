"use strict";
var primeNumbers = [];
var maxValidBound = 100000;

function isPrimeSimple(n){
    if(Number.isNaN(n) || n<=1 ) {return false;}
    var i;
    for(i=2;i<n;i++){
        if(n%i==0){
            return false;
        }
    }
    return true;
}
function isPrimeOpt(n){
    if(Number.isNaN(n) || n<=1 ) {return false;}
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
    var isPrimNum=false;
    for(j=1;j<=maxBoundVal;j++){
        //isPrimNum=isPrimeSimple(j);
        //if (isPrimNum!=isPrimeOpt(j)){console.log("unterschied bei "+j)}
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