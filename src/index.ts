import { WebGL2DCanvas } from "./webgl2d";
import { MessageData, DataType, DataRequest } from "../generated/message_pb"

function field(canvas: WebGL2DCanvas) {
}

async function main() {
    // glcanvas の初期化
    let canvas = new WebGL2DCanvas("#glCanvas");
    canvas.clear();
    canvas.rectangle([[1, 0], [0, 1], [-1, 0], [0, 0.2]], [0, 0, 1, 1])

    const socket = new WebSocket('ws://localhost:3333')!;
    socket.addEventListener("message", async ({ data }) => {
        let message = MessageData.deserializeBinary(await data.arrayBuffer())
        if (message.getType() == DataType.LRFDATA) {
            let x = message.getXList()
            let y = message.getYList()
            let pointdata: number[][] = []
            for (let i = 0, len = x.length; i < len; i++) {
                pointdata.push([x[i], y[i]])
            }
            canvas.clear([0.0, 0.0, 0.0, 1.0])
            field(canvas);
            canvas.point(pointdata, [1, 0, 0, 1], 4)
        }
    })
    function loop() {
        let request = new DataRequest();
        request.setStatus(true)
        request.setType(DataType.LRFDATA)
        // console.log(request.serializeBinary().buffer);
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(request.serializeBinary().buffer);
        }
        setTimeout(() => {
            loop();
        }, 25)
    }

    loop()
}

setTimeout(main, 300)
