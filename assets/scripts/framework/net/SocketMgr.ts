import { log, sys } from "cc";
import { Proto } from "../../app/define/proto_mate";
import { Singleton } from "../components/Singleton";
import { gameMgr } from "../core/GameMgr";
import { Message } from "../listener/Message";
import { decodeUtf8, encodeUtf8, str2ab } from "../utils/functions";
import Logger from "../utils/Logger";
import { netLoadingMgr } from "./NetLoadingMgr";
import { netStateMgr } from "./NetStateMgr";

/*
 * @Author: liuguoqing
 * @Date: 2022-03-02 17:01:02
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-19 13:16:31
 * @Description: file content
 */

export type SocketCallback = {
    (event: any): void
}

const BUFF_SIZE = 1024 * 2;
class SocketMgr extends Singleton {
    private _ws: WebSocket;
    private _StateChangeCallback: SocketCallback;
    private _ip: string;
    private _port: string;

    private _sendBuffer: ArrayBuffer = new ArrayBuffer(BUFF_SIZE) //发送缓冲区

    private constructor() {
        super();
        // net state change callback
        let socketParams = {
            StateChangeCallback: this._listenOnSocketState.bind(this),
        };
        this.registerCallbackHandler(socketParams);

    }

    connect(ip: string, port: string, openFunc: SocketCallback, errorFunc: SocketCallback) {
        this._ip = ip;
        this._port = port;
        try {
            let url = `ws://${ip}:${port}`;
            let ws = new WebSocket(url);
            this._ws = ws;
            ws.onopen = (event) => {
                this._onopen(event);
                openFunc(event);
            };
            ws.onmessage = (event) => {
                this._onmessage(event);
            };
            ws.onerror = (event) => {
                this._onerror(event);
                errorFunc(event);
            };
            ws.onclose = (event) => {
                this._onclose(event);
                errorFunc(event);
            };
        } catch (error) {
            log("connect error: ", error);
        }
    }

    reConnect() {
        if (this._ip && this._port) {
            this.connect(
                this._ip,
                this._port,
                (event) => { },
                (event) => { log(event); }
            );
        }
    }

    close() {
        if (this._ws) {
            this._ws.close(4888);
            this._ws = null;
        }
    }

    // send(msgId: number, data: Object = {}) {
    //     data["proto"] = msgId;
    //     data = JSON.stringify(data);
    //     log("[WS] Send:", msgId, data);
    //     this._ws.send(<string>data);

    //     netLoadingMgr.addMsgLoading(msgId)
    // }

    send(msgId: number, ...sendParams: any[]) {
        let msgParams = Proto.send[msgId]
        if (!msgParams) {
            Logger.e("没有此协议：" + msgId)
            return
        }

        Logger.net("====>msg:" + msgId + " [" + sendParams + "]")

        //发送字节流
        let length = this._writeData(msgParams, sendParams)
        if (length == 0) {
            return
        }

        let newBuffer = this._sendBuffer.slice(0, length)
        this._ws.send(newBuffer);
    }

    private _writeData(msgParams: Array<any>, ...sendParams: any[]) {
        let length = 0;
        let dataView = new DataView(this._sendBuffer)
        for (let index = 0; index < msgParams.length; index++) {
            const element = msgParams[index];
            let typeStr = element.type
            let value = sendParams[index]
            if (typeStr == "uint8" || typeStr == "int8") {
                dataView.setUint8(length, value)
                length++
            }
            else if (typeStr == "uint16" || typeStr == "int16") {
                dataView.setUint16(length, value, sys.isLittleEndian)
                length += 2
            }
            else if (typeStr == "uint32" || typeStr == "int32") {
                dataView.setUint32(length, value, sys.isLittleEndian)
                length += 4
            }
            else if (typeStr == "string") {
                let byteArray = encodeUtf8(value)
                //写入长度
                dataView.setUint32(length, byteArray.length, sys.isLittleEndian)
                length += 4

                //写入字节
                byteArray.forEach((element, i) => {
                    dataView.setUint8(length, element)
                    length++
                });
            }
            else if (typeStr == "array") {
                this._writeData(element.fields, value)
            }
            else {
                Logger.e("未知发送类型: " + typeStr)
                return 0
            }
        }

        return length
    }

    private _parseData(msgParams: Array<any>, arrayBuffer: ArrayBuffer, dataView: DataView, length: number, dataRet?) {
        let dataParse = dataRet || {}

        for (let index = 0; index < msgParams.length; index++) {
            const element = msgParams[index];
            let name = element.name
            let typeStr = element.type
            if (typeStr == "uint8" || typeStr == "int8") {
                let num = dataView.getUint8(length)
                dataParse[name] = num
                length++
            }

            else if (typeStr == "int8") {
                let num = dataView.getInt8(length)
                dataParse[name] = num
                length++
            }

            else if (typeStr == "uint16") {
                let num = dataView.getUint16(length, sys.isLittleEndian)
                dataParse[name] = num
                length += 2
            }

            else if (typeStr == "int16") {
                let num = dataView.getInt16(length, sys.isLittleEndian)
                dataParse[name] = num
                length += 2
            }

            else if (typeStr == "uint32") {
                let num = dataView.getUint32(length, sys.isLittleEndian)
                dataParse[name] = num
                length += 4
            }

            else if (typeStr == "int32") {
                let num = dataView.getInt32(length, sys.isLittleEndian)
                dataParse[name] = num
                length += 4
            }

            else if (typeStr == "string") {
                let strLen = dataView.getUint32(length)
                length += 4

                let arrayBufferTemp = arrayBuffer.slice(length, strLen)
                let str = decodeUtf8(arrayBufferTemp)
                dataParse[name] = str
            }
            else if (typeStr == "array") {
                dataParse = this._parseData(element.fields, arrayBuffer, dataView, length, dataParse)
            }
            else {
                Logger.e("未知发送类型: " + typeStr)
                return 0
            }
        }
        return dataParse
    }

    sendInnerMsg(msgId: number, data: Object = {}) {
        let msg = new Message(msgId, data);
        log("[WS] Send Inner:", msgId, data);
        gameMgr.addInnerMessage(msg);
    }

    registerCallbackHandler(params) {
        this._StateChangeCallback = params.StateChangeCallback;
    }

    /**
     * 监听Socket 状态变化
     */
    private _listenOnSocketState(event) {
        netStateMgr.onSocketChange(event);
    }

    private _onopen(event) {
        log("Send Text WS was opened.");
        log(event);
        if (this._StateChangeCallback) {
            this._StateChangeCallback(event);
        }
    }

    // 接收消息
    private _onmessage(event: any) {
        let data = event.data;
        if (data == null) {
            log(event);
            return;
        }
        // let jsonData = JSON.parse(data);
        // log("[WS] Rev:", jsonData.proto, data);

        let length = 0
        let arrayBuffer = str2ab(event.data)
        let dataView = new DataView(arrayBuffer)
        let msgId = dataView.getUint32(0, sys.isLittleEndian)
        length += 4

        let msgParams = Proto.recv[msgId]
        if (!msgParams) {
            Logger.e("Net <====: 没有此id的协议[" + msgId + "]")
            return
        }

        let dataParse = this._parseData(msgParams, arrayBuffer, dataView, length)
        let msg = new Message(msgId, dataParse);
        gameMgr.addNetMessage(msg);

        netLoadingMgr.removeMsgLoading(msg.msgId)

        Logger.net("<==== msgId:" + msgId + '['+dataParse+']')
    }

    private _onerror(event) {
        log("Send Text fired an error");
        if (this._StateChangeCallback) {
            this._StateChangeCallback(event);
        }
    }

    private _onclose(event) {
        log(event);
        log("WebSocket instance closed.");
        if (this._StateChangeCallback) {
            this._StateChangeCallback(event);
        }
    }

    clear() {
        socketMgr = null;
    }
}

// ()();
export let socketMgr = (() => {
    return SocketMgr.getInstance<SocketMgr>();
})();