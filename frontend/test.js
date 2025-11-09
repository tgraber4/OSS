// Helper: fill an existing circle with an image
function fillCircleWithImage(circle, imgSrc) {
  const img = new Image();
  img.src = imgSrc;

  img.onload = () => {
    const radius = circle.radius();
    const diameter = radius * 2;

    // Scale image so it covers the circle fully (like background-size: cover)
    const scale = Math.max(
      diameter / img.width,
      diameter / img.height
    );

    // Apply image as pattern fill
    circle.fillPatternImage(img);
    circle.fillPatternScale({ x: scale, y: scale });
    circle.fillPatternRepeat('no-repeat');

    // Center the image inside the circle
    circle.fillPatternOffset({
      x: img.width / 2,
      y: img.height / 2,
    });

    // Optional stroke, etc.
    circle.stroke('white');
    circle.strokeWidth(2);

    circle.getLayer().batchDraw(); // refresh the layer
  };
}

// Create a stage and layer
const stage = new Konva.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight,
});
const layer = new Konva.Layer();
stage.add(layer);

// Make a circle
const circle = new Konva.Circle({
  x: 200,
  y: 200,
  radius: 100,
  draggable: true,
});
layer.add(circle);
layer.draw();

// Fill the circle with an image
fillCircleWithImage(circle, './imagesTESTING/mars.png');
