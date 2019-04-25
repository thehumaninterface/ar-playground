// Actual code

var actions = [];





// Create renderer
renderer = new THREE.WebGLRenderer({
  antialias : true,
  alpha: true,
  
  // In order to capture the image being drawn on the canvas
  // https://stackoverflow.com/questions/15558418/how-do-you-save-an-image-from-a-three-js-canvas
  preserveDrawingBuffer: true
});
renderer.setClearColor(new THREE.Color('lightgrey'), 0);
renderer.setSize( 480, 480 );
renderer.domElement.style.position = 'absolute'
renderer.domElement.style.top = '0px'
renderer.domElement.style.left = '0px'
document.body.appendChild( renderer.domElement );


// Material
defaultMaterial = new THREE.MeshNormalMaterial({
  transparent: true,
  opacity: 0.9,
  side: THREE.DoubleSide
});



initialize();
animate();

function initialize() {
  scene = new THREE.Scene();

  let ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
  scene.add( ambientLight );

  camera = new THREE.Camera();
  scene.add(camera);
  

  clock = new THREE.Clock();
  
  ////////////////////////////////////////////////////////////
  // setup arToolkitSource
  ////////////////////////////////////////////////////////////

  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType : 'webcam',
  });

  function onResize() {
    arToolkitSource.onResizeElement()	
    arToolkitSource.copyElementSizeTo(renderer.domElement)	
    if ( arToolkitContext.arController !== null ) {
      arToolkitSource.copyElementSizeTo(arToolkitContext.arController.canvas)	
    }	
  }

  arToolkitSource.init(function onReady(){
    onResize()
  });
  
  // handle resize event
  addEventListener('resize', function(){
    onResize()
  });
  
  ////////////////////////////////////////////////////////////
  // setup arToolkitContext
  ////////////////////////////////////////////////////////////	

  // create atToolkitContext
  arToolkitContext = new THREEx.ArToolkitContext({
    // debug: true,
    detectionMode: 'mono_and_matrix',
    matrixCodeType: '3x3',
    cameraParametersUrl: '/assets/data/camera_para.dat',
  });
  
  // copy projection matrix to camera when initialization complete
  arToolkitContext.init( function onCompleted(){
    camera.projectionMatrix.copy( arToolkitContext.getProjectionMatrix() );
    arController = arToolkitContext.arController;

    // add listener
    // arController.addEventListener('getMarker', onMarkerFound);
  });


  ////////////////////////////////////////////////////////////
  // setup markerRoots
  ////////////////////////////////////////////////////////////

  // build markerControls
  markerRoot1 = new THREE.Group();
  scene.add(markerRoot1);

  let markerControls1 = new THREEx.ArMarkerControls(arToolkitContext, markerRoot1, {
    type: 'barcode', 
    barcodeValue: 37
    // patternUrl: "/assets/markers/hiro.patt",
  })

  // Load a glTF resource
  var loader = new THREE.GLTFLoader();

  console.time('Loaded GLTF model');
  loader.load(
    // resource URL
    '/assets/models/pixelHeart/pixelHeart.gltf',

    // called when the resource is loaded
    function ( gltf ) {
      console.timeEnd('Loaded GLTF model');
      console.log(gltf);

      // material
      // gltf.scene.children.forEach(child => {
      //   if (child.isMesh) child.material = defaultMaterial;
      // });

      // animation
      var mixer = new THREE.AnimationMixer(gltf.scene);
      gltf.animations.forEach(function(animation) {
        actions.push (
          mixer.clipAction(animation).play()
        );
      });
      
      markerRoot1.add(gltf.scene);
    },

    // called while loading is progressing
    function ( xhr ) {
      console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    },

    // called when loading has errors
    function ( error ) {
      console.log( 'An error happened while loading model', error );
    }
  );
}


function update() {
  // console.log("markerRoot1", markerRoot1);
  // console.log("mesh1", mesh1);
  // debugger;
  // if ( markerRoot1.visible )
    // mesh1.rotation.y += 0.01;
  // update artoolkit on every frame
  // console.log(action);

  if (actions.length) {
    actions.forEach(action => action.getMixer().update(clock.getDelta()));
  }

  if ( arToolkitSource.ready !== false )
    arToolkitContext.update( arToolkitSource.domElement );
}


function render() {
  renderer.render( scene, camera );
}


function animate() {
  requestAnimationFrame(animate);
  update();
  render();
}




























function ScreenCapture() {
  var sourceCanvas = arToolkitContext.arController.ctx.canvas;
  var drawingCanvas = renderer.domElement;
  
  console.log(drawingCanvas);
  console.log(arToolkitSource);
  console.log(arToolkitContext);
  console.log(renderer);
  
  
  mergeImages([sourceCanvas.toDataURL("image/png"), drawingCanvas.toDataURL("image/png")])
    .then(b64 => document.getElementById('screencapturepreview').src = b64);

  // var preview = document.getElementById('screencapturepreview');
  // preview.src=mergedCanvas.toDataURL("image/png");
  

  // Save image to device
  // var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");  // here is the most important part because if you dont replace you will get a DOM 18 exception.
  // location.href=image; // it will save locally
}
