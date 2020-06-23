var express = require('express');
var router = express.Router();
const upload = require('../utils/upload')
const { loadData, saveData } = require("../utils/data");
const { loadMeme, saveMeme } = require("../utils/data")
const data = require('../utils/data');
const jimp = require('jimp');
const fs = require('fs')
const path = require('path')
const pathToMemes = path.join(__dirname, "../public/images/meme/")


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/originals", function(req, res, next){
  try {
    const showAll = loadData()
    res.render('originals', {images: showAll, path: "/images/originals/"})
  } catch(err) {
    res.render('index', {error: err.message})
  }
})

router.post("/upload", (req, res, next) => {
  upload(req, res, async function (err) {
    const {file} = req
    if(err){
      return res.render("index", {error: err.message})
      }
    if(!file) {
      return res.render("index", {error: "Please upload a file"})
    }
    console.log("haha",file)
    const originals = loadData()

    // Check duplicate
    const found = originals.findIndex(el => 
      el.originalname === file.originalname ||
      el.size === file.size)
    if (found !== -1){
      return res.render("index", {error: "File duplicated"})
    } 
    try {
      let image = await jimp.read(file.path)
      image.resize(jimp.AUTO, 250)
      await image.writeAsync(file.path)

      // Push the file to database
      file.id = originals.length === 0 ? 1 : originals[originals.length -1].id +1 

      originals.push(file)
      saveData(originals)
      res.render('originals', {images: originals, path: "/images/originals/"})

    } catch(e){
      fs.unlinkSync(file.path);
      return res.render("index", {error: e.message})
    }

  });
})

router.post("/addtext", async(req, res, next)=> {
  // Get the queries
  const {top, bot, id} = req.body
  console.log({top, bot, id})
  console.log(pathToMemes)

  // Error handler
  if(!id) 
  return res.redirect("/browse", {error: "Please enter an ID"})
  if(!top && !bot)
  return res.redirect("/browse", {error: "Please enter a top and bot"})

  const originals = loadData();
  const selectedImageIndex = originals.findIndex(image => image.id*1 === id*1)
  if(selectedImageIndex === -1){
    return res.redirect("/browse", {error: "Image's ID not found"})
  }
  const selectedImage = originals[selectedImageIndex]
  let image = await jimp.read(selectedImage.path)
  let font =  await jimp.loadFont(jimp.FONT_SANS_32_BLACK)

  // Print top text
  image.print(
    font,
    0,
    0,
    {
      text: top,
      alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: jimp.VERTICAL_ALIGN_TOP
    },
    image.bitmap.width,
    image.bitmap.height
  );
  // Print bottom text
  image.print(
    font,
    0,
    0,
    {
      text: bot,
      alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
      alignmentY: jimp.VERTICAL_ALIGN_BOTTOM
    },
    image.bitmap.width,
    image.bitmap.height
  );

  let newName = Date.now().toString() + selectedImage.filename
  await image.writeAsync(pathToMemes + newName)
  const memes = loadMeme()

  let newData = {
    id: memes.length > 0 ? memes[memes.length -1].id + 1 : 1,
    path: pathToMemes+newName,
    filename: newName
  }

  memes.push(newData);
  saveMeme(memes)
  res.render("memes", { images : memes})
})

router.get("/memes", (req, res)=>{
  const showMeme = loadMeme()
  res.render("memes", { images: showMeme})
})

module.exports = router;
