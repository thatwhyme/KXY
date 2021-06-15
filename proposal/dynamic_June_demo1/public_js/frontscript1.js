function fixedDiv(){
    var d1 = document.getElementById("div1");
    var d2 = document.getElementById("body");
    var h = window.document.body.clientHeight;
	// d2.style.position="center";
    d1.style.height=h*0.01;
    d2.style.height=h*0.92;
}
window.οnlοad=function(){
    fixedDiv();
}
window.οnresize=function(){
    fixedDiv();
}
