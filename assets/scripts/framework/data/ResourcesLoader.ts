import { Asset, assetManager, AssetManager, error, game, log, resources, __private } from "cc";
import { ViewInfoType } from "../../app/define/ConfigType";
import { sceneMgr } from "../core/SceneMgr";
import { netLoadingMgr } from "../net/NetLoadingMgr";

/*
 * @Author: liuguoqing
 * @Date: 2022-03-03 09:14:09
 * @LastEditors: liuguoqing
 * @LastEditTime: 2022-03-05 12:58:44
 * @Description: file content
 */

type UnionAsset = Asset | AssetManager.RequestItem[]

type FileCallback<T extends UnionAsset> = {
    (data: T, err?): void
}

export class ResourcesLoader {

    private static _ResCounter: Map<string, Asset> = new Map()

    // 内存限制
    private static _CacheMaxMemory = 1024;

    // 下载资源
    static preload(path: string | string[], doneFunc: FileCallback<UnionAsset>) {
        resources.preload(path, (err, dataAsset) => {
            if (err) {
                error("ResourcesLoader preload error:", err.message);
            }
            doneFunc(dataAsset);
        });
    }

    /**
     * @description resources需要动态加载的资源(使用此方法，需要手动管理资源释放)
     */
    static load(path: string, doneFunc: FileCallback<UnionAsset>, type?: typeof Asset) {
        if (type == undefined) {
            resources.load(path, (err, dataAsset) => {
                if (err) {
                    error("ResourcesLoader load error:", err.message);
                }
                doneFunc(dataAsset, err);
            });
            return;
        }

        resources.load(path, type, (err, dataAsset) => {
            if (err) {
                error("ResourcesLoader load error:", err.message);
            }
            doneFunc(dataAsset, err);
        });
    }

    static get<T extends Asset>(path: string, type?: __private._cocos_core_asset_manager_shared__AssetType<T> | null, bundleName: string = "resources"): T | null {
        var bundle: AssetManager.Bundle | null = assetManager.getBundle(bundleName);
        return bundle!.get(path, type);
    }

    /**
     * @description 创建界面一定使用此方法 resources需要动态加载的资源(使用此方法，引擎底层资源释放)
     */
    static loadWithViewInfo(viewInfo: ViewInfoType, doneFunc: FileCallback<UnionAsset>, isShowLoading: boolean = true, type?: typeof Asset) {
        let path = viewInfo.Path;
        if (isShowLoading) {
            netLoadingMgr.addMsgLoading("load view:" + path, 0)
        }

        if (type == undefined) {
            resources.load(path, (err, dataAsset) => {
                if (err) {
                    error("ResourcesLoader load error:", err.message);
                }

                // 添加自动释放
                ResourcesLoader._autoReleaseRes(viewInfo, dataAsset);
                doneFunc(dataAsset);

                //加载转圈
                netLoadingMgr.removeMsgLoading("load view:" + path)
            });
            return;
        }

        resources.load(path, type, (err, dataAsset) => {
            if (err) {
                error("ResourcesLoader load error:", err.message);
            }

            // 添加自动释放
            ResourcesLoader._autoReleaseRes(viewInfo, dataAsset);
            doneFunc(dataAsset);

            //加载转圈
            netLoadingMgr.removeMsgLoading("load view:" + path)
        });
    }

    static loadList(pathList: string[], onProcess: (finishNum: number, max: number) => void, onComplete: () => void, bundleName: string = "resources") {
        var bundle = assetManager.getBundle(bundleName);
        bundle.load(pathList,onProcess, onComplete)
    }

    static loadDir(path: string,onProcess: (finishNum: number, max: number) => void, onComplete: () => void, bundleName: string = "resources"){
        var bundle = assetManager.getBundle(bundleName);
        bundle.loadDir(path,onProcess, onComplete)
    }

    //释放单个资源
    static release(path: string, bundleName: string = "resources") {
        var bundle = assetManager.getBundle(bundleName);
        bundle?.release(path);
    }

    static loadPromise<T extends Asset>(path: string, type?: typeof Asset): Promise<T> {
        return new Promise<T>((resolve, rejected) => {
            this.load(path, (data: T) => {
                resolve(data);
            }, type)
        })
    }

    //是否需要释放内存
    static checkNeedToRelease(): boolean {
        //暂时用了1GB内存需要释放
        let mb = 1024 * 1024;
        if (game._gfxDevice.memoryStatus.textureSize / (mb) > ResourcesLoader._CacheMaxMemory) {
            return true
        }
        return false
    }

    // 引用计数+1
    static addResRef(layerName: string) {
        let asset = ResourcesLoader._ResCounter.get(layerName);
        if (asset) {
            asset.addRef();
        }
    }

    // 引用计数-1
    //单纯减少引用，纹理统一释放
    static decResRef(layerName: string) {
        let asset = ResourcesLoader._ResCounter.get(layerName);
        if (asset) {
            asset.decRef(false);
            ResourcesLoader._ResCounter.delete(layerName);
        }
    }

    //所有引用清除
    static clearAllRef() {
        ResourcesLoader._ResCounter.forEach(element => {
            element.decRef(false)
        });
        ResourcesLoader._ResCounter.clear()
    }

    static releaseUnusedAssets() {
        resources.releaseUnusedAssets()
    }

    private static _autoReleaseRes(viewInfo: ViewInfoType, asset: Asset) {
        let cache = viewInfo.Cache;
        if (!cache) {
            if (!ResourcesLoader._ResCounter.get(viewInfo.View)) {
                ResourcesLoader._ResCounter.set(viewInfo.View, asset);
            }
        } else {
            // 永久缓存 >1 即可
            asset.addRef();
        }
    }
}