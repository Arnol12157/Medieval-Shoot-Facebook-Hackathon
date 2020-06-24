const Diagnostics = require('Diagnostics')
const Instruction = require('Instruction')
const CameraInfo = require('CameraInfo')
const Scene = require('Scene')
const Time = require('Time')
const fd = Scene.root
  .child('Device')
  .child('Camera')
  .child('Focal Distance')
const planeTracker = Scene.root.child('planeTracker0')
const TouchGestures = require('TouchGestures')

import CANNON from 'cannon'
import CannonHelper from 'spark-ar-physics'

// show switch camera instructions on front camera
Instruction.bind(CameraInfo.captureDevicePosition.eq(CameraInfo.CameraPosition.FRONT), 'flip_camera')

var floorPlane = planeTracker.child('plane0')
var heart1 = Scene.root.find('Heart1')
var heart2 = Scene.root.find('Heart2')
var heart3 = Scene.root.find('Heart3')
var losePanel = Scene.root.find('LosePanel')
var winPanel = Scene.root.find('WinPanel')
var mission2Panel = Scene.root.find('Mission2')
var hits = 0;
var turret = planeTracker.child('Turret')

var ball = planeTracker.child('Canon')
var dragon = planeTracker.child('Dragon')
var block1 = planeTracker.child('Block1')
var block2 = planeTracker.child('Block2')
var block3 = planeTracker.child('Block3')
var block4 = planeTracker.child('Block4')
var block5 = planeTracker.child('Block5')
var block6 = planeTracker.child('Block6')
var block7 = planeTracker.child('Block7')
var block8 = planeTracker.child('Block8')
var block9 = planeTracker.child('Block9')
var block10 = planeTracker.child('Block10')
var blocks = [block1, block2, block3, block4, block5, block6, block7, block8, block9, block10]

ball.hidden = true;

// Create a sphere
var radius = 6 // m
var sphereBody = new CANNON.Body({
  mass: 2, // kg
  position: new CANNON.Vec3(0, 50, 0), // m
  shape: new CANNON.Sphere(radius)
})

// create the cannon floor
var floor = CannonHelper.makeFloor()

// get the initial world objects needed
var worldObjects = [{ sceneObject: floorPlane, physicsObject: floor }, { sceneObject: ball, physicsObject: sphereBody }]

// helper for making my blocks
function initBlock(pos) {
  var blockBody = new CANNON.Body({
    mass: 0.2,
    position: pos,
    shape: new CANNON.Box(new CANNON.Vec3(5.2, 5.2, 5.2))
  })

  return blockBody
}

function initBlockPos() {
  return [
    new CANNON.Vec3(-20, 10, -120),
    new CANNON.Vec3(-5, 10, -120),
    new CANNON.Vec3(10, 10, -120),
    new CANNON.Vec3(25, 10, -120),
    new CANNON.Vec3(-12.5, 20.8, -120),
    new CANNON.Vec3(2.5, 20.8, -120),
    new CANNON.Vec3(17.5, 20.8, -120),
    new CANNON.Vec3(10, 31.6, -120),
    new CANNON.Vec3(-5, 31.6, -120),
    new CANNON.Vec3(2.5, 46, -120)
  ]
}

var blockPos = initBlockPos()

// create a new worldObject for each pin
blocks.forEach((block, i) => {
  worldObjects.push({ sceneObject: block, physicsObject: initBlock(blockPos[i]) })
})

// init the cannon world
var cannonHelper = new CannonHelper(worldObjects)

// create a game loop
var loopTimeMs = 150
var lastTime

Time.ms.interval(loopTimeMs).subscribe(function(elapsedTime) {
  if (lastTime !== undefined) {
    var deltaTime = (elapsedTime - lastTime) / 1000

    // update the cannon world each loop
    cannonHelper.update(deltaTime)
  }

  lastTime = elapsedTime
})

const rangeMap = (input, inLow, inHigh, outLow, outHigh) => {
  return Math.round(((input - inLow) / (inHigh - inLow)) * (outHigh - outLow) + outLow)
}

TouchGestures.onTap().subscribe(function(e) {
  // convert the x of the tap to an x for force later
  const xDirection = rangeMap(e.location.x, 0, 750, -50, 50)

  throwBall(xDirection)
})

function resetGame() {
  ball.hidden = true;
  if(timer > 0){
    dragon.hidden = false;
  }
  sphereBody.position = new CANNON.Vec3(0, 5, 0)
  sphereBody.angularVelocity = new CANNON.Vec3(0, 0, 0)
  sphereBody.velocity = new CANNON.Vec3(0, 0, 0)
  sphereBody.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 0)

  blockPos = initBlockPos()

  // loop over all the world objects
  for (let i = 0; i < worldObjects.length; i++) {
    // skip the first two objects - ball/floor
    if (i > 1) {
      // reset the body
      cannonHelper.resetBody(worldObjects[i].physicsObject, blockPos[i - 2])
    }
  }
}

var resetTimer
var thrown = false
function throwBall(xDirection) {
  if (thrown) return

  ball.hidden = false;
  sphereBody.position = new CANNON.Vec3(0, 25, 0)
  ball.transform.y = 25;

  var force = new CANNON.Vec3(xDirection, 50, -120)
  var pos = new CANNON.Vec3(0, 0, 0)

  // apply an impulse on the ball to move it
  sphereBody.applyLocalImpulse(force, pos)

  thrown = true
  if (resetTimer) {
    Time.clearTimeout(resetTimer)
    resetTimer = null
  }

  resetTimer = Time.setTimeout(function(elapsedTime) {
    resetGame()
    thrown = false
  }, 5000)
}

const delayTimer = Time.setInterval(Timer, 1000);
var timer = 25;
var timer2ndmission = 5;
var timerhint2ndmission = 5;
function Timer(){
  if(timer >= 0){
    timer--;
  } else {
    timer2ndmission--;
    if(timer2ndmission <= 0){
      timerhint2ndmission--;
      if(timerhint2ndmission <= 0){
        mission2Panel.hidden = true;
      } else {
        mission2Panel.hidden = false;
      }
      losePanel.hidden = true;
      winPanel.hidden = true;
      To2ndMission();
    } else {
      if(hits >= 3){
        losePanel.hidden = false;
        winPanel.hidden = true;
      } else {
        losePanel.hidden = true;
        winPanel.hidden = false;
      }
    }
  }
}

function To2ndMission(){
  dragon.hidden = true;
  block1.hidden = false;
  block2.hidden = false;
  block3.hidden = false;
  block4.hidden = false;
  block5.hidden = false;
  block6.hidden = false;
  block7.hidden = false;
  block8.hidden = false;
  block9.hidden = false;
  block10.hidden = false;
}

const delayDistance = Time.setInterval(Distance, 100);

var dis_turret_aux = 0;
function Distance(){

  if(timer < 0){
    return;
  }

  const minDis = 12;
  var disX = Math.pow(dragon.transform.x.pinLastValue() - ball.transform.x.pinLastValue(), 2);
  var disY = Math.pow(dragon.transform.y.pinLastValue() - ball.transform.y.pinLastValue(), 2);
  var disZ = Math.pow(dragon.transform.z.pinLastValue() - ball.transform.z.pinLastValue(), 2);
  var dis = Math.sqrt(disX + disY + disZ);
  
  if(dis < minDis){
    dragon.hidden = true;
  }

  var disX_turret = Math.pow(dragon.transform.x.pinLastValue() - turret.transform.x.pinLastValue(), 2);
  var disY_turret = Math.pow(dragon.transform.y.pinLastValue() - turret.transform.y.pinLastValue(), 2);
  var disZ_turret = Math.pow(dragon.transform.z.pinLastValue() - turret.transform.z.pinLastValue(), 2);
  var dis_turret = Math.sqrt(disX_turret + disY_turret + disZ_turret);
  
  if(dis_turret > 40){
    dis_turret_aux = 0;
  }
  if(dis_turret < 40 && dis_turret_aux == 0 && !dragon.hidden.pinLastValue()){
    dis_turret_aux = dis_turret;
    hits++;
    if(hits == 1){
      heart1.hidden = false
      heart2.hidden = false
      heart3.hidden = true
    } else if(hits == 2){
      heart1.hidden = false
      heart2.hidden = true
      heart3.hidden = true
    } else if(hits == 3){
      heart1.hidden = true
      heart2.hidden = true
      heart3.hidden = true
    }
  }

  
}
