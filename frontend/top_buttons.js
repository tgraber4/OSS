

function clickReset() {

}

function clickDelete() {
    placedCircles.forEach(c => {
        c.destroy();
    });
}


function clickLayout1() {
    placedCircles.forEach(c => {
        c.destroy();
    });
}

function clickLayout2() {
    placedCircles.forEach(c => {
        c.destroy();
    });
}

function clickLayout3() {
    placedCircles.forEach(c => {
        c.destroy();
    });
}

function clickLayout4() {
    placedCircles.forEach(c => {
        c.destroy();
    });
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
layoutButton.on('click', ()=>{ layout_menu_visible = !layout_menu_visible; layout_menu_visible ? layoutMenuTween.play() : layoutMenuTween.reverse(); });

backgroundLayer.draw();