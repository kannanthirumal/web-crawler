import { load } from "cheerio";
import { writeFile } from 'fs/promises';
import { EOL } from 'os';
import chalk from 'chalk';

const crawlPage = async (pageUrl) => {
    const response = await fetch(pageUrl);
    const htmlString = await response.text();
    const $ = load(htmlString);
    const linkElements = $('a[href]');

    const urls = [];
    linkElements.each((ind, ele) => {
        const url = $(ele).attr('href');
        urls.push(url);
    });

    // console.log(urls);
    const baseURl = 'https://scrapeme.live/';
    const filteredUrls = urls.filter(url => {
        const val = 
           url.startsWith(baseURl) &&
           (!url.startsWith(`${baseURl}/wp-admin`) ||
           url ===`${baseURl}/wp-admin/admin-ajax.php`);
        return val;
    });
    // console.log(filteredUrls);
    return filteredUrls;
};

const crawlMain = async () => {
    const yetToCrawl = ['https://scrapeme.live/shop'];
    const pagesCrawled = [];
    const urlsFound = new Set();
    urlsFound.add('https://scrapeme.live/shop');

    const cliGreen = chalk.black.bgGreen;
    const cliWhite = chalk.black.bgWhite;
    const cliYellow = chalk.black.bgYellow;

    while(yetToCrawl.length !== 0 && urlsFound.size < 400){ 
        //remove 'urlsFound.size < 400' in production
        const curPage = yetToCrawl.pop();
        
        console.log(cliGreen(` Crawling right now: [...] ${curPage} `));
        
        const urls = await crawlPage(curPage);
        for(let url of urls){
            if(pagesCrawled.includes(url) || url === curPage){
                continue;
            }
            urlsFound.add(url);
            yetToCrawl.push(url);
        }
        console.log(cliWhite(` Urls found in the current page: ${urls.length} `));

        pagesCrawled.push(curPage);
        console.log(cliWhite(` Pages crawled so far: ${pagesCrawled.length} `));
        console.log(cliWhite(` Count of the overall urls found: ${urlsFound.size} \n`));
    }

    const urlString = [...urlsFound].join(EOL);
    await writeFile('output.csv', urlString);
    console.log(cliYellow(' Crawling complete! Results in output.csv \n'));
}

crawlMain();



