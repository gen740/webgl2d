// package: Visualizer
// file: message.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class MessageData extends jspb.Message { 
    getType(): DataType;
    setType(value: DataType): MessageData;
    clearXList(): void;
    getXList(): Array<number>;
    setXList(value: Array<number>): MessageData;
    addX(value: number, index?: number): number;
    clearYList(): void;
    getYList(): Array<number>;
    setYList(value: Array<number>): MessageData;
    addY(value: number, index?: number): number;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): MessageData.AsObject;
    static toObject(includeInstance: boolean, msg: MessageData): MessageData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: MessageData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): MessageData;
    static deserializeBinaryFromReader(message: MessageData, reader: jspb.BinaryReader): MessageData;
}

export namespace MessageData {
    export type AsObject = {
        type: DataType,
        xList: Array<number>,
        yList: Array<number>,
    }
}

export enum DataType {
    UNKNOWN = 0,
    LRFDATA = 1,
}
