// 1. Create the stage
const stage = new Konva.Stage({
  container: 'container',
  width: window.innerWidth,
  height: window.innerHeight
});

// 2. Create a layer
const layer = new Konva.Layer();
stage.add(layer);

// 3. Create a Konva.Image placeholder
const konvaImage = new Konva.Image({
  x: 50,
  y: 50,
  width: 200,
  height: 200,
});
//layer.add(konvaImage);

// 4. Load the image
const img = new Image();
img.src = './imagesTESTING/mars.png'; // replace with your image path

function setImage() {
  konvaImage.image(img);
  layer.draw();
}

if (img.complete) {
  // Image is already loaded
  setImage();
} else {
  // Wait for image to load
  img.onload = setImage;
}
circle = new Konva.circle()
