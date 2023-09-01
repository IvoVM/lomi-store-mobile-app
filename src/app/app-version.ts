import { App } from "@capacitor/app"

const getAppInfo = async () => {
    const appInfo = await App.getInfo()
    appVersionData['nativeNumber'] = appInfo.build
    appVersionData['nativeName'] = appInfo.version
}

export const appVersionData = {
    versionNumber: 202070,
    versionName: "2.2.7",
    wwwVersionName: "2.2.7",
    wwwVersionNumber: 202070,
    nativeNumber: '',
    nativeName: '',
}

getAppInfo()