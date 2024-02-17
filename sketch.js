function setup() {
  frameRate(60);
  createCanvas(800, 600);
  
  simulationActive = true;
  mainWindowWidth = 600;
  mainWindowHeight = 600;
  squareGridNumber = 50;

  balls = [];
  cannons = [
    //Blue: 1, Green: 2, Red: 3, Yellow: 4
    new Cannon(new Team(1, createVector(mainWindowWidth - 10, 10))),
    new Cannon(new Team(2, createVector(10, mainWindowHeight - 10))),
    new Cannon(new Team(3, createVector(10, 10))),
    new Cannon(new Team(4, createVector(mainWindowWidth - 10, mainWindowHeight - 10)))];

  grid = [];

  for (let i = 0; i < squareGridNumber; i++) {
    for(let j = 0; j < squareGridNumber; j++) {
      
      let position = createVector(i * (mainWindowHeight / squareGridNumber), j * (mainWindowHeight / squareGridNumber));
      let team;

      if (position.x < mainWindowWidth / 2 && position.y < mainWindowHeight / 2) {
        team = cannons[2].team; // Top-left corner, initial angle facing towards the middle
      } else if (position.x >= mainWindowWidth / 2 && position.y < mainWindowHeight / 2) {
        team = cannons[0].team; // Top-right corner, initial angle facing towards the middle
      } else if (position.x < mainWindowWidth / 2 && position.y >= mainWindowHeight / 2) {
        team = cannons[1].team; // Bottom-left corner, initial angle facing towards the middle
      } else {
        team = cannons[3].team; // Bottom-right corner, initial angle facing towards the middle
      }  

      grid.push(new GridSquare(team, position));
    }
  }
}

function draw() {
  if (simulationActive) {
    background(220);
    let redCount = 0;
    let greenCount = 0;
    let blueCount = 0;
    let totalCollisions = 0;
    
    //let randomNumber = Math.floor(Math.random() * 100);
    //if (active === true && randomNumber === 1 && balls.length < 100) {
    //  balls.push(new Ball(new Team(Math.floor(random(3)), random(width), random(height))));
    //}
    
    grid.forEach(grid => {
      grid.display();
    });

    cannons.forEach((cannon, index) => {
      cannon.update();

      let newBall = cannon.fire();
      if (newBall) {
        balls.push(newBall);
      }

      cannon.display();

      if (cannon.markedForDeletion) {
        cannons.splice(index, 1);
      }
    });


    balls.forEach(ball => ball.hasCollided = false);
    balls.forEach((ball, index) => {
      ball.update();
      ball.display();

      switch (ball.team.colour) {
        case '#F00':
          redCount++;
          break;
        case '#0F0':
          greenCount++;
          break;
        case '#00F':
          blueCount++;
          break;
      }
      totalCollisions += ball.totalCollisions;
      if (ball.markedForDeletion) {
        balls.splice(index, 1);
      }
    });
    
    
    fill(0);
    textSize(16);
    textAlign(RIGHT);
    text("Red: " + redCount, mainWindowWidth - 10, 20);
    text("Green: " + greenCount, mainWindowWidth - 10, 40);
    text("Blue: " + blueCount, mainWindowWidth - 10, 60);
    text("Total: " + balls.length, mainWindowWidth - 10, 80);
    text("Total Collision:" + totalCollisions, mainWindowWidth - 10, 100);
  }
}

function keyPressed() {
  if (keyCode === 32) {
    if (active) {
      balls.forEach(ball => ball.stopBall());  
    }
    else {
      balls.forEach(ball => ball.startBall());  
    }
    active = !active;
  } else if (keyCode === 67) {
    balls = [];
  }
}