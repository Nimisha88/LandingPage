# LandingPage
This project is a design of a Currency Exchange Landing Page using HTML, CSS, JavaScript and Bootstrap, fetching real time data through Public API calls 

## Application Preview
https://user-images.githubusercontent.com/29170466/190375333-5f3874b8-22af-4db0-a66b-102f95266249.mov

## Public APIs used for Data
* [**CoinBase**](https://api.coinbase.com/)
* [**Frankfuter**](https://api.frankfurter.app/)
* [**MetalsAPI**](https://api.metals.live/)

## Installation Instruction
* Download the project and `cd` to the main folder
* Run `npm install` to install all project dependencies
* Run `npm run server` to start the local server
* Open browser and go to `http://localhost:3000/` to access the webpage

## Features
1. #### Nav Bar
    * Brand Logo
    * Hamburger Menu for smaller viewport
    * Scroll to anchor
2. #### Hero
    * Background Image
    * Download CTAs with styling for active state (hover)
3. #### Exchange CTA
    * Fetching real data through APIs and populating it
    * Event Listeners to capture User Interaction
    * Graph plots data for last 3 months and hides when Base Currency is same as Conversion Currency
    * Layout changes for smaller viewport
4. #### Quick Glance at popular Exchange Info
    * Displays the popular currency exchange pairs, its current rate and the change since the last available data
    * Change calculated is displayed as Rate-Up in Green and Rate-Down in Red
    * Animated coin flipping and toggling currency icons (hides in smaller viewport)
5. #### Precious Metals Exchange Rates
    * Fetches spot price data for Ag (Silver), Au (Gold) and Pt (Platinum)
    * Cards styled to match the color of Metal rate it displays
6. #### Contact
    * Displays 4 ways of communication and copyright
    * Active state (hover) styled for all links

#### Note
* Color palette is *consistent* accross the website and uses *3 primary colors*
* *Linear gradient* used to color section background
* Appropriate *variable/function names* used and *detailed comments* added accross project for ease of reading and understanding
* All features are usable across *all* viewports and browsers

## Color Palette
* **Primary:** #1089ff, #e5e5e5, #7f8fab
* **Secondary:** #eeeeee, #ffffff, #0779E4, #b30021, #0f8800, #18a4e0 (used for Shadow, Links and Hovers)
* **Tertiary:** #a8a9ad, #ededed, #d4af37, #f7edc6, #bababa, #ffffff (used for styling Metal cards)

## Limitations
* All contact/download links *default* to an alert suggesting to try again later
