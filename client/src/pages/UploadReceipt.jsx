import React, { useState } from 'react';
import NewFridgeItem from '../components/NewFridgeItem';

function UploadReceipt({ sessionId }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [groceries, setGroceries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError('');
      setExtractedText(''); // Clear previous results
      setGroceries([]); // Clear previous groceries
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Create FormData object to send file
      const formData = new FormData();
      formData.append('image', selectedFile);

      // Send file to backend
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'x-session-id': sessionId
        },
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setExtractedText(data.extractedText);
        console.log('Raw extracted text:', data.extractedText);

        // Parse the groceries and store them separately
        try {
          const parsedData = JSON.parse(data.extractedText);
          console.log('Parsed data:', parsedData);

          // Handle both formats: direct array or object with groceries property
          let groceriesArray;
          if (Array.isArray(parsedData)) {
            groceriesArray = parsedData;
          } else if (parsedData.groceries && Array.isArray(parsedData.groceries)) {
            groceriesArray = parsedData.groceries;
          } else {
            groceriesArray = [];
          }

          console.log('Groceries array:', groceriesArray);
          setGroceries(groceriesArray);
        } catch (parseError) {
          console.error('Error parsing extracted text:', parseError);
          setError('Error parsing grocery items from response');
        }
      } else {
        setError(data.error || 'Failed to process image');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>Upload Receipt</h2>

      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="receipt">Upload an image:</label>
        <input
          type="file"
          id="receipt"
          name="receipt"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ marginLeft: '10px' }}
        />
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {selectedFile && (
        <div style={{ marginBottom: '20px' }}>
          <h3>Selected File:</h3>
          <p><strong>Name:</strong> {selectedFile.name}</p>
          <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          <img
            src={URL.createObjectURL(selectedFile)}
            alt="Selected file preview"
            style={{ maxWidth: '400px', maxHeight: '300px', objectFit: 'contain' }}
          />
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!selectedFile || isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: isLoading ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          cursor: isLoading || !selectedFile ? 'not-allowed' : 'pointer'
        }}
      >
        {isLoading ? 'Processing...' : 'Extract Text'}
      </button>

      {/* Debug information */}
      {extractedText && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f5f5f5', fontSize: '12px' }}>
          <strong>Debug Info:</strong>
          <p><strong>Raw Response:</strong> {extractedText}</p>
          <p><strong>Groceries Array Length:</strong> {groceries?.length || 0}</p>
          <p><strong>Groceries Content:</strong> {JSON.stringify(groceries, null, 2)}</p>
        </div>
      )}

      {Array.isArray(groceries) && groceries.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Extracted Grocery Items:</h3>
          {groceries.map((item, index) => (
            <NewFridgeItem
              key={index}
              item={{
                alias: item.name || '',
                quantity: item.quantity || 1,
              }}
              sessionId={sessionId}
              onSave={() => {}}
              onCancel={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default UploadReceipt;