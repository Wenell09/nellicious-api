const { supabase } = require('../supabase');
const { v4: uuidv4 } = require('uuid');
const snap = require("../midtrans");

async function addTransaction(req, res) {
    const { user_id, items } = req.body;
    if (!user_id || !items) {
        return res.status(404).json({
            status: "error",
            message: "Pastikan semua field telah terisi!"
        });
    }
    const reqItems = items.map((item) => ({
        transaction_id: uuidv4(),
        user_id: user_id,
        product_id: item.product_id,
        quantity: item.quantity,
        total_price: item.total_price,
        created_at: new Date().toLocaleString()
    }));
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
    // update penjualan
    for (let i = 0; i < items.length; i++) {
        const { data: productData, error: productError } = await supabase
            .from("product")
            .select("number_of_sales")
            .eq("product_id", items[i].product_id)
        if (productError) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
        // dan update total penjualan produk
        const { data: productUpdateData, error: productUpdateError } = await supabase
            .from("product")
            .update({ number_of_sales: (productData[0].number_of_sales + items[i].quantity) })
            .eq("product_id", items[i].product_id)
        if (productUpdateError) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
    }
    return res.json({
        status: "success",
        message: "Transaksi berhasil!",
    });
}


async function createMidtransTransaction(req, res) {
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
    // ambil data user
    const { data: userData, error: userError } = await supabase
        .from("user")
        .select("*")
        .eq("user_id", user_id);
    if (userError) {
        return res.status(404).json({
            status: "error",
            message: userError.message
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
    // Buat parameter pembayaran Midtrans
    const transactionId = uuidv4();
    const totalAmount = items.reduce((acc, item) => acc + item.total_price, 0);
    let parameter = {
        transaction_details: {
            order_id: transactionId,
            gross_amount: totalAmount
        },
        customer_details: {
            first_name: userData[0].username,
            last_name: "",
            email: userData[0].email
        },
        item_details: items.map(item => ({
            id: item.product_id,
            price: item.price,
            quantity: item.quantity,
            name: item.name
        }))
    };
    try {
        // Buat transaksi Midtrans dan dapatkan token pembayaran
        const transaction = await snap.createTransaction(parameter);
        return res.json({
            status: "pending",
            message: "Transaksi berhasil dibuat dan silahkan selesaikan pembayaran!.",
            token: transaction.token
        });
    } catch (error) {
        return res.status(404).json({
            status: "error",
            message: "Gagal membuat transaksi Midtrans",
            error: error.message
        });
    }
}

// Notifikasi dari Midtrans setelah pembayaran sukses/gagal
async function handleMidtransNotification(req, res) {
    try {
        const notification = req.body;
        // Ambil informasi transaksi
        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        console.log(`Order ${orderId} status: ${transactionStatus}`);
        if (transactionStatus === "capture" || transactionStatus === "settlement") {
            return res.status(200).json({
                status: "success",
                message: "Pembayaran berhasil dan transaksi telah disimpan.",
            });
        }
        return res.status(200).json({
            status: "pending",
            message: "Pembayaran masih dalam proses.",
        });
    } catch (error) {
        console.error("Error handling Midtrans notification:", error.message);
        return res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
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


module.exports = { addTransaction, getTransaction, getTransactionUser, handleMidtransNotification, createMidtransTransaction }