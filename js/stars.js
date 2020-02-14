

import * as THREE from '../three.js-master/build/three.module.js';
import Stats from '../three.js-master/examples/jsm/libs/stats.module.js';
import { GUI } from '../three.js-master/examples/jsm/libs/dat.gui.module.js';
import { EffectComposer } from '../three.js-master/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../three.js-master/examples/jsm/postprocessing/RenderPass.js';
import { FilmPass } from '../three.js-master/examples/jsm/postprocessing/FilmPass.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

var Sun,
    Mercury,  //水星
    Venus,  //金星
    Earth,
    Mars,
    Jupiter, //木星
    Saturn, //土星
    Uranus, //天王
    Neptune, //海王
    Stars = [];

var followCamera = document.getElementById( 'camera-toggle' );

var EarthRotationA = new THREE.Vector3(0.398749 , 0.9170600 , 0.00001) ;
var EarthSpeed = { val: 0.001} ;
var PlanetRotation = new THREE.Vector3(  5.12 , 3.5 , 3.3 ) ;
var PlanetAB =  new THREE.Vector2(45.0,35.0);
var raycaster = new THREE.Raycaster();
var PlaneSpeed = { val: 10 };

var radius = 10;//6371;

var moonScale = 0.23;
var sunScale = 1.2;

var MARGIN = 0;
var SCREEN_HEIGHT = window.innerHeight - MARGIN * 2;
var SCREEN_WIDTH = window.innerWidth;

var camera, controls, scene, renderer, stats;
var geometry, meshPlanet, meshMoon;

var composer;

var gui;

var param = { example: 'Earth' };

var textureLoader = new THREE.TextureLoader();

var d;

var SEGMENTS = 50;

var splines = {};

var positions = [];

var clock = new THREE.Clock();

var ellipse;

var group = new THREE.Group();

var groupEarth = new THREE.Group();
var groupEarth2 = new THREE.Group();
var group2 = new THREE.Group();

var params = {
    radial1: false,
    radial2: false,
    radial3: false,
    卫星视角: false,
    太阳视角: false,

};

var relativeVelocity = {val: 0.00001};

var relativeAngle  = 0.00001 ;
var splineCamera , cameraHelper ;

var moveStar = {
    Mercury: new Object(),  //水星
    Venus: new Object(),  //金星
    Earth: new Object(),
    Mars: new Object(),
    Jupiter: new Object(), //木星
    Saturn: new Object(), //土星
    Uranus: new Object(), //天王
    Neptune: new Object(),
    Sun : new Object()
};

init();
animate();

function init() {

    camera = new THREE.PerspectiveCamera( 25, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 1e8 );
    camera.position.set(250,100,250);

    splineCamera = new THREE.PerspectiveCamera( 90, SCREEN_WIDTH / SCREEN_HEIGHT, 0.01, 1000 );
    //parent.add( splineCamera );
    cameraHelper = new THREE.CameraHelper( splineCamera );


    cameraHelper.visible = false ;

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2( 0x000000, 0.00000025 );

    var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x333333, 0.5);
    scene.add( hemisphereLight );

    scene.add( cameraHelper );
    geometry = new THREE.SphereBufferGeometry( radius, 150, 150 );


    /*太阳光*/
    let sunLight = new THREE.PointLight(0xddddaa,1.5,500);
    sunLight.castShadow = true;
    moveStar["Sun"]["rotSpeed"] = 25.05;
    scene.add(sunLight);

    var sunSkinPic = new THREE.MeshPhongMaterial( {
        emissive: 0xdd4422,
        map: textureLoader.load( "./img/sunCore.jpg" )

    } );


    Sun = new THREE.Mesh( geometry, sunSkinPic );
    Sun.scale.set( sunScale, sunScale, sunScale );
    scene.add(Sun);

    /*planets*/
    Mercury = initPlanet('Mercury',20,58,0,'./img/Mercury.jpg',4 *radius,0.4 *radius);
    Stars.push(Mercury);

    Venus = initPlanet('Venus',12,243,0,'./img/Venus.jpg',6 *radius,0.8 *radius);
    Stars.push(Venus);

    Earth = initEarth('Earth',10,0,8 *radius,radius,geometry)
    Stars.push(Earth);

    Mars = initPlanet('Mars',8,1.0,0,'./img/Mars.jpg',10 *radius,0.8 *radius);
    Stars.push(Mars);

    Jupiter = initPlanet('Jupiter',6,0.42,0,'./img/Jupiter.jpg',14 *radius,1.8 *radius);
    Stars.push(Jupiter);

    Saturn = initPlanet('Saturn',5,0.44,0,'./img/Saturn.png',20 *radius,1.4 *radius,{
        color:'rgb(136,75,30)',
        innerRedius:1.8*radius,
        outerRadius:2.2*radius
    });
    Stars.push(Saturn);

    Uranus = initPlanet('Uranus',3,0.71,0,'./img/Uranus.jpg',24*radius,0.8*radius);
    Stars.push(Uranus);

    Neptune = initPlanet('Neptune',2,0.67,0,'./img/Neptune.jpg',30*radius,0.6*radius);
    Stars.push(Neptune);


    // moon
    var materialMoon = new THREE.MeshPhongMaterial( {

        map: textureLoader.load( "./img/moon_1024.jpg" )

    } );

    meshMoon = new THREE.Mesh( geometry, materialMoon );
    // meshMoon.position.set( radius , 0, 0 );
    meshMoon.scale.set( moonScale, moonScale, moonScale );
    meshMoon.name = 'meshMoon';
    group.add( meshMoon );

    scene.add( group );

    //

    let geometry_x = new THREE.BoxBufferGeometry( 10, 10, 10 );
    let material_x = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    let mesh_x = new THREE.Mesh( geometry_x, material_x );
    mesh_x.scale.set( 0.1, 0.1, 0.1 );
    mesh_x.name = 'mesh_x';
    mesh_x.position.set( radius+2.5 , 0 , 0);
    mesh_x.receiveShadow = true;
    mesh_x.castShadow = true;



    groupEarth2.add(mesh_x);
    groupEarth2.name = 'groupEarth2';
    groupEarth.add( groupEarth2 );
    //groupEarth2.add( splineCamera );

    groupEarth.position.set( 8*radius , 0 , 0);

    scene.add(groupEarth);


    let geometryN = new THREE.BoxBufferGeometry( 10, 10, 10 );
    let materialN = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    let meshN = new THREE.Mesh( geometryN, materialN );
    meshN.scale.set( 0.01, 0.01, 0.01 );
    meshN.name = 'meshN';
    meshN.position.set(0 , radius-1 , 0);
    group2.add( meshN );

    let geometryS = new THREE.BoxBufferGeometry( 10, 10, 10 );
    let materialS = new THREE.MeshBasicMaterial( { color: 0xffffff } );
    let meshS = new THREE.Mesh( geometryS, materialS );
    meshS.scale.set( 0.01, 0.01, 0.01 );
    meshS.name = 'meshS';
    meshS.position.set(0 , -(radius-1) , 0);
    group2.add( meshS );

    group2.position.set( 8*radius , 0 , 0);

    scene.add(group2);


    var i, r = radius, starsGeometry = [ new THREE.BufferGeometry(), new THREE.BufferGeometry() ];

    var vertices1 = [];
    var vertices2 = [];

    var vertex = new THREE.Vector3();

    for ( i = 0; i < 250; i ++ ) {

        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar( r );

        vertices1.push( vertex.x, vertex.y, vertex.z );

    }

    for ( i = 0; i < 1500; i ++ ) {

        vertex.x = Math.random() * 2 - 1;
        vertex.y = Math.random() * 2 - 1;
        vertex.z = Math.random() * 2 - 1;
        vertex.multiplyScalar( r );

        vertices2.push( vertex.x, vertex.y, vertex.z );

    }

    starsGeometry[ 0 ].setAttribute( 'position', new THREE.Float32BufferAttribute( vertices1, 3 ) );
    starsGeometry[ 1 ].setAttribute( 'position', new THREE.Float32BufferAttribute( vertices2, 3 ) );

    var stars;
    var starsMaterials = [
        new THREE.PointsMaterial( { color: 0xffffff, size: 3, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0xffffff, size: 2, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x333333, size: 3, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x3a3a3a, size: 2, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x1a1a1a, size: 3, sizeAttenuation: false } ),
        new THREE.PointsMaterial( { color: 0x1a1a1a, size: 2, sizeAttenuation: false } )
    ];

    for ( i = 10; i < 30; i ++ ) {

        stars = new THREE.Points( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

        stars.rotation.x = Math.random() * 6;
        stars.rotation.y = Math.random() * 6;
        stars.rotation.z = Math.random() * 6;
        stars.scale.setScalar( i * 10 );

        stars.matrixAutoUpdate = false;
        stars.updateMatrix();

        scene.add( stars );

    }

    renderer = new THREE.WebGLRenderer( { antialias: true,alpha:true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    renderer.shadowMap.enabled = true; //辅助线
    renderer.shadowMapSoft = true; //柔和阴影
    renderer.setClearAlpha(0.0);
    document.body.appendChild( renderer.domElement );

    controls = new OrbitControls( camera, renderer.domElement );
    // plane();

    controls.minDistance = 50;
    controls.maxDistance = 1000;

    stats = new Stats();
    document.body.appendChild( stats.dom );

    window.addEventListener( 'resize', onWindowResize, false );

    // postprocessing

    var renderModel = new RenderPass( scene, camera );
    var effectFilm = new FilmPass( 0.35, 0.75, 2048, false );

    composer = new EffectComposer( renderer );

    composer.addPass( renderModel );
    composer.addPass( effectFilm );

  //  updateMaterial();
    LineRadial();


}


function initEarth(name,speed,angle,distance,volume,geometry_s){

    var materialNormalMap = new THREE.MeshPhongMaterial( {

        specular: 0x333333,
        shininess: 15,
        map: textureLoader.load( "./img/earth_atmos_2048.jpg" ),
        specularMap: textureLoader.load( "./img/earth_specular_2048.jpg" ),
        normalMap: textureLoader.load( "./img/earth_normal_2048.jpg" ),
        normalScale: new THREE.Vector2( 0.85, 0.85 )

    } );

    moveStar[name]["speed"] = speed ;

    // planet

    meshPlanet = new THREE.Mesh( geometry_s, materialNormalMap );

    meshPlanet.receiveShadow = true;
    meshPlanet.castShadow = true;

    meshPlanet.name = name;

    /*轨道*/
    let track = new THREE.Mesh( new THREE.RingGeometry (distance-0.2, distance+0.2, 64,1),
        new THREE.MeshBasicMaterial( { color: 0x888888, side: THREE.DoubleSide } )
    );
    track.rotation.x = - Math.PI / 2;
    scene.add(track);

    let star = {
        name,
        speed,
        angle,
        distance,
        volume,
        Mesh : meshPlanet
    }
    groupEarth.add( meshPlanet );
    return star;
}

function initPlanet(name,speed,rotSpeed,angle,color,distance,volume,ringMsg){

    moveStar[name]["speed"] = speed ;
    moveStar[name]["rotSpeed"] = rotSpeed;
     // console.log(moveStar);
    var materialNormalMap = new THREE.MeshPhongMaterial( {
        shininess: 5,
        map: textureLoader.load( color )
    } );

    // planet

    let mesh  = new THREE.Mesh( new THREE.SphereGeometry( volume, 16,16 ), materialNormalMap );

    mesh.position.x = distance;
    mesh.receiveShadow = true;
    mesh.castShadow = true;

    mesh.name = name;

    /*轨道*/
    let track = new THREE.Mesh( new THREE.RingGeometry (distance-0.2, distance+0.2, 64,1),
        new THREE.MeshBasicMaterial( { color: 0x888888, side: THREE.DoubleSide } )
    );
    track.rotation.x = - Math.PI / 2;
    scene.add(track);

    let star = {
        name,
        speed,
        angle,
        distance,
        volume,
        Mesh : mesh
    }
    /*如果有碎星带*/
    if(ringMsg){
        let ring = new THREE.Mesh( new THREE.RingGeometry(ringMsg.innerRedius, ringMsg.outerRadius, 32, 6),
            new THREE.MeshBasicMaterial( { color: ringMsg.color, side: THREE.DoubleSide, opacity:.7, transparent:true } )
        );

        ring.name = `Ring of ${name}`;
        ring.rotation.x = - Math.PI / 3;
        ring.rotation.y = - Math.PI / 4;
        scene.add(ring);
        //   console.log(ring);
        star.ring = ring;
    }


    scene.add(mesh);

    return star;
}

function updateSplineOutline() {
    let point = new THREE.Vector3();
    for ( var k in splines ) {
        var spline = splines[ k ];
        var splineMesh = spline.mesh;
        var position = splineMesh.geometry.attributes.position;
        for (var i = 0; i < SEGMENTS; i ++ ) {
            var t = i / ( SEGMENTS - 1 );
            spline.getPoint( t, point );
            //console.log(point);
            position.setXYZ( i, point.x, point.y, point.z );
        }
        position.needsUpdate = true;
    }
}

function LineRadial() {
    positions = [];

    let cc = new THREE.Vector3();

    positions.push(new THREE.Vector3().copy( Earth.Mesh.position) );

    cc =  new THREE.Vector3().copy(Earth.Mesh.position);
    cc.y  = - radius ;
    positions.push( cc );

    cc = new THREE.Vector3().addVectors(Sun.position, Earth.Mesh.position ).multiplyScalar(0.8);
    cc.y  = -10 ;
    positions.push( cc );

    positions.push(new THREE.Vector3().copy(Sun.position)  );
    cc = new THREE.Vector3().addVectors(Sun.position, Earth.Mesh.position ).multiplyScalar(0.8);
    cc.y  = 10 ;
    positions.push( cc );
    cc =  new THREE.Vector3().copy(Earth.Mesh.position);
    cc.y  = radius ;
    positions.push( cc );
    positions.push(new THREE.Vector3().copy( Earth.Mesh.position) );

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute( 'position', new THREE.BufferAttribute( new Float32Array( SEGMENTS * 3 ), 3 ) );



    let curve = new THREE.CatmullRomCurve3( positions );
    curve.curveType = 'catmullrom';
    curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
        color: 0xff0000,
        opacity: 1
    } ) );
    curve.mesh.castShadow = true;
    splines.uniform = curve;

    curve = new THREE.CatmullRomCurve3( positions );
    curve.curveType = 'centripetal';
    curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
        color: 0x00ff00,
        opacity: 1
    } ) );
    curve.mesh.castShadow = true;
    splines.centripetal = curve;

    curve = new THREE.CatmullRomCurve3( positions );
    curve.curveType = 'chordal';
    curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
        color: 0x0000ff,
        opacity: 1
    } ) );
    curve.mesh.castShadow = true;
    splines.chordal = curve;

    for ( var k in splines ) {
        var spline = splines[ k ];
        scene.add( spline.mesh );
    }
}

function load( new_positions ) {


    positions[ 0 ].copy( new_positions[ 0 ] );
    let cc = new THREE.Vector3().addVectors(new_positions[ 0 ], new_positions[ 1 ] ).multiplyScalar(0.7);
    cc.y  = -20 ;
    positions[ 1 ].copy( cc );
    cc =  new THREE.Vector3().copy(new_positions[ 1 ]);
    cc.y  = -1 * radius ;
    positions[ 2 ].copy( cc );
    positions[ 3].copy( new_positions[ 1 ] );

    cc = new THREE.Vector3().addVectors(new_positions[ 1 ], new_positions[ 2 ] ).multiplyScalar(0.7);
    cc.y  = 20 ;
    positions[ 4 ].copy( cc );
    cc =  new THREE.Vector3().copy(new_positions[ 2 ]);
    cc.y  = radius ;
    positions[ 5 ].copy( cc );
    positions[ 6 ].copy( new_positions[ 2 ] );

    updateSplineOutline();
}

var angleM = 0;
/*行星移动*/
function move(){

    /*行星公转*/
    Stars.forEach(star=>moveEachStar(star));

    /*太阳自转*/
    Sun.rotation.y = ((Sun.rotation.y) >= 2*Math.PI ? 1/moveStar["Sun"].rotSpeed : Sun.rotation.y+ 1/moveStar["Sun"].rotSpeed);

    angleM += PlaneSpeed.val/1000.0;

    let aa = ( 2 * Math.PI * PlanetAB.x + 4*(PlanetAB.x - PlanetAB.y)) ;
    let bb = Math.sqrt( Math.pow( PlanetAB.x , 2 ) - Math.pow( PlanetAB.y , 2 )) ;
    angleM =(angleM  > aa )? (angleM - aa) : angleM ;

    meshMoon.position.set((PlanetAB.x * Math.cos(angleM) - bb), 0, PlanetAB.y* Math.sin(angleM));

    group.rotation.set(PlanetRotation.x, PlanetRotation.y, PlanetRotation.z);

    // changePivot(0,0,0,meshMoon).rotation.set(PlanetRotation.x, PlanetRotation.y, PlanetRotation.z);
}
var EarthSelf = 0 ;
/*每一颗行星的公转与自转*/
function moveEachStar(star){
    // star.angle+=star.speed;
    star.angle+= moveStar[star.name].speed /1000.0;

    star.angle =(star.angle > 2 * Math.PI * star.distance) ? (star.angle - (2 * Math.PI * star.distance)) : star.angle ;

    if (star.name === 'Earth')
    {
        groupEarth.position.set( star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle));

        EarthSelf +=  EarthSpeed.val ;
        EarthSelf =(EarthSelf > 2 * Math.PI * star.distance) ? (EarthSelf- (2 * Math.PI * star.distance)) : EarthSelf ;
        star.Mesh.quaternion.setFromAxisAngle( new THREE.Vector3(0,1,0) , EarthSelf);

        relativeAngle += relativeVelocity.val ;
        relativeAngle =(star.angle > 2 * Math.PI * (star.distance + 2.5 )) ? (star.angle - (2 * Math.PI * (star.distance + 2.5 ))) : relativeAngle ;

        groupEarth2.quaternion.setFromAxisAngle( new THREE.Vector3(0,1,0) , EarthSelf + relativeAngle);

        groupEarth.rotation.set( EarthRotationA.x ,EarthRotationA.y,EarthRotationA.z );

        //groupEarth2.updateMatrixWorld();
        groupEarth.updateMatrixWorld();


        group2.position.set( star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle));
        group2.rotation.set( EarthRotationA.x ,EarthRotationA.y,EarthRotationA.z );
        // group2.quaternion.setFromAxisAngle(EarthRotationA.normalize() , EarthSelf);
        group2.updateMatrixWorld();

    }
    else
    {
        star.Mesh.rotation.y = ((star.Mesh.rotation.y) >= 2*Math.PI ? 0.05/moveStar[star.name].rotSpeed : star.Mesh.rotation.y+0.05/moveStar[star.name].rotSpeed);
        star.Mesh.position.set(star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle));
    }


    /*碎星带*/
    if(star.ring){
        star.ring.position.set(star.distance * Math.sin(star.angle), 0, star.distance * Math.cos(star.angle));
    }
    starM();
}

function starM() {
    if ( ellipse ) {
        group.remove( ellipse );
    }
    ellipse = null;
    //椭圆

    let curve = new THREE.EllipseCurve(
        Math.sqrt( Math.pow( PlanetAB.x , 2 ) - Math.pow( PlanetAB.y , 2 )),0,             // ax, aY
        PlanetAB.x, PlanetAB.y,           // xRadius, yRadius
        0,  2 * Math.PI,  // aStartAngle, aEndAngle
        false,            // aClockwise
        0                 // aRotation
    );

    let points = curve.getPoints( 50 );

    let geometryLine = new THREE.BufferGeometry().setFromPoints( points );

    let materialLine = new THREE.LineBasicMaterial( {
        color : 0xff0000
    } );

    ellipse = new THREE.Line( geometryLine, materialLine );

    ellipse.rotation.set(- Math.PI / 2, Math.PI, 0);

    group.add(ellipse);

}
function onWindowResize() {

    SCREEN_HEIGHT = window.innerHeight;
    SCREEN_WIDTH = window.innerWidth;

    camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.updateProjectionMatrix();

    renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
    composer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

}

function animate() {

    requestAnimationFrame( animate );

    render();
    stats.update();

}
function update() {
    var delta = clock.getDelta();
    let cameraTarget = new THREE.Vector3();
    let cameraTarget2 = new THREE.Vector3();
    if ( params.太阳视角 ) {
        Sun.getWorldPosition( cameraTarget );
        cameraTarget.set(300,150,300);
        // // console.log(cameraTarget.z);
        camera.position.lerp( cameraTarget, delta * 5 );

        camera.lookAt( cameraTarget2 );


    }else
    if (  params.卫星视角 ) {
        groupEarth2.getObjectByName('mesh_x').getWorldPosition( cameraTarget );
        groupEarth.getObjectByName('Earth').getWorldPosition( cameraTarget2 );

        splineCamera.position.set(cameraTarget.x *2 - cameraTarget2.x,cameraTarget.y *2 - cameraTarget2.y,cameraTarget.z *2 - cameraTarget2.z);

        splineCamera.lookAt( cameraTarget2 );

    }

}

function render() {
    move();

    let dd1 =new THREE.Vector3();
    let dd2 =new THREE.Vector3();

    group2.getObjectByName('meshS').getWorldPosition(dd1);

    group2.getObjectByName('meshN').getWorldPosition(dd2);
    load( [ dd1,Sun.position , dd2 ]);
    splines.uniform.mesh.visible = params.radial1;
    splines.centripetal.mesh.visible = params.radial2;
    splines.chordal.mesh.visible = params.radial3;

    update();

    cameraHelper.update();

    renderer.render( scene, params.卫星视角 === true ?splineCamera :camera );

}

export {EarthRotationA, EarthSpeed, PlanetAB, PlaneSpeed, PlanetRotation, params, relativeVelocity, moveStar}
