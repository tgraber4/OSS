

function clickReset() {
    fetch("http://127.0.0.1:5000/reset_simulation", {
        method: "POST"
    });

}

function clickDelete() {
    fetch("http://127.0.0.1:5000/clear_simulation", {
        method: "POST"
    });
    placedCircles.forEach(c => {
        c.destroy();
    });
}


function Clicklayout() {
    fetch("http://127.0.0.1:5000/layouts_selection", {
        method: "POST"
    });
}


const resetButton = makeButton(stage.width()-200, 0, 100, navbarHeight,'Reset', uiLayer, clickReset);
const layoutButton = makeButton(stage.width()-300, 0, 100, navbarHeight,'Clear', uiLayer, clickDelete);
const eraseButton = makeButton(stage.width()-400, 0, 100, navbarHeight,'Layout', uiLayer, Clicklayout);

