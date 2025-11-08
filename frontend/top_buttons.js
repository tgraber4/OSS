

function clickReset() {

}

function clickDelete() {
    placedCircles.forEach(c => {
        c.destroy();
    });
}


function Clicklayout() {

}


const resetButton = makeButton(stage.width()-200, 0, 100, navbarHeight,'Reset', uiLayer, clickReset);
const layoutButton = makeButton(stage.width()-300, 0, 100, navbarHeight,'Clear', uiLayer, clickDelete);
const eraseButton = makeButton(stage.width()-400, 0, 100, navbarHeight,'Layout', uiLayer, Clicklayout);


