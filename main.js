
const puppeteer = require('puppeteer')
const fs = require('fs')
const { PassThrough } = require('stream')
const { off } = require('process')
const data = fs.readFileSync('./list.json', 'utf8')
// parse JSON string to JSON object
const links = JSON.parse(data)
//fill a list of obj with the first price
const data2 = fs.readFileSync('./credential.json', 'utf8')
const discordUrl = JSON.parse(data2)
let color
let linksAndPrices = []

function discord_message(title, url,oldPrice,sale_discount,newPrice, color, img, discordUrl){
    const { Webhook, MessageBuilder } = require('discord-webhook-node')
    const hook = new Webhook(discordUrl)
    const embed = new MessageBuilder()    
    .setTitle(title)
    .setAuthor('payless', 'https://thumbor.forbes.com/thumbor/fit-in/416x416/filters%3Aformat%28jpg%29/https%3A%2F%2Fspecials-images.forbesimg.com%2Fimageserve%2F5d825aa26de3150009a4616c%2F0x0.jpg%3Fbackground%3D000000%26cropX1%3D0%26cropX2%3D416%26cropY1%3D0%26cropY2%3D416')
    .setURL(url)
    .addField("Prima dello sconto :",`prezzo iniziale €${oldPrice}`,true)
    .addField(`Dopo lo sconto del: ${sale_discount}%`, `prezzo scontato €${newPrice}`, true)
    .setColor(color)
    //.setThumbnail('https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcRehqW7E5F3CvWlkfaAZqRsMdINSHS5B0_bWFWpPq69T0cSeTD0s6Dr3c5gw2DAnqWl3wq_RaORKjlDwZ7Hs8YVbS8Ck0AV8Fn34RhN&usqp=CAU&ec=45714079')
    .setDescription("Il seguente prodotto è in sconto 🔥")
    .setImage(img)
    .setTimestamp()
    hook.send(embed)

}

function setColor(percent){
    let colur
    if (percent < 15){
        colur = '#c21e0c' //less than 15%
    }
    if (percent > 15 && percent < 35){
        colur = '#f6ff00' //more than 15% and less than 35%
    }
    if (percent > 35){
        colur = '#26d11d' //more than 35% off
    }
    return colur
}


async function updateJson(lista){
    linksAndPrices = []
    for (e in lista){
        let Price = await getPrice(lista[e]["url"])
        let Name = await getName(lista[e]["url"])
        let Image = await getImage(lista[e]["url"])
        let product = new Object()
        product.Url = lista[e]["url"]
        product.price = Price
        product.name = Name
        product.image = Image
        linksAndPrices.push(product)
    }
    
}


async function getPrice(url){
    const browser = await puppeteer.launch()
    const page =  await browser.newPage()
    await page.goto(url)
    const [el] = await page.$x('//*[@id="priceblock_dealprice"]')
    const txt = await el.getProperty('textContent')
    const rawTxt = await txt.jsonValue()
    browser.close()
    return parseInt(rawTxt.slice(0,-2))
}

async function getName(url){
    const browser = await puppeteer.launch()
    const page =  await browser.newPage()
    await page.goto(url)
    const [el] = await page.$x('//*[@id="productTitle"]')
    const txt = await el.getProperty('textContent')
    const rawTxt = await txt.jsonValue()
    browser.close()
    return rawTxt.replace(/\n/g, '')
}

async function getImage(url){
    const browser = await puppeteer.launch()
    const page =  await browser.newPage()
    await page.goto(url)
    const [el] = await page.$x('//*[@id="landingImage"]')
    const src = await el.getProperty('src')
    const srcTxt = await src.jsonValue()
    browser.close()
    console.log(srcTxt)
    return srcTxt
}


function isOnSale(price1, price2){
    if (price2-price1 < 0){
        salePercentage(price1, price2)
        return true
    }
}

function isMoreExpansive(price1, price2){
    if ((price2-price1)>0){
        return true
    }
}



function salePercentage(price1, price2){
    let off_percentage  = ((price1-price2)/price1)*100
    return off_percentage.toFixed(2)
}
function sale(price1, price2) {
    return price1 - price2
}



updateJson(links)

//while true check if every product is on sale every 5 minutes, if is on sale, it notify you with discord


setInterval(function(){
    for (obj in linksAndPrices){
        let url = linksAndPrices[obj]["Url"]
        let oldPrice = linksAndPrices[obj]["price"]
        let newPrice = getPrice(url)
        if (isOnSale(oldPrice, newPrice)){
            let sale_discount = salePercentage(oldPrice, newPrice)
            discord_message(linksAndPrices[obj]["name"],url, oldPrice, salePercentage(oldPrice, newPrice), newPrice, setColor(salePercentage(oldPrice, newPrice)), linksAndPrices[obj]["image"], discordUrl[0]["discordUrl"])
            linksAndPrices[obj]["price"] = newPrice
            //console.log("Spedito!")
        }
        if (isMoreExpansive(oldPrice, newPrice)){
            linksAndPrices[obj]["price"] = newPrice
        }
    }
}, 300000)


