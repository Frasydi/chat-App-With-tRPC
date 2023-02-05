import * as fs from "fs"
import * as path from "path"
export default async function autoIncrementFileNames(fileName:string, fileBuffer:string) {
    try {

        const files = fs.readdirSync("image" )
        const existingFileNames = files.map((file) => file.split('.')[0]);
    
    let i = 1;
    while (existingFileNames.includes(fileName)) {
        fileName = `${fileName}-${i}`;
        i += 1;
    }
    
    fs.writeFileSync(`image/${fileName}`, fileBuffer);
    return true
    }catch(err) {
        console.log(err)
        return false
    }
}