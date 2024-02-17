class Ball {  
  constructor(team, cannon) {
    this.team = team;
    this.radius = 10;
    this.cannon = cannon;
    this.ballSpeed = 5;
    this.markedForDeletion = false;
    
    this.position = createVector(this.team.position.x, this.team.position.y);
    if (cannon === undefined) {
      this.velocity = createVector(this.position.x % 1 == 0 ? -this.ballSpeed : this.ballSpeed, this.position.y % 1 == 0 ? -this.ballSpeed : this.ballSpeed);
    } else {
      this.velocity = createVector(cos(this.cannon.angle) * this.ballSpeed, sin(this.cannon.angle) * this.ballSpeed);
    }
    
    this.storedVelocity = this.velocity;
    
    this.totalCollisions = 0;
    this.hasCollided = false;
  }
  
  display() {
    fill(this.team.colour);
    ellipse(this.position.x, this.position.y, this.radius * 2);
  }
  
  update() {
    this.position.add(this.velocity);
    
    if (this.position.x + this.radius >= mainWindowWidth || this.position.x - this.radius <= 0) {
      this.velocity.x *= -1; // Reverse horizontal velocity
      this.position.x = constrain(this.position.x, this.radius, mainWindowWidth - this.radius);
    }
    
    if (this.position.y + this.radius >= mainWindowHeight || this.position.y - this.radius <= 0) {
      this.velocity.y *= -1; // Reverse vertical velocity
      this.position.y = constrain(this.position.y, this.radius, mainWindowHeight - this.radius);
    }
    
    for (let i = 0; i < balls.length; i++) {
      if (balls[i] !== this && this.intersectsBall(balls[i])) {
        let normalPosition = p5.Vector.sub(balls[i].position, this.position);
        normalPosition.normalize();
        
        let dotProduct = p5.Vector.dot(this.velocity, normalPosition);
        let newVelocity = p5.Vector.sub(this.velocity, p5.Vector.mult(normalPosition, 2 * dotProduct));
        this.velocity.set(newVelocity.x, newVelocity.y);
        this.handleCollision(balls[i]);
      }
    }

    for (let i = 0; i< cannons.length; i ++) {
      if (this.intersectsCannon(cannons[i])) {
        this.handleCannonCollision(cannons[i]);
      }
    }

    grid.forEach(gridSquare => {
      if (this.intersectsGridSquare(gridSquare)) {
        gridSquare.changeTeam(this.team);
        this.dispose();
      }
    })

  }
  
  dispose() {
    this.markedForDeletion = true;
  }

  handleCollision(otherBall) {
    if (!this.hasCollided) {
      this.hasCollided = true;
      this.totalCollisions ++;

      let normalPosition = p5.Vector.sub(this.position, otherBall.position).normalize();
      let distance = p5.Vector.dist(this.position, otherBall.position);
      let minimumTranslationDistance = p5.Vector.mult(normalPosition, (this.radius + otherBall.radius - distance) / 2);
      this.position.add(minimumTranslationDistance);
      otherBall.position.sub(minimumTranslationDistance);

      // Calculate new velocities after collision using vector reflection
      let velocityRelative = p5.Vector.sub(this.velocity, otherBall.velocity);
      let velocityNormal = p5.Vector.dot(velocityRelative, normalPosition);
      if (velocityNormal > 0) 
        return; // Balls are moving away from each other
      //let restitution = 0.1; // Coefficient of restitution
      //let impulse = p5.Vector.mult(normalPosition, -2 * velocityNormal);
      //this.velocity.add(p5.Vector.mult(impulse, restitution));
      //otherBall.velocity.sub(p5.Vector.mult(impulse, restitution));
    }
  }

  handleCannonCollision(cannon) {
    this.dispose();
    cannon.dispose();
  }
  
  intersectsBall(otherBall) {
    let distance = dist(this.position.x, this.position.y, otherBall.position.x, otherBall.position.y);
    return otherBall.team !== this.team && distance < this.radius + otherBall.radius;
  }
  
  intersectsCannon(cannon) {
    return cannon.intersectsBall(this);
  }

  intersectsGridSquare(gridSquare) {
   return this.team !== gridSquare.team
    && this.position.x + this.radius > gridSquare.position.x
    && this.position.x - this.radius < gridSquare.position.x + gridSquare.size
    && this.position.y + this.radius > gridSquare.position.y
    && this.position.y - this.radius < gridSquare.position.y + gridSquare.size;
  }

  startBall() {
    this.velocity = this.storedVelocity;
  }
  
  stopBall() {
    this.velocity = createVector(0, 0);
  }
  
}

class Cannon {
  constructor(team) {
    this.team = team;
    this.position = createVector(this.team.position.x, this.team.position.y);
    this.markedForDeletion   = false;

    this.maxRotationAngle = PI / 4;
    this.angle = this.calculateInitialAngle() + random(-this.maxRotationAngle, this.maxRotationAngle);
    this.rotationDirection = 1;
    this.rotationSpeed = 0.01;

    this.baseOffset = 10;
    this.barrelLength = 25;
    this.baseRadius = 25;
    this.fireInterval = random(0, 50);
    this.fireCounter = random(20, 50);
  }
  
  update() {
    this.fireCounter ++;
    this.angle += this.rotationSpeed * this.rotationDirection;
    
    if (this.angle >= this.calculateInitialAngle() + this.maxRotationAngle || this.angle <= this.calculateInitialAngle() - this.maxRotationAngle) {
      this.rotationDirection *= -1; // Reverse rotation direction
    }
  }
  
  display() {
    push();
    
    translate(this.position.x, this.position.y);
    rotate(this.angle);    
    this.createCannon();
    
    pop();
  }
  
  calculateInitialAngle() {
    if (this.position.x < mainWindowWidth / 2 && this.position.y < mainWindowHeight / 2) {
      return PI / 4; // Top-left corner, initial angle facing towards the middle
    } else if (this.position.x >= mainWindowWidth / 2 && this.position.y < mainWindowHeight / 2) {
      return -PI / 4; // Top-right corner, initial angle facing towards the middle
    } else if (this.position.x < mainWindowWidth / 2 && this.position.y >= mainWindowHeight / 2) {
      return 3 * PI / 4; // Bottom-left corner, initial angle facing towards the middle
    } else {
      return -3 * PI / 4; // Bottom-right corner, initial angle facing towards the middle
    }  
  }

  createCannon() {
    fill(this.team.colour);
    rectMode(CENTER);

    if (this.position.x < mainWindowWidth / 2 && this.position.y < mainWindowHeight / 2) {
      ellipse(0, 0, this.baseRadius);
      rect(this.baseOffset, 0, this.barrelLength, 10); // Top-left corner
    } else if (this.position.x >= mainWindowWidth / 2 && this.position.y < mainWindowHeight / 2) {
      ellipse(0, 0, this.baseRadius);
      rect(-this.baseOffset, 0, this.barrelLength, 10); // Top-right corner
    } else if (this.position.x < mainWindowWidth / 2 && this.position.y >= mainWindowHeight / 2) {
      ellipse(0, 0, this.baseRadius);
      rect(-this.baseOffset, 0, this.barrelLength, 10); // Bottom-left corner
    } else {
      ellipse(0, 0, this.baseRadius);
      rect(this.baseOffset, 0, this.barrelLength, 10); // Bottom-right corner
    } 
  }

  dispose() {
    this.markedForDeletion = true;
  }

  fire() {
    if (this.fireCounter >= this.fireInterval) {
      this.fireCounter = 0;
      
      return new Ball(this.team, this);
    }
    
    return null;
  }

  getBarrelBoundingBox() {
    let x1 = this.position.x - this.barrelLength / 2;
    let x2 = this.position.x + this.barrelLength / 2;
    let y1 = this.position.y - this.barrelLength / 2;
    let y2 = this.position.y + this.barrelLength / 2;
    return { x1, x2, y1, y2 };
  }

  getBaseCenter() {
    return createVector(this.position.x, this.position.y + this.baseOffset);
  }

  intersectsBall(ball) {
    if (ball.team === this.team) {
      return false;
    }

    let cannonBarrelBoundingBox = this.getBarrelBoundingBox();
    let cannonBaseCenter = this.getBaseCenter();

    let intersectsBarrel = 
      ball.position.x + ball.radius > cannonBarrelBoundingBox.x1
      && ball.position.x - ball.radius < cannonBarrelBoundingBox.x2
      && ball.position.y + ball.radius > cannonBarrelBoundingBox.y1
      && ball.position.y - ball.radius < cannonBarrelBoundingBox.y2
    
      let distanceToBaseCenter = dist(ball.position.x, ball.position.y, cannonBaseCenter.x, cannonBaseCenter.y);
      let intersectsBase = distanceToBaseCenter < this.baseRadius + ball.radius;

      return intersectsBarrel || intersectsBase;
  }
}

class GridSquare {
  constructor(team, position) {
    this.team = team;
    this.position = position;
    this.size = mainWindowWidth / squareGridNumber;
  }

  display() {
    stroke(0);
    strokeWeight(1);
    fill(this.team.colour);
    rect(this.position.x, this.position.y, this.size);
  }

changeTeam(team) {
  this.team = team;
}

}

class Team {
  constructor(team, position) {
    this.id = team;
    switch (team) {
      case 1:
        this.colour = '#00F';
        break;
      case 2:
        this.colour = '#0F0';
        break;
      case 3:
        this.colour = '#F00';
        break;
      case 4:
        this.colour = '#FF0';
        break;
      default:
        this.colour = '#000';
        break;
    }
    
    this.position = position;
  }
  
}