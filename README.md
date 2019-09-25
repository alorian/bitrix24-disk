# Bitrix24 Disk
Interaction helper for bitrix24 disk

Key features are **recursive directory creation** from string and **promise based requests** 

## Installation
```shell script
$ yarn add alorian/bitrix24-disk
```

## Methods
All methods return js Promise. Library expects window.BX24 rest library already defined

### Bitrix24Disk.initStorage()

Method defines storage which will be used for all other methods. Must be called before any other method. 

Library uses default app storage:
[https://dev.1c-bitrix.ru/rest_help/disk/storage/disk_storage_getforapp.php](https://dev.1c-bitrix.ru/rest_help/disk/storage/disk_storage_getforapp.php)


### Bitrix24Disk.findSubFolder(diskFolder, subFolderName)

Arguments:

* diskFolder - null or bitrix24 folder object. If null given than method looks into storage root. Otherwise method 
looks subfolder name at given folder

* subFolderName - name of folder to find


### Bitrix24Disk.createSubFolder(diskFolder, subFolderName)

Arguments:

* diskFolder - null or bitrix24 folder object. If null given than method creates
 subfolder into storage root. Otherwise method 
creates subfolder at given folder

* subFolderName - name of folder to create


### Bitrix24Disk.findOrCreatePath(diskPath)
Method takes any string. Recursively creates folder structure by given string

If any part of given path already exists, than method create only rest path

Method returns "disk folder object" for deepest directory

Basic example:
```javascript
let pathCreated = Bitrix24Disk.findOrCreatePath('/any/folder/structure')
pathCreated.then(diskFolder => {
    console.log(diskFolder)
})
```

### Bitrix24Disk.uploadToFolder(diskFolder, fileName, fileReader)

Arguments:

* diskFolder - null or bitrix24 folder object. If null given than method upload
file into storage root. Otherwise method uploads file at given folder

* fileName - string, filename on bitrix24 storage

* fileReader - fileReader object
more info here [https://developer.mozilla.org/ru/docs/Web/API/FileReader](https://developer.mozilla.org/ru/docs/Web/API/FileReader)

Method returns bitrix24 disk file object

### Bitrix24Disk.uploadToPath(diskPath, fileReader)

Arguments:

* diskPath - Method takes any string. Recursively creates folder structure by given string.
Last part after "/" must be file name

* fileReader - fileReader object
more info here [https://developer.mozilla.org/ru/docs/Web/API/FileReader](https://developer.mozilla.org/ru/docs/Web/API/FileReader)

Method returns bitrix24 disk file object

## Basic usage example
 
```javascript
import Bitrix24Disk from "./index"

let storageLoaded = Bitrix24Disk.initStorage()
storageLoaded.then(storage => {
    console.log(storage)
    let pathCreated = Bitrix24Disk.findOrCreatePath('/any/folder/structure')
    pathCreated.then(diskFolder => {
        let fileInput = document.getElementById('file-input-id')
        let filesList = fileInput.files
        if (filesList.length > 0) {
            for (let i = 0; i < filesList.length; i++) {
                let fileReader = new FileReader();
                fileReader.readAsDataURL(files[i]);
                
                let fileUploaded = Bitrix24Disk.uploadToFolder(
                    diskFolder, 
                    files[i].name, 
                    fileReader
                )
                
                fileUploaded.then(file => {
                    console.log(file)
                })

                fileUploaded.then(error => {
                    console.log(error)
                })
            }
        }
    })
})

storageLoaded.catch((error) => {
    console.log(error)
})
```