import {
    Scene,
    PerspectiveCamera,
    BufferGeometry,
    BufferAttribute,
    ShaderMaterial,
    Color,
    Points,
    WebGLRenderer,
} from 'three';

const SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;
let mouseX = -windowHalfX, mouseY = 0 - windowHalfY;

const scene = new Scene();
const camera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
camera.position.z = 1000;

const numParticles = AMOUNTX * AMOUNTY;
const positions = new Float32Array(numParticles * 3);
const scales = new Float32Array(numParticles);

let i = 0, j = 0;

for (let ix = 0; ix < AMOUNTX; ix++) {
    for (let iy = 0; iy < AMOUNTY; iy++) {
        positions[i] = ix * SEPARATION - ((AMOUNTX * SEPARATION) / 2); // x
        positions[i + 1] = 0; // y
        positions[i + 2] = iy * SEPARATION - ((AMOUNTY * SEPARATION) / 2); // z

        scales[j] = 1;

        i += 3;
        j++;
    }
}

const geometry = new BufferGeometry();
geometry.setAttribute('position', new BufferAttribute(positions, 3));
geometry.setAttribute('scale', new BufferAttribute(scales, 1));

const material = new ShaderMaterial({
    uniforms: {
        color: {value: new Color(0x484848)},
    },
    vertexShader: `
attribute float scale;

void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1 );
    gl_PointSize = scale * ( 50.0 / - mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
}
    `,
    fragmentShader: `
    uniform vec3 color;

void main() {
    if ( length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.475 ) discard;
    gl_FragColor = vec4( color, 1 );
}
    `,
});

const particles = new Points(geometry, material);
let count = 0;
scene.add(particles);

const renderer = new WebGLRenderer({
    antialias: true,
    canvas: document.getElementById('background__canvas')
});
renderer.setClearColor(0x0e0e0e, 1);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener('resize', () => {
    windowHalfX = window.innerWidth / 2;
    windowHalfY = window.innerHeight / 2;

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('pointermove', (event) => {
    if (event.isPrimary === false) return;

    // mouseX = event.clientX - windowHalfX;
    // mouseY = event.clientY - windowHalfY;

    mouseX = event.clientX * 0.3 - windowHalfX;
    mouseY = 0 - windowHalfY;
});

renderer.r

function animate() {
    requestAnimationFrame(animate);

    camera.position.x += (mouseX - camera.position.x) * .05;
    camera.position.y += (-mouseY - camera.position.y) * .05;
    camera.lookAt(scene.position);

    const positions = particles.geometry.attributes.position.array;
    const scales = particles.geometry.attributes.scale.array;

    let i = 0, j = 0;

    for (let ix = 0; ix < AMOUNTX; ix++) {

        for (let iy = 0; iy < AMOUNTY; iy++) {

            positions[i + 1] = (Math.sin((ix + count) * 0.3) * 50) +
                (Math.sin((iy + count) * 0.5) * 50);

            scales[j] = (Math.sin((ix + count) * 0.3) + 1) * 20 +
                (Math.sin((iy + count) * 0.5) + 1) * 20;

            i += 3;
            j++;

        }

    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.scale.needsUpdate = true;

    renderer.render(scene, camera);

    count += 0.1;
}

animate();