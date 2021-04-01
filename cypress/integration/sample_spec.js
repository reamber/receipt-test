describe('Receipt Validation Test', function () {
    // 1
    it('should validate the values of the fields', function () {
        var receipts = require('/receipts.json'); 
        for (var i = 0; i < receipts.length; i++) {
            cy.readFile('receipts.json').its(i).its('storeId').should('match', /[A-Z0-9]{3}/g);
            cy.readFile('receipts.json').its(i).its('pinCode').should('match', /(?<!\d)\d{5}(?!\d)/g);
            cy.readFile('receipts.json').its(i).its('receiptNumber').should('match', /\d+/g);
            cy.readFile('receipts.json').its(i).its('itemsSold').should('match', /\d+/g);
            cy.readFile('receipts.json').its(i).its('total').should('match', /[+-]?([0-9]*[.])?[0-9]+/g);
            // cy.readFile('receipts.json').its(i).its('timestamp').should('match', '2021-02-01 14:00:00 EST');
            //for(var j = 0; receipts[i].items.length; j++ ){
            cy.readFile('receipts.json').its(i).its('items').its(0).its('itemId').should('match', /[A-Za-z0-9]/g);
            cy.readFile('receipts.json').its(i).its('items').its(0).its('itemPrice').should('match', /[+-]?([0-9]*[.])?[0-9]+/g);
            cy.readFile('receipts.json').its(i).its('items').its(0).its('taxRate').should('match', /^(0(\.\d+)?|1(\.0+)?)$/g);
            cy.readFile('receipts.json').its(i).its('items').its(0).its('discount').should('match', /^(0(\.\d+)?|1(\.0+)?)$/g);
            //}
        }
    });
    // 2
    it('should validate grand totals', function () {
        
        var receipts = require('/receipts.json'); 

        for (var i = 0; i < receipts.length; i++) {
            var total = 0.0;
            var itemTotal = 0.0;
            var price = 0;
            var taxRate = 0.00;
            var discount = 0.00;
            for (var j = 0; j < receipts[i].items.length; j++) {
                price = receipts[i].items[j].itemPrice;
                taxRate = receipts[i].items[j].taxRate;
                discount = receipts[i].items[j].discount;

                itemTotal = price + (price * taxRate) - (price * discount);
                total += itemTotal;
            }

            cy.readFile('receipts.json').its(i).its('total').should('eq', Math.round(total * 10) / 10);
        }   
    });
  
    //3
    it('should validate count of items sold', function () {
        var receipts = require('/receipts.json'); 
        var count = 0;
        var itemsCount = [];
        var items = [];
  
        for (var i = 0; i < receipts.length; i++) {
            for (var j = 0; j < receipts[i].items.length; j++) {
                if (receipts[i].items[j].itemPrice >= 0) {
                    items.push(receipts[i].items[j].itemId);
                    count++;
                }
                if (receipts[i].items[j].itemPrice < 0) {
                    items.pop(receipts[i].items[j - 1].itemId);
                    count--;
                }
            }
            itemsCount.push(count);
            count = 0;
        }
        //first receipt
        var itemsSold = 3;
        cy.expect(itemsCount[0]).to.deep.equal(itemsSold);
        cy.readFile('receipts.json').its(0).its('itemsSold').should('be.gt', 0);
        cy.readFile('receipts.json').its(0).its('itemsSold').should('eq', itemsSold);
        //second receipt
        itemsSold = 2;
        cy.expect(itemsCount[1]).to.deep.equal(itemsSold);
        cy.readFile('receipts.json').its(1).its('itemsSold').should('be.gt', 0);
        cy.readFile('receipts.json').its(1).its('itemsSold').should('eq', itemsSold);

    });
  
    // 4. Ensures receipts are valid
    it('should ensure receipts are valid', function () {
        var receipts = require('/receipts.json');
        // Expect receipts to come from the same date
        //all receipt come from same store
        var pinCode = 30234;
        var storeId = 'WAL001';
        for (var i = 0; i < receipts.length - 1; i++) {
            cy.expect(receipts[i].timestamp).to.deep.equal(receipts[i+1].timestamp);
            cy.readFile('receipts.json').its(i).its('receiptNumber').should('eq', receipts[i].receiptNumber);
            cy.readFile('receipts.json').its(i).its('timestamp').should('eq', receipts[i].timestamp);
            cy.readFile('receipts.json').its(i).its('receiptNumber').should('not.eq', receipts[i+1].receiptNumber);
            cy.readFile('receipts.json').its(i+1).its('receiptNumber').should('not.eq', receipts[i].receiptNumber);
            cy.readFile('receipts.json').its(i+1).its('timestamp').should('eq', receipts[i].timestamp);
            cy.readFile('receipts.json').its(i+1).its('receiptNumber').should('eq', receipts[i+1].receiptNumber);

            cy.readFile('receipts.json').its(i).its('pinCode').should('eq', pinCode);
            cy.readFile('receipts.json').its(i).its('storeId').should('eq', storeId);
            cy.readFile('receipts.json').its(i).its('pinCode').should('eq', pinCode);
            cy.readFile('receipts.json').its(i).its('storeId').should('eq', storeId);
        } 
    });
  
    // 5. Determine most sold item
    it('should return most sold item', function () {
        var receipts = require('/receipts.json');
        var mostFrequentItem = '';
        var mostFrequent = 1;
        var mostCount = 0;
        var items = [];
        for (var i = 0; i < receipts.length; i++) {
            for (var j = 0; j < receipts[i].items.length; j++) {
                if (receipts[i].items[j].itemPrice >= 0) {
                    items.push(receipts[i].items[j].itemId);
                }
                if (receipts[i].items[j].itemPrice < 0) {
                    items.pop(receipts[i].items[j - 1].itemId);
                }
            }
        }
  
        for (var x = 0; x < items.length; x++) {
            for (var y = x; y < items.length; y++) {
                if (items[x] === items[y]) {
                    mostCount++;
                }
                if (mostFrequent < mostCount) {
                    mostFrequent = mostCount;
                    mostFrequentItem = items[x];
                }
            }
            mostCount = 0;
        }
        cy.expect(mostFrequentItem).to.deep.equal('GROC001');
    });
  });
  
  
