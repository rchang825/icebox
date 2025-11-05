import React from 'react';
import OpenAI from "openai";
import { useState, useEffect } from 'react';


function UploadReceipt({ sessionId }) {
  const [result, setResult] = useState('loading...');
  useEffect(() => {
    fetch('/api/upload', { headers: { 'x-session-id': sessionId } })
      .then((response) => response.json())
      .then((data) => {
        setResult(data.output_text);
      })
      .catch((error) => {
        console.error("Error fetching AI response:", error);
      });
  }, [sessionId]);


  return (
    <div>
      <h2>Upload Receipt</h2>
      {
        result && (
          <div>
            <h3>AI Response:</h3>
            <p>{result}</p>
          </div>
        )
      }
    </div>
  );
}

export default UploadReceipt;