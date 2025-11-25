let bg;

// Chun Li animation frames
let chunLiAnimations = {
  stay: [],
  walk: [],
  attack: [],
  jumpAir: [],
  jumpGround: [],
};

// Ryu animation frames
let ryuAnimations = {
  stay: [],
  hit: [],
};

let bombFrames = [];

// Sprite sheets
let sheets = {};

// Chun Li state
let chunLi = {
  x: 500,
  y: 500,
  vx: 0,
  vy: 0,
  isJumping: false,
  facing: 1,
  currentAnimation: "stay",
  frameIndex: 0,
  frameSpeed: 8
};

// Ryu state
let ryu = {
  x: 700,
  y: 500,
  facing: -1,
  currentAnimation: "stay",
  frameIndex: 0,
  frameSpeed: 10,
  isHit: false,
  hitTimer: 0
};

let gravity = 0.8;
let bombs = [];
let score = 0;

function preload() {
  bg = loadImage("bg.png");
  
  // 載入 Chun Li sprite sheets
  sheets.chunStay = loadImage("chun li/stay/131x171.png");
  sheets.chunWalk = loadImage("chun li/walk/123x195.png");
  sheets.chunAttack = loadImage("chun li/attack/208x158.png");
  sheets.chunJumpAir = loadImage("chun li/jump/air/103x214.png");
  sheets.chunJumpGround = loadImage("chun li/jump/ground/129x171.png");
  sheets.bomb = loadImage("chun li/bomb/56x32.png");
  
  // 載入 Ryu sprite sheets
  sheets.ryuStay = loadImage("ryu/stay/118x186.png");
  sheets.ryuHit = loadImage("ryu/hit/165x165.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // 切割 Chun Li 動畫
  cutFrames(sheets.chunStay, 131, 171, chunLiAnimations.stay);
  cutFrames(sheets.chunWalk, 123, 195, chunLiAnimations.walk);
  cutFrames(sheets.chunAttack, 208, 158, chunLiAnimations.attack);
  cutFrames(sheets.chunJumpAir, 103, 214, chunLiAnimations.jumpAir);
  cutFrames(sheets.chunJumpGround, 129, 171, chunLiAnimations.jumpGround);
  cutFrames(sheets.bomb, 56, 32, bombFrames);
  
  // 切割 Ryu 動畫
  cutFrames(sheets.ryuStay, 118, 186, ryuAnimations.stay);
  cutFrames(sheets.ryuHit, 165, 165, ryuAnimations.hit);
  
  // 調整角色起始位置（螢幕下方）
  chunLi.y = height - 200;
  ryu.y = height - 200;
  ryu.x = width/2;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  chunLi.y = height - 200;
  ryu.y = height - 200;
  ryu.x = width/2;
}

function draw() {
  // 繪製背景（保持比例填滿畫面）
  let bgAspect = bg.width / bg.height;
  let canvasAspect = width / height;
  
  if (bgAspect > canvasAspect) {
    let newHeight = height;
    let newWidth = newHeight * bgAspect;
    image(bg, (width - newWidth) / 2, 0, newWidth, newHeight);
  } else {
    let newWidth = width;
    let newHeight = newWidth / bgAspect;
    image(bg, 0, (height - newHeight) / 2, newWidth, newHeight);
  }

  // 更新 Chun Li
  handleChunLiMovement();
  applyChunLiJump();
  updateChunLiAnimation();
  
  // 更新 Ryu
  updateRyuFacing();
  updateRyuAnimation();
  
  // 更新炸彈和碰撞檢測
  updateBombs();
  
  // 繪製角色
  drawChunLi();
  drawRyu();
  
  // 顯示分數
  drawScore();
}

function cutFrames(sheet, w, h, array) {
  let count = floor(sheet.width / (w + 5));
  
  for (let i = 0; i < count; i++) {
    let imgFrame = sheet.get(i * (w + 5), 0, w, h);
    array.push(imgFrame);
  }
}

function drawChunLi() {
  let index = floor(chunLi.frameIndex / chunLi.frameSpeed);
  index = index % chunLiAnimations[chunLi.currentAnimation].length;

  push();
  translate(chunLi.x, chunLi.y);
  scale(chunLi.facing, 1);
  imageMode(CENTER);
  image(chunLiAnimations[chunLi.currentAnimation][index], 0, 0);
  pop();
}

function drawRyu() {
  let index = floor(ryu.frameIndex / ryu.frameSpeed);
  index = index % ryuAnimations[ryu.currentAnimation].length;

  push();
  translate(ryu.x, ryu.y);
  scale(ryu.facing, 1);
  imageMode(CENTER);
  image(ryuAnimations[ryu.currentAnimation][index], 0, 0);
  pop();
}

function handleChunLiMovement() {
  chunLi.vx = 0;

  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    chunLi.vx = -5;
    chunLi.facing = -1;
    if (!chunLi.isJumping) chunLi.currentAnimation = "walk";
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    chunLi.vx = 5;
    chunLi.facing = 1;
    if (!chunLi.isJumping) chunLi.currentAnimation = "walk";
  }

  if (chunLi.vx === 0 && !chunLi.isJumping && chunLi.currentAnimation !== "attack") {
    chunLi.currentAnimation = "stay";
  }

  chunLi.x += chunLi.vx;
  chunLi.x = constrain(chunLi.x, 50, width - 50);
}

function updateChunLiAnimation() {
  chunLi.frameIndex += 1;
  if (chunLi.frameIndex >= chunLiAnimations[chunLi.currentAnimation].length * chunLi.frameSpeed) {
    chunLi.frameIndex = 0;
    if (chunLi.currentAnimation === "attack") chunLi.currentAnimation = "stay";
  }
}

function updateRyuFacing() {
  // Ryu 面對 Chun Li
  if (chunLi.x < ryu.x) {
    ryu.facing = -1;
  } else {
    ryu.facing = 1;
  }
}

function updateRyuAnimation() {
  ryu.frameIndex += 1;
  
  if (ryu.isHit) {
    ryu.currentAnimation = "hit";
    ryu.hitTimer--;
    
    if (ryu.hitTimer <= 0) {
      ryu.isHit = false;
      ryu.currentAnimation = "stay";
      ryu.frameIndex = 0;
    }
  }
  
  if (ryu.frameIndex >= ryuAnimations[ryu.currentAnimation].length * ryu.frameSpeed) {
    ryu.frameIndex = 0;
  }
}

function keyPressed() {
  // Jump
  if ((keyCode === UP_ARROW || key === "w" || key === "W") && !chunLi.isJumping) {
    chunLi.isJumping = true;
    chunLi.vy = -18;
    chunLi.currentAnimation = "jumpAir";
  }

  // Attack
  if (key === " ") {
    chunLi.currentAnimation = "attack";
    chunLi.frameIndex = 0;
    
    // 發射炸彈
    bombs.push({ 
      x: chunLi.x + (chunLi.facing * 50), 
      y: chunLi.y - 40, 
      vx: 12 * chunLi.facing,
      facing: chunLi.facing
    });
  }
}

function applyChunLiJump() {
  if (chunLi.isJumping) {
    chunLi.y += chunLi.vy;
    chunLi.vy += gravity;

    if (chunLi.vy > 0) chunLi.currentAnimation = "jumpGround";

    if (chunLi.y >= height - 200) {
      chunLi.y = height - 200;
      chunLi.vy = 0;
      chunLi.isJumping = false;
      chunLi.currentAnimation = "stay";
    }
  }
}

function updateBombs() {
  for (let i = bombs.length - 1; i >= 0; i--) {
    let b = bombs[i];
    b.x += b.vx;
    
    // 檢測與 Ryu 的碰撞
    let distance = dist(b.x, b.y, ryu.x, ryu.y);
    if (distance < 60 && !ryu.isHit) {
      ryu.isHit = true;
      ryu.hitTimer = 30; // 受擊動畫持續時間
      ryu.frameIndex = 0;
      score++;
      bombs.splice(i, 1);
      continue;
    }
    
    // 繪製炸彈（根據方向翻轉）
    let frame = bombFrames[floor(chunLi.frameIndex / chunLi.frameSpeed) % bombFrames.length];
    push();
    translate(b.x, b.y);
    scale(b.facing, 1);
    imageMode(CENTER);
    image(frame, 0, 0);
    pop();
    
    // 移除超出畫面的炸彈
    if (b.x < -50 || b.x > width + 50) {
      bombs.splice(i, 1);
    }
  }
}

function drawScore() {
  push();
  fill(255);
  stroke(0);
  strokeWeight(3);
  textSize(32);
  textAlign(LEFT, TOP);
  text("Score: " + score, 20, 20);
  pop();
}