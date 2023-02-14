import * as fs from "fs"
import * as path from "path"
export default function autoIncrementFileNames(fileName:string, fileBuffer:string) {
    try {
        const [name, ext] = fileName.split(".")
        let resName = name
        const files = fs.readdirSync("image" )
        const existingFileNames = files.map((file) => file.split('.')[0]);
    
    let i = 1;
    while (existingFileNames.includes(resName)) {
        resName = `${resName}-${i}`;
        i += 1;
    }
    const hasilName = resName+"."+ext
    fs.writeFileSync(`image/${hasilName}`, fileBuffer);
    return hasilName
    }catch(err) {
        console.log(err)
        return false
    }
}