const { supabase } = require('../supabase');
const { v4: uuidv4 } = require('uuid');

async function addTransaction(req, res) {
    const { user_id, items } = req.body;
    if (!user_id || !items) {
        return res.status(404).json({
            status: "error",
            message: "Pastikan semua field telah terisi!"
        });
    }
    // Ambil data cart dari database berdasarkan user_id
    const { data: cartItems, error: cartError } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", user_id);
    if (cartError) {
        return res.status(404).json({
            status: "error",
            message: cartError.message
        });
    }
    // Validasi apakah data cart sesuai dengan data yang dikirim untuk transaksi
    const isCartValid = items.every(item => {
        const cartItem = cartItems.find(cart => cart.product_id === item.product_id);
        return cartItem && cartItem.quantity === item.quantity;
    });
    if (!isCartValid) {
        return res.status(404).json({
            status: "error",
            message: "Data cart tidak sesuai dengan data yang dimasukkan untuk transaksi!"
        });
    }
    // Jika data cart valid, lanjutkan proses transaksi
    const reqItems = items.map((item) => ({
        transaction_id: uuidv4(),
        user_id: user_id,
        product_id: item.product_id,
        quantity: item.quantity,
        total_price: item.total_price,
        created_at: new Date().toLocaleString()
    }));
    let productId = items[0].product_id;
    const { data, error } = await supabase
        .from("transaction")
        .insert(reqItems);
    if (error) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    // Jika transaksi berhasil, hapus semua daftar cart yang sudah dibeli
    const { data: cartData, error: cartDeleteError } = await supabase
        .from("cart")
        .delete()
        .eq("user_id", user_id);
    if (cartDeleteError) {
        return res.status(404).json({
            status: "error",
            message: cartDeleteError.message
        });
    }
    // dan update total penjualan produk
    const { data: productData, error: productError } = await supabase
        .from("product")
        .select("number_of_sales")
        .eq("product_id", productId)
    if (productError) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    const { data: productUpdateData, error: productUpdateError } = await supabase
        .from("product")
        .update({ number_of_sales: (productData[0].number_of_sales + 1) })
        .eq("product_id", productId)
    if (productUpdateError) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        message: "Transaction success!"
    });
}

async function getTransaction(req, res) {
    const { user_id } = req.params;
    if (!user_id) {
        return res.status(404).json({
            status: "error",
            message: "pastikan semua field telah terisi!"
        });
    }
    const { data, error } = await supabase
        .from("transaction")
        .select("*,user(user_id,username,email),product(product_id,name,image,price,ratings,category(name))")
        .eq("user_id", user_id)
    const formattedData = data.map((result) => ({
        ...result,
        user_id: undefined,
        product_id: undefined
    }));
    if (error) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        data: formattedData
    });
}

async function getTransactionUser(req, res) {
    const { data, error } = await supabase
        .from("transaction")
        .select("*,user(user_id,username,email),product(product_id,name,image,price,ratings,category(name))")
    const formattedData = data.map((result) => ({
        ...result,
        user_id: undefined,
        product_id: undefined
    }));
    if (error) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        data: formattedData
    });
}


module.exports = { addTransaction, getTransaction, getTransactionUser }