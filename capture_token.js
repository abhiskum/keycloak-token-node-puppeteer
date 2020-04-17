var puppeteer = require('puppeteer');

module.exports = async function (url, username, password) {
    console.log("Opening headless browser");
    const browser = await puppeteer.launch({
        ignoreHTTPSErrors: true
    });
    const page = await browser.newPage();
    console.log("Waiting for login page");
    await page.goto(url, {
        waitUntil: 'networkidle2'
    });
    /*await page.goto(url)
    await page.waitForXPath("//input[@id='kc-login']")*/
    /*await page.screenshot({
        path: 'login.png'
    })*/
    console.log("Entering user credentials");
    await page.type('input#username.form-control', username)
    await page.type('input#password.form-control', password)
    console.log("Submit");
    await page.click('input#kc-login')
    await page.waitForNavigation();
    /*await page.screenshot({
        path: 'token.png'
    })*/
    console.log("Waiting for JWT token");
    await page.waitForSelector('body')
    let element = await page.$('body')
    let tokenJson = await page.evaluate(el => el.textContent, element)
    await browser.close();
    return tokenJson;
}