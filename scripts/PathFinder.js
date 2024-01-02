// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/latest/firebase-app.esm.js";
import { getDatabase, ref, set, push, onValue } from "https://www.gstatic.com/firebasejs/latest/firebase-database.esm.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBEjIFHLuCQIq8DncTuSyEGqpyH6nNJla8",
  authDomain: "pathfinderdb-e7a0e.firebaseapp.com",
  databaseURL: "https://pathfinderdb-e7a0e-default-rtdb.firebaseio.com",
  projectId: "pathfinderdb-e7a0e",
  storageBucket: "pathfinderdb-e7a0e.appspot.com",
  messagingSenderId: "776610855488",
  appId: "1:776610855488:web:556e93b5e347146db83da5",
  measurementId: "G-DYC44HJZ1C"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

function SaveLevel(levelID,Level, steps) {
    const db = getDatabase();
    const referance = ref(db,"levels/"+levelID);
    set(referance, {
        level: Level,
        Moves: steps
    })
    console.log("Saved");
}

function TotalLevels() {
    const db = getDatabase();
    const referance = ref(db,"levels");
    let Counter = 0;
    onValue(referance, (snapshot) => {
        snapshot.forEach(childSnapshot => {
            Counter++;
        });
    })
    return Data;
}

let totalLevels = 0;


let myGamePiece;
let END;
let screenHeight;
let screenWidth;
let walls = [];
let moveing = false;

let score = 0;
let speed = 8;

let N = 15;




let Background = new Image();
Background.src = "./Resourses/Background2.jpg"

let Border = new Image();
Border.src = "./Resourses/Border2.jpg"

let Player = new Image();
Player.src = "./Resourses/Player.jpg"

let Goal = new Image();
Goal.src = "./Resourses/Goal.jpg"

let Logoimg = new Image();
Logoimg.src = "./Resourses/Logo.jpg"

let level = [];

let images = [Background, Border, Player, Goal, Logoimg];

// Function to check if all images are loaded
function areAllImagesLoaded() {
    for (let i = 0; i < images.length; i++) {
        if (!images[i].complete) {
            return false;
        }
    }
    return true;
}
            
// Event listener for image loading
function checkImageLoad() {
    if (areAllImagesLoaded()) {
        // All images are loaded, start the game or perform any necessary actions
        startGame();
    } else {
    // Some images are still loading, wait and check again
    setTimeout(checkImageLoad, 100);
    }
}

Background.onload = function() {
    checkImageLoad();
};

function startGame() {
    updateScreenSize();
    totalLevels = TotalLevels();
    myGameArea.start();
}

let myGameArea = {
    canvas : document.getElementById("gameCanvas"),
    start : function() {
        this.canvas.width = screenWidth *2;
        this.canvas.height = screenHeight;
        this.context = this.canvas.getContext("2d");
        this.context.drawImage(Background,0,0,screenWidth,screenHeight);

        let logo = document.getElementById("Logo");
        logo.width = screenWidth*2;
        logo.height = window.innerHeight*0.15;
        drawLogo();

        this.context.font = "30px Comic Sans MS";
        this.context.fillStyle = "red";
        this.context.textAlign = "center";
        this.context.fillText("Hello World", screenWidth + screenWidth/2, screenHeight * 0.2);

        this.frameNo = 0;
        level = MakeNextLevel();
        setOBS();
        window.addEventListener('keydown', function (e) {
            e.preventDefault();
            myGameArea.keys = (myGameArea.keys || []);
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            myGameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        this.interval = setInterval(updateGameArea, 20);
        },
    clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
    stop : function() {
        clearInterval(this.interval);
        score++;
        level = MakeNextLevel();
        setOBS();
        startGame();
    }
}

function drawLogo(){
    let logo = document.getElementById("Logo");
    let logocontext = logo.getContext("2d");
    logocontext.drawImage(Logoimg,0,0,screenWidth*2,window.innerHeight*0.15);
}

function updateScore() {
    myGameArea.context.fillStyle = "#b33c00";
    myGameArea.context.fillRect(screenWidth,0, screenWidth,screenHeight);
    myGameArea.context.fillStyle = "#ff9966";
    myGameArea.context.fillRect(screenWidth + screenWidth*0.05,screenHeight*0.05,screenWidth*0.9,screenHeight*0.9);
    myGameArea.context.fillStyle = "red"
    myGameArea.context.fillText("Compleated Levels: " + score, screenWidth + screenWidth/2, screenHeight * 0.2);
}

function updateScreenSize() {
    screenHeight = window.innerHeight * 0.80;
    screenWidth = window.innerWidth * 0.80;
    if(screenHeight < screenWidth){
        screenHeight = screenHeight * 0.95;
        screenWidth = screenHeight;
    }
    else{
        screenWidth = screenWidth * 0.95;
        screenHeight = screenWidth;
    }
}

function setOBS() {
    walls = [];
    let width = screenWidth/N;
    let height = screenHeight/N;
    for(let i = 0; i<N; i+=1){
        for(let j = 0; j<N; j+=1){
            if(level[i][j] == 1){
                walls.push(new Component(width, height, "red", j*width, i*height));
            }
            else if (level[i][j] == 2){
                myGamePiece = new Component(width, height, "green", j*width, i*height);
                level[i][j] = 0;
            }
            else if (level[i][j] == 3){
                END = new Component(width, height, "yellow", j*width, i*height);
                level[i][j] = 0;
            }
            
        }
    }

}

function Component(width, height, color, x, y, type) {
    this.type = type;
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;    
    this.x = x;
    this.y = y;
    this.oldx = x;
    this.oldy =y;
    this.xLoc = Math.floor((this.oldx + this.width/2)/this.width);
    this.yLoc = Math.floor((this.oldy + this.height/2)/this.height);
    this.update = function() {
        let ctx = myGameArea.context;
        if (this.type == "text") {
            ctx.font = this.width + " " + this.height;
            ctx.fillStyle = color;
            ctx.fillText(this.text, this.x, this.y);
        }
        else {
            if(color == "red"){
                ctx.drawImage(Border,this.x,this.y,this.width,this.height);
            }
            else if(color == "green"){
                ctx.drawImage(Player,this.x,this.y,this.width,this.height);
            }
            else if(color == "yellow"){
                ctx.drawImage(Goal,this.x,this.y,this.width,this.height);
            }
        }
    }
    this.newPos = function() {
        this.oldx = this.x;
        this.oldy = this.y;
        this.x += this.speedX;
        this.y += this.speedY;
        this.xLoc = Math.floor((this.oldx + this.width/2)/this.width);
        this.yLoc = Math.floor((this.oldy + this.height/2)/this.height);
    }

    this.move = function(xnew,ynew) {
        this.oldx = xnew;
        this.oldy = ynew;
        this.xLoc = Math.floor((this.oldx + this.width/2)/this.width);
        this.yLoc = Math.floor((this.oldy + this.height/2)/this.height);
    }

    this.crashtop = function(otherobj) {
        let mytop = this.y;
        let otherbottom = otherobj.y + (otherobj.height);
        let crash = false;
        if ((mytop < otherbottom) && (this.oldy > otherbottom)) {
            crash = true;
        } 
        return crash;
    }

    this.crashright = function(otherobj) {
        let myright = this.x + (this.width);
        let otherleft = otherobj.x;
        let crash = false;
        if ((myright > otherleft) && (this.oldx < otherleft)) {
            crash = true;
            console.log("Hit");
        } 
        return crash;
    }

    this.crashbottom = function(otherobj) {
        let mybottom = this.y + (this.height);
        let othertop = otherobj.y;
        let crash = false;
        if ((mybottom > othertop) && (this.oldy < othertop)) {
            crash = true;
            console.log("Hit");
        } 
        return crash;
    }

    this.crashleft = function(otherobj) {
        let myleft = this.x;
        let otherright = otherobj.x + (otherobj.width);
        let crash = false;
        if ((myleft < otherright) && (this.oldx > otherright)) {
            crash = true;
        } 
        return crash;
    }
}

function updateGameArea() {
    updateScore();
    if(moveing != 0){
    for (let i = 0; i < walls.length; i += 1) {
        if(Math.abs(walls[i].xLoc - myGamePiece.xLoc) == 0 && (moveing == 1 || moveing == 3)){
            if(moveing == 1){
                if(myGamePiece.crashtop(walls[i])){
                    myGamePiece.x = Math.floor((myGamePiece.oldx + myGamePiece.width/2)/myGamePiece.width) * myGamePiece.width;
                    myGamePiece.y = Math.floor((myGamePiece.oldy + myGamePiece.height/2)/myGamePiece.height) * myGamePiece.height;
                    clearmove();
                }
            }
            else if(moveing == 3){
                if(myGamePiece.crashbottom(walls[i])){
                    myGamePiece.x = Math.floor((myGamePiece.oldx + myGamePiece.width/2)/myGamePiece.width) * myGamePiece.width;
                    myGamePiece.y = Math.floor((myGamePiece.oldy + myGamePiece.height/2)/myGamePiece.height) * myGamePiece.height;
                    clearmove();
                }
            }
            
        }
        if (Math.abs(walls[i].yLoc - myGamePiece.yLoc) == 0 && (moveing == 2 || moveing == 4)){
            if(moveing == 2){
                if(myGamePiece.crashright(walls[i])){
                    myGamePiece.x = Math.floor((myGamePiece.oldx + myGamePiece.width/2)/myGamePiece.width) * myGamePiece.width;
                    myGamePiece.y = Math.floor((myGamePiece.oldy + myGamePiece.height/2)/myGamePiece.height) * myGamePiece.height;
                    clearmove();
                }
            }
            else if(moveing == 4){
                if(myGamePiece.crashleft(walls[i])){
                    myGamePiece.x = Math.floor((myGamePiece.oldx + myGamePiece.width/2)/myGamePiece.width) * myGamePiece.width;
                    myGamePiece.y = Math.floor((myGamePiece.oldy + myGamePiece.height/2)/myGamePiece.height) * myGamePiece.height;
                    clearmove();
                }
            }
        }
    }
    }

    if(myGamePiece.xLoc == END.xLoc && myGamePiece.yLoc == END.yLoc && moveing == 0){
        myGameArea.stop();   
    }

    if (myGameArea.keys && myGameArea.keys[37] && moveing == 0) {moveleft();}
    if (myGameArea.keys && myGameArea.keys[39] && moveing == 0) {moveright();}
    if (myGameArea.keys && myGameArea.keys[38] && moveing == 0) {moveup(); }
    if (myGameArea.keys && myGameArea.keys[40] && moveing == 0) {movedown(); }




    myGameArea.clear();
    myGameArea.context.drawImage(Background,0,0,screenWidth,screenHeight);
    updateScore();
    myGameArea.frameNo += 1;
    for (const element of walls) {
        element.update();
    }
    END.update();

    myGamePiece.newPos();    
    myGamePiece.update();
}

function everyinterval(n) {
    return (myGameArea.frameNo / n) % 1 == 0;
}

function moveup() {
    if(canMoveUp()){
    myGamePiece.speedY = -1 * speed;
    moveing = 1;
    }
}

function movedown() {
    if(canMoveDown()){
    myGamePiece.speedY = speed;
    moveing = 3;
    }
}

function moveleft() {
    if(canMoveLeft()){
    myGamePiece.speedX = -1 * speed;
    moveing = 4;
    }
}

function moveright() {
    if (canMoveRight()) {
    myGamePiece.speedX = speed;
    moveing = 2;
    }
}

function clearmove() {
    myGamePiece.speedX = 0;
    myGamePiece.speedY = 0;
    moveing = 0;
}

function canMoveUp() {
    if (moveing == 0) {
        return level[myGamePiece.yLoc - 1][myGamePiece.xLoc] == 0;
    }
    return false;
}

function canMoveDown() {
    if (moveing == 0) {
        return level[myGamePiece.yLoc + 1][myGamePiece.xLoc] == 0;
    }
    return false;
}

function canMoveLeft() {
    if (moveing == 0) {
        return level[myGamePiece.yLoc][myGamePiece.xLoc - 1] == 0;
    }
    return false;
}

function canMoveRight() {
    if (moveing == 0) {
        return level[myGamePiece.yLoc][myGamePiece.xLoc + 1] == 0;
    }
    return false;
}


let testLevel;
function MakeNextLevel(){
    let testLevel = [];
    for (let i = 0; i < N; i++) {
        testLevel[i] = Array(N).fill(0);
        for (let j = 0; j < N; j++) {
            if (i === 0 || i === N - 1 || j === 0 || j === N - 1) {
                testLevel[i][j] = 1;
            }
        }
    }
    


    ObsNumbers = ((N-2)*(N-2))*0.25 + Math.floor(Math.random() * 6);

    for(let i = 0;i<ObsNumbers;i++){
        testLevel[1 + Math.floor(Math.random() * (N-2))][1 + Math.floor(Math.random() * (N-2))] = 1;
    }
    Px = 1 + Math.floor(Math.random() * (N-2));
    Py = 1 + Math.floor(Math.random() * (N-2));
    Ex = 1 + Math.floor(Math.random() * (N-2));
    Ey = 1 + Math.floor(Math.random() * (N-2));
    testLevel[Py][Px] = 0;
    testLevel[Ey][Ex] = 0;
    if(!(Px == Ex && Py == Ey)){
        let steps = CheckLevel(testLevel,Px,Py,Ex,Ey);

        if( steps != -1){
            testLevel[Py][Px] = 2;
            testLevel[Ey][Ex] = 3;
            let count = TotalLevels();
            let L2 = levelString(testLevel);
            SaveLevel(count+1,L2,steps);
            return testLevel;
        }
    }

    return MakeNextLevel();
}

function CheckLevel(testLevel, Px, Py, Ex, Ey) {
    const queue = [{ x: Px, y: Py, steps: 0 }];
    const rows = testLevel.length;
    const cols = testLevel[0].length;

    // Create a 2D array to track visited locations
    const visited = Array.from({ length: rows }, () => Array(cols).fill(false));

    while (queue.length > 0) {
        let playerLoc = queue.shift();

        if (playerLoc.x == Ex && playerLoc.y == Ey) {
            console.log("Found the exit!");
            if(playerLoc.steps > 5 && playerLoc.steps <= 10){
                console.log("Steps needed:", playerLoc.steps);
                return playerLoc.steps;
            }
            return -1;
        }

        // Check if the location has been visited

        visited[playerLoc.y][playerLoc.x] = true;
        if(testLevel[playerLoc.y+1][playerLoc.x] != 1){
            let tmpy =  checkUp(testLevel,playerLoc.x,playerLoc.y);
            if (visited[tmpy][playerLoc.x] != true) {
                queue.push({ x: playerLoc.x, y: tmpy, steps: playerLoc.steps + 1 });
            }
        }
        if(testLevel[playerLoc.y-1][playerLoc.x] != 1){
            let tmpy =  checkDown(testLevel,playerLoc.x,playerLoc.y);
            if (visited[tmpy][playerLoc.x] != true) {
                queue.push({ x: playerLoc.x, y: tmpy, steps: playerLoc.steps + 1 });
            }
        }
        if(testLevel[playerLoc.y][playerLoc.x+1] != 1){
            let tmpx = checkRight(testLevel,playerLoc.x,playerLoc.y);
            if (visited[playerLoc.y][tmpx] != true) {
                queue.push({ x: tmpx, y: playerLoc.y, steps: playerLoc.steps + 1 });
            }
        }
        if(testLevel[playerLoc.y][playerLoc.x-1] != 1){
            let tmpx = checkLeft(testLevel,playerLoc.x,playerLoc.y);
            if(visited[playerLoc.y][tmpx] != true){
                queue.push({ x: tmpx, y: playerLoc.y, steps: playerLoc.steps + 1 });
            }
        }
    }

    return -1;
}


function checkRight(testLevel,x,y){
    while(testLevel[y][x+1] != 1){
        x++;
    }
    return x;
}

function checkLeft(testLevel,x,y){
    while(testLevel[y][x-1] != 1){
        x--;
    }
    return x;
}

function checkDown(testLevel,x,y){
    while(testLevel[y+1][x] != 1){
        y++;
    }
    return y;
}

function checkUp(testLevel,x,y){
    console.log(testLevel)
    while(testLevel[y-1][x] != 1){
        y--;
    }
    return y;
}

function levelString(level){
    let length = level.length;
    let str = ""
    for(i = 0;i<length; i++){
        for(j = 0;j<length; j++){
            str = str + level[i][j];
        }
    }
}