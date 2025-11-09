// --- Celestial data ---
const celestialBodies = [
  { name: 'Sun', image: './images/sun.png', color: '#ffcc00', mass: 1.989e30, planetRadius: 696340, speed: 0, direction: 0, acceleration: 0 },
  { name: 'Mercury', image: './images/cookie_mercury.png', color: '#bfbfbf', mass: 3.285e23, planetRadius: 2440, speed: 0, direction: 0, acceleration: 0 },
  { name: 'Venus', image: './images/venus.png', color: '#e0b24c', mass: 4.867e24, planetRadius: 6052, speed: 0, direction: 0, acceleration: 0 },
  { name: 'Earth', image: './images/ms_paint_earth.png', color: '#2a6bd4', mass: 5.972e24, planetRadius: 6371, speed: 0, direction: 0, acceleration: 0 },
  { name: 'Mars', image: './images/mars.png', color: '#d14b28', mass: 6.39e23, planetRadius: 3389, speed: 0, direction: 0, acceleration: 0 },
  { name: 'Jupiter', image: './images/jupiter.png', color: '#c48a3d', mass: 1.898e27, planetRadius: 69911, speed: 0, direction: 0, acceleration: 0 },
  { name: 'Saturn', image: './images/saturn.png', color: '#d9c073', mass: 5.683e26, planetRadius: 58232, speed: 0, direction: 0, acceleration: 0 },
  { name: 'Uranus', image: './images/uranus.png', color: '#7fc7ff', mass: 8.681e25, planetRadius: 25362, speed: 0, direction: 0, acceleration: 0 },
  { name: 'Neptune', image: './images/neptune.png', color: '#4062fa', mass: 1.024e26, planetRadius: 24622, speed: 0, direction: 0, acceleration: 0 },
];



// --- backend Requests ---

const backendUrl = "http://127.0.0.1:5000";

let updateInterval = null;
var objects = [];
var playDataObjects = [];
var objectsCurIndex = 0;

var getObjectIndexFromId = function (id) {
    for (var i=0; i < objects.length; i++) {
        if (objects[i][0] == id) {
            return i;
        }
    }
}

var addObject = function (customObject) {
    customObject.setAttr('objIndex', objectsCurIndex);
    objects.push([objectsCurIndex, customObject]);
    objectsCurIndex++;
    getParams();
    
}

var deleteObject = function (customObject) {
    objects.splice(getObjectIndexFromId(customObject.getAttr('objIndex')), 1);
    customObject.destroy();
}

class playDataObject {
    constructor(id, mass, velocity, direction, posx, posy) {
        this.id = id;
        this.mass = mass;
        this.velocity = velocity;
        this.direction = direction;
        this.posx = posx;
        this.posy = posy;
    }
}


var getParams = function () {
    playDataObjects = []
    for (var i = 0; i < objects.length; i++) {
        var id = objects[i][1].getAttr('objIndex');
        var mass = objects[i][1].getAttr('data').mass
        var velocity = objects[i][1].getAttr('data').speed;
        var direction = objects[i][1].getAttr('data').direction;
        var posx = objects[i][1].x();
        var posy = objects[i][1].y();
        playDataObjects.push(new playDataObject(id, mass, velocity, direction, posx, posy))
    }
}

var updatePositions = function (positionArray) {
    for (var i = 0; i < positionArray.length; i++) {
        var index = getObjectIndexFromId(positionArray[i][0]);
        var physicalObject = objects[index][1];
        physicalObject.x(positionArray[i][1])
        physicalObject.y(positionArray[i][2])
    }
}


// Send initial planet data to backend to start simulation
function sendPlayRequestToBackend() {
    getParams();
    
    // Convert playDataObjects to the format your backend expects
    const planetsData = playDataObjects.map(obj => ({
        id: obj.id,
        pos: [obj.posx, obj.posy],
        mass: obj.mass,
        vel_mag: obj.velocity,
        vel_deg: obj.direction
    }));
    fetch("http://127.0.0.1:5000/start_simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planets: planetsData })
    })
    .then(res => res.json())
    // .then(data => console.log("Simulation started:", data))
    .catch(error => console.error("Error starting simulation:", error));
}

// Get a single snapshot of positions from backend
function getRequestFromBackend() {
    fetch("http://127.0.0.1:5000/update_positions")
    .then(res => res.json())
    .then(data => {
        if (data.planets) {
            const positionArray = data.planets.map((planet) => {
                return [planet.id, planet.pos[0], planet.pos[1]];
            });
            updatePositions(positionArray);
            backgroundLayer.draw();
        }
    })
    .catch(error => console.error("Error fetching positions:", error));
}

function sendPauseToBackend() {
  fetch("http://127.0.0.1:5000/pause_simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planets: planetsData })
    })
    .then(res => res.json())
    // .then(data => console.log("Simulation started:", data))
    .catch(error => console.error("Error starting simulation:", error));
}

function updateObjectsUponPause (data) {
    console.log("Simulation paused:", data.planets.length)
    for (var i =0; i < data.planets.length; i++) {
        console.log(data.planets[i])
        var index = getObjectIndexFromId(data.planets[i]["id"]);
        var physicalObject = objects[index][1];
        physicalObject.x(data.planets[i]["pos"][0])
        physicalObject.y(data.planets[i]["pos"][1])
        physicalObject.setAttr('speed', data.planets[i]["vel"]);
        physicalObject.setAttr('direction', data.planets[i]["direction"]);
    }
    
}

function clickPlay() {
    if (!playButton.clicked) {
        playButton.Text.setAttr('text', 'Pause');
        playButton.clicked = true;

        sendPlayRequestToBackend();
        
        // Start the update loop
        updateInterval = setInterval(() => {
            getRequestFromBackend()
        }, 17); // ~60 FPS

    } else {
        playButton.Text.setAttr('text', 'Play');
        playButton.clicked = false;

        // Stop the update loop
        if (updateInterval) {
            clearInterval(updateInterval);
            updateInterval = null;
        }

        fetch(`${backendUrl}/pause_simulation`, {
            method: "POST"
        })
        .then(res => res.json())
        .then(data => updateObjectsUponPause(data))
        .catch(error => console.error("Error pausing simulation:", error));
    }
}





function lightenHex(hex, amount = 0x11) {
    // Convert hex string to number
    let num = parseInt(hex.slice(1), 16);

    // Extract channels
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;

    // Add amount, clamp to 255
    r = Math.min(255, r + amount);
    g = Math.min(255, g + amount);
    b = Math.min(255, b + amount);

    // Convert back to hex string
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}


const stage = new Konva.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight
});

const backgroundLayer = new Konva.Layer(),
      uiLayer = new Konva.Layer();

stage.add(backgroundLayer, uiLayer);

const navbarHeight = 50,
      menuWidth = 200,
      colors = ['#ff6666','#66ccff','#66ff66','#ffcc66','#ff66ff','#66ffff','#ffff66','#ff9966','#66ff99','#9966ff'],
      spacing = 80,
      radius = 20;

const placedCircles = [];

// --- Helper: create button ---
function makeButton(x, y, w, h, text, layer, clickFn, fill_value = '#555') {
  const btn = new Konva.Rect({x, y, width: w, height: h, fill: fill_value, cornerRadius: 0, listening: true});
  const txt = new Konva.Text({x: x + w/2, y: y + h/2, text, fontSize: 16, fill: 'white', listening: false});
  txt.offsetX(txt.width()/2); txt.offsetY(txt.height()/2);
  layer.add(btn, txt);
  btn.on('mouseenter', ()=>{ btn.fill('#777'); layer.draw(); });
  btn.on('mouseleave', ()=>{ btn.fill(fill_value); layer.draw(); });
  
  btn.on('mouseover', function (e) { e.target.getStage().container().style.cursor = 'pointer'; });
  btn.on('mouseout', function (e) { e.target.getStage().container().style.cursor = 'default'; });

  btn.Text = txt;
  
  if(clickFn) btn.on('click', clickFn);
  return btn;
}

// --- Navbar & buttons ---

uiLayer.add(new Konva.Rect({x:0, y:0, width:stage.width(), height:navbarHeight, fill:'#333'}));
const menuButton = makeButton(0,0,menuWidth,navbarHeight,'Object Menu', uiLayer),
      playButton = makeButton(stage.width()-100,0,100,50,'Play', uiLayer, clickPlay);

playButton.clicked = false;

// --- Menu group with clipping ---
const menuClipHeight = stage.height() - navbarHeight;
const menuGroup = new Konva.Group({
  x:0,
  y:-menuClipHeight+navbarHeight,
  clip: { x:0, y:0, width:menuWidth, height:menuClipHeight }
});
backgroundLayer.add(menuGroup);

// Menu background
menuGroup.add(new Konva.Rect({x:0, y:0, width:menuWidth, height:2*menuClipHeight, fill:'grey'}));

// Inner content group for scrolling
const menuContentGroup = new Konva.Group();
menuGroup.add(menuContentGroup);

// --- Delete zone ---
const deleteZone = new Konva.Rect({
  x: stage.width() - 20,
  y: stage.height() - 20,
  width: 20,
  height: 20,
  fill: 'red',
  opacity: 0.6,
  visible: false,
  shadowColor: 'red'
});
backgroundLayer.add(deleteZone);

function inDeleteZone(circle) {
  const dz = deleteZone.getClientRect();
  const c = circle.getClientRect();
  return c.x+c.width/2>dz.x && c.x+c.width/2<dz.x+dz.width &&
         c.y+c.height/2>dz.y && c.y+c.height/2<dz.y+dz.height;
}

// --- Make circle draggable with collision prevention ---
function makeDraggable(circle) {
  circle.draggable(true);
  let dragging = false;

  circle.on('dragstart', () => {
    dragging = true;
    circle._lastValidPosition = { x: circle.x(), y: circle.y() };

    if (circle._tooltip) {
      circle._tooltip.destroy();
      circle._tooltip = null;
      backgroundLayer.draw();
    }

    deleteZone.show();
    backgroundLayer.draw();

    if (circle.getAttr('fromMenu') && menuVisible) {
      menuTween.reverse();
      menuVisible = false;
    }
    circle.moveToTop();
  });

  circle.on('dragmove', () => {
    circle.moveToTop();
    if (inDeleteZone(circle)) {
      deleteZone.opacity(0.9);
      deleteZone.shadowBlur(40);
    } else {
      deleteZone.opacity(0.6);
      deleteZone.shadowBlur(0);
    }

    backgroundLayer.batchDraw();
  });

  circle.on('dragend', () => {
  const maxIterations = 10; // prevent infinite loop
  let iteration = 0;
  let collided = true;

  while (collided && iteration < maxIterations) {
    collided = false;
    iteration++;

    for (let other of placedCircles) {
      if (other === circle) continue;

      let dx = circle.x() - other.x();
      let dy = circle.y() - other.y();
      let distance = Math.sqrt(dx * dx + dy * dy);
      const minDist = circle.radius() + other.radius();

      if (distance < minDist) {
        collided = true;
        // Avoid divide by zero
        if (distance === 0) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
          distance = Math.sqrt(dx * dx + dy * dy);
        }

        const overlap = minDist - distance;
        const nx = dx / distance;
        const ny = dy / distance;

        circle.x(circle.x() + nx * overlap);
        circle.y(circle.y() + ny * overlap);
      }
    }
  }

  // Delete zone logic
  if (inDeleteZone(circle)) {
    deleteObject(circle);
    const idx = placedCircles.indexOf(circle);
    if (idx !== -1) placedCircles.splice(idx, 1);
  } else {
    circle.moveToBottom();
    addObject(circle);
  }

  deleteZone.hide();
  deleteZone.shadowBlur(0);
  deleteZone.opacity(0.6);
  backgroundLayer.draw();

  if (circle.getAttr('fromMenu') && !menuVisible) {
    menuTween.play();
    menuVisible = true;
  }

  circle.setAttr('fromMenu', false);
  dragging = false;
});


  circle.on('click', e => {
    if (!dragging) {
      placedCircles.forEach(c => { if (c._tooltip) { c._tooltip.destroy(); c._tooltip = null; } });
      circle._tooltip = showTooltip(circle);
      backgroundLayer.draw();
      e.cancelBubble = true;
    }
  });

}

// --- Tooltip ---
function showTooltip(circle) {
  const data = circle.getAttr('data') || {};
  const tooltipWidth = 160;  // width of tooltip box
const tooltipHeight = 200; // height of tooltip box

// horizontal: center above the circle
let tooltipX = circle.x() - tooltipWidth / 2;

// vertical: just above the circle, but not above navbar
let tooltipY = circle.y() - circle.radius() - tooltipHeight - 10; // 10px spacing

// clamp to stage edges
tooltipX = Math.max(50, Math.min(stage.width() - tooltipWidth, tooltipX));
tooltipY = Math.max(navbarHeight + 20, tooltipY);

const tooltip = new Konva.Group({
  x: tooltipX,
  y: tooltipY,
  listening: true
});

 const boxWidth = tooltipWidth;
    const boxHeight = tooltipHeight;

const box = new Konva.Rect({
    x: -60,
    y: -30,
    width: boxWidth,
    height: boxHeight,
    fill: 'black',
    opacity: 0.9,
    cornerRadius: 6,
    listening: true
  });

  tooltip.add(box);

  const fields = [
    { label: 'Name', key: 'name', editable: false },
    { label: 'Radius', key: 'planetRadius', suffix: ' km', editable: true },
    { label: 'Mass', key: 'mass', suffix: ' kg', editable: true },
    { label: 'Speed', key: 'speed', suffix: ' km/s', editable: true },
    { label: 'Direction', key: 'direction', suffix: '\u00B0', editable: true },
    { label: 'Acceleration', key: 'acceleration', suffix: ' m/s²', editable: false }
  ];

  const startY = box.y() + 12;
  const lineHeight = 20;

  fields.forEach((field, i) => {
    const y = startY + i * lineHeight;
    const t = new Konva.Text({
      x: box.x() + 10,
      y,
      text: `${field.label}: ${data[field.key]}${field.suffix || ''}`,
      fontSize: 14,
      fill: '#fff',
      listening: field.editable // only editable lines will respond to events
    });

    if (field.editable) {
      // Hover highlight for editable lines
      t.on('mouseenter', () => {
        t.fill('#0ff');
        backgroundLayer.draw();
        stage.container().style.cursor = 'pointer';
      });
      t.on('mouseleave', () => {
        t.fill('#fff');
        backgroundLayer.draw();
        stage.container().style.cursor = 'default';
      });

      // Inline editing for editable lines
      t.on('click', (e) => {
        e.cancelBubble = true;
        const canvasBox = stage.container().getBoundingClientRect();
        const textBox = t.getClientRect();
        const input = document.createElement('input');

        input.type = 'number';
        input.value = data[field.key];
        input.style.position = 'absolute';
        input.style.left = `${canvasBox.left + textBox.x + textBox.width + 5}px`;
        input.style.top = `${canvasBox.top + textBox.y}px`;
        input.style.width = '80px';
        input.style.fontSize = '14px';
        input.style.background = 'rgba(0,0,0,0.85)';
        input.style.color = 'white';
        input.style.border = '1px solid #777';
        input.style.padding = '2px 4px';
        input.style.outline = 'none';
        input.style.zIndex = 1000;

        document.body.appendChild(input);
        input.focus();

        const commit = () => {
          let val = parseFloat(input.value);
          if (!isNaN(val)) {
            if(field.key === 'planetRadius') {
              val = Math.max(1, Math.min(celestialBodies[0].planetRadius, val));
              data[field.key] = val;
              circle.radius(Math.pow(val / celestialBodies[0].planetRadius, 0.3) * 50)

              resolveCollision(circle);
              t.text(`${field.label}: ${val}${field.suffix || ''}`);
              backgroundLayer.draw();
            }
            if(field.key === 'speed') {
              val = Math.max(0, Math.min(500, val)) 
              data[field.key] = val;
            }
            if(field.key === 'direction') {
              val = ((val % 360) + 360) % 360;
              data[field.key] = val;
            }

            data[field.key] = val;
            t.text(`${field.label}: ${val}${field.suffix || ''}`);
            backgroundLayer.draw();
          }
          document.body.removeChild(input);
        };

        input.addEventListener('blur', commit);
        input.addEventListener('keydown', (evt) => {
          if (evt.key === 'Enter') input.blur();
        });
      });
    }

    tooltip.add(t);
  });


  // --- Delete button ---
  const deleteBtnY = startY + fields.length * lineHeight + 10;
  const deleteBtn = new Konva.Rect({
    x: box.x() + 10,
    y: deleteBtnY,
    width: 100,
    height: 26,
    fill: '#c33',
    cornerRadius: 4,
    listening: true
  });

  const deleteText = new Konva.Text({
    x: deleteBtn.x() + deleteBtn.width() / 2,
    y: deleteBtn.y() + deleteBtn.height() / 2,
    text: 'Delete',
    fontSize: 14,
    fill: 'white'
  });
  deleteText.offsetX(deleteText.width() / 2);
  deleteText.offsetY(deleteText.height() / 2);
  deleteText.listening(false);

  deleteBtn.on('mouseenter', () => {
    deleteBtn.fill('#e44');
    backgroundLayer.draw();
    stage.container().style.cursor = 'pointer';
  });
  deleteBtn.on('mouseleave', () => {
    deleteBtn.fill('#c33');
    backgroundLayer.draw();
    stage.container().style.cursor = 'default';
  });

  deleteBtn.on('click', (e) => {
    e.cancelBubble = true;
    const fadeOutTooltip = new Konva.Tween({
      node: tooltip,
      duration: 0.1,
      opacity: 0,
      onFinish: () => {
        tooltip.destroy();
        circle._tooltip = null;
        circle.destroy();
        const idx = placedCircles.indexOf(circle);
        if (idx !== -1) placedCircles.splice(idx, 1);
        deleteObject(circle);
        backgroundLayer.draw();
      }
    });
    fadeOutTooltip.play();
  });

  tooltip.add(deleteBtn, deleteText);
  backgroundLayer.add(tooltip);

  circle._tooltip = tooltip;
  return tooltip;
}

// --- Stage click closes tooltip ---
stage.on('click', ()=>{
  placedCircles.forEach(c=>{ if(c._tooltip){ c._tooltip.destroy(); c._tooltip=null; } });
  backgroundLayer.draw();
});

// --- Menu circles ---
celestialBodies.forEach((body, i) => {
  const x = menuWidth / 2;
  const y = 60 + i * spacing;

  // Create menu circle
  const circle = createCircle(x, y, radius, body, false, false, backgroundLayer);

  const label = new Konva.Text({
    x,
    y: y - radius - 20,
    text: body.name,
    fontSize: 14,
    fill: 'white',
    align: 'center',
  });
  label.offsetX(label.width() / 2);

  // Hover highlight (lighter color only if no image)
  circle.on('mouseenter', () => {
    circle.stroke('#0ff');
    backgroundLayer.draw();
  });

  circle.on('mouseleave', () => {
    circle.stroke('#555');
    backgroundLayer.draw();
  });

  // When user drags from menu
  circle.on('mousedown', () => {
    const pos = stage.getPointerPosition();

    const sunRadius = celestialBodies[0].planetRadius;
    const baseVisualRadius = 50;
    const exponent = 0.3;

    const scaledRadius = body.name === 'Sun'
      ? baseVisualRadius
      : Math.max(5, Math.pow(body.planetRadius / sunRadius, exponent) * baseVisualRadius);

    // Create new planet clone using your helper
    const clone = createCircle(pos.x, pos.y, scaledRadius, body, true, true, backgroundLayer);
    backgroundLayer.add(clone);
    makeDraggable(clone);
    clone.startDrag();

    placedCircles.push(clone);
  });

  menuContentGroup.add(circle, label);
});



// --- Scroll menu content with wheel (smooth) ---
let menuScrollOffset = 0;
const totalHeight = colors.length*spacing + 120;
const maxScroll = Math.max(0, totalHeight - menuClipHeight);

stage.on('wheel', (e)=>{
  const pointer = stage.getPointerPosition();
  if(!pointer) return;
  if(pointer.x <= menuWidth && pointer.y >= navbarHeight){
    e.evt.preventDefault();
    menuScrollOffset += e.evt.deltaY * 0.5; // scaled smooth
    menuScrollOffset = Math.max(0, Math.min(maxScroll, menuScrollOffset));
    menuContentGroup.y(-menuScrollOffset);
    backgroundLayer.batchDraw();
  }
});

function resolveCollision(circle) {
  const maxIterations = 10; // avoid infinite loops
  let iteration = 0;
  let collided = true;

  while (collided && iteration < maxIterations) {
    collided = false;
    iteration++;

    for (let other of placedCircles) {
      if (other === circle) continue;

      let dx = circle.x() - other.x();
      let dy = circle.y() - other.y();
      let distance = Math.sqrt(dx * dx + dy * dy);
      const minDist = circle.radius() + other.radius();

      if (distance < minDist) {
        collided = true;

        // handle exact same position
        if (distance === 0) {
          dx = Math.random() - 0.5;
          dy = Math.random() - 0.5;
          distance = Math.sqrt(dx * dx + dy * dy);
        }

        const overlap = minDist - distance;
        const nx = dx / distance;
        const ny = dy / distance;

        // move circle just outside the other
        circle.x(circle.x() + nx * overlap);
        circle.y(circle.y() + ny * overlap);
      }
    }
  }
}


function createCircle(x, y, radius, body, draggable = false, fromMenu = false, layer = backgroundLayer, vel_mag = 0, vel_dir = 0) {
  const circle = new Konva.Circle({
    x,
    y,
    radius,
    stroke: '#555',
    strokeWidth: 2,
    draggable,
  });

  body.speed = vel_mag;
  body.direction = vel_dir;
  circle.setAttr('data', { ...body });
  circle.setAttr('fromMenu', fromMenu);

  if (body.image) {
    const img = new Image();
    img.src = body.image;

    img.onload = () => {
      // Scale the image so it completely covers the circle
      const scale = (2 * radius) / Math.max(img.width, img.height);

      circle.fillPatternImage(img);
      circle.fillPatternRepeat('no-repeat');
      circle.fillPatternOffset({ x: img.width / 2, y: img.height / 2 });
      circle.fillPatternScale({ x: scale, y: scale });

      // Optional: remove fill fallback if desired
      // circle.fill(null);

      layer.batchDraw();
    };
  }

  return circle;
}




function createCircleGroup(x, y, radius, body, draggable = false, fromMenu = false, layer = backgroundLayer, vel_mag = 0, vel_dir = 0) {
  const group = new Konva.Group({ x, y, draggable });

  // Base circle (for stroke and fallback color)
  const circle = new Konva.Circle({
    radius,
    stroke: '#555',
    strokeWidth: 2,
    fill: body.image ? null : body.color,
  });
  group.add(circle);

  group.setAttr('data', { ...body });
  group.setAttr('fromMenu', fromMenu);

  // Add image if present
  if (body.image) {
    const img = new Image();
    img.src = body.image;

    img.onload = () => {
      const imageNode = new Konva.Image({
        image: img,
        width: radius * 2,
        height: radius * 2,
        offsetX: radius,
        offsetY: radius,
        listening: false, // don't block events
      });

      // Use the circle as a clip to mask the image
      imageNode.cache();
      imageNode.clipFunc((ctx) => {
        ctx.beginPath();
        ctx.arc(radius, radius, radius, 0, Math.PI * 2);
        ctx.closePath();
      });

      group.add(imageNode);
      layer.batchDraw();
    };
  }

  return group;
}


// --- Menu tween ---
let menuVisible=false;
const menuTween = new Konva.Tween({ node: menuGroup, duration:0.4, y:navbarHeight, easing: Konva.Easings.EaseInOut });
menuButton.on('click', ()=>{ menuVisible = !menuVisible; menuVisible?menuTween.play():menuTween.reverse(); });

backgroundLayer.draw();
uiLayer.draw();