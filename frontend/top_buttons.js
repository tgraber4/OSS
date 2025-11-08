
function clickReset() {
    placedCircles.forEach(c => {
        c._tooltip.destroy();
    });
}


const resetButton = makeButton(stage.width()-200, 0, 100, navbarHeight,'Reset', uiLayer, clickReset);
const layoutButton = makeButton(stage.width()-300, 0, 100, navbarHeight,'Delete', uiLayer);
const eraseButton = makeButton(stage.width()-400, 0, 100, navbarHeight,'Layout', uiLayer);


