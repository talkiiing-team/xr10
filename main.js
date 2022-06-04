import "./style.css";

let scene, camera, renderer, clock, deltaTime, totalTime;

let arToolkitSource, arToolkitContext;

const meshes = {};

window.state = {
  rotation: 0,
  modelsLoadingStatuses: [false, false, false],
};

function onLoaded(index) {
  state.modelsLoadingStatuses[index] = true;

  const getTitle = (val) => (val ? "Загружена" : "В процессе");

  document.querySelector(".info").innerHTML = `
  Идет загрузка моделей:

  <br>
  Модель собаки - ${getTitle(state.modelsLoadingStatuses[0])}

  <br>
  Модель кошки - ${getTitle(state.modelsLoadingStatuses[1])}

  <br>
  Модель человека - ${getTitle(state.modelsLoadingStatuses[2])}
  `;

  if (state.modelsLoadingStatuses.every((v) => v)) {
    setTimeout(
      () => (document.querySelector(".info").style.display = "none"),
      600
    );
  }
}

onLoaded();

initialize();
animate();

function initialize() {
  scene = new THREE.Scene();

  let ambientLight = new THREE.AmbientLight(0xcccccc, 1.0);
  scene.add(ambientLight);

  camera = new THREE.Camera();
  scene.add(camera);

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
  });
  renderer.setClearColor(new THREE.Color("lightgrey"), 0);
  renderer.setSize(640, 480);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.top = "0px";
  renderer.domElement.style.left = "0px";
  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();
  deltaTime = 0;
  totalTime = 0;

  arToolkitSource = new THREEx.ArToolkitSource({
    sourceType: "webcam",
  });

  function onResize() {
    arToolkitSource.onResize();
    arToolkitSource.copySizeTo(renderer.domElement);
    if (arToolkitContext.arController !== null) {
      arToolkitSource.copySizeTo(arToolkitContext.arController.canvas);
    }
  }

  arToolkitSource.init(function onReady() {
    onResize();
  });

  window.addEventListener("resize", function () {
    onResize();
  });

  arToolkitContext = new THREEx.ArToolkitContext({
    cameraParametersUrl: "data/camera_para.dat",
    detectionMode: "mono",
  });

  arToolkitContext.init(function onCompleted() {
    camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
  });

  const markerRoot1 = new THREE.Group();
  scene.add(markerRoot1);
  let markerControls1 = new THREEx.ArMarkerControls(
    arToolkitContext,
    markerRoot1,
    {
      type: "pattern",
      patternUrl: "data/qrdog2.patt",
    }
  );

  function onProgress(xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  }
  function onError(xhr) {
    console.log("An error happened");
  }

  new THREE.MTLLoader()
    .setPath("models/")
    .load("dog.mtl", function (materials) {
      materials.preload();
      new THREE.OBJLoader()
        .setMaterials(materials)
        .setPath("models/")
        .load(
          "dog.obj",
          function (group) {
            const mesh0 = group.children[0];
            mesh0.rotation.x = -Math.PI / 2;
            mesh0.position.y = 0.25;
            mesh0.scale.set(0.05, 0.05, 0.05);
            markerRoot1.add(mesh0);
            meshes.dog = mesh0;
            onLoaded(0);
          },
          onProgress,
          onError
        );
    });

  // build markerControls
  const markerRoot2 = new THREE.Group();
  scene.add(markerRoot2);
  let markerControls2 = new THREEx.ArMarkerControls(
    arToolkitContext,
    markerRoot2,
    {
      type: "pattern",
      patternUrl: "data/qrcat.patt",
    }
  );

  new THREE.MTLLoader()
    .setPath("models/")
    .load("cat.mtl", function (materials) {
      materials.preload();
      new THREE.OBJLoader()
        .setMaterials(materials)
        .setPath("models/")
        .load(
          "cat.obj",
          function (group) {
            const mesh0 = group.children[0];
            // mesh0.material.side = THREE.DoubleSide;
            mesh0.rotation.x = -Math.PI / 2;
            mesh0.position.y = 0.25;
            mesh0.scale.set(0.05, 0.05, 0.05);
            markerRoot2.add(mesh0);
            meshes.cat = mesh0;
            onLoaded(1);
          },
          onProgress,
          onError
        );
    });

  // build markerControls
  const markerRoot3 = new THREE.Group();
  scene.add(markerRoot3);
  let markerControls3 = new THREEx.ArMarkerControls(
    arToolkitContext,
    markerRoot3,
    {
      type: "pattern",
      patternUrl: "data/qrhuman.patt",
    }
  );

  const normalMaterial = new THREE.MeshNormalMaterial();

  new THREE.OBJLoader().setPath("models/").load(
    "human.obj",
    function (group) {
      const mesh0 = group.children[0];
      mesh0.position.y = 0.25;
      mesh0.scale.set(0.1, 0.1, 0.1);
      mesh0.material = normalMaterial;
      markerRoot3.add(mesh0);
      meshes.human = mesh0;
      onLoaded(2);
    },
    onProgress,
    onError
  );
}

function update() {
  // update artoolkit on every frame
  if (arToolkitSource.ready !== false)
    arToolkitContext.update(arToolkitSource.domElement);
}

function render() {
  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  deltaTime = clock.getDelta();
  totalTime += deltaTime;

  state.rotation += 0.1;
  // meshes.forEach((mesh) => (mesh.rotation.z = state.rotation));
  if ("human" in meshes) {
    meshes.human.rotation.y = state.rotation;
  }

  if ("dog" in meshes) {
    meshes.dog.rotation.z = state.rotation;
  }

  if ("cat" in meshes) {
    meshes.cat.rotation.z = state.rotation;
  }

  update();
  render();
}
