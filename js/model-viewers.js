var viewer, link, filename, camera, controls, scene, mesh, renderer;
var map_arr = [
	{
		name: 'Bottom-band-j-756-256',
		preview: "assets/images/test-text/Bottom-band-j-756-256/bottom_band_j_756.jpg",
		repeat: {x: 8, y: 8},
		maps: {
			map: "assets/Bottom-band-j-756-256/Bottom-band-j-756-256_BASE.jpg",
			normalMap: "assets/Bottom-band-j-756-256/Bottom-band-j-756-256_NRM.jpg",
			metalnessMap: "assets/Bottom-band-j-756-256/Bottom-band-j-756-256_MTL.jpg",
			roughnessMap: "assets/Bottom-band-j-756-256/Bottom-band-j-756-256_ROUGH.jpg",
			alphaMap: "assets/Bottom-band-j-756-256/Bottom-band-j-756-256_ALPHA.jpg"
		}
	},
	{
		name: 'Back-lining-32',
		preview: "assets/images/test-text/Back-lining-32/back_lining.jpg",
		repeat: {x: 64, y: 64},
		maps: {
			map: "assets/Back-lining-32/Back-lining-32_BASE.jpg",
			normalMap: "assets/Back-lining-32/Back-lining-32_NRM.jpg",
			metalnessMap: "assets/Back-lining-32/Back-lining-32_MTL.jpg",
			roughnessMap: "assets/Back-lining-32/Back-lining-32_ROUGH.jpg",
			alphaMap: "assets/Back-lining-32/Back-lining-32_ALPHA.jpg",
		}

	}
];

var materials = [
	{
		roughness: 0.2,
		metalness: 0.3,
		color: new THREE.Color( 0xff0000 ),
		emissive: new THREE.Color( 0x000000 )
	},
	{
		roughness: 0.8,
		metalness: 0.9,
		color: new THREE.Color( 0xff00ff ),
		emissive: new THREE.Color( 0xff0000 )
	}
];

const textureLoader = new THREE.TextureLoader();


$(document).ready(function () {
	initializeModelViewer();
});

function initializeModelViewer() {
	viewer = document.getElementById('js-viewer-container');

	if (viewer !== null) {
		//link = viewer.dataset.link;
		link = './draco/draco_file_two';
		filename = viewer.dataset.filename;
		screenshotType = viewer.dataset.screenshotType
		// textureLoader = new THREE.TextureLoader();
		// textureLoader.setCrossOrigin("anonymous");

		if (!Detector.webgl) Detector.addGetWebGLMessage();
		scene = new THREE.Scene();

		// configure viewer container
		var width = viewer.offsetWidth / 2;
		viewer.style.height = width + "px"; // set height as width
		renderer = new THREE.WebGLRenderer({antialias: true, preserveDrawingBuffer: true});
		renderer.setPixelRatio(window.devicePixelRatio);
		renderer.gammaInput = true;
		renderer.gammaOutput = true;
		renderer.setSize(viewer.offsetWidth, viewer.offsetHeight);
		renderer.shadowMap.enabled = true;
		viewer.appendChild(renderer.domElement);

		// configure camera
		camera = new THREE.PerspectiveCamera(40, viewer.offsetWidth / viewer.offsetHeight, 1, 1000);
		camera.position.z = 150;

		// configure lights
		var light = new THREE.DirectionalLight(0xffffff);
		light.position.set(5, 5, 10);
		scene.add(light);
		var light = new THREE.DirectionalLight(0xffffff);
		light.position.set(-10, -10, 0);
		scene.add(light);
		var light = new THREE.AmbientLight(0x545159);
		scene.add(light);

		// configure scene background
		scene.background = new THREE.Color(0xffffff);

		// handle resize
		window.addEventListener('resize', onWindowResize, false);

		// load model
		var loader;

		THREE.DRACOLoader.setDecoderPath("./draco_decoder.js");
		THREE.DRACOLoader.setDecoderConfig({type: 'js'});
		loader = new THREE.DRACOLoader();

		loader.load(link, function (geometry) {
			// Set Up Mesh
			var material = new THREE.MeshStandardMaterial({color: 0xffffff});

			if (geometry instanceof THREE.BufferGeometry) {
				geometry = new THREE.Geometry().fromBufferGeometry(geometry);
			}

			mesh = new THREE.Mesh(geometry, material);
			mesh.castShadow = true;
			mesh.receiveShadow = true;
			//mesh.geometry.mergeVertices();
			mesh.geometry.computeVertexNormals();
			scene.add(mesh);

			// Re-Position Camera
			geometry.computeBoundingBox();

			var center = geometry.boundingBox.getCenter();
			var size = geometry.boundingBox.getSize();
			var maxDim = Math.max(size.x, size.y, size.z);
			var fov = camera.fov * (Math.PI / 180);
			var cameraZ = Math.abs(maxDim / 4 * Math.tan(fov * 2)) * 1.25;
			camera.position.set(center.x, center.y, cameraZ);

			// Set far edge
			var minZ = geometry.boundingBox.min.z;
			var cameraToFarEdge = ( minZ < 0 ) ? -minZ + cameraZ : cameraZ - minZ;
			camera.far = cameraToFarEdge * 3;
			camera.updateProjectionMatrix();

			// set camera to rotate around center of loaded object
			controls.target = center;

			// prevent camera from zooming out far enough to create far plane cutoff
			controls.maxDistance = cameraToFarEdge * 2;

			renderViewer();
		});

		$('.js-container-fullscreen').click(function () {
			if (window.innerHeight == screen.height) {
				document.webkitExitFullscreen();
				onWindowResize();
			} else {
				this.parentNode.webkitRequestFullscreen();
			}
			setTimeout(function () {
				renderViewer();
			}, 700); // re-render after fullscreen for distortion issues
		});
		$('.js-viewer-snapshot').click(function () {
			try {
				var strippedFilename = filename.replace(/\.[^/.]+$/, "");
				var constructedFilename = strippedFilename + "_" + Date.now() + '.jpeg';
				var imgData = renderer.domElement.toDataURL("image/jpeg");

				downloadFile(imgData.replace("image/jpeg", "image/octet-stream"), constructedFilename)
			} catch (e) {
				console.log(e);
				return;
			}
		});

		// configure controls
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		// controls.addEventListener('change', renderViewer);
		controls.enablePan = true;
		controls.keys = {
			LEFT: 68, // d key
			UP: 83, // s key
			RIGHT: 65, // a key
			BOTTOM: 87 // w key
		}

		animate();
	}
}

function PBRmaterial(obj) {
	if(obj) {

		if(!obj.repeat){
			obj.repeat = {
				x: 1,
				y: 1
			}
		}

		const map = mesh.material.map;
		const normalMap = mesh.material.normalMap;
		const metalnessMap = mesh.material.metalnessMap;
		const roughnessMap = mesh.material.roughnessMap;
		const alphaMap = mesh.material.alphaMap;

		if (obj.maps.map) {
			mesh.material.map = textureLoader.load(obj.maps.map);
			mesh.material.map.wrapS = mesh.material.map.wrapT = 1000;
			mesh.material.map.repeat.x = obj.repeat.x;
			mesh.material.map.repeat.y = obj.repeat.y;
		}
		if (map)
			map.dispose();

		if (obj.maps.normalMap) {
			mesh.material.normalMap = textureLoader.load(obj.maps.normalMap);
			mesh.material.normalMap.wrapS = mesh.material.normalMap.wrapT = 1000;
			mesh.material.normalMap.repeat.x = obj.repeat.x;
			mesh.material.normalMap.repeat.y = obj.repeat.y;
		}
		if (normalMap)
			normalMap.dispose();

		if (obj.maps.metalnessMap) {
			mesh.material.metalnessMap = textureLoader.load(obj.maps.metalnessMap);
			mesh.material.metalnessMap.wrapS = mesh.material.metalnessMap.wrapT = 1000;
			mesh.material.metalnessMap.repeat.x = obj.repeat.x;
			mesh.material.metalnessMap.repeat.y = obj.repeat.y;
		}
		if (metalnessMap)
			metalnessMap.dispose();

		if (obj.maps.roughnessMap) {
			mesh.material.roughnessMap = textureLoader.load(obj.maps.roughnessMap);
			mesh.material.roughnessMap.wrapS = mesh.material.roughnessMap.wrapT = 1000;
			mesh.material.roughnessMap.repeat.x = obj.repeat.x;
			mesh.material.roughnessMap.repeat.y = obj.repeat.y;
		}
		if (roughnessMap)
			roughnessMap.dispose();

		if (obj.maps.alphaMap) {
			mesh.material.alphaMap = textureLoader.load(obj.maps.alphaMap);
			mesh.material.alphaMap.wrapS = mesh.material.alphaMap.wrapT = 1000;
			mesh.material.alphaMap.repeat.x = obj.repeat.x;
			mesh.material.alphaMap.repeat.y = obj.repeat.y;
		}
		if (alphaMap)
			alphaMap.dispose();

		mesh.material.needsUpdate = true;
	}
}

function changeMaterial(obj){
	for(var key in obj){
		if(mesh.material[key])
			mesh.material[key] = obj[key];
	}
	mesh.material.needsUpdate = true;
}

function onWindowResize() {
	var width = viewer.offsetWidth / 2;
	viewer.style.height = width + "px"; // set height as width

	camera.aspect = viewer.offsetWidth / viewer.offsetHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(viewer.offsetWidth, viewer.offsetHeight);
}
function renderViewer() {
	renderer.render(scene, camera);
}

function animate() {
	renderViewer();
	requestAnimationFrame( animate );
}


function downloadFile(imgData, filename) {
	var link = document.createElement('a');
	if (typeof link.download === 'string') {
		document.body.appendChild(link); //Firefox requires the link to be in the body
		link.download = filename;
		link.href = imgData;
		link.click();
		document.body.removeChild(link); //remove the link when done
	} else {
		location.replace(uri);
	}
}
