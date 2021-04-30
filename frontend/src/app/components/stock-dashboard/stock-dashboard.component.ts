import { Component, OnInit, OnDestroy } from '@angular/core';
import { StockChart } from 'angular-highcharts';
import { ActivatedRoute } from '@angular/router';
import { RestService } from '../../services/rest.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { take } from 'rxjs/operators';
import { SnackBarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-stock-dashboard',
  templateUrl: './stock-dashboard.component.html',
  styleUrls: ['./stock-dashboard.component.css']
})
export class StockDashboardComponent implements OnInit , OnDestroy{

  selectedCompany: string = "";
  lastUpdatedTime;
  stock: StockChart;
  companies: any;
  loader: boolean = false;
  timerIds = [];
  
  constructor(private snackBarService: SnackBarService, private router: ActivatedRoute, private _snackBar: MatSnackBar, private restService: RestService) {
  }

  /**
   *  Function to Initiate component.
   *  Initiating company lists
   */
  ngOnInit(): void {
    this.selectedCompany = this.router.snapshot.queryParamMap.get('companyId');
    this.getCompanies();
  }

  /**
   *  Function to get all companies.
   *  @returns  {null}
   */
  getCompanies() {
    this.restService.getData('companies/list')
      .pipe(take(1))
      .subscribe(
        response => {
          if (response && response.success) {
            this.companies = response.data;
            if (this.companies && this.companies.length > 0) {
              if(!this.selectedCompany || this.selectedCompany === "")
                this.selectedCompany = this.companies[0].companyId;
              this.getStockData();
            }
          }
        },
        error => {
          if (error && error.error && error.error.message) {
            this.snackBarService.openSnackBar(error.error.message, '');
          }
          this.clearAllTimeOuts();
          this.loader = false;
        });
  }

  /**
   *  Function to get all stockDatas for selected company.
   * 
   *  @returns  {null}
   */
  getStockData() {
    if (this.selectedCompany) {
      this.loader = true;
      this.stock = new StockChart({});
      this.restService.getData(`companies/dashboard/${this.selectedCompany}`)
        .pipe(take(1))
        .subscribe(
          response => {
            if (response && response.success) {
              const stocks = response.data.stocks;
              const company = response.data.company;
              if (stocks && stocks.length > 0) {
                this.parseStockDatas(stocks,company);
              } else if (company && company.status === 'PROCESSING') {
                /**
                 * Retrying getStockData in the case of empty stocks at that current time. 
                 * But it may have data since the staus is in PROCESSING,
                 * so fetching the datas of running simulation in certain interval.
                 * 
                 */
                const id = setTimeout(() => {
                  this.getStockData();
                }, 5000);
                this.timerIds.push(id);
              }
              this.loader = false;
            }
          },
          error => {
            if (error && error.error && error.error.message) {
              this.snackBarService.openSnackBar(error.error.message, '');
            }
            this.clearAllTimeOuts();
            this.loader = false;
          });
    }
  }
  /**
   * Function to parse the stocks and form as per the chart data format.
   * updates the lastUpatedTime and redraws the chart.
   * 
   * @param stocks  contains unformatted stocks data
   * @param company contains company information - companyName,shortCode and status
   */
  parseStockDatas(stocks,company) {
    const chartData = [];
    this.lastUpdatedTime = stocks[(stocks.length - 1)].date;
    for (var i = 0; i < stocks.length; i++) {
      chartData.push([stocks[i].date, parseInt(stocks[i].currentValue)])
    }
    this.createChart(chartData,company)
  }

  /**
   * Function to draw new chart for a company
   * @param chartData Formatted chart data
   * @param company contains company information.
   */
  createChart(chartData,company) {
    this.stock = new StockChart({
      rangeSelector: {
        selected: 1
      },
      title: {
        text: company.companyName + ' Stock Price'
      },
      series: [{
        tooltip: {
          valueDecimals: 2,
        },
        name: company.companyShortCode,
        type: 'line',
        data: chartData,
      }]
    });
    if (company && company.status === 'PROCESSING') {
      this.updateDashboard();
    }
  }

  updateDashboard() {
    if (this.selectedCompany && this.lastUpdatedTime) {
      this.restService.getData(`companies/dashboard/${this.selectedCompany}?date=${this.lastUpdatedTime}`)
        .pipe(take(1))
        .subscribe(
          response => {
            if (response && response.success) {
              const data = response.data.stocks;
              const company = response.data.company;
              if (company && company.status == 'COMPLETED' || company.status === null) {
                  // Canceling subscription when simulation completed
                  this.clearAllTimeOuts()
              } else {
                if (data && data.length > 0) {
                  // updating lastUpdatedtime with current stock data
                  this.lastUpdatedTime = data[(data.length - 1)].date;
                  this.stock.ref$.pipe(take(1)).subscribe(chart => {
                    for (var i = 0; i < data.length; i++) {
                      chart.series[0].addPoint([data[i].date, parseInt(data[i].currentValue)]);
                    }
                  });
                }
                if(company && company.status == 'PROCESSING'){
                  /**
                   * Retrying getStockData in the case of empty stocks at that current time. 
                   * But it may have data since the staus is in PROCESSING,
                   * so fetching the datas of running simulation in certain interval.
                   * 
                   */
                   const id = setTimeout(() => {
                    this.updateDashboard();
                  }, 5000);
                  this.timerIds.push(id);
                }
              }
            }
          },
          error => {
            if (error && error.error && error.error.message) {
              this.snackBarService.openSnackBar(error.error.message, '');
            }
            this.clearAllTimeOuts();
            this.loader = false;
          });
    }
  }
  
  /**
   * Function to clear all timeout functions
   */
  clearAllTimeOuts() {
    if (this.timerIds && this.timerIds.length > 0) {
      const ids = this.timerIds;
      for (var i = 0; i < ids.length; i++) {
        clearTimeout(ids[i]);
      }
    }
  }
  
  ngOnDestroy() {
    this.clearAllTimeOuts();
  }
}






