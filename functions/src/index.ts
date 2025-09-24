import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import yahooFinance from 'yahoo-finance2';

admin.initializeApp();
const db = admin.firestore();

export const updateStockPrices = functions.pubsub
  .schedule('every 15 minutes')
  .onRun(async (context) => {
    const executionId = Date.now().toString();
    const startTime = admin.firestore.Timestamp.now();
    
    try {
      await db.collection('functionLogs').doc(executionId).set({
        functionName: 'updateStockPrices',
        startTime,
        status: 'started',
        endTime: null,
        error: null
      });

      // Get all unique stock symbols from transactions
      const transactionsSnapshot = await db.collection('transactions').get();
      const stockSymbols = new Set<string>();
      
      transactionsSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.stockSymbol) {
          stockSymbols.add(data.stockSymbol);
        }
      });

      // Fetch current prices for all stocks
      const updatePromises = Array.from(stockSymbols).map(async (symbol) => {
        try {
          const quote = await yahooFinance.quote(symbol);
          
          // Find existing document for this stock
          const stockQuerySnapshot = await db
            .collection('currentStockData')
            .where('stockSymbol', '==', symbol)
            .get();

          const stockData = {
            stockSymbol: symbol,
            stockName: quote.longName || quote.shortName || symbol,
            currentPrice: quote.regularMarketPrice,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
          };

          if (stockQuerySnapshot.empty) {
            // Create new document if it doesn't exist
            await db.collection('currentStockData').add(stockData);
          } else {
            // Update existing document
            await stockQuerySnapshot.docs[0].ref.update(stockData);
          }

          functions.logger.info(`Updated price for ${symbol}: ${quote.regularMarketPrice}`);
        } catch (error) {
          functions.logger.error(`Error updating ${symbol}:`, error);
        }
      });

      await Promise.all(updatePromises);
      functions.logger.info('Successfully updated all stock prices');

      // Update log with success status
      await db.collection('functionLogs').doc(executionId).update({
        endTime: admin.firestore.Timestamp.now(),
        status: 'completed',
        updatedSymbols: Array.from(stockSymbols)
      });

      return null;
    } catch (error: unknown) {
      functions.logger.error('Error in updateStockPrices:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Update log with error status
      await db.collection('functionLogs').doc(executionId).update({
        endTime: admin.firestore.Timestamp.now(),
        status: 'error',
        error: errorMessage
      });

      throw error;
    }
  });