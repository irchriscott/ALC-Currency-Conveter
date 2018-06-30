const protocol = window.location.protocol.replace(/:/g, '');
const BASE_URL_API = "https://free.currencyconverterapi.com/api/v5";

const html = {
    "from": document.getElementById("cc-from-currency"),
    "to": document.getElementById("cc-to-currency"),
    "button": document.getElementById("cc-button"),
    "result": document.getElementById("cc-result"),
    "amount": document.getElementById("cc-amount")
}

//Init IndexDB

const openIndedDB = () => {

    if (!window.indexedDB) {
        return Promise.resolve();
    }

    return idb.open('currencyDB', 1, db => {
        const currency = db.createObjectStore('currencies', {
            keyPath: 'name',
        });
        const conversion = db.createObjectStore('conversions', {
            keyPath: 'id',
        });
    });
};


class CurrencyConveterApp {

    constructor() {
        this.currencies = [];
        this._idb = openIndedDB();
        this.view = html;
    }

    //Register Service Worker

    _registerServiceWorker() {
        if (navigator.serviceWorker) {
            navigator.serviceWorker.register('/sw.js').then(() => {
                console.log('Service worker registered');
            }).catch((e) => {
                console.log('Service worker registertion failed');
            });
        }
    }

    //Init App Data

    _initCurrencies() {
        try {
            if (navigator.onLine) {
                let promise = new Promise((resolve, _) => {
                    return fetch(`${BASE_URL_API}/currencies`).then((response) => resolve(response.json()));
                });

                promise.then((data) => {
                    Object.keys(data.results).map((key) => {
                        this.currencies.push({"id": key, "name": data.results[key].currencyName});
                    });
                });

                this._appendCurrenciesToView(this.currencies);
                this._storeCurrencies(this.currencies);
                this._getConversionRate();

            } else {
                this._getCurrenciesFromIdb();
            }
        } catch (error) {

        }
    }

    //Get Rate Of Currencies

    async _getConversionRate(){

        const query = `${this.view.from.value.toUpperCase()}_${this.view.to.value.toUpperCase()}`;

        let conversion = await this._getConversionFromIdb(query);

        if (!conversion) {
            let rate = new Promise((resolve, _) => {
                try {
                    return fetch(`${BASE_URL_API}/convert?q=${query}`).then((response) => resolve(response.json()));
                } catch (error) {}
            });
            rate.then((response) => {
                this._storeConversions(response.results[query]);
                conversion = response.results[query];
                this._convertCurrency(conversion.val, query);
            });
        } else {
            this._convertCurrency(conversion.val, query);
        }
    }

    //Store Currencies In Index DB

    _storeCurrencies(currencies) {
        this._idb.then((db) => {

            if (!db) return;

            let trans = db.transaction('currencies', 'readwrite');
            let store = trans.objectStore('currencies');

            store.openCursor(null).then(function del(cursor) {
                if (!cursor) return;
                cursor.delete();
                return cursor.continue().then(del);
            });
            currencies.forEach(currency => {
                store.put(currency);
            });
        });
    }

    //Store Conversion

    _storeConversions(conversion) {
        this._idb.then((db) => {

            if (!db) return;

            let trans = db.transaction('conversions', 'readwrite');
            let store = trans.objectStore('conversions');
            store.put(conversion);
        });
    }

    //Get Conversion From Index DB

    _getConversionFromIdb(query) {
        return new Promise((resolve, _) => {
            return this._idb.then((db) => {
                if (!db) return;

                let trans = db.transaction('conversions').objectStore('conversions');
                return trans.get(query).then(obj => resolve(obj));
            });
        }).then((response) => response);
    }

    //Get Currencies From Index DB

    _getCurrenciesFromIdb() {
        this._idb.then(db => {
            if (!db) return;

            let trans = db.transaction('currencies').objectStore('currencies');
            return trans.getAll().then((currencies) => {
                this.currencies = [...currencies];
                this._appendCurrenciesToView(currencies);
                this._getConversionRate();
            });
        });
    }

    //Append Currencies To Template

    _appendCurrenciesToView(currencies){
        
        setTimeout(() => {
            for (let currency of currencies) {
                const option = document.createElement("option");
                option.setAttribute("value", currency.id);
                option.text = currency.name;
                this.view.from.add(option);
            }
            for (let currency of currencies) {
                const option = document.createElement("option");
                option.setAttribute("value", currency.id);
                option.text = currency.name;
                this.view.to.add(option);
            }
        }, 2000);
    }

    //Fire Convert Event

    _submitConvertForm(){
        this.view.button.addEventListener("click", (event) => { 
            event.preventDefault(); 
            this._getConversionRate();
        });
    }

    //Convert Currencies

    _convertCurrency(rate, query) {
        let amount = parseInt(this.view.amount.value);
        this.view.result.innerText = (amount * rate) + " " + query.split("_")[1];
    }

}

const app = new CurrencyConveterApp();
app._registerServiceWorker();
app._initCurrencies();
app._submitConvertForm();

