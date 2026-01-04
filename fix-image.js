// Script to update the Women's category image
const axios = require('axios');

const updateCategoryImage = async () => {
  try {
    const response = await axios.put(
      'https://shopping-ivig.onrender.com/api/categories/695a7c35bcc48b21af8fd99e',
      {
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25343c?w=800&h=600&fit=crop&crop=faces&auto=format'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_JWT_TOKEN_HERE'
        }
      }
    );
    console.log('Category image updated successfully!');
  } catch (error) {
    console.error('Error updating category:', error.response?.data || error.message);
  }
};

updateCategoryImage();
