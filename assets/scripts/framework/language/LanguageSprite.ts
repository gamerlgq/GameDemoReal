// import { Component, Size, Sprite, SpriteFrame, UITransform, _decorator } from "cc";
// import { ResourcesLoader } from "../data/ResourcesLoader";
// import { ComponentBase } from "../ui/ComponentBase";
// import { LanguageData } from "./LanguageData";

// const { ccclass, property, menu } = _decorator;

// @ccclass("LanguageSprite")
// @menu('ui/language/LanguageSprite')
// export class LanguageSprite extends ComponentBase {
//     @property({
//         tooltip: "资源路径（language/texture/内的相对路径）"
//     })
//     public path: string = "";

//     @property({
//         tooltip: "是否设置为图片原始资源大小"
//     })
//     private isRawSize: boolean = true;

//     start() {
//         super.start()
//         this.language = LanguageData.current;
//     }

//     set language(lang: string) {
//         this.updateSprite(lang);
//     }

//     onDestroy() {
//         super.onDestroy()

//         let spcomp: Sprite = this.getComponent(Sprite)!;
//         spcomp.spriteFrame?.decRef(false)
//         spcomp.spriteFrame=null
//     }

//     updateSprite(lang: string) {
//         let spcomp: Sprite = this.getComponent(Sprite)!;
//         // 获取语言标记
//         let path = `language/texture/${lang}/${this.path}/spriteFrame`;

//         //动态加载
//         ResourcesLoader.load(path, (spr:SpriteFrame)=>{
//             //减去旧图的引用
//             spcomp.spriteFrame.decRef(false)
//             spr.addRef()
//             spcomp.spriteFrame = spr
//         }, SpriteFrame)

      

//         /** 修改节点为原始图片资源大小 */
//         if (this.isRawSize) {
//             //@ts-ignore
//             let rawSize = res._originalSize as Size;
//             spcomp.getComponent(UITransform)?.setContentSize(rawSize);
//         }
//     }
// }