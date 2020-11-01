let characterTilt = 0;
let characterTiltDirection = .9;
let difficultyLevel = .995;

function waitForLoad() {
  document.querySelector("#startButton").style.display = "none";
  imageContainer.onload = gameLoop();
}

function gameLoop() {
  document.onkeydown = asyncMove;
  document.onmousedown = attack;
  
  let renderLoop = window.requestAnimationFrame(renderPage);

}

function renderPage() {
  let display = playArea.getContext("2d");
  display.clearRect(0, 0, playArea.width, playArea.height);
  display.imageSmoothingEnabled = false;
  display.canvas.width = window.innerWidth;
  display.canvas.height = window.innerHeight;
  
  if (Math.random() > difficultyLevel)
    buildGoblin();

  if (Math.random() > .999)
    difficultyLevel -= .001

  display.shadowColor = "black";
  display.shadowBlur = 15;
  
  let castle = document.getElementById("castle");
  castle.onload = display.drawImage(castle, (2*playArea.width)/5, (playArea.height-(playArea.width/5))/2, playArea.width/5, playArea.width/5);

  if (Math.abs(characterTilt) >= 10)
    characterTiltDirection *= -1;
  characterTilt += characterTiltDirection;

  for (i=characters.length-1; i>=0; i--) {
    display.translate(characters[i].positionX+50, characters[i].positionY+100);
    display.rotate(characterTilt * Math.PI / 180);
    display.translate(-characters[i].positionX-50, -characters[i].positionY-100);
    characters[i].image.onload = display.drawImage(characters[i].image, characters[i].positionX, characters[i].positionY, characters[i].width, characters[i].height);
    display.setTransform(1,0,0,1,0,0);
  }

  for (g=1; g<characters.length; g++) {
    if (characters[g].positionX < playArea.width/2)
      characters[g].positionX += 1;
    if (characters[g].positionX > playArea.width/2)
      characters[g].positionX -= 1;
    if (characters[g].positionY < playArea.height/2)
      characters[g].positionY += 1;
    if (characters[g].positionY > playArea.height/2)
      characters[g].positionY -= 1;
  }

  for (g=1; g<characters.length; g++) {
    if ((characters[g].positionX > (2*playArea.width)/5) && (characters[g].positionX < (11*playArea.width)/20) && (characters[g].positionY > (playArea.height-(playArea.width/5))/2) && (characters[g].positionY < (playArea.height+(playArea.width/5))/2)) {
      document.onkeydown = null;
      document.onmousedown = null;  
      endgameScreen();
      return 0;
    }
  }
  window.requestAnimationFrame(renderPage);
}

function character(type, imageName, positionX, positionY) {
  this.type = type;
  this.image = document.getElementById(imageName);
  this.positionX = positionX;
  this.positionY = positionY;
  this.width = 100;
  this.height = 100;
}

function buildGoblin() {
  let side = Math.floor(Math.random() * 3);
  let positionX, positionY;
  switch (side) {
    case 0:
      positionX = 0;
      positionY = Math.floor(Math.random() * playArea.height);
      break;
    case 1:
      positionX = Math.floor(Math.random() * playArea.width);
      positionY = 0;
      break;
    case 2:
      positionX = playArea.width;
      positionY = Math.floor(Math.random() * playArea.height);
      break;
    case 3:
      positionX = Math.floor(Math.random() * playArea.width);
      positionY = playArea.height;
      break;
  }
  let goblin = new character("enemy", "goblin", positionX, positionY);
  characters.push(goblin);
}

function asyncMove(event) {
  setTimeout(move, 0, event);
}

function move(event) {
  switch (event.keyCode) {
    case 37:
      characters[0].positionX -= 8;
      break;
    case 39:
      characters[0].positionX += 8;
      break;
    case 38:
      characters[0].positionY -= 8;
      break;
    case 40:
      characters[0].positionY += 8;
      break;
    case 71:
      buildGoblin();
      break;
  }
}

function attack(event) {
  let bounds = playArea.getBoundingClientRect()
  let positionX = event.clientX - bounds.left;
  let positionY = event.clientY - bounds.top;
  let playerCenterX = characters[0].positionX + 50;
  let playerCenterY = characters[0].positionY + 75;
  let hypotenuse = Math.sqrt(Math.pow(positionX - playerCenterX, 2) + Math.pow(positionY - playerCenterY, 2));
  let scalar = 50 / hypotenuse;
  let scaledPositionX = (positionX - playerCenterX) * scalar;
  let scaledPositionY = (positionY - playerCenterY) * scalar
  let hitboxCenterX = scaledPositionX + playerCenterX;
  let hitboxCenterY = scaledPositionY + playerCenterY;

  for(g=1; g<characters.length; g++) {
    if ((Math.abs(characters[g].positionX + 50 - hitboxCenterX) <= 100) && (Math.abs(characters[g].positionY + 50 - hitboxCenterY) <= 100))
      characters.splice(g, 1);
  }
  
  let angle
  if (scaledPositionX === 0)
    angle = 90;
  else
    angle = Math.abs(Math.atan(scaledPositionY / scaledPositionX) * (180 / Math.PI));
  
  if ((hitboxCenterX >= playerCenterX) && (hitboxCenterY < playerCenterY))
    angle = 90 - angle;
  if ((hitboxCenterX > playerCenterX) && (hitboxCenterY >= playerCenterY))
    angle = 90 + angle;
  if ((hitboxCenterX <= playerCenterX) && (hitboxCenterY > playerCenterY))
    angle = (90 - angle) + 180;
  if ((hitboxCenterX < playerCenterX) && (hitboxCenterY < playerCenterY))
    angle = 270 + angle;

  window.requestAnimationFrame(function() {animateSword(0, angle-10)});
}

function animateSword(tick, angle) {
  let display = playArea.getContext("2d");
  display.imageSmoothingEnabled = false;

  let swordImage = document.getElementById("sword");

  display.translate(characters[0].positionX+50, characters[0].positionY+75);
  display.rotate((angle + tick) * Math.PI / 180);
  display.translate(-characters[0].positionX-50, -characters[0].positionY-75);
  swordImage.onload = display.drawImage(swordImage, characters[0].positionX, characters[0].positionY-75, 100, 200)
  display.setTransform(1,0,0,1,0,0);

  if (tick >= 20)
    return 0;
  else
    window.requestAnimationFrame(function() {animateSword(tick+4, angle)});
}

function endgameScreen() {
  let display = playArea.getContext("2d");
  display.imageSmoothingEnabled = false;
  display.clearRect(0, 0, playArea.width, playArea.height);

  display.shadowColor = "black";
  display.shadowBlur = 15;

  display.font = "bold 100px Optima";
  display.fillStyle = "#9D0404";
  display.textAlign = "center";
  display.fillText("Game Over", playArea.width/2, playArea.height/2);

  display.shadowBlur = 0;

  player.positionX = playArea.width*.65;
  player.positionY = playArea.height/2;
  
  display.translate(player.positionX+150, player.positionY+300);
  display.rotate(70 * Math.PI / 180);
  display.translate(-player.positionX-150, -player.positionY-300);
  player.image.onload = display.drawImage(player.image, player.positionX, player.positionY, 300, 300);
  display.setTransform(1,0,0,1,0,0);
}

imageContainer = document.querySelector("#imageContainer");

let playArea = document.querySelector("#playArea");
let player = new character("player", "knight", window.innerWidth/2, window.innerHeight/2);

let characters = [
  player
];