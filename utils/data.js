const fs = require('fs')
const path = require('path')


const pathToData = path.join(__dirname, '../data.json')
const pathToMeme = path.join(__dirname, '../meme.json')


const loadData = () => {
    try{
        const buffer = fs.readFileSync(pathToData)
        const string = buffer.toString()
        return JSON.parse(string)
    } catch(err) {
        return []
    }    
}

const loadMeme = () => {
    try{
        const buffer = fs.readFileSync(pathToMeme)
        const string = buffer.toString()
        return JSON.parse(string)
    } catch(err) {
        return []
    } 
}

const saveData = data => {
    fs.writeFileSync(pathToData, JSON.stringify(data))
    console.log("save data")
}

const saveMeme = data => {
    fs.writeFileSync(pathToMeme, JSON.stringify(data))
}

module.exports = { loadData, saveData, loadMeme, saveMeme }