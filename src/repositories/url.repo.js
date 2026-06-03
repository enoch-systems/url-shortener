const pool = require('../db/postgres');
const { generateShortCode } = require('../utils/base62');

class UrlRepository {
  // CREATE: Insert a new short URL
  async createShortUrl(originalUrl) {
    const query = `
      INSERT INTO urls (original_url, short_code)
      VALUES ($1, (SELECT SHORT_CODE FROM generate_short_code($2)))
      RETURNING id, short_code, original_url, created_at
    `;
    
    // For now, simpler approach: insert and get the id back
    const insertQuery = `
      INSERT INTO urls (original_url, short_code)
      VALUES ($1, $2)
      RETURNING id, short_code, original_url, created_at
    `;
    
    try {
      const result = await pool.query(insertQuery, [originalUrl, '']);
      const { id } = result.rows[0];
      const shortCode = generateShortCode(id);
      
      // Update the short_code
      const updateQuery = `
        UPDATE urls
        SET short_code = $1
        WHERE id = $2
        RETURNING id, short_code, original_url, created_at
      `;
      
      const updatedResult = await pool.query(updateQuery, [shortCode, id]);
      return updatedResult.rows[0];
    } catch (error) {
      throw new Error(`Failed to create short URL: ${error.message}`);
    }
  }

  // READ: Find URL by short code
  async getUrlByShortCode(shortCode) {
    const query = `
      SELECT id, short_code, original_url, created_at
      FROM urls
      WHERE short_code = $1
    `;
    
    try {
      const result = await pool.query(query, [shortCode]);
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Failed to get URL: ${error.message}`);
    }
  }

  // READ ALL: Get all URLs
  async getAllUrls() {
    const query = `
      SELECT id, short_code, original_url, created_at
      FROM urls
      ORDER BY created_at DESC
    `;
    
    try {
      const result = await pool.query(query);
      return result.rows;
    } catch (error) {
      throw new Error(`Failed to get all URLs: ${error.message}`);
    }
  }
}

module.exports = new UrlRepository();