import { error, log, sys, warn } from "cc";
import { Singleton } from "../components/Singleton";

export default class Logger {
    private static _lv: number = 4;
    public static get lv(): number {
        return this._lv;
    }
    public static set lv(value: number) {
        this._lv = value;
    }

    static i(message:any, ...op:any[]) {
        if (this.lv >= 3) {
            if (sys.isNative) {
                if (typeof(message) === "object") {
                    let s = JSON.stringify(message)
                    log(s, op)
                }
                else{
                    log(message,op)
                }
            }
            else{
                log(message, op)
            }
        }
    }

    static e(message:any) {
        if (this.lv >= 1) {
            error(message)
        }
    }

    static w(message:any) {
        if (this.lv >= 2) {
            warn(message)
        }
    }

    static net(message:any) {
        if (this.lv >=4) {
            log("NET: ",message)
        }
    }
}