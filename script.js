

    lucide.createIcons();

    const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwzx6A0jf6GPufP9qtgCejkEgNT3B1dhXrfkTxl9NwaviOrAicuDdzqqImnGIEFj7_p/exec';

    //DOM references
    const customerName = document.getElementById('customerName');
    const consumption = document.getElementById('consumption');
    const customerType = document.getElementById('customerType');
    const generateBtn = document.getElementById('generateBtn');
    const transactionCounterSpan = document.getElementById('transactionCounter');
    const recordedCountSpan = document.getElementById('recordedCount');
    const billOutput = document.getElementById('billOutput');

    let transactionCount = 0;
    let recordedCount = 0;

    function updateCounters() {
        transactionCounterSpan.textContent = transactionCount;
        recordedCountSpan.textContent = recordedCount;
    }

    function handleGenerateBill() {
        const name = customerName.value.trim();
        const consValue = consumption.value.trim();
        const type = customerType.value;

        if (name === '') {
            alert(' Please enter the customer name.');
            customerName.focus();
            return;
        }

        const consNum = Number(consValue);
        if (consValue === '' || isNaN(consNum) || consNum < 0) {
            alert(' Please enter a valid water consumption (positive number).');
            consumption.value = '';
            consumption.focus();
            return;
        }

        let rate;
        if (consNum <= 20) {
            rate = 25;
        } else if (consNum <= 40) {
            rate = 35;
        } else if (consNum <= 60) {
            rate = 45;
        } else {
            rate = 60;
        }

        const waterCharge = consNum * rate;

        let discountRate = 0;
        if (type === "Senior Citizen") {
            discountRate = 0.25;
        } else if (type === "Solo Parent") {
            discountRate = 0.15;
        } else {
            discountRate = 0; 
        }

        const discountAmount = waterCharge * discountRate;
        const totalDue = waterCharge - discountAmount;
        const discountPercent = discountRate * 100;

        const bill = {
            name: name,
            consumption: consNum,
            customerType: type,
            waterCharge: waterCharge,
            discountPercent: discountPercent,
            discountAmount: discountAmount,
            totalDue: totalDue,
            timestamp: new Date().toLocaleString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: true 
            })
        };


        transactionCount += 1;
        updateCounters();

 
        renderBill(bill);

        if (APPS_SCRIPT_URL.startsWith('https://script.google.com')) {
            sendToGoogleSheets(bill);
        } else {
            recordedCount += 1;
            updateCounters();
            console.log(' (demo mode) Bill recorded:', bill);
        }


        consumption.value = '';
        consumption.focus();
    }

    function renderBill(bill) {
        billOutput.style.display = 'block';
        
        let discountLine = '';
        if (bill.discountPercent > 0) {
            discountLine = `
                <div class="row">
                    <span>Discount (${bill.discountPercent}%):</span> 
                    <b style="color:#22a65e;">-₱${bill.discountAmount.toFixed(2)}</b>
                </div>
            `;
        }

        billOutput.innerHTML = `
            <div class="row"><span> Customer:</span> <b>${bill.name}</b></div>
            <div class="row"><span> Consumption:</span> <b>${bill.consumption} m³</b></div>
            <div class="row"><span> Type:</span> <b>${bill.customerType}</b></div>
            <div class="row"><span> Water Charge:</span> <b>₱${bill.waterCharge.toFixed(2)}</b></div>
            ${discountLine}
            <div class="row total">
                <span> Total Amount Due:</span> 
                <b>₱${bill.totalDue.toFixed(2)}</b>
            </div>
            <div class="row" style="font-size:0.75rem; color:#999; border-top:1px solid #eee; margin-top:0.4rem; padding-top:0.4rem; border-bottom: none;">
                <span> ${bill.timestamp}</span>
            </div>
        `;
    }


    function sendToGoogleSheets(bill) {
        const payload = {
            timestamp: bill.timestamp,
            name: bill.name,
            consumption: bill.consumption,
            customerType: bill.customerType,
            waterCharge: bill.waterCharge,
            discount: bill.discountAmount,
            totalDue: bill.totalDue
        };

        fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        }).then(() => {
            recordedCount += 1;
            updateCounters();
            console.log(' Data sent to Google Sheets:', payload);
        }).catch((error) => {
            console.warn(' Failed to send to Google Sheets:', error);
            recordedCount += 1;
            updateCounters();
        });
    }

    generateBtn.addEventListener('click', handleGenerateBill);

    document.querySelectorAll('input, select').forEach(el => {
        el.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                generateBtn.click();
            }
        });
    });

    updateCounters();

    console.log(' Water Billing System ready.');
    console.log(' Google Apps Script URL:', APPS_SCRIPT_URL);