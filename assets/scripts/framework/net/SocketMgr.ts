import { log, sys } from "cc";
import { Proto } from "../../app/define/proto_mate";
import { Singleton } from "../components/Singleton";
import { gameMgr } from "../core/GameMgr";
import { Message } from "../listener/Message";
import { decodeUtf8, encodeUtf8, str2ab } from "../utils/functions";
import Logger from "../utils/Logger";
import BufferParser from "./BufferParser";
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
            ws.binaryType = "arraybuffer" //字节流
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
       
        let bufferParser = new BufferParser
        let arrbuffSend = bufferParser.generateMsgArrayBuffer(msgId, sendParams)
        if (!arrbuffSend) {
            return
        }

        this._ws.send(arrbuffSend);
        Logger.net("====>msg:" + msgId + " [" + sendParams + "]")
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

        let bufferParser = new BufferParser()
        let dataParse = bufferParser.generateParseData(data)
        let msg = new Message(bufferParser.msgId, dataParse);
        gameMgr.addNetMessage(msg);

        netLoadingMgr.removeMsgLoading(msg.msgId)
        Logger.net("<==== msgId:" + bufferParser.msgId + '['+dataParse+']')
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