const express = require("express");
const cors = require("cors");
const { welcome } = require("./function/welcome");
const { registerAccount, loginAccount } = require("./function/auth");
const { getAccount, editAccount, deleteAccount } = require("./function/user");
const { addProduct, getAllProduct, getProductByCategory, getProductById, editProduct, deleteProduct, searchProduct } = require("./function/product");
const { addFavorite, getFavorite, deleteFavorite } = require("./function/favorite");
const { addCart, getCart, deleteCart } = require("./function/cart");
const { addTransaction, getTransaction, getTransactionUser } = require("./function/transaction");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = 3000 || process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server berjalan pada http://localhost:${PORT}`);
});


app.get("/", welcome);
// route auth
app.post("/register", registerAccount);
app.post("/login", loginAccount);
// route user
app.get("/account/:user_id", getAccount);
app.patch("/editAccount/:user_id", editAccount);
app.delete("/deleteAccount/:user_id", deleteAccount);
// route product
app.post("/addProduct", addProduct);
app.get("/product", getAllProduct);
app.get("/product/:product_id", getProductById);
app.get("/product/category/:category_id", getProductByCategory);
app.get("/searchProduct", searchProduct);
app.patch("/editProduct/:product_id", editProduct);
app.delete("/deleteProduct/:product_id", deleteProduct);
// route favorite
app.post("/addFavorite", addFavorite);
app.get("/favorite/:user_id", getFavorite);
app.delete("/deleteFavorite/:user_id/:favorite_id?", deleteFavorite);
// route cart
app.post("/addCart", addCart);
app.get("/cart/:user_id", getCart);
app.delete("/deleteCart/:user_id/:cart_id?", deleteCart);
// route transaction
app.post("/addTransaction", addTransaction);
app.get("/transaction/:user_id", getTransaction);
app.get("/transactionUser/", getTransactionUser);