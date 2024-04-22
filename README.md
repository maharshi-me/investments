# Investments Tracker

This is a WEB UI for tracking CAMS and KFintech mutual fund investments made with React. It can read your mutual fund transactions from Consolidated Account Statement and stores them in localstorage. Price chart will be fetched from https://www.mfapi.in/ and cached in localstorage. This re fetches once or twice a day.

# Features
- Performance chart over time (All, 1M, 3M, 6M 1Y)
- Transactions bar graph (Anually, 12M, All)
- Allocation by Scheme Type in Pie chart with filtering
- Allocation by Scheme Name in Pie chart with filtering
- Data Table with you current holdings, Total profit and Total value
- Similar to Google Finance, you can get current value of each holding in portflio with profit details if you open the collapsible row
- Data table of all transaction you have made in a nice format

## Initial Setup

- Install the dependencies <br>
Run `npm install` in project path

- Download CAS pdf from here - https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement

- Add PDF file in `public` folder
- Create `.env ` file in project path and add these two variables
  ```
  REACT_APP_PDF_PATH='filename.pdf'
  REACT_APP_PDF_PASSWORD='passwordForPDF'
  ```
- In the project directory, you can run:<br>
  `npm start`
- Open [http://localhost:3000](http://localhost:3000) to view it in your browser.
- Go to "Cache" tab. Scheme Codes shuould automatically populate from API. If not, you can select them from dropdown or fill them manually.
  - You can get scheme codes from here - https://www.mfapi.in/
- Select Scheme Type for each fund (Equity or Debt)
- Once the above setup is done, you only need to replace the CAS pdf for syncing latest transactions.
