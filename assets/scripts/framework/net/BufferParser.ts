import { Pool, sys } from "cc";
import { Proto } from "../../app/define/proto_mate";
import { decodeUtf8, encodeUtf8, str2ab } from "../utils/functions";
import Logger from "../utils/Logger";

const BUFF_SIZE = 1024 * 2;
const MSG_ID_SIZE = 2
const STR_LEN_SIZE = 2
const BYTE_TYPE_SIZE = 4

export default class BufferParser {
    private _dataView:DataView
    private _length = 0;
    public static pool:Pool<ArrayBuffer> //发送缓冲区对象池(突然觉得不需要对象池，send都是同步的..)
    
    private _msgId;
    public get msgId() {
        return this._msgId;
    }
    public set msgId(value) {
        this._msgId = value;
    }

    constructor() {
        if (!BufferParser.pool) {
            BufferParser.pool = new Pool<ArrayBuffer>(()=>{
                let arrayBuffer: ArrayBuffer = new ArrayBuffer(BUFF_SIZE) //发送缓冲区
                return arrayBuffer
            },1)
        }
    }

    /**
     * 产出一个发送buffer
     * @param msgId 
     * @param sendParams 发送参数
     * @returns 
     */
    generateMsgArrayBuffer(msgId:number, ...sendParams: any[]):ArrayBuffer {
        let ab = BufferParser.pool.alloc()
        this._dataView = new DataView(ab)

        let msgParams = Proto.send[msgId]
        if (!msgParams) {
            Logger.e("没有此协议：" + msgId)
            return 
        }

        //写入id
        this._dataView.setUint16(0, msgId)

        //写入数据
        this._writeData(msgParams, sendParams)

        if (this._length == 0) {
            return
        }

        if (this._length > BUFF_SIZE) {
            Logger.e("NET: 发送长度超出buffer缓冲区")
            return
        }

        let ret = ab.slice(0, this._length)
        BufferParser.pool.free(ab)
        return ret
    }


    private _writeData(msgParams: Array<any>, ...sendParams: any[]) {
        for (let index = 0; index < msgParams.length; index++) {
            const element = msgParams[index];
            let typeStr = element.type
            let value = sendParams[index]
            if (typeStr == "uint8" || typeStr == "int8") {
                this._dataView.setUint8(this._length, value)
                this._length++
            }
            else if (typeStr == "uint16" || typeStr == "int16") {
                this._dataView.setUint16(this._length, value, sys.isLittleEndian)
                this._length += 2
            }
            else if (typeStr == "uint32" || typeStr == "int32") {
                this._dataView.setUint32(this._length, value, sys.isLittleEndian)
                this._length += 4
            }
            else if (typeStr == "string") {
                let byteArray = encodeUtf8(value)
                //写入长度
                this._dataView.setUint16(this._length, byteArray.length, sys.isLittleEndian)
                this._length += STR_LEN_SIZE

                //写入字节
                byteArray.forEach((element, i) => {
                    this._dataView.setUint8(this._length, element)
                    this._length++
                });
            }
            else if (typeStr == "array") {
                this._writeData(element.fields, value)
            }
            else {
                Logger.e("未知发送类型: " + typeStr)
            }
        }
    }

    generateParseData(arrayBuffer) {
        this._dataView = new DataView(arrayBuffer)

        let msgId = this._dataView.getUint16(0, sys.isLittleEndian)
        this.msgId = msgId
        this._length += MSG_ID_SIZE

        let msgParams = Proto.recv[msgId]
        if (!msgParams) {
            Logger.e("Net <====: 没有此id的协议[" + msgId + "]")
            return
        }

        let dataParse = this._parseData(msgParams, arrayBuffer)
        return dataParse
    }

    private _parseData(msgParams: Array<any>, arrayBuffer: ArrayBuffer, dataRet?) {
        let dataParse = dataRet || {}

        for (let index = 0; index < msgParams.length; index++) {
            const element = msgParams[index];
            let name = element.name
            let typeStr = element.type
            if (typeStr == "uint8" || typeStr == "int8") {
                let num = this._dataView.getUint8(this._length)
                dataParse[name] = num
                this._length++
            }

            else if (typeStr == "int8") {
                let num = this._dataView.getInt8(this._length)
                dataParse[name] = num
                this._length++
            }

            else if (typeStr == "uint16") {
                let num = this._dataView.getUint16(this._length, sys.isLittleEndian)
                dataParse[name] = num
                this._length += 2
            }

            else if (typeStr == "int16") {
                let num = this._dataView.getInt16(this._length, sys.isLittleEndian)
                dataParse[name] = num
                this._length += 2
            }

            else if (typeStr == "uint32") {
                let num = this._dataView.getUint32(this._length, sys.isLittleEndian)
                dataParse[name] = num
                this._length += 4
            }

            else if (typeStr == "int32") {
                let num = this._dataView.getInt32(this._length, sys.isLittleEndian)
                dataParse[name] = num
                this._length += 4
            }

            else if (typeStr == "string") {
                let strLen = this._dataView.getUint16(this._length)
                this._length += STR_LEN_SIZE

                let arrayBufferTemp = arrayBuffer.slice(this._length, strLen)
                let str = decodeUtf8(arrayBufferTemp)
                dataParse[name] = str

                this._length += strLen
            }
            else if (typeStr == "array") {
                dataParse = this._parseData(element.fields, arrayBuffer, dataParse)
            }
            else {
                Logger.e("未知发送类型: " + typeStr)
                return 0
            }
        }
        return dataParse
    }
}