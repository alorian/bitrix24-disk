'use strict';

export default class Bitrix24Disk {
}
Bitrix24Disk.storage = null

Bitrix24Disk.initStorage = function () {
    return new Promise((resolve, reject) => {
        if (this.storage) {
            resolve(this.storage)
        } else {
            window.BX24.callMethod(
                "disk.storage.getforapp",
                {},
                (result) => {
                    if (result.error()) {
                        reject(result.error())
                    } else {
                        this.storage = result.data()
                        resolve(result.data())
                    }
                }
            );
        }
    })
}

Bitrix24Disk.findSubFolder = function (diskFolder, subFolderName) {
    return new Promise((resolve, reject) => {

        let ID = this.storage.ID
        let method = 'disk.storage.getchildren'
        if (diskFolder && diskFolder.ID) {
            method = 'disk.folder.getchildren'
            ID = diskFolder.ID
        }

        window.BX24.callMethod(
            method,
            {
                id: ID,
                filter: {
                    NAME: subFolderName
                }
            },
            (result) => {
                if (result.error()) {
                    reject(result.error())
                } else {
                    if (result.data().length > 0) {
                        resolve(result.data()[0])
                    } else {
                        resolve(null)
                    }
                }
            }
        );
    })
}

Bitrix24Disk.createSubFolder = function (diskFolder, subFolderName) {
    return new Promise((resolve, reject) => {
        let ID = this.storage.ID
        let method = 'disk.storage.addfolder'
        if (diskFolder && diskFolder.ID) {
            method = 'disk.folder.addsubfolder'
            ID = diskFolder.ID
        }

        window.BX24.callMethod(
            method,
            {
                id: ID,
                data: {
                    'NAME': subFolderName
                }
            },
            (result) => {
                if (result.error()) {
                    reject(result.error())
                } else {
                    resolve(result.data())
                }
            }
        )
    })
}

Bitrix24Disk.findOrCreatePath = function (diskPath) {
    return new Promise((resolve, reject) => {
        let foldersList = diskPath.split('/')
        foldersList.shift()

        let parentDiskFolder = null
        let folderIndex = 0

        let nextFolder = (folderIndex) => {
            if (folderIndex < foldersList.length) {
                let folderName = foldersList[folderIndex]
                let findRequest = this.findSubFolder(parentDiskFolder, folderName)
                findRequest.then(folder => {
                    if (folder && folder.ID) {
                        parentDiskFolder = folder
                        folderIndex++
                        nextFolder(folderIndex)
                    } else {
                        let createRequest = this.createSubFolder(parentDiskFolder, folderName)
                        createRequest.then(folder => {
                            parentDiskFolder = folder
                            folderIndex++
                            nextFolder(folderIndex)
                        })

                        createRequest.catch(reason => {
                            reject(reason)
                        })
                    }
                })

                findRequest.catch(reason => {
                    reject(reason)
                })
            } else {
                resolve(parentDiskFolder)
            }
        }

        nextFolder(folderIndex)
    })
}

Bitrix24Disk.uploadToFolder = function (diskFolder, fileName, fileReader) {
    return new Promise((resolve, reject) => {
        let uploadFile = () => {
            let fileContent = fileReader.result.toString().replace(/^data:(.*,)?/, '');
            if ((fileContent.length % 4) > 0) {
                fileContent += '='.repeat(4 - (fileContent.length % 4));
            }

            let ID = this.storage.ID
            let method = 'disk.storage.uploadfile'
            if (diskFolder && diskFolder.ID) {
                method = 'disk.folder.uploadfile'
                ID = diskFolder.ID
            }

            window.BX24.callMethod(
                method,
                {
                    id: ID,
                    data: {
                        NAME: fileName
                    },
                    fileContent: fileContent
                },
                (result) => {
                    if (result.error()) {
                        reject(result.error())
                    } else {
                        console.log(result.data())
                        resolve(result.data())
                    }
                }
            )
        }

        if (fileReader.readyState === fileReader.DONE) {
            uploadFile()
        } else {
            fileReader.onloadend = uploadFile
        }

    })
}

Bitrix24Disk.uploadToPath = function (diskPath, fileReader) {
    return new Promise((resolve, reject) => {

        let foldersList = diskPath.split('/')
        foldersList.shift()
        let fileName = foldersList.pop()

        let findLastFolder = this.findOrCreatePath(diskPath)
        findLastFolder.then(diskFolder => {
            let fileUploaded = this.uploadToFolder(diskFolder, fileName, fileReader)

            fileUploaded.then(response => {
                resolve(response)
            })

            fileUploaded.catch(reason => {
                reject(reason)
            })
        })

        findLastFolder.catch(reason => {
            reject(reason)
        })

    })
}
