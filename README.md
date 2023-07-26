# Revolve-OnlineBooks
# E-Commerce Online Book Booking Website

This is an e-commerce online book booking website built using Node.js, Express and MongoDB. It provides users with the ability to browse and purchase books online. The website has been structured using the MVC architecture and incorporates various features, such as payment integration with Razorpay, OTP generation, wallet system, coupon management, and many other facilities to enhance the user experience.

## Frameworks and Libraries Used

- Node.js Express: Used to build the entire backend of the website.
- MongoDB: Serves as the database for storing data.
- Handlebars (HBS): Chosen as the template engine for rendering dynamic views.
- jQuery: Employed to build certain parts of the front-end and make API calls via AJAX.
- Chart.js: Used for creating and displaying charts and graphs on the website.
- Font Awesome & Line Awesome: Used to incorporate icons throughout the website.

## Third-Party Modules & APIs Used

- Cloudinary: Utilized for storing images in the cloud.
- Razorpay: Integrated as the payment gateway for processing payments.
- Multer: Used for handling file uploads, specifically for sending multiple images to the server.
- Twilio: Integrated for managing messages, particularly for OTP generation.

Please refer to the `package.json` file for a comprehensive list of packages used, along with their respective versions.

## Installation

To run this app locally, follow these steps:

1. Clone the repository: `git clone https://github.com/your_username/your_repository_name`
2. Install Node.js and MongoDB if you haven't already.
3. Install dependencies: `npm install`
4. Create a `.env` file in the root directory and set the following environment variables:
   - `MONGODB_URI`: the URI for your MongoDB database
   - `SECRET_KEY`: a secret key for encrypting session data
   - `RAZORPAY_API_KEY`: your Razorpay API key (for payment integration)
   - `RAZORPAY_API_SECRET`: your Razorpay API secret (for payment integration)
   - `TWILIO_ACCOUNT_SID`: your Twilio account SID (for OTP generation)
   - `TWILIO_AUTH_TOKEN`: your Twilio authentication token (for OTP generation)
5. Start the server: `npm start`

## Usage

To use this app, follow these steps:

1. Create an account by clicking on the "Sign up" button and providing the necessary details.
2. Browse books by clicking on the "Shop" button to view available books.
3. Click on a book to view its details and add it to your cart.
4. View your cart by clicking on the cart icon in the top right corner.
5. Proceed to checkout by entering your shipping and payment information.
6. Apply coupons or use your wallet balance (if available) during the checkout process.

## API Documentation

This app includes two modules: Admin and User. The API provides the following endpoints:

### ADMIN

- `GET /api/products`: Get a list of all products.
- `GET /api/products/:id`: Get details of a single product by ID.
- `POST /api/orders`: Create a new order.
- `GET /api/orders/:id`: Get details of a single order by ID.

To use the API, send requests to the appropriate endpoint with the required data in the request body. Responses will be returned in JSON format.

Feel free to explore the code and contribute to making the website even better! If you encounter any issues or have any suggestions, please open an issue in the repository.

Happy book shopping! 📚🛒
