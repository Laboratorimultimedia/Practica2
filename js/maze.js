/**
 * Created by Black Phoenix on 29/04/2016.
 */

var canvas, context;
var imatgePista, imatgeCara;
var cara={x:0,y:0, moviment:{dx:0,dy:0}};           // posició actual de la cara i moviment de la cara
var direccio=[{dx:1,dy:0},{dx:0,dy:1},{dx:-1,dy:0},{dx:0,dy:-1}];  // dreta, avall, esquerra i amunt

const TECLA={AMUNT:87,AVALL:83,DRETA:68,ESQUERRA:65, MAJUSCULES:16};  // codi de la tecla
var teclaShift=false; // quan apretem la tecla Shift, avancem píxel a píxel
var mark;        // no deixa rastre del camí recorregut
var autopilot;

var temporitzador;  // animacions

$(document).ready(function(){

    // Selecció Nivell

    var codiImatge="";
    var imatgeSel;
    var nomImatge;
    var width;
    var height;

      //////////////////////////////
     ///// Seleccionar nivell /////
    //////////////////////////////

    $(".img").click(function(e){

        imatgeSel = $(this);
        imatgeSel.css("border", "#FFFF00 2px solid");

        nomImatge = $(this).attr('id');console.log(nomImatge);
        width = $(this).attr('width');console.log(nomImatge);
        height = $(this).attr('height');console.log(nomImatge);

        codiImatge = '<img id="pista" src="imatges/'+nomImatge+'.jpg" width="'+width+'" height="'+height+'"/>'; console.log(codiImatge);

        $("#resources").append(codiImatge);
    });

 // End Seleccionar nivell   ///
//////////////////////////////

    canvas=$("#canvas")[0];              // Objecte DOM, equivalent a document.getElementById("canvas") 
    imatgePista=$("#pista")[0];	         // Objecte DOM   

    canvas.width=imatgePista.width;              // dimenciona el llenç d'acord a la mida de la imatge
    canvas.height=imatgePista.height;
    $(canvas).css("margin","50px auto");

    context=canvas.getContext("2d");     // agafem el context per poder dibuixar
    context.drawImage(imatgePista, 0,0);         // "dibuixa" la imatge en el llenç

    imatgeCara=$("#cara")[0];
    cara.x=115; cara.y=10;
    context.drawImage(imatgeCara, cara.x, cara.y);  // "dibuixa" la cara

    mark=$("#mark").is(":checked");
    autopilot=$("#auto").is(":checked");

    temporitzador = window.requestAnimationFrame(dibuixaFotograma);  // s'actualitza a f=60Hz, 60fps

    // events
    $(document).keydown(function(e){
        cara.moviment = {dx:0,dy:0};    // si la cara s'està movent, la parem
        switch(e.keyCode){
            case TECLA.AMUNT   : cara.moviment.dy = -1; break;  // ajustem la direcció del moviment d'acord a la tecla que s'ha premut
            case TECLA.AVALL   : cara.moviment.dy =  1; break;
            case TECLA.DRETA   : cara.moviment.dx =  1; break;
            case TECLA.ESQUERRA: cara.moviment.dx = -1; break;
        }
    });

    $(document).keyup(function(){
        cara.moviment = {dx:0,dy:0};
    });

    $("#mark").change(function(){
        mark=!mark;
    });

});




function dibuixaFotograma() {
    // Només dibuixa un nou fotograma si la cara es mou
    if (cara.moviment.dx != 0 || cara.moviment.dy != 0) {
        if(mark){
            // Esborra la posició anterior de la cara però deixa un rastre de color groc per crear un efecte mark
            context.beginPath();
            context.fillStyle = "#ffb";             // color groc
            context.rect(cara.x, cara.y, 15, 15);
            context.fill();
        }
        else{
            // Esborra la posició anterior de la cara 
            context.beginPath();
            context.fillStyle = "#fff";             // color blanc
            context.rect(cara.x, cara.y, 15, 15);
            context.fill();
        }
        // Incrementa la posició de la cara
        cara.x += cara.moviment.dx;
        cara.y += cara.moviment.dy;
        // Atura la cara si toca la paret del laberint i retrocedeix a la posició anterior
        if (hiHaCol_lisio()) {
            cara.x -= cara.moviment.dx;
            cara.y -= cara.moviment.dy;
            cara.moviment.dx = 0;
            cara.moviment.dy = 0;
        }
        // Dibuixa la cara en la nova posició
        context.drawImage(imatgeCara, cara.x, cara.y);

    }
    window.requestAnimationFrame(dibuixaFotograma);  // es crida un cop cada f=60Hz, 60fps
}

function hiHaCol_lisio() {
    // Agafem el bloc de píxels de la imatge on està situada la cara
    var imgData = context.getImageData(cara.x-1, cara.y-1, 15+2, 15+2);
    var pixels = imgData.data;

    // Mirem tots els píxels del bloc
    for (var i = 0; n = pixels.length, i < n; i += 4) {
        var red = pixels[i];
        var green = pixels[i+1];
        var blue = pixels[i+2];
        var alpha = pixels[i+3];

        // Busquem un píxels de color negre, és a dir, la vora de la pista
        if (red==0 && green==0 && blue==0 ) {
            return true;
        }
    }
    // Si arribem aquí, és que no hi ha col·lisió.
    return false;
}

$("#start").click(function(e) {
    $("#menu").hide();
    $("#maze").show();
});