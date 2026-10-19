const express = require('express');
const router = express.Router();
const { optionalProtect } = require('../middleware/auth');

// Available Gemini models fallback chain
const GEMINI_MODELS = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.8-flash'];

/**
 * Resilient helper to query Gemini across available models
 */
async function queryGemini(contents, generationConfig, apiKey) {
  if (!apiKey || apiKey.trim() === '') return null;

  for (const model of GEMINI_MODELS) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents, generationConfig })
        }
      );

      const data = await response.json();
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        return {
          text: data.candidates[0].content.parts[0].text,
          model
        };
      } else {
        const errMsg = data.error?.message || 'No candidates';
        console.warn(`Gemini [${model}] fallback notice:`, errMsg);
      }
    } catch (err) {
      console.warn(`Gemini [${model}] error:`, err.message);
    }
  }
  return null;
}

// @route POST /api/ai/insights
// Generate smart natural language executive summary from column stats
// Guest & Authenticated Users supported
router.post('/insights', optionalProtect, async (req, res) => {
  try {
    const { fileName, totalRows, totalColumns, columnStats, sampleRows } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    const statsStr = JSON.stringify(columnStats || {}, null, 2);
    const sampleStr = JSON.stringify((sampleRows || []).slice(0, 8), null, 2);

    const prompt = 'You are a Senior Business Intelligence & Data Analytics Expert.\n' +
      'Analyze the following spreadsheet dataset overview:\n' +
      'File Name: ' + (fileName || 'Uploaded Spreadsheet') + '\n' +
      'Total Rows: ' + (totalRows || 0) + '\n' +
      'Total Columns: ' + (totalColumns || 0) + '\n\n' +
      'Column Profiles & Statistical Summaries:\n' +
      statsStr + '\n\n' +
      'Sample Data Preview (First few rows):\n' +
      sampleStr + '\n\n' +
      'Please provide an Executive Business Intelligence Summary structured with clear markdown formatting:\n' +
      '1. **Key Overview**: (1-2 clear sentences on what this dataset represents)\n' +
      '2. **Standout Trends & Outliers**: (Key metrics, highest/lowest drivers, distribution patterns, any negative/concerning values)\n' +
      '3. **Strategic Recommendations**: (2-3 highly actionable business recommendations or next-step analyses)\n\n' +
      'Keep the response concise, authoritative, direct, and formatted in clean markdown bullet points. Do not include boilerplate intro.';

    const geminiResult = await queryGemini(
      [{ parts: [{ text: prompt }] }],
      { temperature: 0.25, maxOutputTokens: 800 },
      apiKey
    );

    if (geminiResult && geminiResult.text) {
      return res.json({
        success: true,
        source: geminiResult.model,
        insight: geminiResult.text
      });
    }

    // Comprehensive Statistical Engine Fallback if AI offline
    let summaryText = `### Executive Statistical Report for **${fileName || 'Active Dataset'}**\n\n`;
    summaryText += `* **Dataset Overview:** Processed **${totalRows || 0} rows** across **${totalColumns || 0} columns** with multi-attribute profiling.\n`;

    if (columnStats && typeof columnStats === 'object') {
      const numCols = Object.keys(columnStats).filter(k => columnStats[k]?.type === 'numeric');
      const catCols = Object.keys(columnStats).filter(k => columnStats[k]?.type !== 'numeric');

      if (numCols.length > 0) {
        summaryText += `* **Numerical Drivers:** Identified primary numeric indicators: **${numCols.join(', ')}**.\n`;
        const topNum = columnStats[numCols[0]];
        if (topNum && topNum.max !== undefined) {
          summaryText += `* **Peak Range:** Highest recorded value in **${numCols[0]}** is **${topNum.max}** (Min: **${topNum.min ?? 0}**).\n`;
        }
      }
      if (catCols.length > 0) {
        summaryText += `* **Categorical Dimensions:** Grouped by **${catCols.slice(0, 4).join(', ')}**.\n`;
      }
    }

    summaryText += `* **Strategic Recommendations:** Explore multidimensional correlation in the Chart Studio, and use the AI Chat Assistant to query specific segment breakdowns.`;

    return res.json({
      success: true,
      source: 'statistical-engine',
      insight: summaryText
    });
  } catch (error) {
    console.error('AI Insight Route Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/ai/nlq
// Natural Language Query (Chat with your Data & Report)
// Guest & Authenticated Users supported
router.post('/nlq', optionalProtect, async (req, res) => {
  try {
    const { question, fileName, columns, columnStats, sampleRows, lastInsight } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!question || question.trim() === '') {
      return res.status(400).json({ success: false, message: 'Please provide a question' });
    }

    const systemPrompt = `You are an intelligent data analyst and AI assistant inside the Excel Insight analytics platform.
The user is asking a question about the active spreadsheet dataset and/or the generated executive report:
File Name: ${fileName || 'Active Dataset'}
Columns: ${JSON.stringify(columns || [])}
Statistical Profiles: ${JSON.stringify(columnStats || {})}
Sample Data Preview (First rows): ${JSON.stringify((sampleRows || []).slice(0, 15))}
Current Executive Report / Insights: ${lastInsight || 'None generated yet'}

User Question: "${question}"

Instructions:
1. Provide a direct, well-formulated, and comprehensive answer to the user's question using the data and the report above.
2. Quote exact numbers, categories, or trends whenever available in the dataset.
3. If the user asks about the report, explain or summarize the key points directly from the report text.
4. If a visualization would help, suggest appropriate chart parameters (x, y, type, agg).

You must respond in valid JSON format ONLY with this schema:
{
  "answer": "Your formatted answer in clean markdown with **bold highlights** and bullet points where helpful (2-4 sentences or clear bullet points).",
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

    const geminiResult = await queryGemini(
      [{ parts: [{ text: systemPrompt }] }],
      { temperature: 0.2, maxOutputTokens: 1024 },
      apiKey
    );

    if (geminiResult && geminiResult.text) {
      let replyText = geminiResult.text.replace(/```json/gi, '').replace(/```/g, '').trim();
      const jsonMatch = replyText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return res.json({
            success: true,
            source: geminiResult.model,
            ...parsed
          });
        } catch (e) {
          // Fall through to text output if JSON parse fails
        }
      }

      return res.json({
        success: true,
        source: geminiResult.model,
        answer: replyText,
        suggestedChart: null,
        filterSuggestion: null
      });
    }

    // High-accuracy Mathematical / Statistical Fallback if Gemini unavailable
    const qLower = question.toLowerCase();
    const rows = Array.isArray(sampleRows) ? sampleRows : [];
    let fallbackAnswer = '';
    let suggestedChart = null;

    // 1. Report queries
    if ((qLower.includes('report') || qLower.includes('insight') || qLower.includes('summary')) && lastInsight) {
      fallbackAnswer = `**Executive Report Summary:**\n\n${lastInsight.slice(0, 450)}...`;
    }
    // 2. Highest / Top / Max queries
    else if (qLower.includes('highest') || qLower.includes('max') || qLower.includes('top') || qLower.includes('best') || qLower.includes('most')) {
      const numCol = (columns || []).find(c => {
        const cl = c.toLowerCase();
        const isNumeric = columnStats && columnStats[c]?.type === 'numeric';
        return isNumeric && (qLower.includes(cl) || cl.includes('sales') || cl.includes('profit') || cl.includes('revenue') || cl.includes('score'));
      }) || (columns || []).find(c => columnStats && columnStats[c]?.type === 'numeric') || columns?.[1];

      const catCol = (columns || []).find(c => {
        const cl = c.toLowerCase();
        return c !== numCol && (qLower.includes(cl) || (!columnStats || columnStats[c]?.type !== 'numeric'));
      }) || (columns || []).find(c => c !== numCol) || columns?.[0];

      if (numCol && rows.length > 0) {
        const groupSums = {};
        for (const r of rows) {
          const key = catCol ? (r[catCol] || 'Other') : 'Entry';
          const val = Number(r[numCol]) || 0;
          groupSums[key] = (groupSums[key] || 0) + val;
        }

        const sortedGroups = Object.entries(groupSums).sort((a, b) => b[1] - a[1]);
        if (sortedGroups.length > 0) {
          const [topCat, topVal] = sortedGroups[0];
          fallbackAnswer = `Based on the active dataset, **${topCat}** generated the highest total **${numCol}** (accumulating **${topVal.toLocaleString()}** across the analyzed records).`;
          if (catCol) {
            suggestedChart = { type: 'bar', x: catCol, y: numCol, agg: 'sum' };
          }
        }
      }
    }
    // 3. Lowest / Min / Bottom queries
    else if (qLower.includes('lowest') || qLower.includes('min') || qLower.includes('bottom') || qLower.includes('least') || qLower.includes('worst')) {
      const numCol = (columns || []).find(c => {
        const cl = c.toLowerCase();
        const isNumeric = columnStats && columnStats[c]?.type === 'numeric';
        return isNumeric && (qLower.includes(cl) || cl.includes('sales') || cl.includes('profit') || cl.includes('cost'));
      }) || (columns || []).find(c => columnStats && columnStats[c]?.type === 'numeric') || columns?.[1];

      const catCol = (columns || []).find(c => c !== numCol && (!columnStats || columnStats[c]?.type !== 'numeric')) || columns?.[0];

      if (numCol && rows.length > 0) {
        const groupSums = {};
        for (const r of rows) {
          const key = catCol ? (r[catCol] || 'Other') : 'Entry';
          const val = Number(r[numCol]) || 0;
          groupSums[key] = (groupSums[key] || 0) + val;
        }

        const sortedGroups = Object.entries(groupSums).sort((a, b) => a[1] - b[1]);
        if (sortedGroups.length > 0) {
          const [lowestCat, lowestVal] = sortedGroups[0];
          fallbackAnswer = `Based on the active records, **${lowestCat}** recorded the lowest total **${numCol}** (totaling **${lowestVal.toLocaleString()}** across analyzed entries).`;
          if (catCol) {
            suggestedChart = { type: 'bar', x: catCol, y: numCol, agg: 'min' };
          }
        }
      }
    }
    // 4. Negative / Loss queries
    else if (qLower.includes('negative') || qLower.includes('loss') || qLower.includes('losses')) {
      const numCol = (columns || []).find(c => {
        const cl = c.toLowerCase();
        return cl.includes('profit') || cl.includes('margin') || (columnStats && columnStats[c]?.min < 0);
      }) || 'Profit';

      const negatives = rows.filter(r => (Number(r[numCol]) || 0) < 0);
      if (negatives.length > 0) {
        fallbackAnswer = `⚠️ **Yes, negative values detected:** Found **${negatives.length} records** with negative **${numCol}**, with the lowest reaching **${Math.min(...negatives.map(r => Number(r[numCol])))}**.`;
      } else {
        fallbackAnswer = `✅ **No negative values found:** All recorded entries for **${numCol}** maintain positive or zero values in this dataset preview.`;
      }
    }
    // 5. Chart / plot request
    else if (qLower.includes('chart') || qLower.includes('graph') || qLower.includes('plot') || qLower.includes('visual')) {
      const numCol = (columns || []).find(c => columnStats && columnStats[c]?.type === 'numeric') || columns?.[1];
      const catCol = (columns || []).find(c => c !== numCol) || columns?.[0];
      fallbackAnswer = `I have generated a suggested chart configuration comparing **${numCol}** grouped by **${catCol}**. Click **Plot in Studio** below to visualize it!`;
      suggestedChart = { type: 'bar', x: catCol, y: numCol, agg: 'sum' };
    }

    // Default smart answer if specific formula didn't match
    if (!fallbackAnswer) {
      fallbackAnswer = `I analyzed your query regarding **"${question}"** across the active dataset (**${fileName || 'Spreadsheet'}**). The data encompasses **${(columns || []).length} columns** and **${rows.length} rows** currently loaded. You can cross-tabulate metrics or plot visual charts below.`;
    }

    return res.json({
      success: true,
      source: 'smart-data-engine',
      answer: fallbackAnswer,
      suggestedChart,
      filterSuggestion: null
    });
  } catch (error) {
    console.error('NLQ Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
