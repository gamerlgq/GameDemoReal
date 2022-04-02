/*
 * @Author: liuguoqing
 * @Date: 2022-03-04 23:09:26
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-05 15:11:03
 * @Description: file content 
 */
import { Node, UIOpacity, v2, v3, Vec2, Vec3 } from "cc"
import { RedPoint } from "../../app/views/common/RedPoint"
import Logger from "./Logger"

export function setNodeVisible(node: Node, isVisible: boolean) {
    // let opComp = node.addComponent(UIOpacity)
    // opComp.opacity = isVisible ? 255:0
    node.active = isVisible
}

export function posAdd(node: Node, offPos: Vec2, minX?: number, maxX?: number, minY?: number, maxY?: number) {
    node.position = node.position.add(v3(offPos.x, offPos.y))
    let x, y
    if (minX && node.position.x < minX) {
        x = minX
    }
    if (maxX && node.position.x > maxX) {
        x = maxX
    }

    if (minY && node.position.y < minY) {
        y = minY
    }

    if (maxY && node.position.y > maxY) {
        y = maxY
    }

    node.position = v3(x || node.position.x, y || node.position.y)
}

/**
 * 递归找到node节点的红点节点，并显示/隐藏
 * @param node 
 * @param isShow 
 */
export function showRedPoint(node: Node, isShow: boolean) {
    let comp = node.getComponentInChildren(RedPoint)
    if (!comp) {
        Logger.e("找不到红点节点")
        return
    }
    comp.node.active = isShow
}

export function v2ToV3(v2: Vec2) {
    return v3(v2.x, v2.y, 0)
}

export function v3ToV2(v3: Vec3) {
    return v2(v3.x, v3.y)
}

/**
 * 把字符串序列化UTF8字节流
 * @param text 
 * @returns 
 */
export function encodeUtf8(text) {
    const code = encodeURIComponent(text);
    const bytes = [];
    for (var i = 0; i < code.length; i++) {
        const c = code.charAt(i);
        if (c === '%') {
            const hex = code.charAt(i + 1) + code.charAt(i + 2);
            const hexVal = parseInt(hex, 16);
            bytes.push(hexVal);
            i += 2;
        } else bytes.push(c.charCodeAt(0));
    }
    return bytes;
}

//反序列化UFT8字节 =>字符串
export function decodeUtf8(bytes) {
    var encoded = "";
    for (var i = 0; i < bytes.length; i++) {
        encoded += '%' + bytes[i].toString(16);
    }
    return decodeURIComponent(encoded);
}

/**
 * 字符串转为ArrayBuffer对象
 * @param str 字符串
 * @returns 
 */
export function str2ab(str:string) {
    var buf = new ArrayBuffer(str.length * 2); // 每个字符占用2个字节
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

