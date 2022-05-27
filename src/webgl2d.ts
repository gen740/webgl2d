import { vShader, fShader } from "./glsl";

export class WebGL2DCanvas {
    private canvas: HTMLCanvasElement;
    private gl: WebGLRenderingContext;
    private position: number;
    private color: WebGLUniformLocation;
    private point_size: WebGLUniformLocation;
    private pmatrix: WebGLUniformLocation;

    private xscale: number = 1;
    private xoffset: number = 0;
    private yscale: number = 1;
    private yoffset: number = 0;

    constructor(elementid: string) {
        this.canvas = <HTMLCanvasElement>document.querySelector(elementid);
        this.gl = this.canvas.getContext("webgl2")!;
        if (this.gl === null) {
            alert("WebGL を初期化できません");
        }

        // shader のプログラムを定義
        var shaderProgram = this.gl.createProgram()!;

        let vert_shader = this.gl.createShader(this.gl.VERTEX_SHADER)!;
        this.gl.shaderSource(vert_shader, vShader);
        this.gl.compileShader(vert_shader);
        this.gl.attachShader(shaderProgram, vert_shader);

        var fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER)!;
        this.gl.shaderSource(fragShader, fShader);
        this.gl.compileShader(fragShader);
        this.gl.attachShader(shaderProgram, fragShader);

        this.gl.linkProgram(shaderProgram);
        this.gl.useProgram(shaderProgram);

        // color の alpha ブレンドを有効にする
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

        // cull は行わない
        // this.gl.enable(this.gl.CULL_FACE);

        this.position = this.gl.getAttribLocation(shaderProgram, "position");
        this.color = this.gl.getUniformLocation(shaderProgram, "color")!;
        this.point_size = this.gl.getUniformLocation(shaderProgram, "point_size")!;
        this.pmatrix = this.gl.getUniformLocation(shaderProgram, "pmatrix")!;

        this.gl.uniformMatrix4fv(this.pmatrix, false, [
            this.xscale, 0, 0, 0,
            0, this.yscale, 0, 0,
            0, 0, 1, 0,
            this.xoffset, this.yoffset, 0, 1,
        ]);
    }

    // canvas を特定の色でクリアする
    clear(color: number[] = [0.0, 0.0, 0.0, 1.0]) {
        // canvas の初期化
        this.gl.clearColor(color[0], color[1], color[2], color[3]);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    // x/y range を決めてそれに合わせてx,yの比率と offset を決める
    set_xrange(min: number, max: number) {
        this.xscale = 2 / (max - min);
        this.xoffset = (-this.xscale * (max + min)) / 2;
        this.gl.uniformMatrix4fv(this.pmatrix, false, [
            this.xscale, 0, 0, 0,
            0, this.yscale, 0, 0,
            0, 0, 1, 0,
            this.xoffset, this.yoffset, 0, 1,
        ]);
    }
    set_yrange(min: number, max: number) {
        this.yscale = 2 / (max - min);
        this.yoffset = (-this.yscale * (max + min)) / 2;
        this.gl.uniformMatrix4fv(this.pmatrix, false, [
            this.xscale, 0, 0, 0,
            0, this.yscale, 0, 0,
            0, 0, 1, 0,
            this.xoffset, this.yoffset, 0, 1,
        ]);
    }

    // 以下は基本的な図形をプロットするプログラム
    point(pos: number[][], color: number[], point_size: number = 5.0) {
        this.attributePosition(pos);
        this.gl.uniform4fv(this.color, color);
        this.gl.uniform1f(this.point_size, point_size);
        this.gl.drawArrays(this.gl.POINTS, 0, pos.length);
    }

    glLine(pos: number[][], color: number[]) {
        this.attributePosition(pos);
        this.gl.uniform4fv(this.color, color);
        this.gl.drawArrays(this.gl.LINE_STRIP, 0, pos.length);
    }

    line(pos: number[][], color: number[], width: number) {
        for (let i = 0, len = pos.length - 1; i < len; i++) {
            let cx = pos[i + 1][0] - pos[i][0]
            let cy = pos[i + 1][1] - pos[i][1]
            let r = Math.hypot(cx, cy)
            console.log(cx, cy, r);
            this.rectangle([
                [pos[i + 1][0] - width * cy / (2 * r), pos[i + 1][1] + width * cx / (2 * r)],
                [pos[i][0] - width * cy / (2 * r), pos[i][1] + width * cx / (2 * r)],
                [pos[i][0] + width * cy / (2 * r), pos[i][1] - width * cx / (2 * r)],
                [pos[i + 1][0] + width * cy / (2 * r), pos[i + 1][1] - width * cx / (2 * r)]
            ], color)
        }
    }

    triangle(pos: number[][], color: number[]) {
        this.attributePosition(pos);
        this.gl.uniform4fv(this.color, color);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 3);
    }

    rectangle(pos: number[][], color: number[]) {
        this.attributePosition(pos);
        this.gl.uniform4fv(this.color, color);
        this.gl.bindBuffer(
            this.gl.ELEMENT_ARRAY_BUFFER,
            this.createIBO([0, 1, 2, 2, 3, 0])
        );
        this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0);
    }

    polygon(pos: number[][], color: number[], index: number[] | null = null) {
        this.attributePosition(pos);
        this.gl.uniform4fv(this.color, color);
        let idx: number[] = [];
        if (index == null) {
            for (let i = 1, len = pos.length - 1; i < len; i++) {
                idx.push(0);
                idx.push(i);
                idx.push(i + 1);
            }
        } else {
            idx = index;
        }
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.createIBO(idx));
        this.gl.drawElements(
            this.gl.TRIANGLES,
            idx.length,
            this.gl.UNSIGNED_SHORT,
            0
        );
    }

    // vertex Buffer Object を作成する
    private createVBO(data: number[]): WebGLBuffer {
        let vbo = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vbo);
        this.gl.bufferData(
            this.gl.ARRAY_BUFFER,
            new Float32Array(data),
            this.gl.STATIC_DRAW
        );
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        return vbo;
    }

    // Index Buffer Object を作成する
    private createIBO(data: number[]): WebGLBuffer {
        var ibo = this.gl.createBuffer()!;
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, ibo);
        this.gl.bufferData(
            this.gl.ELEMENT_ARRAY_BUFFER,
            new Int16Array(data),
            this.gl.STATIC_DRAW
        );
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
        return ibo;
    }

    // Buffer に位置をバインドする
    private attributePosition(position: number[][]) {
        let pos: number[] = [];
        for (let i of position) {
            pos.push(i[0]);
            pos.push(i[1]);
        }
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.createVBO(pos));
        this.gl.vertexAttribPointer(this.position, 2, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(this.position);
    }
}
