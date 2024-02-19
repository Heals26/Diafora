function setup() {
  simulationActive = true;
  wins = [0, 0, 0, 0];
  obstacleWidth = 30;
  rowInterval = 1500;
  lastRowSpawnTime = 0;
  
  frameRate(60);
  createCanvas(800, 600);
  
  this.create();
}

function create() {
  clear();
  mainWindowWidth = 600;
  mainWindowHeight = 600;
  squareGridNumber = 50;

  rouletteWindowWidth = width - mainWindowWidth;
  rouletteWindowHeight = mainWindowHeight / 2;
  
  balls = [];
  cannons = [
    //Blue: 1, Green: 2, Red: 3, Yellow: 4
    new Cannon(new Team(1, createVector(mainWindowWidth - 10, 10))),
    new Cannon(new Team(2, createVector(10, mainWindowHeight - 10))),
    new Cannon(new Team(3, createVector(10, 10))),
    new Cannon(new Team(4, createVector(mainWindowWidth - 10, mainWindowHeight - 10)))];

  grid = [];
  roulette = [new RouletteBall(cannons[0].team, createVector(random(mainWindowWidth, width), 0), createVector(0, rouletteWindowHeight))];
  obstacles = [];
  
  
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
    let yellowCount = 0;
    let totalCollisions = 0;
    let errorCount = 0;

    //let randomNumber = Math.floor(Math.random() * 100);
    //if (active === true && randomNumber === 1 && balls.length < 100) {
    //  balls.push(new Ball(new Team(Math.floor(random(3)), random(width), random(height))));
    //}

    if (millis() - lastRowSpawnTime > rowInterval) {
      lastRowSpawnTime = millis();
    }
    
    grid.forEach(grid => {
      //Blue: 1, Green: 2, Red: 3, Yellow: 4
      grid.display();
      switch (grid.team.id) {
        case 1:
          blueCount ++;
        break;
      case 2:
        greenCount ++;
        break;
      case 3:
        redCount ++;
        break;
      case 4:
        yellowCount ++;
        break;
      default:
        errorCount ++;
        break;
      }
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

    if (cannons.length <= 1) {
      wins[cannons[0].team.id - 1]++;
      create();
    }

    balls.forEach(ball => ball.hasCollided = false);
    balls.forEach((ball, index) => {
      ball.update();
      ball.display();
      totalCollisions += ball.totalCollisions;
      if (ball.markedForDeletion) {
        balls.splice(index, 1);
      }
    });
    
    roulette.forEach(ball => ball.hasCollided = false);
    roulette.forEach((ball, index) => {
      ball.update();
      ball.display();
    })

    obstacles.forEach((obstacle, index) => {
      obstacle.update();
      obstacle.display();
      if (obstacle.markedForDeletion) {
        obstacle.splice(index, 1);
      }
    })
    
    fill(0);
    textSize(16);
    textAlign(RIGHT);
    
    const totalSquares = grid.length;

    const redPercentage = (redCount / totalSquares) * 100;
    const greenPercentage = (greenCount / totalSquares) * 100;
    const bluePercentage = (blueCount / totalSquares) * 100;
    const yellowPercentage = (yellowCount / totalSquares) * 100;

    text("Red Squares: " + redPercentage.toFixed(2) + "%", mainWindowWidth - 10, 20);
    text("Green Squares: " + greenPercentage.toFixed(2) + "%", mainWindowWidth - 10, 40);
    text("Blue Squares: " + bluePercentage.toFixed(2) + "%", mainWindowWidth - 10, 60);
    text("Yellow Squares: " + yellowPercentage.toFixed(2) + "%", mainWindowWidth - 10, 80);
    text('Total Wins: ' + wins, mainWindowWidth - 10, 100)
  }
}

function generateObstacleRow() {
  let obstaclesInRow = [];
  let numObstacles = 20; // Adjust as needed
  let startX = mainWindowWidth + 10; // Adjust as needed
  let startY = height - 10; // Adjust as needed
  for (let i = 0; i < numObstacles; i++) {
    let obstacleX = startX + i * obstacleWidth * 1.5;
    let obstacle = new Obstacle(createVector(obstacleX, startY - obstacleHeight));
    obstaclesInRow.push(obstacle);
  }
  obstacles.push(obstaclesInRow);
}

function keyPressed() {
  if (keyCode === 32) {
    if (simulationActive) {
      balls.forEach(ball => ball.stopBall());  
    }
    else {
      balls.forEach(ball => ball.startBall());  
    }
    simulationActive = !simulationActive;
  } else if (keyCode === 67) {
    this.create();
  }
}