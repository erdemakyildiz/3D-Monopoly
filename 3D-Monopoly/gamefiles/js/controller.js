var players = new Array();
var tileBoard = new Array();
var currentPlayer = 0;

var renderer, container, camera, scene;
var line, test, geometry, chancecards, comcards, comtop, chancetop;
var mouseXOnMouseDown = mouseYOnMouseDown = 0;
var	targetXRotationOnMouseDown = targetXRotationOnMouseDown = 0;
var	mouseX = mouseY = targetX = targetY = 0;
this.currentWindowX = window.innerWidth ;
this.currentWindowY = window.innerHeight;
var that = this;
var material = new THREE.MeshLambertMaterial({color: 0xD9E8FF, map: THREE.ImageUtils.loadTexture('textures/lighttexture.png'), shininess: 200, reflectivity: .85});
var selMaterial = new THREE.MeshLambertMaterial( { color: 0x000000, emissive: 0x000000, ambient: 0x000000, shading: THREE.SmoothShading } );
var rectmesh, underMesh;
var size = 600;
var step = 150;
var objHeight = 15;

var main;
var playerPosition = board = turnCount = reRollCount = 0;
var gameOver = reRoll = false;
var firstDie;
var numberOfPlayers = 4; //TODO enable more players
var testCount = 1; //4 full turns

var community_chest_cards;
var chance_cards;

window.onload = function()
{
    initalConnect();
	
	var loader = new THREE.STLLoader();
	loader.addEventListener( 'load', function ( event ) {

		var geometry = event.content;
		var material = new THREE.MeshPhongMaterial( { ambient: 0xff5533, color: 0xff5533, specular: 0x111111, shininess: 200 } );
		var mesh = new THREE.Mesh( geometry, material );

		mesh.position.set( 0, - 0.25, 0.6 );
		mesh.rotation.set( 0, - Math.PI / 2, 0 );
		mesh.scale.set( 0.5, 0.5, 0.5 );

		scene.add( mesh );
	} );

	init();
	animate();
	
    updateDisplay();
    
    initialize_community_chest_cards();
    initialize_chance_cards();
    
    initializeTileBoard();
    populateListing();
    
}
function initializeTileBoard()
{
    for(var x=0; x<40; x++)
    {
        tileBoard[x] = createTile(x);
    }
}

function init()
{
    container = document.getElementById("container");
    
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.set(0, 1250, 1000);
    
    scene = new THREE.Scene();
    
    var ambientLight = new THREE.AmbientLight(0x202020);
    scene.add( ambientLight );

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 1, 0);
    scene.add(directionalLight);
    
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(this.currentWindowX, this.currentWindowY);
    renderer.setFaceCulling( THREE.CullFaceNone );
    renderer.autoClear = false;	
    container.appendChild(renderer.domElement);
    
    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener( 'mousewheel', onMouseWheel, false);
    window.addEventListener( 'DOMMouseScroll', onMouseWheel, false);
    document.addEventListener( 'mousedown', onMouseDown, false );
    
    initializePlayers();
    initializePieces(step);
    
    var recttest = new THREE.CubeGeometry(1200, .0001, 1200);
    angelTexture = THREE.ImageUtils.loadTexture("textures/board.jpg");
    var rm = new THREE.MeshBasicMaterial( { map: angelTexture, wireframe: false } )
    rectmesh = new THREE.Mesh(recttest, rm);
    scene.add(rectmesh);

    
    var newgeo = new THREE.CubeGeometry(1210, 10, 1210);
    newgeo.applyMatrix(new THREE.Matrix4().makeTranslation(0, -5.5, 0));
    underMesh = new THREE.Mesh(newgeo, selMaterial);
    scene.add(underMesh);
    
    var comcard = new THREE.CubeGeometry(140, 40, 210);
    comcard.applyMatrix(new THREE.Matrix4().makeRotationY(2.355));
    comcard.applyMatrix(new THREE.Matrix4().makeTranslation(270, 20, 270));
    var cardTexture = THREE.ImageUtils.loadTexture("textures/cards2.png");
    var rm = new THREE.MeshBasicMaterial( { map: cardTexture, wireframe: false } );
    comcards = new THREE.Mesh(comcard, rm);
    scene.add(comcards);
    
    var comtopgeo = new THREE.CubeGeometry(140, 2, 210);
    comtopgeo.applyMatrix(new THREE.Matrix4().makeRotationY(2.355));
    comtopgeo.applyMatrix(new THREE.Matrix4().makeTranslation(270, 42, 270));
    var comtext = THREE.ImageUtils.loadTexture("textures/chance2.png");
    var rm = new THREE.MeshBasicMaterial( { map: comtext, wireframe: false } );
    comtop = new THREE.Mesh(comtopgeo, rm);
    scene.add(comtop);
    
    var comtopgeo = new THREE.CubeGeometry(140, 2, 210);
    comtopgeo.applyMatrix(new THREE.Matrix4().makeRotationY(2.355));
    comtopgeo.applyMatrix(new THREE.Matrix4().makeTranslation(-270, 42, -270));
    var comtext = THREE.ImageUtils.loadTexture("textures/comchest2.png");
    var rm = new THREE.MeshBasicMaterial( { map: comtext, wireframe: false } );
    chancetop = new THREE.Mesh(comtopgeo, rm);
    scene.add(chancetop);
    
    var comcard = new THREE.CubeGeometry(140, 40, 210);
    comcard.applyMatrix(new THREE.Matrix4().makeRotationY(2.355));
    comcard.applyMatrix(new THREE.Matrix4().makeTranslation(-270, 20, -270));
    var cardTexture = THREE.ImageUtils.loadTexture("textures/cards3.png");
    var rm = new THREE.MeshBasicMaterial( { map: cardTexture, wireframe: false } );
    chancecards = new THREE.Mesh(comcard, rm);
    scene.add(chancecards);
    
    
    document.getElementById('rolldice').onclick = function()
    {
        rollDice();
        sync();
    }
    
    document.getElementById('doubles').onclick = function()
    {
        rollDice(true);
        sync();
    }
    
    document.getElementById('switchplayer').onclick = function()
    {
        currentPlayer = (currentPlayer + 1) % numberOfPlayers;
        $('#money')[0].value = players[currentPlayer].money;
        updateDisplay();
        
        if (currentPlayer != finalPlayerID)
            updateStatus("Pretending to be Player "+currentPlayer);
        else
            updateStatus("Connected as Player "+currentPlayer);
    }
    
    document.getElementById('realmove').onclick = function()
    {
        move(players[currentPlayer].piece, players[currentPlayer].playerPosition, parseInt(document.getElementById('move').value));
        sync();
    }
    
    document.getElementById('go').onclick = function()
    {
        players[currentPlayer].money = document.getElementById("money").value;
        updateDisplay();
    }
    
    document.getElementById('addDeed').onclick = function()
    {
        players[currentPlayer].addPropertyIndex(parseInt(document.getElementById("deedValue").value));
        updateDisplay();
    }
    
    document.getElementById('jail').onclick = function()
    {
        getJailed();
    }
    
    document.getElementById('moveToGo').onclick = function()
    {
        moveToGo();
    }
    
    document.getElementById('passgo').onclick = function()
    {
        moveToGo();
        passedGo();
    }
    document.getElementById('comchest').onclick = function(){
        
        drawCard("comchest");
        
    }
    document.getElementById('chance').onclick = function(){
        drawCard("chance");
    }
}

function initializePieces(step)
{
    for (var i = 0; i < numberOfPlayers; i++)
    {
        var geometry = getPiece(i);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(475 + (75*(i%2)), objHeight, 420 + step/2 + 70 * (Math.floor((i)/2))));
        test = new THREE.Mesh(geometry, selMaterial);
        test = new THREE.Mesh(geometry, material);

        test.id = i;
        scene.add(test);
        players[i].piece = test;
    }
}

function getPiece(playerNumber)
{
    if (playerNumber === 0)
        var geometry = new THREE.SphereGeometry(22.5, 15, 13.5);
    else if (playerNumber === 1)
        var geometry = new THREE.CubeGeometry(30, 30, 30);
    else if (playerNumber === 2)
        var geometry = new THREE.IcosahedronGeometry(22.5);
    else if (playerNumber === 3)
        var geometry = new THREE.TorusGeometry(17.5, 7.5, 100, 100)
    return geometry;
}

function initializePlayers()
{
    for (var i = 0; i < numberOfPlayers; i++)
        players.push(new Player(0, test, 1500));
}

function rollDice(twodice)
{
    var piece = players[currentPlayer].piece;
    var pos = players[currentPlayer].playerPosition;
    
    firstDie = Math.floor((Math.random()*6)+1);
    if (twodice)
        secondDie = firstDie;
    else
        secondDie = Math.floor((Math.random()*6)+1);
    var roll = firstDie + secondDie;
    
    
    document.getElementById('move').value = roll;
    
    if (firstDie === secondDie)
    {
        if (players[currentPlayer].jailed === true)
        {
            move(piece, pos, roll);
            players[currentPlayer].jailed = false;
        }
        else
        {
            players[currentPlayer].doublesRolled += 1;
            if (players[currentPlayer].doublesRolled === 3)
                getJailed();
            else
                move(piece, pos, roll);
        }
    }
    else if (players[currentPlayer].jailed === false)
    {
        move(piece, pos, roll);
        players[currentPlayer].doublesRolled = 0;
    }
}

function getJailed()
{
    players[currentPlayer].jailed = true;
    move(players[currentPlayer].piece, 0, 10);
}

function move(piece, currentSpace, spaces)
{
    var id = piece.id;
    var geometry = getPiece(id);
    var subt = 97;
    var offset = 0;
    var xoffset = 0;
    var offSide = 525;
    var sidePush = 390;
	var jaily = 0;
    var destSquare = (currentSpace + spaces) % 40;
    
    if (currentSpace + spaces >= 40)
    {
        passedGo();
    }

	offset = 50 * Math.floor(id/2);
	xoffset = -20 + (45 * (id%2));
	
    

    if (destSquare === 0)
         geometry.applyMatrix(new THREE.Matrix4().makeTranslation(475 + (75*(id%2)), objHeight, 420 + step/2 + 70 * (Math.floor((id)/2))));
    else if (destSquare < 10)
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(sidePush-(((currentSpace+spaces)%10)-1)*subt + xoffset, objHeight, offSide + offset));
    else if (destSquare === 10)
    {
        if (players[currentPlayer].jailed === true)
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offSide + 60*(id%2), objHeight, offSide - 50 + 60 * (Math.floor((id)/2))));
        else
		{
			if (id === 0)
				jaily = -50;
			if (id === 3)
				offset += 50;
		
            geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offSide - 45 + offset, objHeight, offSide + 55 + jaily));
		}
    }
    else if (destSquare < 20)
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offSide - offset, objHeight, sidePush-(((currentSpace+spaces)%10)-1)*subt + xoffset));
    else if (destSquare === 20)
         geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-475 - (75*(id%2)), objHeight, -420 - step/2 - 70 * (Math.floor((id)/2))));
    else if (destSquare < 30)
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-sidePush+(((currentSpace+spaces)%10)-1)*subt - xoffset, objHeight, -offSide - offset));
    else if (destSquare === 30)
    {
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(-offSide + 60*(id%2), objHeight, offSide - 50 + 60 * (Math.floor((id)/2))));
        players[currentPlayer].jailed = true;
    }
    else if (destSquare < 40)
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(offSide + offset, objHeight, -sidePush+(((currentSpace+spaces)%10)-1)*subt - xoffset));
        
    var xrot = piece.rotation.x;
    var yrot = piece.rotation.y;
    scene.remove(piece);
    
    piece = new THREE.Mesh(geometry, material);
    piece.rotation.x = xrot;
    piece.rotation.y = yrot;
    
    console.log(destSquare);
    
    if (id == currentPlayer)
    {
    
        var currentProp = tileBoard[destSquare].activate();
        if (currentProp.cost && !alreadyOwned(destSquare))
        {
            if (currentProp.cost <= players[id].money)
            {
                //console.log(currentProp.getInfo());
                
                players[currentPlayer].addPropertyIndex(currentProp.index);
                players[currentPlayer].money -= currentProp.cost;
                updateDisplay();
            }
        }
        else
            console.log(currentProp);
    }
    
    players[id].piece = piece;
    players[id].playerPosition = destSquare;
    players[id].piece.id = id;
    scene.add(piece);
}

function moveToGo()
{
    move(players[currentPlayer].piece, 0, 0);
}

function passedGo()
{
    players[currentPlayer].money = parseInt(players[currentPlayer].money)+200;
    updateDisplay();
}

function alreadyOwned(destSquare)
{
    var alreadyOwned = false;
    
    for(var x=0; x<players.length; x++)
    {
        for(var y=0; y<players[x].properties.length; y++){
            
            if(players[x].properties[y] == lookUps[destSquare])
                alreadyOwned = true;
        }
    }
    
    return alreadyOwned;
}


function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}


function onMouseWheel()
{
    var fovMAX = 160;
    var fovMIN = 5;
    
    if ( event.target.id == 'chatbox')
        return;
    
    camera.fov -= event.wheelDeltaY * 0.05;
    camera.fov = Math.max(Math.min(camera.fov, fovMAX), fovMIN);
    camera.projectionMatrix = new THREE.Matrix4().makePerspective(camera.fov, window.innerWidth / window.innerHeight, camera.near, camera.far);
}

function onMouseDown(event)
{

    if ( event.target.tagName == 'DIV')
        event.preventDefault();

    document.addEventListener( 'mousemove', onMouseMoveCam, false );
    document.addEventListener( 'mouseup', onMouseUpCam, false );
    document.addEventListener( 'mouseout', onMouseUpCam, false );

    mouseXOnMouseDown = event.clientX - that.currentWindowX;
    mouseYOnMouseDown = event.clientY - that.currentWindowY;
    targetYRotationOnMouseDown = that.targetY;
    targetXRotationOnMouseDown = that.targetX;
}

function onMouseMoveCam(event)
{
    mouseX = event.clientX - that.currentWindowX;
    mouseY = event.clientY - that.currentWindowY;

    that.targetY = targetYRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.015;
    that.targetX = targetXRotationOnMouseDown + ( mouseY - mouseYOnMouseDown ) * 0.015;
}

function onMouseUpCam(event)
{
    document.removeEventListener( 'mousemove', onMouseMoveCam, false );
    document.removeEventListener( 'mouseup', onMouseUpCam, false );
    document.removeEventListener( 'mouseout', onMouseUpCam, false );
}

function animate()
{
    requestAnimationFrame(animate);
    render();
}

function render()
{
    for (var i = 0; i < numberOfPlayers; i++)
    {
        var piece = players[i].piece;
        piece.rotation.x += ( targetX - piece.rotation.x ) * 0.05;
        piece.rotation.y += ( targetY - piece.rotation.y ) * 0.05;
    }
    
    rectmesh.rotation.x += ( targetX - rectmesh.rotation.x ) * 0.05;
    rectmesh.rotation.y += ( targetY - rectmesh.rotation.y ) * 0.05;
    
    underMesh.rotation.x += ( targetX - underMesh.rotation.x ) * 0.05;
    underMesh.rotation.y += ( targetY - underMesh.rotation.y ) * 0.05;
    
    chancecards.rotation.x += ( targetX - chancecards.rotation.x ) * 0.05;
    chancecards.rotation.y += ( targetY - chancecards.rotation.y ) * 0.05;
    
    comcards.rotation.x += ( targetX - comcards.rotation.x ) * 0.05;
    comcards.rotation.y += ( targetY - comcards.rotation.y ) * 0.05;
    
    comtop.rotation.x += ( targetX - comtop.rotation.x ) * 0.05;
    comtop.rotation.y += ( targetY - comtop.rotation.y ) * 0.05;
    
    chancetop.rotation.x += ( targetX - chancetop.rotation.x ) * 0.05;
    chancetop.rotation.y += ( targetY - chancetop.rotation.y ) * 0.05;
        
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

function initialize_community_chest_cards(){
 community_chest_cards = new Array();
 
 community_chest_cards.push(new Card("comchest",0,
 "<p>Advance to Go.<br> Collect $200</p>",
 function(player){
  player.money = player.money + 200;
 }
 ));
 
 community_chest_cards.push(new Card("comchest",1,
 "<p>Bank error in your favor. <br>Collect $75.</p>",
 function(player){
   player.money = player.money + 75;
   document.getElementById("money").value = players[currentPlayer].money;
 }
 
 ));
 
 community_chest_cards.push(new Card("comchest",2,
 "<p>Doctor's fees.<br>Pay $50.</p>",
 function(player){
  player.money = player.money - 50;
 }
 
 ));
 
 community_chest_cards.push(new Card("comchest",3,
 "<p>Get out of jail free.<br> This card may be kept unitl needed, or sold.</p>",
 function(player){
  player.cardsHeld.push(this);
  //add code later to remove this card from the com_chest_deck
 }));
 
 community_chest_cards.push(new Card("comchest",4,
 "<p>Go to jail.<br>Go directly to jail.<br>Do not pass Go.<br> Do not collect $200.</p>",
 function(player){
  move(player.piece,0,10);
  player.jailed = true;
 }
 ));
 
community_chest_cards.push(new Card("comchest",5,
"<p>It's your birthday.<br>Collect $10 from each player.</p>",
function(player){
 for(var i=0; i < players.length; i++){
  if(i !== currentPlayer){
   players[i].money = players[i].money - 10;
   player.money = player.money + 10;
  }
 }
}

));

community_chest_cards.push(new Card("comchest",6,
"<p>Grand Opera Night. <br> Collect $50 from every player<br> for opening night seats.</p>",
function(player){
 for(var i=0; i < players.length; i++){
  if(i !== currentPlayer){
   players[i].money = players[i].money - 50;
   player.money = player.money + 50;
  }
 }
}));

community_chest_cards.push(new Card("comchest",7,
"<p>Income Tax refund.<br>Collect $20.</p>",
function(player){
 player.money = player.money + 20;
}

));

community_chest_cards.push(new Card("comchest",8,
"<p>Life Insurance Matures.<br> Collect $100.</p>",
function(player){
player.money = player.money + 100;
}
));

community_chest_cards.push(new Card("comchest",9,
"<p>Pay Hospital Fees of $100.</p>",
function(player){
 player.money = player.money - 100;
}
));

community_chest_cards.push(new Card("comchest",10,
"<p>Pay School Fess of $50.</p>",
function(player){
 player.money = player.money - 50;
}
));

community_chest_cards.push(new Card("comchest",11,
"<p>Receive $25 Consultancy Fee.</p>",
function(player){
 player.money = player.money + 25;
}
));

community_chest_cards.push(new Card("comchest",12,
"<p>You are assessed for street repairs.<br>$40 per house.<br>$115 per hotel.</p>",
function(player){
//I'll write code for this later.
}
));

community_chest_cards.push(new Card("comchest",13,
"<p>You have won second prize in a beauty contest. Collect $10.</p>",
function(player){
 player.money = player.money+10;
}
));

community_chest_cards.push(new Card("comchest",14,
"<p>You inherit $100.</p>",
function(player){
 player.money = player.money+100;
}
));

community_chest_cards.push(new Card("comchest",15,
"<p>From sale of stock you get $50.</p>",
function(player){
 player.money = player.money + 50;
}
));

community_chest_cards.push(new Card("comchest",16,
"<p>Holiday Fund matures. Receive $100.</p>",
function(player){
 player.money = player.money + 100;
}
));
}

function initialize_chance_cards(){
 chance_cards = new Array();
 
 chance_cards.push(new Card("chance",0,
  "<p> Advance to Go.<br>Collect $200.</p>",
  function(player){
   move(player.piece, 0, 0);
   player.money = player.money + 200;
  }
 ));

}

function drawCard(type){
if(type === "comchest"){
 community_chest_cards[16].behavior(players[currentPlayer]);
 styleCard(community_chest_cards[16].message,"comchest");
}
else if(type === "chance"){
 chance_cards[0].behavior(players[currentPlayer]);
 styleCard(chance_cards[0].message,"chance");
}
    
    updateDisplay();

}

function styleCard(message,type){
    if(type === "comchest"){
     var output = "<div class='com_chest_display'>";
     output = output+message;
     output = output+"</div>";
     document.getElementById("community_chest_card_display").innerHTML = output;
     setTimeout(function(){
                   $(".com_chest_display").remove();					
                                                 },5000);
    
    }
    else if(type === "chance"){
     var output = "<div class='chance_display'>";
     output = output + message;
     output = output+"</div>";
     document.getElementById("chance_card_display").innerHTML = output;
        setTimeout(function(){
                   $(".chance_display").remove();
                                            },5000);
    
    }
    
    
}

function updateDisplay()
{
    expandMoneys(players[currentPlayer].money);
    updateDeedCards(players[currentPlayer].properties);
    
    // update debug stuff
    document.getElementById("money").value = players[currentPlayer].money;
}

