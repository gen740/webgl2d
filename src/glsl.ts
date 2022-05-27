export const vShader = `
attribute vec2 position;
uniform vec4 color;
uniform float point_size;
uniform mat4 pmatrix;
varying vec4 vColor;

void main(void) {
    gl_Position = pmatrix * vec4(position, 0.0, 1.0);
    gl_PointSize =  point_size;
    // glLineWidth = 10.0;
    vColor = color;
}
`;

export const fShader = `
precision mediump float;
varying vec4 vColor;

void main() {
    gl_FragColor = vColor;
}
`;
