const sql = require('mssql');
const config = require('./dbConfig');

// Function to get all categories
const getAllCategories = async () => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().execute('GetAllCategories');
    return { success: true, categories: result.recordset };
  } catch (err) {
    console.error('Error getting categories:', err.message);
    return { success: false, message: 'Error fetching categories' };
  } finally {
    await sql.close();
  }
};

// Function to get category by ID
const getCategoryByID = async (categoryID) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('CategoryID', sql.Int, categoryID)
      .execute('GetCategoryByID');
    
    if (result.recordset.length > 0) {
      return { success: true, category: result.recordset[0] };
    } else {
      return { success: false, message: 'Category not found' };
    }
  } catch (err) {
    console.error('Error fetching category by ID:', err.message);
    return { success: false, message: 'Error fetching category by ID' };
  } finally {
    await sql.close();
  }
};

const GetCategoriesByUser = async (userId) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('UserID', sql.Int, userId)  // Use userId, not categoryID
      .execute('GetAllCategories');

    console.log(result.recordset);  // Log the result to see the structure

    if (result.recordset.length > 0) {
      return { success: true, categories: result.recordset };  // Return categories as an array
    } else {
      return { success: false, message: 'No categories found for this user' };
    }
  } catch (err) {
    console.error('Error fetching categories by user:', err.message);
    return { success: false, message: 'Error fetching categories by user' };
  } finally {
    await sql.close();
  }
};


// Function to add a new category
const addCategory = async (categoryData) => {
  try {
    const { name } = categoryData;

    const pool = await sql.connect(config);
    await pool.request()
      .input('CategoryName', sql.NVarChar, name)
      .execute('InsertCategory');
    
    return { success: true, message: 'Category added successfully' };
  } catch (err) {
    console.error('Error adding category:', err.message);
    return { success: false, message: 'Error adding category' };
  } finally {
    await sql.close();
  }
};

// Function to update an existing category
const updateCategory = async (categoryID, newCategoryData) => {
  try {
    const { name } = newCategoryData;

    const pool = await sql.connect(config);
    await pool.request()
      .input('CategoryID', sql.Int, categoryID)
      .input('NewCategoryName', sql.NVarChar, name)
      .execute('UpdateCategory');
    
    return { success: true, message: 'Category updated successfully' };
  } catch (err) {
    console.error('Error updating category:', err.message);
    return { success: false, message: 'Error updating category' };
  } finally {
    await sql.close();
  }
};

// Function to delete a category
const deleteCategory = async (categoryID) => {
  try {
    const pool = await sql.connect(config);
    await pool.request()
      .input('CategoryID', sql.Int, categoryID)
      .execute('DeleteCategory');
    
    return { success: true, message: 'Category deleted successfully' };
  } catch (err) {
    console.error('Error deleting category:', err.message);
    return { success: false, message: 'Error deleting category' };
  } finally {
    await sql.close();
  }
};

const getTasksByCategoryForUser = async (categoryId, userId) => {
  try {
      const pool = await sql.connect(config);
      const result = await pool.request()
          .input('CategoryID', sql.Int, categoryId)  // Input parameter for categoryId
          .input('UserID', sql.Int, userId)          // Input parameter for userId
          .execute('GetTasksByCategoryForUser');     // Call the stored procedure
      
        
        
      return result.recordset;  // Return the tasks
  } catch (err) {
      console.error('Error fetching tasks:', err.message);
      throw new Error('Error fetching tasks');  // Throw the error so the router can catch it
  } finally {
      await sql.close();  // Close the SQL connection
  }
};

module.exports = {
  getAllCategories,
  getCategoryByID,
  addCategory,
  updateCategory,
  deleteCategory,
  GetCategoriesByUser,
  getTasksByCategoryForUser
};
