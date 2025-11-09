

function clickReset() {

}

function clickDelete() {
    placedCircles.forEach(c => {
        c.destroy();
        const idx = placedCircles.indexOf(c);
        if (idx !== -1)
            placedCircles.splice(idx, 1);
    });

    placedCircles.length = 0;
}


function toggle_layout_menu()
{
    layout_menu_visible = !layout_menu_visible;
    layout_menu_visible ? layoutMenuTween.play() : layoutMenuTween.reverse(); 
}


function createPlanet(planet_id, x, y, v_mag, v_deg)
{
    createCircle(x, y, 100, celestialBodies[planet_id], true, false, backgroundLayer);
}


function clickLayout1() {
    clickDelete();

    createPlanet(0, 500, 400, 0, 0);
    //placedCircles.push(createPlanet(1, 500-57.91, 400, 47.87, -90));
    //placedCircles.push(createPlanet(2, 500-108.21, 400, 35.02, -90));
    //placedCircles.push(createPlanet(3, 500-149.6, 400, 29.785, -90));
    //placedCircles.push(createPlanet(4, 500-230, 400, 24.013, -90));

    toggle_layout_menu();
}

function clickLayout2() {
    clickDelete();

    createPlanet(0, 250, 400, 15, 90);
    createPlanet(0, 550, 400, 15, -90);

    toggle_layout_menu();
}

function clickLayout3() {
    clickDelete();

    toggle_layout_menu();
}

function clickLayout4() {
    clickDelete();
    
    toggle_layout_menu();
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
