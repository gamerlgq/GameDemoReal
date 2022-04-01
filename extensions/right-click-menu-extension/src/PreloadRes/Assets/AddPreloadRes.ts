
import fs, { Stats } from 'fs-extra';
import path, { join } from 'path';

import { AssetInfo } from '../../../@types/packages/asset-db/@types/public';
module.exports = {

    onShow(data:any){
        return {
            enable:true,//如果为false，菜单变灰且不可以点击
            visible:true//如果为false，直接不显示菜单
        }
    },

    /**
     * @description 点击菜单时
     * @param data {name:string,info | uuid:string}
     */
    onClick(data:any){
        let dir = <string>data.info.url;
        if (dir.search("resources") == -1) {
            console.warn("添加预加载:只允许在resources bundle下使用!,其他bundle需要手动加载!!!");
            return
        }
        if (dir == "db://assets/resources") {
            console.warn("添加预加载:不能把resources bundle下的所有资源都加入预加载!!!");
            return
        }
        console.log("添加预加载:默认是追加模式，如果需要重新写入preload.json,则需要先删除文件，再逐个文件夹添加。")
        queryAsset(dir);
        console.log("添加预加载:添加"+dir+"完成!");
    },
}

async function queryAsset(dir:string) {
    let assetInfo = await Editor.Message.request("asset-db","query-asset-info",dir);
    let isDir = assetInfo.isDirectory;    
    if (isDir) {
        search(assetInfo.file);
    }else{
        await record(assetInfo.path);
    }
}


let IgnoreFile = {
    meta:true,
    DS_Store:true
}

let IgnoreDir = {
    datas:true,
    data:true,
    pics:true,
    pic:true
}

/**
 * 文件遍历方法
 * @param filePath 需要遍历的文件路径
 */
 function search(pathUrl:string){
    // 根据文件路径读取文件，返回一个文件列表
    fs.readdir(pathUrl, (err:NodeJS.ErrnoException, files:string[]) => {
        if (err) {
            return console.warn(err);
        }
        
        // 遍历读取到的文件列表
        files.forEach(filename => {
            // path.join得到当前文件的绝对路径
            const filepath = path.join(pathUrl, filename);
            // 根据文件路径获取文件信息
            fs.stat(filepath, async (error:NodeJS.ErrnoException, stats:Stats) => {
                if (error) {
                    return console.warn('获取文件stats失败');
                }                

                const isFile = stats.isFile(); // 是否为文件
                if (isFile) {
                    const list = filepath.split(".");
                    let isIgnore = false;
                    list.forEach(nm =>{
                        if (IgnoreFile[nm]){
                            isIgnore = true;
                        }                        
                    })        

                    if(!isIgnore){
                        let idx = filepath.search("assets")
                        let url = "db://" +filepath.slice(idx);
                        let assetInfo:AssetInfo = await Editor.Message.request("asset-db","query-asset-info",url);
                        if (assetInfo){
                            await record(assetInfo.path);
                        }
                    }
                }
                
                const isDir = stats.isDirectory(); // 是否为文件夹
                if (isDir) {
                    let isGoOn = true;
                    const dirs = filepath.split("/");
                    dirs.forEach(dir => {
                        if (IgnoreDir[dir]) {
                            isGoOn = false;
                        }
                    });

                    if (isGoOn) {
                        search(filepath);
                    }
                }
            });
        });
    });
};


let records = {}
async function record(file:string) {
    let resBundle = "resources";
    let resBundleLength = resBundle.length;
    let idx = file.search(resBundle);
    if (idx == -1){
        return;
    }
    records[file.slice(idx+resBundleLength+1)] = true;
    await save();
}

async function save() {
    let url = "db://assets/resources/maincity/datas/preload.json"
    let assetInfo:AssetInfo = await Editor.Message.request("asset-db","query-asset-info",url);
    if (!assetInfo){
        assetInfo = await Editor.Message.request("asset-db","create-asset",url,JSON.stringify(records));
    }else{
        let str = fs.readFileSync(assetInfo.file,"utf-8");
        let output = JSON.parse(str);
        const keys = Object.keys(records);
        keys.forEach(key=>{
            output[key] = true
        })
        fs.writeFileSync(assetInfo.file,JSON.stringify(output),"utf-8");
    }
}