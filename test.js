const FixedFloat = require('./'); // Change it to 'fixedfloat'
const ff = new FixedFloat('API_KEY', 'API_SECRET');

(async()=>{
    const data = await ff.getCurrencies();
    console.log(data);
})()