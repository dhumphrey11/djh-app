import { activeSymbolsService } from '../services/activeSymbolsService';

/**
 * Utility function to sync active symbols based on current portfolio and recommendations
 * This can be called manually or scheduled to run periodically
 */
export const syncActiveSymbolsUtil = async (): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> => {
  try {
    console.log('Starting active symbols sync utility...');
    await activeSymbolsService.syncActiveSymbols();
    
    return {
      success: true,
      message: 'Active symbols synced successfully'
    };
  } catch (error) {
    console.error('Error syncing active symbols:', error);
    return {
      success: false,
      message: 'Failed to sync active symbols',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Schedule active symbols sync to run periodically
 * This can be used in the main application to automatically keep symbols updated
 */
export const scheduleActiveSymbolsSync = (intervalMinutes: number = 60): () => void => {
  console.log(`Scheduling active symbols sync to run every ${intervalMinutes} minutes`);
  
  const intervalId = setInterval(async () => {
    console.log('Running scheduled active symbols sync...');
    const result = await syncActiveSymbolsUtil();
    
    if (result.success) {
      console.log('✅ Scheduled sync completed successfully');
    } else {
      console.error('❌ Scheduled sync failed:', result.error);
    }
  }, intervalMinutes * 60 * 1000);

  // Return cleanup function
  return () => {
    console.log('Cleaning up scheduled active symbols sync');
    clearInterval(intervalId);
  };
};

/**
 * Get active symbols statistics for monitoring
 */
export const getActiveSymbolsStats = async () => {
  try {
    const activeSymbols = await activeSymbolsService.getActiveSymbols();
    const allSymbols = await activeSymbolsService.getAllSymbols();
    
    const stats = {
      totalActive: activeSymbols.length,
      totalAll: allSymbols.length,
      bySource: {
        portfolio: activeSymbols.filter(s => s.source === 'portfolio').length,
        recommendation: activeSymbols.filter(s => s.source === 'recommendation').length,
        manual: activeSymbols.filter(s => s.source === 'manual').length
      },
      lastUpdated: new Date()
    };
    
    return stats;
  } catch (error) {
    console.error('Error getting active symbols stats:', error);
    throw error;
  }
};