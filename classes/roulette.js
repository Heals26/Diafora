class RouletteBall {
    constructor(team, position, bottom) {
      this.team = team;
      this.position = position;
      this.velocity = createVector(random(-3, 3), 2);
      this.radius = 7;

      this.gravity = 1;
      this.friction = 0.007;

      this.bottom = bottom;
      this.hasCollided = false;
      
    }
    
    display() {
      fill(this.team.colour);
      ellipse(this.position.x, this.position.y, this.radius * 2);
    }
    
    hitBottom() {
      return this.position.y + this.radius >= this.bottom.y;
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
        let impulse = p5.Vector.mult(normalPosition, -2 * velocityNormal);
        this.velocity.add(p5.Vector.mult(impulse, restitution));
        //otherBall.velocity.sub(p5.Vector.mult(impulse, restitution));
      }
    }
    
    update() {
      this.velocity.y += this.gravity;
      
      if (this.velocity.x !== 0) {
        let frictionDirection = this.velocity.copy().normalize().mult(-1);
        let frictionForce = frictionDirection.mult(this.friction);
        this.velocity.add(frictionForce);

        if(this.velocity.copy().dot(frictionDirection) > 0) {
          this.velocity.set(0, this.velocity.y);
        }
      }
      
      this.position.add(this.velocity);
      
      if (this.position.x + this.radius >= width || this.position.x - this.radius <= mainWindowWidth) {
        this.velocity.x *= -1; // Reverse horizontal velocity
        this.position.x = constrain(this.position.x, mainWindowWidth - this.radius, width);
      }
      
      if (this.position.y + this.radius >= this.bottom.y || this.position.y - this.radius <= 0) {
        this.velocity.y *= -1; // Reverse vertical velocity
        this.position.y = constrain(this.position.y, this.radius, this.bottom.y - this.radius);
      }
      
      for (let i = 0; i < obstacles.length; i++) {
        if (obstacles[i] !== this && this.intersectsBall(obstacles[i])) {
          let normalPosition = p5.Vector.sub(obstacles[i].position, this.position);
          normalPosition.normalize();
          
          let dotProduct = p5.Vector.dot(this.velocity, normalPosition);
          let newVelocity = p5.Vector.sub(this.velocity, p5.Vector.mult(normalPosition, 2 * dotProduct));
          this.velocity.set(newVelocity.x, newVelocity.y);
          this.handleCollision(obstacles[i]);
        }
      }
      
    }
    
  }
  
  class Obstacle {
    constructor(position, upperBound, lowerBound) {
      this.position = position;
      this.upperBound = upperBound;
      this.lowerBound = lowerBound;
      this.radius = 10;
      
      this.velocity = createVector(0, 3);

      this.markedForDeletion  = false;
    }

    display() {
      fill(220);
      ellipse(this.position.x, this.position.y, this.radius * 2);
    }

    update() {
      this.position.add(this.velocity);

      if (this.position.y <= this.upperBound - this.radius) {
        this.markedForDeletion = true;
      }
    }

  }
  
  class exitPoint {
    constructor() {
  
    }
  }