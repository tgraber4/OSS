



// function clickDelete() {
//     fetch("http://127.0.0.1:5000/clear_simulation", {
//         method: "POST"
//     });
//     placedCircles.forEach(c => {
//         c.destroy();
//     });
// }




function clickReset() {

}

function clickDelete() {
    placedCircles.forEach(c => {
        deleteObject(c.getAttr('arrow'));
        deleteObject(c);
        c.destroy();
    });
}


function toggle_layout_menu()
{
    layout_menu_visible = !layout_menu_visible;
    layout_menu_visible ? layoutMenuTween.play() : layoutMenuTween.reverse(); 
}

function createPlanet(planet_id, x, y, v_mag, v_deg)
{
    const sunRadius = celestialBodies[0].planetRadius;
    const baseVisualRadius = 50;
    const exponent = 0.3;

    const scaledRadius = celestialBodies[planet_id].name === 'Sun'
      ? baseVisualRadius
      : Math.max(5, Math.pow(celestialBodies[planet_id].planetRadius / sunRadius, exponent) * baseVisualRadius);
    
    const clone = createCircle(x, y, scaledRadius, celestialBodies[planet_id], true, false, backgroundLayer, v_mag, v_deg);
    
    backgroundLayer.add(clone);
    backgroundLayer.draw();
    placedCircles.push(clone);
    makeDraggable(clone);
    addObject(clone)
    return clone;
}

function clickLayout1() {
    clickDelete();

    var x = stage.width()/2;
    var y = stage.height()/2 + navbarHeight/2;
    createPlanet(0, x, y, 0, 0);
    createPlanet(1, x-57.91, y, 47.87, -90);
    createPlanet(2, x-108.21, y, 35.02, -90);
    createPlanet(3, x-149.6, y, 29.785, -90);
    createPlanet(4, x-230, y, 24.013, -90);


    toggle_layout_menu();
}

function clickLayout2() {
    clickDelete();

    var x = stage.width()/2;
    var y = stage.height()/2 + navbarHeight/2;
    createPlanet(0, x-150, y, 15, 90);
    createPlanet(0, x+150, y, 15, -90);

    toggle_layout_menu();
}

function clickLayout3() {
    placedCircles.forEach(c => {
        c.destroy();
    });

    var x = stage.width()/2;
    var y = stage.height()/2 + navbarHeight/2;
    createPlanet(0, x-150, y, 15, 90);
    createPlanet(0, x+150, y, 15, -90);

    createPlanet(2, x, y+50, 5.385, 68.1986);
    createPlanet(2, x, y-50, 5, 126.87);

    toggle_layout_menu()
}

function clickLayout4() {
    placedCircles.forEach(c => {
        c.destroy();
    });

    var x = stage.width()/2;
    var y = stage.height()/2 + navbarHeight/2;
    createPlanet(0, x-250, y, 15, -90);
    createPlanet(0, x+250, y, 15, 90);
    createPlanet(0, x, y-250, 15, 180);
    createPlanet(0, x, y+250, 15, 0);

    toggle_layout_menu()
}


const resetButton = makeButton(stage.width()-200, 0, 100, navbarHeight,'Reset', uiLayer, clickReset);
const clearButton = makeButton(stage.width()-300, 0, 100, navbarHeight,'Clear', uiLayer, clickDelete);
const layoutButton = makeButton(stage.width()-500, 0, 200, navbarHeight,'Layout', uiLayer);


// --- Menu group with clipping ---
const layoutClipHeight = 200;

const layout_group = new Konva.Group({
  x:0,
  y:-menuClipHeight+navbarHeight,
  clip: { x:stage.width()-500, y:0, width:menuWidth, height:layoutClipHeight }
});

backgroundLayer.add(layout_group);
layout_group.add(new Konva.Rect({x:stage.width()-500, y:0, width:menuWidth, height:2*layoutClipHeight, fill:'blue'}));

const layout_button1 = makeButton(stage.width()-500, 0, 200, navbarHeight,'test 1', backgroundLayer, clickLayout1, fill = '#722')
layout_group.add(layout_button1);
layout_group.add(layout_button1.Text);

const layout_button2 = makeButton(stage.width()-500, 50, 200, navbarHeight,'test 2', backgroundLayer, clickLayout2, fill = '#722')
layout_group.add(layout_button2);
layout_group.add(layout_button2.Text);

const layout_button3 = makeButton(stage.width()-500, 100, 200, navbarHeight,'test 3', backgroundLayer, clickLayout3, fill = '#722')
layout_group.add(layout_button3);
layout_group.add(layout_button3.Text);

const layout_button4 = makeButton(stage.width()-500, 150, 200, navbarHeight,'test 4', backgroundLayer, clickLayout4, fill = '#722')
layout_group.add(layout_button4);
layout_group.add(layout_button4.Text);

let layout_menu_visible=false;
const layoutMenuTween = new Konva.Tween({ node: layout_group, duration:0.4, y:navbarHeight, easing: Konva.Easings.EaseInOut });

layoutButton.on('click', ()=>toggle_layout_menu());
backgroundLayer.draw();



function draw_circle()
{
    var patternPentagon = new Konva.RegularPolygon({
        x: 220,
        y: stage.height() / 2,
        sides: 5,
        radius: 70,
        fillPatternImage: img1,
        fillPatternOffset: { x: -220, y: 70 },
        stroke: 'white',
        strokeWidth: 4,
        draggable: true,
    });

    uiLayer.add(patternPentagon);
    backgroundLayer.draw();
}