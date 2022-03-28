
import { _decorator, Component, Node, js, director, Label, sys, assetManager, log, ProgressBar, game } from 'cc';
import { EnterApp } from '../app/EnterApp';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = HotUpdate
 * DateTime = Tue Mar 08 2022 10:55:51 GMT+0800 (中国标准时间)
 * Author = Steven_Greeard
 * FileBasename = HotUpdate.ts
 * FileBasenameNoExtension = HotUpdate
 * URL = db://assets/scripts/hotUpdate/HotUpdate.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/zh/
 *
 */


@ccclass('HotUpdate')
export class HotUpdate extends Component {
    @property(Label)
    private tipsLabel: Label

    @property(ProgressBar)
    private progressBar: ProgressBar;

    private _am: jsb.AssetsManager = null!;
    private _storagePath = '';



    start() {
        if (sys.isNative) {
            this.checkUpdate()
        }
        else {
            this.tipsLabel.string = "更新完成."
            this.progressBar.progress = 1
            this.goMainScene()
        }
    }

    onLoad() {
        if (!sys.isNative) {
            return;
        }
        this._storagePath = ((jsb.fileUtils ? jsb.fileUtils.getWritablePath() : '/') + 'hotupdate');
        console.log('Storage path for remote asset : ' + this._storagePath);

        // Setup your own version compare handler, versionA and B is versions in string
        // if the return value greater than 0, versionA is greater than B,
        // if the return value equals 0, versionA equals to B,
        // if the return value smaller than 0, versionA is smaller than B.
        let versionCompareHandle = function (versionA: string, versionB: string) {
            console.log("JS Custom Version Compare: version A is " + versionA + ', version B is ' + versionB);
            var vA = versionA.split('.');
            var vB = versionB.split('.');
            for (var i = 0; i < vA.length; ++i) {
                var a = parseInt(vA[i]);
                var b = parseInt(vB[i] || '0');
                if (a === b) {
                    continue;
                }
                else {
                    return a - b;
                }
            }
            if (vB.length > vA.length) {
                return -1;
            }
            else {
                return 0;
            }
        };

        // Init with empty manifest url for testing custom manifest
        this._am = new jsb.AssetsManager('', this._storagePath, versionCompareHandle);
        this._am.setVerifyCallback(function (path: string, asset: any) {
            // When asset is compressed, we don't need to check its md5, because zip file have been deleted.
            var compressed = asset.compressed;
            // Retrieve the correct md5 value.
            var expectedMD5 = asset.md5;
            // asset.path is relative path and path is absolute.
            var relativePath = asset.path;
            // The size of asset file, but this value could be absent.
            var size = asset.size;

            if (compressed) {
                log("Verification passed : " + relativePath)
                return true
            }

            let data = jsb.fileUtils.getDataFromFile(path);
            let md5Str = MD5_2(data)

            log("expectedMD5:" + expectedMD5 + "  md5Str:" + md5Str)
            if (expectedMD5 != md5Str) {
                log("验证失败")
                return false
            }

            return true
        });
    }

    checkCb(event: any) {
        console.log('Code: ' + event.getEventCode());
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.tipsLabel.string = "No local manifest file found, hot update skipped.";
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.tipsLabel.string = "下载更新文件失败";
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.tipsLabel.string = "更新完成.";
                this.progressBar.progress = 1
                this.goMainScene()
                break;
            case jsb.EventAssetsManager.NEW_VERSION_FOUND:
                if (sys.NetworkType.WWAN == jsb.device.getNetworkType()) {

                }
                else {
                    this.tipsLabel.string = '正准备更新...'
                    this.hotUpdate()
                }
                break;
            default:
                return;
        }

    }

    private getDownloadByteStr(byte: number) {
        let suffix = "B"

        //kb
        if (byte > 1024) {
            suffix = "KB"
            byte /= 1024

            //mb
            if (byte > 1024) {
                suffix = "M"
                byte /= 1024
            }

            return byte.toFixed(1) + suffix
        }

        return byte + suffix
    }

    updateCb(event: any) {
        var needRestart = false;
        var failed = false;
        switch (event.getEventCode()) {
            case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
                this.tipsLabel.string = 'No local manifest file found, hot update skipped.';
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_PROGRESSION:
                let downloadByte: number = event.getDownloadedBytes()
                let totalByte: number = event.getTotalBytes()
                log("updateing... ", downloadByte, " "+ totalByte)
                this.tipsLabel.string = this.getDownloadByteStr(downloadByte) + "/" + this.getDownloadByteStr(totalByte)
                this.progressBar.progress = downloadByte/totalByte
                break;
            case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
            case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
                this.tipsLabel.string = '获取更新文件失败';
                failed = true;
                break;
            case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
                this.tipsLabel.string = 'Already up to date with the latest remote version.';
                failed = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FINISHED:
                this.tipsLabel.string = '更新完成.'
                needRestart = true;
                break;
            case jsb.EventAssetsManager.UPDATE_FAILED:
                this.tipsLabel.string = '更新失败: ' + event.getMessage();
                failed = true;
                break;
            case jsb.EventAssetsManager.ERROR_UPDATING:
                this.tipsLabel.string = '更新失败: ' + event.getAssetId() + ', ' + event.getMessage();
                break;
            case jsb.EventAssetsManager.ERROR_DECOMPRESS:
                this.tipsLabel.string = event.getMessage();
                break;
            default:
                break;
        }

        if (failed) {
            this._am.setEventCallback(null!);
        }

        if (needRestart) {
            this._am.setEventCallback(null!);
            // Prepend the manifest's search path
            var searchPaths = jsb.fileUtils.getSearchPaths();
            var newPaths = this._am.getLocalManifest().getSearchPaths();
            console.log(JSON.stringify(newPaths));
            Array.prototype.unshift.apply(searchPaths, newPaths);
            // This value will be retrieved and appended to the default search path during game startup,
            // please refer to samples/js-tests/main.js for detailed usage.
            // !!! Re-add the search paths in main.js is very important, otherwise, new scripts won't take effect.
            localStorage.setItem('HotUpdateSearchPaths', JSON.stringify(searchPaths));
            jsb.fileUtils.setSearchPaths(searchPaths);

            this.goMainScene()
        }
    }

    hotUpdate() {
        log("hotupdate start...")
        this._am.setEventCallback(this.updateCb.bind(this));
        this._am.update();
    }

    checkUpdate() {
        this.progressBar.progress = 0
        this.tipsLabel.string = "正在检查更新..."

        if (this._am.getState() === jsb.AssetsManager.State.UNINITED) {
            this._am.loadLocalManifest('project.manifest');
        }
        if (!this._am.getLocalManifest() || !this._am.getLocalManifest().isLoaded()) {
            this.tipsLabel.string = "Failed to load local manifest ..."
            return;
        }
        this._am.setEventCallback(this.checkCb.bind(this));
        this._am.checkUpdate();
    }

    goMainScene() {
        if (this._am) {
            this._am.setEventCallback(null)            
        }

        this.scheduleOnce((dt: number) => {
            director.loadScene("main", () => {
                new EnterApp();
            });
        }, 1);
    }
}
