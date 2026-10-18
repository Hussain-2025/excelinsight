const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

// @route POST /api/ai/insights
// Generate smart natural language executive summary from column stats
router.post('/insights', protect, async (req, res) => {
  try {
    const { fileName, totalRows, totalColumns, columnStats, sampleRows } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const statsStr = JSON.stringify(columnStats || {}, null, 2);
    const sampleStr = JSON.stringify((sampleRows || []).slice(0, 5), null, 2);

    const prompt = 'You are a Senior Business Intelligence & Data Analytics Expert.\n' +
      'Analyze the following spreadsheet dataset overview:\n' +
      'File Name: ' + (fileName || 'Uploaded Spreadsheet') + '\n' +
      'Total Rows: ' + (totalRows || 0) + '\n' +
      'Total Columns: ' + (totalColumns || 0) + '\n\n' +
      'Column Profiles & Statistical Summaries:\n' +
      statsStr + '\n\n' +
      'Sample Data Preview (First few rows):\n' +
      sampleStr + '\n\n' +
      'Please provide an Executive Business Intelligence Summary structured as:\n' +
      '1. Key Overview (1-2 sentences on what this dataset represents)\n' +
      '2. Standout Trends & Outliers (Key findings, highest/lowest metrics, any negative values or distribution skews)\n' +
      '3. Strategic Recommendations (Actionable business advice or data cleanup tips)\n\n' +
      'Keep the response concise, highly professional, direct and formatted in clean markdown bullet points. Do not include boilerplate intro.';

    if (!apiKey || apiKey.trim() === '') {
      return res.json({
        success: true,
        source: 'rule-based',
        insight: '### Automated Executive Summary for **' + fileName + '**\n\n' +
          '* **Dataset Overview:** Processed **' + totalRows + ' rows** across **' + totalColumns + ' dimensions**.\n' +
          '* **Primary Indicators:** Multiple categorical groups and numerical distributions detected. Ready for multidimensional correlation.\n' +
          '* **Actionable Next Step:** Use the Chart Studio to correlate top numeric metrics with categorical drivers.'
      });
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 600
          }
        })
      }
    );

    const data = await response.json();

    if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
      const generatedText = data.candidates[0].content.parts[0].text;
      return res.json({
        success: true,
        source: 'gemini-3.8-flash',
        insight: generatedText
      });
    } else {
      const errMsg = data.error?.message || 'Could not parse Gemini response';
      console.warn('Gemini API notice:', errMsg);

      let summaryText = '### Statistical Intelligence Report for **' + fileName + '**\n\n' +
        '* **Volume:** **' + totalRows + ' records** structured across **' + totalColumns + ' columns**.\n';
      if (columnStats) {
        const numCols = Object.keys(columnStats).filter(k => columnStats[k]?.type === 'numeric');
        if (numCols.length > 0) {
          summaryText += '* **Key Metrics:** Identified numerical columns: **' + numCols.join(', ') + '**.\n';
        }
      }
      summaryText += '* **Recommendation:** Cross-filter dimensions in the Data Grid and explore trends in Chart Studio.';

      return res.json({
        success: true,
        source: 'statistical-engine',
        insight: summaryText,
        note: errMsg
      });
    }
  } catch (error) {
    console.error('AI Insight Route Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/ai/nlq
// Natural Language Query (Chat with your Data)
router.post('/nlq', protect, async (req, res) => {
  try {
    const { question, fileName, columns, columnStats, sampleRows } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!question || question.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a question' });
    }

    const systemPrompt = `You are an intelligent data assistant embedded inside an Excel Analytics Platform.
The user is asking a question about the active spreadsheet dataset:
File Name: ${fileName || 'Active Dataset'}
Columns: ${JSON.stringify(columns || [])}
Statistical Profiles: ${JSON.stringify(columnStats || {})}
Sample Data Preview: ${JSON.stringify((sampleRows || []).slice(0, 8))}

User Question: "${question}"

You must respond in valid JSON format ONLY with the following schema:
{
  "answer": "A clear, concise, direct conversational answer to the question using the available data (2-3 sentences max).",
  "suggestedChart": {
    "type": "bar" | "line" | "doughnut" | "pie" | "scatter" | null,
    "x": "column_name" | null,
    "y": "column_name" | null,
    "agg": "sum" | "avg" | "count" | "max" | "min" | null
  },
  "filterSuggestion": {
    "column": "column_name" | null,
    "query": "search_value" | null
  }
}
If no chart or filter is applicable, set those fields to null. Do not include markdown code block ticks (\`\`\`) in the response, return pure JSON only.`;

    if (!apiKey) {
      return res.json({
        success: true,
        answer: `I analyzed your question about "${question}". The dataset contains ${columns?.length || 0} dimensions and multiple records ready for exploration.`,
        suggestedChart: null,
        filterSuggestion: null
      });
    }

    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=' + apiKey,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024
          }
        })
      }
    );

    const data = await response.json();
    let replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    replyText = replyText.replace(/```json/gi, '').replace(/```/g, '').trim();

    try {
      const jsonMatch = replyText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return res.json({
          success: true,
          ...parsed
        });
      }
      throw new Error('No JSON structure found');
    } catch (e) {
      return res.json({
        success: true,
        answer: replyText || 'Could not parse structured response from Gemini.',
        suggestedChart: null,
        filterSuggestion: null
      });
    }
  } catch (error) {
    console.error('NLQ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
