import { WebGL2DCanvas } from "./webgl2d";
import { MessageData, DataType } from "../generated/message_pb"

let canvas = new WebGL2DCanvas("#glCanvas");

function field(canvas: WebGL2DCanvas) {
    canvas.set_xrange(-10, 10);
    canvas.set_yrange(-10, 10);
    // canvas.rectangle(
    //     [
    //         [0, 0],
    //         [12000, 0],
    //         [12000, 12000],
    //         [0, 12000],
    //     ],
    //     [0.1, 0.1, 0.1, 1]
    // );
}

function main() {
    canvas.clear();
    // field(canvas);
    // canvas.rectangle([[1, 0], [0, 1], [-1, 0], [0, -1]], [0, 0, 1, 1])
    canvas.rectangle([[1, 0], [0, 1], [-1, 0], [0, 0.2]], [0, 0, 1, 1])
    // canvas.set_xrange(-2, 1)
    // canvas.polygon([[1, 0], [0, 1], [-1, 0], [0, -0.3], [0.8, -0.3]], [0, 0, 1, 1]);
    // canvas.rectangle([[0, 0.0], [1.0, 0], [-0.8, 0.0], [0, -0.8]], [0, 1, 0, 0.2]);
    // canvas.rectangle([[0, 0.0], [1.0, 0], [-0.8, 0.0], [0, -0.8]], [0, 1, 0, 0.2]);
    // loop();
}

window.onload = main;


async function comunicate() {
    const socket = new WebSocket('ws://localhost:3333')!;
    socket.addEventListener("message", async ({ data }) => {
        let message = MessageData.deserializeBinary(await data.arrayBuffer())
        if (message.getType() == DataType.LRFDATA) {
            console.log(message.getYList());
            console.log(message.getXList());
            let x = message.getXList()
            let y = message.getYList()
            let pointdata: number[][] = []
            for (let i = 0, len = x.length; i < len; i++) {
                pointdata.push([x[i], y[i]])
            }
            console.log(pointdata)
            canvas.clear()
            canvas.set_xrange(-10, 10);
            canvas.set_yrange(-10, 10);
            canvas.point(pointdata, [1, 1, 1, 1])
            canvas.rectangle([[0, 0.0], [1.0, 0], [-0.8, 0.0], [0, -0.8]], [0, 1, 0, 0.2]);
        }
    })

    setTimeout(() => {
        socket.send("Hello");
        socket.onmessage ? ((msg: any) => {
            console.log(msg);
        }) : undefined;
    }, 1000)
}

comunicate()
