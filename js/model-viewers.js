var scene;
var map_arr = [
	{
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
		color: new THREE.Color(0xff0000),
		emissive: new THREE.Color(0x000000)
	},
	{
		roughness: 0.8,
		metalness: 0.9,
		color: new THREE.Color(0xff00ff),
		emissive: new THREE.Color(0xff0000)
	}
];
const textureLoader = new THREE.TextureLoader();


$(document).ready(function () {
	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);

		controls.handleResize();
		controls.update();
		renderer.render(scene, camera);
	}

	var redraw = true;

	function animate() {
		requestAnimationFrame(animate);

		controls.update();
		if (redraw)
			renderer.render(scene, camera);
		redraw = false;
	}

	var camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.1, 1000);
	camera.position.z = 5;

	var controls = new THREE.TrackballControls(camera);
	controls.rotateSpeed = 10.0;
	controls.zoomSpeed = 1.5;
	controls.panSpeed = 0.8;
	controls.noZoom = false;
	controls.noPan = false;
	controls.staticMoving = true;
	controls.dynamicDampingFactor = 0.3;
	controls.keys = [65, 83, 68];
	controls.addEventListener('change', function () {
		redraw = true;
	});

	scene = new THREE.Scene();
	scene.background = new THREE.Color(0xfffff0);
	scene.fog = new THREE.Fog(0x050505, 2000, 3500);
	scene.add(new THREE.AmbientLight(0x444444));


	var light1 = new THREE.DirectionalLight(0xffffff, 1.0);
	light1.position.set(1, 1, -1);
	scene.add(light1);

	var light2 = new THREE.DirectionalLight(0xffffff, 1.0);
	light2.position.set(-1, -1, 1);
	scene.add(light2);

	var renderer = new THREE.WebGLRenderer({antialias: true});
	renderer.setClearColor(scene.fog.color);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	var viewer = document.getElementById('js-viewer-container');
	viewer.appendChild(renderer.domElement);

	var model = viewer.dataset.link;

	/* An appropriate material can be used as a fourth arg for the NexusObject constructor

	 var texture = new THREE.DataTexture( new Uint8Array([1, 1, 1]), 1, 1, THREE.RGBFormat );
	 texture.needsUpdate = true;
	 var material = new THREE.MeshLambertMaterial( { color: 0xffffff, map: texture } );
	 */


	function onNexusLoad() {
		var s = 1 / nexus_obj.geometry.boundingSphere.radius;
		var p = nexus_obj.geometry.boundingBox.getCenter().negate();
		nexus_obj.position.set(p.x * s, p.y * s, p.y * s); //.set(p.x, p.y, p.z); // = p; //.set(p.x, p.y, p.z);
		nexus_obj.scale.set(s, s, s);
		redraw = true;

		console.log(nexus_obj);
		//
		// var geometry = nexus_obj.geometry;
		//
		// var material = new THREE.MeshStandardMaterial({color: 0xffffff});
		//
		// if (geometry instanceof THREE.BufferGeometry) {
		// 	geometry = new THREE.Geometry().fromBufferGeometry(geometry);
		// }
		//
		// var mesh = new THREE.Mesh(geometry, material);
		// mesh.castShadow = true;
		// mesh.receiveShadow = true;
		// //mesh.geometry.mergeVertices();
		// mesh.geometry.computeVertexNormals();
		// scene.add(mesh);
	}

	var nexus_obj = new NexusObject(model, onNexusLoad, function () {
		redraw = true;
	}, renderer, new THREE.MeshStandardMaterial({color: 0xffffff}));

	//console.log(nexus_obj);

	function changeMaps(obj, mesh) {
		if (obj) {

			if (!obj.repeat) {
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
	function changeMaterial(obj, mesh) {
		for (var key in obj) {
			if (mesh.material[key])
				mesh.material[key] = obj[key];
		}
		mesh.material.needsUpdate = true;
	}


	scene.add(nexus_obj);

	window.addEventListener('resize', onWindowResize, false);

	window.doit = function (i) {
		changeMaterial(materials[i], nexus_obj);
	};

	animate();
});
