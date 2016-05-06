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
var square=0;
var temporitzador;  // animacions

var back=false;
var dirAnterior=TECLA.AVALL;

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
       if(autopilot==false) {
           cara.moviment = {dx: 0, dy: 0};    // si la cara s'està movent, la parem

           switch (e.keyCode) {
               case TECLA.AMUNT   :
                   cara.moviment.dy = -1;
                   break;  // ajustem la direcció del moviment d'acord a la tecla que s'ha premut
               case TECLA.AVALL   :
                   cara.moviment.dy = 1;
                   break;
               case TECLA.DRETA   :
                   cara.moviment.dx = 1;
                   break;
               case TECLA.ESQUERRA:
                   cara.moviment.dx = -1;
                   break;
           }
       }
    });

    $(document).keyup(function(){
        if(autopilot!=true)cara.moviment = {dx:0,dy:0};
    });

    $("#mark").change(function(){
        mark=!mark;
    });

    $("#auto").change(function(){
        autopilot=!autopilot;
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
    else if(autopilot){
        var path=expandDesition();

        switch (path) {
            case TECLA.AMUNT   :
                cara.moviment.dy = -1;
                break;  // ajustem la direcció del moviment d'acord a la tecla que s'ha premut
            case TECLA.AVALL   :
                cara.moviment.dy = 1;
                break;
            case TECLA.DRETA   :
                cara.moviment.dx = 1;
                break;
            case TECLA.ESQUERRA:
                cara.moviment.dx = -1;
                break;
        }
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


function expandDesition() {

    var upHeuristic;
    var downHeuristic;
    var rightHeuristic;
    var leftHeuristic;

    var heuristics;

    var lowest;
    var aux;
    var jump=false;

    // TOP
    cara.y += -1;
    if (hiHaCol_lisio()) {
        upHeuristic = 50000
    }
    else if (hiHaMarca(1)) {
        upHeuristic = 40000
    }
    else {
        upHeuristic = (894 - cara.x) + (580 - cara.y); // Constant values are the x and y positions of the goal's cords
    }
    cara.y -= -1;

    // DOWN
    cara.y += 1;
    if (hiHaCol_lisio()) {
        downHeuristic = 50000
    }
    else if (hiHaMarca(2)) {
        downHeuristic = 40000
    }
    else {
        downHeuristic = (894 - cara.x) + (580 - cara.y); // Constant values are the x and y positions of the goal's cords
    }
    cara.y -= 1;

    // RIGHT
    cara.x += 1;
    if (hiHaCol_lisio()) {
        rightHeuristic = 50000
    }
    else if (hiHaMarca(3)) {
        rightHeuristic = 40000
    }
    else {
        rightHeuristic = (894 - cara.x) + (580 - cara.y); // Constant values are the x and y positions of the goal's cords
    }
    cara.x -= 1;

    // LEFT
    cara.x += -1;
    if (hiHaCol_lisio()) {
        leftHeuristic = 50000
    }
    else if (hiHaMarca(4)) {
        leftHeuristic = 40000
    }
    else {
        leftHeuristic = (894 - cara.x) + (580 - cara.y); // Constant values are the x and y positions of the goal's cords
    }
    cara.x -= -1;

    if(upHeuristic >= 40000 && downHeuristic >= 40000 && rightHeuristic >= 40000 && leftHeuristic >= 40000 && back==false){
        back = true;
        if (dirAnterior==TECLA.AMUNT)lowest=TECLA.AVALL;
        else if (dirAnterior==TECLA.AVALL)lowest=TECLA.AMUNT;
        else if (dirAnterior==TECLA.DRETA)lowest=TECLA.ESQUERRA;
        else if (dirAnterior==TECLA.ESQUERRA)lowest=TECLA.DRETA;
        return(lowest);
    }

    if (back) {

        // Completar siguiendo linea derecha
        // TOP
        cara.y += -1;
        if (hiHaCol_lisio()) {
            upHeuristic = 50000

        }
        else if (!hiHaMarca(1)) {
            back = false;
            upHeuristic = 0;
        }
        else if (dirAnterior == TECLA.ESQUERRA) upHeuristic = 0;
        else if (dirAnterior == TECLA.AVALL) upHeuristic = 60;
        else if (dirAnterior == TECLA.DRETA) upHeuristic = 10;
        else upHeuristic = 50;

        cara.y -= -1;

        // DOWN
        cara.y += 1;
        if (hiHaCol_lisio()) {
            downHeuristic = 50000
        }
        else if (!hiHaMarca(1)) {
            back = false;
            downHeuristic = 0;
        }
        else if (dirAnterior == TECLA.DRETA) downHeuristic = 0;
        else if (dirAnterior == TECLA.AMUNT) downHeuristic = 60;
        else if (dirAnterior == TECLA.ESQUERRA) downHeuristic = 10;
        else downHeuristic = 50;

        cara.y -= 1;

        // RIGHT
        cara.x += 1;
        if (hiHaCol_lisio()) {
            rightHeuristic = 50000
        }
        else if (!hiHaMarca(1)) {
            back = false;
            rightHeuristic = 0;
        }
        else if (dirAnterior == TECLA.AMUNT) rightHeuristic = 0;
        else if (dirAnterior == TECLA.ESQUERRA) rightHeuristic =60;
        else if (dirAnterior == TECLA.AVALL) rightHeuristic = 10;
        else rightHeuristic = 50;

        cara.x -= 1;

        // LEFT
        if (hiHaCol_lisio()) {
            leftHeuristic = 50000
        }
        else if (!hiHaMarca(1)) {
            back = false;
            leftHeuristic = 0;
        }
        else if (dirAnterior == TECLA.AVALL) leftHeuristic = 0;
        else if (dirAnterior == TECLA.DRETA) leftHeuristic = 60;
        else if (dirAnterior == TECLA.AMUNT) leftHeuristic = 10;
        else leftHeuristic = 50;

        cara.x -= -1;

    }

    if (upHeuristic < 0)upHeuristic *= -1;
    if (downHeuristic < 0)downHeuristic *= -1;
    if (rightHeuristic < 0)rightHeuristic *= -1;
    if (leftHeuristic < 0)leftHeuristic *= -1;

    alert("Up Heursitic= " + upHeuristic + "\n Down Heuristic= " + downHeuristic + "\n Right Heuristic= " + rightHeuristic + "\n Left Heuristic= " + leftHeuristic + "\n Back= " + back+ "\n Anterior= " + dirAnterior);

    lowest = TECLA.AMUNT;
    if (downHeuristic < upHeuristic) {
        lowest = TECLA.AVALL;
        aux = TECLA.AMUNT;
    }
    if (rightHeuristic < downHeuristic && rightHeuristic < upHeuristic) {
        lowest = TECLA.DRETA;
        if (downHeuristic < upHeuristic)aux = TECLA.AVALL;
    }
    if (leftHeuristic < rightHeuristic && leftHeuristic < upHeuristic && leftHeuristic < downHeuristic) {
        lowest = TECLA.ESQUERRA;
        if (rightHeuristic < upHeuristic && rightHeuristic < downHeuristic)aux = TECLA.DRETA;
    }
    dirAnterior=lowest;
    return(lowest);
}



function hiHaMarca(dir) {
    // Agafem el bloc de píxels de la imatge on està situada la cara
    if(dir==1)var imgData = context.getImageData(cara.x, cara.y-16, 1, 1);
    else if(dir==2)var imgData = context.getImageData(cara.x, cara.y+16, 1, 1);
    else if(dir==3)var imgData = context.getImageData(cara.x+16, cara.y, 1, 1);
    else if(dir==4)var imgData = context.getImageData(cara.x-16, cara.y, 1, 1);
    var pixels = imgData.data;

    // Mirem tots els píxels del bloc
    for (var i = 0; n = pixels.length, i < n; i += 4) {
        var red = pixels[i];
        var green = pixels[i+1];
        var blue = pixels[i+2];
        var alpha = pixels[i+3];

        // Busquem un píxels de color negre, és a dir, la vora de la pista
        if (red>0 && green>0 && blue>0&&blue<255) {
            return true;
        }
    }
    // Si arribem aquí, és que no hi ha col·lisió.
    return false;
}