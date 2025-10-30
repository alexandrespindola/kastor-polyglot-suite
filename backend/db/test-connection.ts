import { connectDB, closeConnection } from './connection';

const testConnection = async (): Promise<void> => {
  try {
    console.log('🔍 Testing MongoDB connection...');
    
    // Test connection
    const db = await connectDB();
    console.log('✅ Database connected successfully');
    
    // Test basic operations
    const testCollection = db.collection('test');
    
    // Insert test document
    const result = await testCollection.insertOne({
      test: true,
      timestamp: new Date()
    });
    console.log('✅ Insert test document:', result.insertedId);
    
    // Find test document
    const found = await testCollection.findOne({ _id: result.insertedId });
    console.log('✅ Found test document:', found);
    
    // Clean up
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('✅ Cleaned up test document');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await closeConnection();
    process.exit(0);
  }
};

// Run test if this file is executed directly
if (import.meta.main) {
  testConnection();
}