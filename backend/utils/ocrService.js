const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

class OCRService {
  constructor() {
    this.worker = null;
  }

  async initializeWorker() {
    if (!this.worker) {
      this.worker = await Tesseract.createWorker('eng');
      await this.worker.loadLanguage('eng');
      await this.worker.initialize('eng');
    }
    return this.worker;
  }

  async extractTextFromImage(imagePath) {
    try {
      const worker = await this.initializeWorker();
      
      // Preprocess image for better OCR results
      const processedImagePath = await this.preprocessImage(imagePath);
      
      const { data: { text } } = await worker.recognize(processedImagePath);
      
      // Clean up processed image if it's different from original
      if (processedImagePath !== imagePath) {
        fs.unlinkSync(processedImagePath);
      }
      
      return text;
    } catch (error) {
      console.error('OCR extraction error:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  async extractTextFromPDF(pdfPath) {
    try {
      const dataBuffer = fs.readFileSync(pdfPath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error('Failed to extract text from PDF');
    }
  }

  async preprocessImage(imagePath) {
    try {
      const outputPath = imagePath.replace(/\.[^/.]+$/, '_processed.jpg');
      
      await sharp(imagePath)
        .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
        .grayscale()
        .normalize()
        .sharpen()
        .jpeg({ quality: 90 })
        .toFile(outputPath);
      
      return outputPath;
    } catch (error) {
      console.error('Image preprocessing error:', error);
      return imagePath; // Return original if preprocessing fails
    }
  }

  async extractTextFromFile(filePath, mimetype) {
    if (mimetype === 'application/pdf') {
      return await this.extractTextFromPDF(filePath);
    } else if (mimetype.startsWith('image/')) {
      return await this.extractTextFromImage(filePath);
    } else {
      throw new Error('Unsupported file type for OCR');
    }
  }

  parseExpenseData(text) {
    const extractedData = {
      amount: null,
      currency: 'USD',
      date: null,
      merchant: null,
      description: null,
      category: null,
      confidence: 0
    };

    if (!text || text.trim().length === 0) {
      return extractedData;
    }

    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    let confidence = 0;

    // Extract amount (look for currency patterns)
    const amountPatterns = [
      /(?:total|amount|sum|subtotal|grand total)[\s:]*\$?(\d+\.?\d*)/i,
      /\$(\d+\.?\d*)/g,
      /(\d+\.?\d*)\s*(?:USD|EUR|GBP|CAD|AUD|JPY|INR)/i,
      /(?:total|amount)[\s:]*(\d+\.?\d*)/i
    ];

    for (const pattern of amountPatterns) {
      const matches = text.match(pattern);
      if (matches) {
        const amount = parseFloat(matches[1] || matches[0].replace(/[^\d.]/g, ''));
        if (amount > 0) {
          extractedData.amount = amount;
          confidence += 30;
          break;
        }
      }
    }

    // Extract currency
    const currencyPatterns = [
      /\$(\d+\.?\d*)/g,
      /(\d+\.?\d*)\s*(USD|EUR|GBP|CAD|AUD|JPY|INR)/i,
      /(USD|EUR|GBP|CAD|AUD|JPY|INR)/i
    ];

    for (const pattern of currencyPatterns) {
      const match = text.match(pattern);
      if (match) {
        if (match[0].startsWith('$')) {
          extractedData.currency = 'USD';
        } else if (match[1]) {
          extractedData.currency = match[1].toUpperCase();
        } else if (match[0]) {
          extractedData.currency = match[0].toUpperCase();
        }
        confidence += 10;
        break;
      }
    }

    // Extract date (various formats)
    const datePatterns = [
      /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
      /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[\s,]*\d{1,2}[\s,]*\d{2,4}/i,
      /(\d{1,2}[\s,]+(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[\s,]+(?:19|20)\d{2})/i
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          const dateStr = match[0].replace(/[^\d\/\-,\s]/g, '');
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            extractedData.date = date.toISOString().split('T')[0];
            confidence += 20;
            break;
          }
        } catch (error) {
          // Continue to next pattern
        }
      }
    }

    // Extract merchant name (usually in first few lines)
    const merchantPatterns = [
      /^([A-Z][A-Za-z\s&.,'-]+)$/m,
      /^([A-Z][A-Za-z\s&.,'-]+(?:INC|LLC|CORP|LTD|CO|STORE|SHOP|RESTAURANT))/im
    ];

    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i];
      for (const pattern of merchantPatterns) {
        if (pattern.test(line) && line.length > 3 && line.length < 50) {
          extractedData.merchant = line.trim();
          confidence += 15;
          break;
        }
      }
      if (extractedData.merchant) break;
    }

    // Extract description (look for item descriptions)
    const descriptionPatterns = [
      /(?:item|product|service|description)[\s:]*([^\n]+)/i,
      /^([A-Za-z\s]+)\s+\d+\.?\d*$/m
    ];

    for (const pattern of descriptionPatterns) {
      const match = text.match(pattern);
      if (match && match[1] && match[1].length > 3) {
        extractedData.description = match[1].trim();
        confidence += 10;
        break;
      }
    }

    // If no specific description found, use merchant name
    if (!extractedData.description && extractedData.merchant) {
      extractedData.description = extractedData.merchant;
    }

    // Categorize based on keywords
    const categoryKeywords = {
      'Food': ['restaurant', 'food', 'dining', 'cafe', 'coffee', 'lunch', 'dinner', 'breakfast', 'pizza', 'burger', 'sandwich'],
      'Travel': ['hotel', 'flight', 'airline', 'taxi', 'uber', 'lyft', 'car rental', 'train', 'bus', 'travel'],
      'Transport': ['gas', 'fuel', 'parking', 'toll', 'metro', 'subway', 'transportation'],
      'Office Supplies': ['office', 'supplies', 'stationery', 'paper', 'pen', 'pencil', 'notebook'],
      'Entertainment': ['movie', 'cinema', 'theater', 'entertainment', 'game', 'sports', 'gym', 'fitness']
    };

    const textLower = text.toLowerCase();
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        extractedData.category = category;
        confidence += 10;
        break;
      }
    }

    extractedData.confidence = Math.min(confidence, 100);
    return extractedData;
  }

  async processReceipt(filePath, mimetype) {
    try {
      const text = await this.extractTextFromFile(filePath, mimetype);
      const parsedData = this.parseExpenseData(text);
      
      return {
        success: true,
        extractedText: text,
        parsedData: parsedData
      };
    } catch (error) {
      console.error('Receipt processing error:', error);
      return {
        success: false,
        error: error.message,
        extractedText: '',
        parsedData: {
          amount: null,
          currency: 'USD',
          date: null,
          merchant: null,
          description: null,
          category: null,
          confidence: 0
        }
      };
    }
  }

  async cleanup() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

module.exports = new OCRService();
