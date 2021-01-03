let bubble1;
let bubble2;
bubbles = [];
let centerPull;
foods = [];
foodSpawnTimer = 0;
foodSpawnTimeOut = 30;
foodEnergy = 500;
canvasx = 800;
canvasy = 800;
defaultSpeed = 2;
defaultSight = 2;
averageSpeed = 0;
averageSight = 0;
speedMod = 0.3;
sightMod = 0.3;
penaltyNotEating = false;
penaltyNotEatingAdding = 0.001;
speedToEnergy = 1.5;

function setup() {
  frameRate(60)
  createCanvas(canvasx, canvasy);
  centerPull = 1;
  angleMode(DEGREES);
}

function draw() {
  background(0);

  if(foodSpawnTimer <= 0) {
    foodSpawnTimer = foodSpawnTimeOut;
    let x = round(random(0+30,canvasx-30));
    let y = round(random(0+30,canvasy-30));
    let food1 = new Food(x,y);
    foods.push(food1);
  } else {
    foodSpawnTimer--;
  }

  averageSpeed = 0;
  averageSight = 0;
  for(let i = 0; i < bubbles.length; i++){
    if(bubbles[i].deadTimer >= 240) {
      bubbles.splice(i,1);
    } else {
      bubbles[i].move();
      bubbles[i].show();
      averageSpeed += bubbles[i].speed;
      averageSight += bubbles[i].sight;
    }
  }
  averageSpeed = Math.round(averageSpeed/bubbles.length* 100) / 100;
  averageSight = Math.round(averageSight/bubbles.length* 100) / 100;

  for(let j = 0; j < foods.length; j++){
    foods[j].show();
  }

  fill(255);
  textSize(20);
  text("sheep: "+bubbles.length,10,20);
  text("avg. speed: "+averageSpeed,10,40);
  text("avg. sight: "+averageSight,10,60);

}

function mouseClicked() {
  let s = random(0.5,2);
  let bub = new Bubble(mouseX, mouseY,24,defaultSpeed,defaultSight,1);
  bubbles.push(bub);
  // prevent default
  return false;
}

function checkForFood(x,y) {
  let foodsInRange = 0;
  for(let i = 0; i < foods.length; i++){
    let fd = foods[i];
    if(x >= fd.x-10 && x <= fd.x+10) {
      if(y >= fd.y-10 && y <= fd.y+10) {
        foodsInRange++;
        let rem = foods.splice(i,1);
      }
    }
  }
  return foodsInRange;
}

function checkFoodInSight(x,y,s) {
  s = s * 25;
  for(let i = 0; i < foods.length; i++){
    let fd = foods[i];
    if(x >= fd.x-s && x <= fd.x+s) {
      if(y >= fd.y-s && y <= fd.y+s) {
        return fd;
      }
    }
  }
  return false;
}

class Bubble {
  constructor(x, y, r, s, st,g) {
    this.x = x;
    this.y = y;
    this.r = r;
    this.speed = s;
    this.sight = st;
    this.gen = g;
    this.dirCount = 0;
    this.energy = 1500;
    this.traveled2 = 0;
    this.dir = round(random(0,360));
    this.dead = false;
    this.deadTimer = 0;
    this.notEatingPenalty = 0;
    this.energyRecord = 0;
  }

  move() {
    if(this.energy-this.speed > 0) {
      if(this.dirCount <= 0) {
        this.newDirection();
        this.dirCount = round(random(1,5));
      }
    if(this.x <= 0) {
      this.dir = 0;
    }
    if(this.x >= canvasx) {
      this.dir = 180;
    }
    if(this.y <= 0) {
      this.dir = 90;
    }
    if(this.y >= canvasy) {
      this.dir = 270;
    }

      this.lookForFood();
      this.eatFood();

      if(penaltyNotEating){
        this.notEatingPenalty = this.notEatingPenalty + penaltyNotEatingAdding;
        this.energy -= this.notEatingPenalty;
      }

      this.oldX = this.x;
      this.oldY = this.y;
      this.x = this.speed/2*cos(this.dir) + this.x;
      this.y = this.speed/2*sin(this.dir) + this.y;
      this.dirCount--;

      //The all important formula to calculate the amount of energy lost per move
      this.energy = this.energy - ((Math.pow(this.speed, speedToEnergy) + this.sight)/10);

      this.traveled2 += Math.sqrt(Math.pow((this.oldX-this.x),2)) + Math.sqrt(Math.pow((this.oldY-this.y),2));
      //this.energy -= (Math.sqrt(Math.pow((this.oldX-this.x),2)) + Math.sqrt(Math.pow((this.oldY-this.y),2)));

      if(this.energy >= 3000) {
        this.duplicate();
      }

    } else {
      this.dead = true;
      this.deadTimer++;
    }
  }

  lookForFood() {
    this.foundfood = checkFoodInSight(this.x,this.y,this.sight);
    if(this.foundfood != false) {
      this.dir = Math.atan2(this.foundfood.y - this.y, this.foundfood.x - this.x) * 180 / Math.PI;
    }
  }

  eatFood() {
    this.foodInRange = checkForFood(this.x,this.y);
    if(this.foodInRange > 0) {
      this.energy += this.foodInRange*foodEnergy;
      this.notEatingPenalty = 0;
    }
  }

  newDirection() {
    this.diroffset = round(random(-20,20));
    this.dir = this.dir + this.diroffset;
  }

  duplicate() {
    let s = random(this.speed-1*speedMod,this.speed+speedMod);
    if(s < 1) {s = 1;}
    let st = random(this.sight-1*sightMod,this.sight+sightMod);
    let bub = new Bubble(this.x, this.y,24,s,st,this.gen+1);
    bubbles.push(bub);
    this.energy -= 1500;
  }

  show() {
    if(!this.dead) {
      strokeWeight(2);
      stroke(51);
      noFill();
      rect(this.x-this.sight*25, this.y-this.sight*25, this.sight*2*25, this.sight*2*25);
      fill(255);
    } else {
      fill(100);
    }
    noStroke();
    this.energySize = this.energy/100;
    ellipse(this.x, this.y, 11+this.energySize, 11+this.energySize);
    textSize(12);
    text(this.gen+"|"+round(this.speed*100)/100+"|"+round(this.sight*100)/100+"|"+round(this.energy)+"|"+round(this.traveled2), this.x-35, this.y-17);
    push();
    fill(this.speed*60,0,188-this.speed*30);
    translate(8*cos(this.dir),8*sin(this.dir));
    ellipse(this.x, this.y, 5+this.energySize*0.5, 5+this.energySize*0.5);
    pop();
  }
}

class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  show() {
    noStroke();
    fill(26,188,156);
    ellipse(this.x, this.y, 7, 7);
  }
}
