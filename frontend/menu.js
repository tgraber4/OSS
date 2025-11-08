// --- Celestial data ---
const celestialBodies = [
  { name: 'Sun', color: '#ffcc00', mass: 1.989e30, planetRadius: 696340, velocity: 0, acceleration: 0 },
  { name: 'Mercury', color: '#bfbfbf', mass: 3.285e23, planetRadius: 2440, velocity: 0, acceleration: 0 },
  { name: 'Venus', color: '#e0b24c', mass: 4.867e24, planetRadius: 6052, velocity: 0, acceleration: 0 },
  { name: 'Earth', color: '#2a6bd4', mass: 5.972e24, planetRadius: 6371, velocity: 0, acceleration: 0 },
  { name: 'Mars', color: '#d14b28', mass: 6.39e23, planetRadius: 3389, velocity: 0, acceleration: 0 },
  { name: 'Jupiter', color: '#c48a3d', mass: 1.898e27, planetRadius: 69911, velocity: 0, acceleration: 0 },
  { name: 'Saturn', color: '#d9c073', mass: 5.683e26, planetRadius: 58232, velocity: 0, acceleration: 0 },
  { name: 'Uranus', color: '#7fc7ff', mass: 8.681e25, planetRadius: 25362, velocity: 0, acceleration: 0 },
  { name: 'Neptune', color: '#4062fa', mass: 1.024e26, planetRadius: 24622, velocity: 0, acceleration: 0 },
];



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
function makeButton(x, y, w, h, text, layer, clickFn) {
  const btn = new Konva.Rect({x, y, width: w, height: h, fill: '#555', cornerRadius: 0, listening: true});
  const txt = new Konva.Text({x: x + w/2, y: y + h/2, text, fontSize: 16, fill: 'white', listening: false});
  txt.offsetX(txt.width()/2); txt.offsetY(txt.height()/2);
  layer.add(btn, txt);
  btn.on('mouseenter', ()=>{ btn.fill('#777'); layer.draw(); });
  btn.on('mouseleave', ()=>{ btn.fill('#555'); layer.draw(); });
  
  btn.on('mouseover', function (e) {
  e.target.getStage().container().style.cursor = 'pointer';
  });
  btn.on('mouseout', function (e) {
    e.target.getStage().container().style.cursor = 'default';
  });

  btn.Text = txt;

  if(clickFn) btn.on('click', clickFn);
  return btn;
}

// --- Navbar & buttons ---

function clickPlay() {
    if (!playButton.clicked)
    {
        playButton.Text.setAttr('text', 'Pause');
        playButton.clicked = true;
    }
    else
    {
        playButton.Text.setAttr('text', 'Play');
        playButton.clicked = false;
    }
}

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

    // Destroy tooltip if it exists
    if(circle._tooltip){ 
      circle._tooltip.destroy(); 
      circle._tooltip = null; 
      backgroundLayer.draw(); 
    }

    deleteZone.show();
    backgroundLayer.draw();


    if(circle.getAttr('fromMenu') && menuVisible){ menuTween.reverse(); menuVisible=false; }
  });

  circle.on('dragmove', () => {
    // Show delete zone
    if(inDeleteZone(circle)){ deleteZone.opacity(0.9); deleteZone.shadowBlur(40); }
    else { deleteZone.opacity(0.6); deleteZone.shadowBlur(0); }

    // Prevent overlap by checking next position
    const pos = {x: circle.x(), y: circle.y()};
    const collided = placedCircles.some(other => {
      if(other === circle) return false;
      const oRect = other.getClientRect();
      const cRect = {
        x: pos.x - circle.radius(),
        y: pos.y - circle.radius(),
        width: circle.radius()*2,
        height: circle.radius()*2
      };
      return !(cRect.x + cRect.width < oRect.x || cRect.x > oRect.x + oRect.width ||
               cRect.y + cRect.height < oRect.y || cRect.y > oRect.y + oRect.height);
    });

    if(collided){
      circle.position(circle._lastValidPosition);
    } else {
      circle._lastValidPosition = pos;
    }

    backgroundLayer.batchDraw();
  });

  circle.on('dragend', () => {
    if(inDeleteZone(circle)){
      circle.destroy();
      const idx = placedCircles.indexOf(circle);
      if(idx!==-1) placedCircles.splice(idx,1);
    } else {
      circle.moveToBottom();
    }

    deleteZone.hide();
    deleteZone.shadowBlur(0);
    deleteZone.opacity(0.6);
    backgroundLayer.draw();

    if(circle.getAttr('fromMenu') && !menuVisible){ menuTween.play(); menuVisible=true;}
    dragging=false;
    circle.setAttr('fromMenu', false);
  });

  circle.on('click', (e)=>{
    if(!dragging){
      // Destroy previous tooltip
      placedCircles.forEach(c=>{ if(c._tooltip) { c._tooltip.destroy(); c._tooltip=null; } });
      circle._tooltip = showTooltip(circle);
      backgroundLayer.draw();
      e.cancelBubble = true; // prevent stage click
    }
  });
}

// --- Tooltip ---
function showTooltip(circle){
  const data = circle.getAttr('data') || {};
  const tooltip = new Konva.Group({
    x: circle.x(),
    y: circle.y() - circle.radius() - 175, // a bit closer
    listening: true
  });

  const box = new Konva.Rect({
    x: -50, y: -30, width: 150, height: 200,
    fill: 'black', opacity: 0.9, listening: true
  });

  const padding = 10;
  const text = new Konva.Text({
    x: box.x() + padding, y: box.y() + 10, text: `Name: ${data.name}\nRadius: ${data.planetRadius}km\nMass: ${data.mass}kg\nVelocity: ${data.velocity}m/s\nAcceleration: ${data.acceleration}m/s^2`, fontSize: 14,
    fill: 'white', align: 'left'
  });
  // make the text non-listening so clicks pass to buttons underneath
  text.listening(true);

  text.on('click', (e) => {
  e.cancelBubble = true;

  const data = circle.getAttr('data');
  const canvasBox = stage.container().getBoundingClientRect();
  const tooltipPos = tooltip.getClientRect();

  // Fields to edit and their line indices in the tooltip
  const editableFields = [
    { key: 'planetRadius', lineIndex: 1 },
    { key: 'mass', lineIndex: 2 },
    { key: 'velocity', lineIndex: 3 }
  ];
  const lineHeight = text.fontSize() + 2;

  editableFields.forEach(field => {
    const inputLeft = canvasBox.left + tooltipPos.x + tooltipPos.width + 5;
    const inputTop  = canvasBox.top + tooltipPos.y + 10 + field.lineIndex * lineHeight;

    const input = document.createElement('input');
    input.type = 'number';
    input.value = data[field.key];
    input.style.position = 'absolute';
    input.style.left = `${inputLeft}px`;
    input.style.top = `${inputTop}px`;
    input.style.width = '80px';
    input.style.fontSize = `${text.fontSize()}px`;
    input.style.background = 'rgba(0,0,0,0.8)';
    input.style.color = 'white';
    input.style.border = 'none';
    input.style.padding = '2px';
    input.style.outline = 'none';

    document.body.appendChild(input);
    input.focus();

    input.addEventListener('blur', () => {
      const value = parseFloat(input.value);
      if (!isNaN(value)) {
        circle.getAttr('data')[field.key] = value;

        // Update tooltip text
        const d = circle.getAttr('data');
        text.text(`Name: ${d.name}\nRadius: ${d.planetRadius}km\nMass: ${d.mass}kg\nVelocity: ${d.velocity}m/s\nAcceleration: ${d.acceleration}m/s^2`);
        backgroundLayer.draw();
      }
      document.body.removeChild(input);
    });

    input.addEventListener('keydown', (evt) => {
      if (evt.key === 'Enter') input.blur();
    });
  });
});



  const closeBtn = new Konva.Rect({
    x: box.x() + box.width() - 18,
    y: box.y() + 6,
    width: 12, height: 12, fill: 'red', cornerRadius: 2, listening: true
  });
  closeBtn.on('click', (e) => {
    e.cancelBubble = true;              // stop stage handler
    tooltip.destroy();
    circle._tooltip = null;
    backgroundLayer.draw();
  });

  // Delete button (rect) — text on top is non-listening so clicks hit this rect
  const deleteBtn = new Konva.Rect({
    x: box.x() + 10,
    y: box.y() + box.height() - 34,
    width: 100,
    height: 24,
    fill: '#c33',
    cornerRadius: 4,
    listening: true
  });

  const deleteText = new Konva.Text({
    x: deleteBtn.x() + deleteBtn.width()/2,
    y: deleteBtn.y() + deleteBtn.height()/2,
    text: 'Delete',
    fontSize: 14,
    fill: 'white'
  });
  deleteText.offsetX(deleteText.width()/2);
  deleteText.offsetY(deleteText.height()/2);
  deleteText.listening(false); // allow rect to receive the click

deleteBtn.on('click', (e) => {
  e.cancelBubble = true;

  // Fade out both tooltip and circle smoothly
  const fadeDuration = 0.1;

  const fadeOutCircle = new Konva.Tween({
    node: circle,
    duration: fadeDuration,
    opacity: 0,
    onFinish: () => {
      const idx = placedCircles.indexOf(circle);
      if (idx !== -1) placedCircles.splice(idx, 1);
      circle.destroy();
      backgroundLayer.draw();
    }
  });

  const fadeOutTooltip = new Konva.Tween({
    node: tooltip,
    duration: fadeDuration,
    opacity: 0,
    onFinish: () => {
      tooltip.destroy();
      circle._tooltip = null;
      backgroundLayer.draw();
    }
  });

  fadeOutCircle.play();
  fadeOutTooltip.play();
});


  tooltip.add(box, text, closeBtn, deleteBtn, deleteText);
  backgroundLayer.add(tooltip);

  // keep a reference so other code can close it
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
  const circle = new Konva.Circle({
    x: menuWidth / 2,
    y: 60 + i * spacing,
    radius,
    fill: body.color,
    stroke: '#555',
    strokeWidth: 2,
  });

  const label = new Konva.Text({
    x: circle.x(),
    y: circle.y() - radius - 20,
    text: body.name,
    fontSize: 14,
    fill: 'white',
    align: 'center',
  });
  label.offsetX(label.width() / 2)

  // store the planet data
  circle.setAttr('data', body);

  circle.on('mouseenter', () => {
    circle.fill(lightenHex(body.color));
    backgroundLayer.draw();
  });

  circle.on('mouseleave', () => {
    circle.fill(body.color);
    backgroundLayer.draw();
  });

  circle.on('mousedown', () => {
    const pos = stage.getPointerPosition();

    const sunRadius = celestialBodies[0].planetRadius;
    const baseVisualRadius = 50;
    const exponent = 0.3;

    let scaledRadius;
    if(body.name === 'Sun') {
      scaledRadius = baseVisualRadius;
  } else {
    scaledRadius = Math.max(5, Math.pow(body.planetRadius / sunRadius, exponent) * baseVisualRadius);
  }
    const clone = new Konva.Circle({
      x: pos.x,
      y: pos.y,
      radius: scaledRadius,
      fill: body.color,
      stroke: '#555',
      strokeWidth: 2,
      draggable: true,
    });
    // copy planet data into the clone
    clone.setAttr('data', { ...body });
    clone.setAttr('fromMenu', true);


    backgroundLayer.add(clone);
    makeDraggable(clone);
    clone.startDrag();
    placedCircles.push(clone);
    backgroundLayer.draw();
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

// --- Menu tween ---
let menuVisible=false;
const menuTween = new Konva.Tween({ node: menuGroup, duration:0.4, y:navbarHeight, easing: Konva.Easings.EaseInOut });
menuButton.on('click', ()=>{ menuVisible = !menuVisible; menuVisible?menuTween.play():menuTween.reverse(); });

backgroundLayer.draw();
uiLayer.draw();
