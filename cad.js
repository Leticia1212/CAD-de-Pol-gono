//2) Implementar o CAD de polígono em que cada ponto possa
// ter sua cor. Porém faça o programa com feedback de onde os
// pontos foram criados mesmo antes de fechar o polígono.
// Ideia: Usar transparência.

"use strict";

var gl;
var index = 0;
var maxPoints = 100;
var floatSize = Float32Array.BYTES_PER_ELEMENT;
var fechado = false;

var vBuffer, cBuffer;

//7 cores para o cad que escolhi
var colorList = [
  vec4(1, 0, 0, 1.0),//vermelho
  vec4(0, 0, 1, 1.0),//azul
  vec4(0, 1, 0, 1.0),//verde
  vec4(1, 1, 0, 1.0),//amarelo
  vec4(0.0, 0.0, 0.0, 1.0)//preto
];

init();

function init() {
  var canvas = document.getElementById("gl-canvas");
  gl = canvas.getContext("webgl2");
  if (!gl) alert("WebGL 2.0 não disponível");

  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(1, 1, 1, 1);

  var program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  //buffer de posicoes
  vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, maxPoints * 2 * floatSize, gl.DYNAMIC_DRAW);

  var positionLoc = gl.getAttribLocation(program, "aPosition");
  gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(positionLoc);

  //buffer para as cores
  cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, maxPoints * 4 * floatSize, gl.DYNAMIC_DRAW);

  var colorLoc = gl.getAttribLocation(program, "aColor");
  gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(colorLoc);

  //adiciona o ponto e a cor no index atual com o click no canvas
  canvas.addEventListener("click", function(event) {
    if (index == maxPoints){
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    //Posiçao no mundo
    var t = vec2(-1 + 2*event.offsetX/canvas.width
        , 1 - 2*event.offsetY/canvas.height);
    
    //envia posição do ponto para adicionar
    gl.bufferSubData(gl.ARRAY_BUFFER, index*2*floatSize, flatten(t));


    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    t = colorList[index%5];//5 é o total de cores da lista

    //envia cor escolhida
    gl.bufferSubData(gl.ARRAY_BUFFER, index*4*floatSize, flatten(t));

    index++;//total de pontos adicionados
  });

  //botao que ira fechar o poligono apartir de 3 pontos escolhidos, menos que isso não fecha
  document.getElementById("fechar").addEventListener("click", function() {
    if (index >= 3) {
      fechado = true; //o minimo para fechar o poligono 
    }
  });

  render();
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.POINTS, 0, index);//mostra os pontos escolhidos
    
    if (fechado) {
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, index);//fecha o polígono se for true
      } else {
        gl.drawArrays(gl.LINE_STRIP, 0, index);//liga os pontos
      }
  
    requestAnimationFrame(render);
  }
