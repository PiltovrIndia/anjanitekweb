import pool from '../../../db'
import { Keyverify } from '../../../secretverify';
import { addMonths, format } from 'date-fns';

// get the forecast via simple exponential smoothing
// series: array of numbers
// alpha: smoothing factor 0 < alpha < 1
function ses(series, alpha = 0.3) {
  let f = series[0] || 0;
  for (let i = 1; i < series.length; i++) {
    f = alpha * series[i] + (1 - alpha) * f;
    console.log(`${series[i]} : ${f}`);
    
  }
  return Math.round(f);
}

// croston's method for intermittent demand forecasting
// series: array of numbers
function croston(series) {
  const demand = series.filter(v => v > 0);
  if (!demand.length) return 0;

  const intervals = [];
  let lastIdx = -1;
  series.forEach((v, i) => {
    if (v > 0) {
      if (lastIdx >= 0) intervals.push(i - lastIdx);
      lastIdx = i;
    }
  });

  const avgDemand = demand.reduce((a, b) => a + b, 0) / demand.length;
  const avgInterval = intervals.length
    ? intervals.reduce((a, b) => a + b, 0) / intervals.length
    : 1;

  return Math.round(avgDemand / avgInterval);
}

// TSB method for intermittent demand forecasting
// series: array of numbers
// alpha: smoothing factor for demand size
// beta: smoothing factor for demand probability
function tsb(series, alpha = 0.2, beta = 0.2) {
  let z = 0;   // estimated demand size
  let p = 0;   // estimated demand probability

  for (let y of series) {
    if (y > 0) {
      z = alpha * y + (1 - alpha) * z;
      p = beta * 1 + (1 - beta) * p;
    } else {
      p = (1 - beta) * p;
    }
  }

  return Math.round(z * p);   // TSB forecast for next period
}

// automatic alpha selector via 1-step CV
function bestAlpha(series) {
  const alphas = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
  let bestA = 0.3, bestErr = Infinity;
  alphas.forEach(a => {
    let err = 0, f = series[0];
    for (let i = 1; i < series.length; i++) {
      f = a * series[i - 1] + (1 - a) * f;
      err += Math.abs(series[i] - f);
    }
    if (err < bestErr) { bestErr = err; bestA = a; }
  });
  return bestA;
}

function bestAB(series, grid = [0.1, 0.2, 0.3, 0.4, 0.5]) {
  let bestA = 0.2, bestB = 0.2, bestErr = Infinity;
  grid.forEach(a => {
    grid.forEach(b => {
      let err = 0, z = 0, p = 0;
      for (let i = 0; i < series.length; i++) {
        const prev = tsb(series.slice(0, i), a, b); // helper that returns forecast
        const actual = series[i];
        err += Math.abs(actual - prev);
      }
      const avg = err / series.length;
      if (avg < bestErr) { bestErr = avg; bestA = a; bestB = b; }
    });
  });
  return { alpha: bestA, beta: bestB };
}

export async function GET(request,{params}) {

    // get the pool connection to db
    const connection = await pool.getConnection();



    try{

        // authorize secret key
        if(await Keyverify(params.ids[0])){

            
            if(params.ids[1] == 1){

                let q = `SELECT * from sales_data where date <= "`+params.ids[2]+`"`;
                // let q = `SELECT * from sales_data where sku="6071JA"`;
                const [rows, fields] = await connection.execute(q);

                ///////////////////////////////
                // group the rows by sku
                var skuList = [];
                for (let r of rows) {

                    if (skuList.some(item => item.sku === r.sku)) {
                        let index = skuList.findIndex(item => item.sku === r.sku);
                        skuList[index].sale.push(parseInt(r.quantity));
                        skuList[index].dates.push(format(new Date(r.date), 'MMM-yyyy'));
                        // continue;
                    }
                    else {
                        var obj = {sku:'', sale:[], dates:[]};
                        obj.sku = r.sku;
                        obj.sale.push(parseInt(r.quantity));
                        obj.dates.push(format(new Date(r.date), 'MMM-yyyy'));
                        skuList.push(obj);
                    }
                }
                ///////////////////////////////


                // // for each sku, get the forecast
                // for(let sku of skuList){
                //     if(sku.sale.length < 3) continue; // skip if not enough history
                    
                //     // SES forecast
                //     const alpha = bestAlpha(sku.sale);
                //     const point = ses(sku.sale, alpha);

                //     // // CROSTON forecast
                //     // const alpha = 0.3;
                //     // const point = croston(sku.sale);
                    
                //     // // TSB forecast
                //     // const {alpha, beta} = bestAB(sku.sale);
                //     // const point = tsb(sku.sale, alpha, beta);

                //     const nextMonth = format(addMonths(new Date(), 1), 'yyyy-MM-dd');
                //     sku.alpha = alpha;
                //     sku.forecast = point;
                //     sku.nextMonth = nextMonth;
                // }

                // check for the updated app version
                if(rows.length>0){

                    // return the requests data
                    return Response.json({status: 200, message:'Updated!', data: skuList}, {status: 200})

                }
                else{
                    // wrong role
                    return Response.json({status: 404, message:'No list found'}, {status: 200})
                }
            }
            else if(params.ids[1] == 1.5){

                let q = `SELECT * from sales_data where date <= "`+params.ids[2]+`"`;
                // let q = `SELECT * from sales_data where sku="6071JA"`;
                const [rows, fields] = await connection.execute(q);

                ///////////////////////////////
                // group the rows by sku
                var skuList = [];
                for (let r of rows) {

                    if (skuList.some(item => item.sku === r.sku)) {
                        let index = skuList.findIndex(item => item.sku === r.sku);
                        skuList[index].sale.push(parseInt(r.quantity));
                        skuList[index].dates.push(format(new Date(r.date), 'MMM-yyyy'));
                        // continue;
                    }
                    else {
                        var obj = {sku:'', sale:[], dates:[]};
                        obj.sku = r.sku;
                        obj.sale.push(parseInt(r.quantity));
                        obj.dates.push(format(new Date(r.date), 'MMM-yyyy'));
                        skuList.push(obj);
                    }
                }
                ///////////////////////////////


                // // for each sku, get the forecast
                for(let sku of skuList){
                    if(sku.sale.length < 3) continue; // skip if not enough history
                    
                    var alpha = 0.3;
                    var {alpha, beta} = {alpha:0.3, beta:0.3};
                    var point = 0;

                    // check which model to use
                    if(params.ids[3] == 1){
                      // SES forecast
                      alpha = bestAlpha(sku.sale);
                      point = ses(sku.sale, alpha);
                    }
                    else if(params.ids[3] == 2){
                      // CROSTON forecast
                      alpha = 0.3;
                      point = croston(sku.sale);
                    }
                    else if(params.ids[3] == 3){
                      // TSB forecast
                      ({alpha, beta} = bestAB(sku.sale));
                      point = tsb(sku.sale, alpha, beta);
                    }
                    else{
                      // default to SES
                      alpha = bestAlpha(sku.sale);
                      point = ses(sku.sale, alpha);
                    }
                    

                    const nextMonth = format(addMonths(Date.parse(params.ids[2]), 1), 'MMM-yyyy');
                    // const nextMonth = format(addMonths(new Date(), 1), 'MMM-yyyy');
                    sku.alpha = alpha;
                    sku.forecast = point;
                    sku.nextMonth = nextMonth;
                }

                // check for the updated app version
                if(rows.length>0){

                    // return the requests data
                    return Response.json({status: 200, message:'Updated!', data: skuList}, {status: 200})

                }
                else{
                    // wrong role
                    return Response.json({status: 404, message:'No list found'}, {status: 200})
                }
            }
            else if(params.ids[1] == 2){

                let q = `SELECT DISTINCT(date) FROM sales_data ORDER BY date DESC`;
                // let q = `SELECT * from sales_data where sku="6071JA"`;
                const [rows, fields] = await connection.execute(q);

                // check for the updated app version
                if(rows.length>0){

                    // return the requests data
                    return Response.json({status: 200, message:'Updated!', data: rows}, {status: 200})

                }
                else{
                    // wrong role
                    return Response.json({status: 404, message:'No list found'}, {status: 200})
                }
            }
            else {
                // wrong role
                return Response.json({status: 402, message:'Your donot have access!'}, {status: 200})
            }

            
        }
        else {
            // wrong secret key
            return Response.json({status: 401, message:'Unauthorized'}, {status: 200})
        }
    }
    catch (err){
        // some error occured
        return Response.json({status: 500, message:'Facing issues. Please try again!'+err.message}, {status: 200})
    }
    
    
  }
  