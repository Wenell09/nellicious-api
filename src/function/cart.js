const { supabase } = require('../supabase');
const { v4: uuidv4 } = require('uuid');

async function addCart(req, res) {
    const cart_id = uuidv4();
    const { user_id, product_id, quantity } = req.body;
    if (!cart_id || !user_id || !product_id || !quantity) {
        return res.status(404).json({
            status: "error",
            message: "Pastikan semua field telah terisi!"
        });
    }
    // ambil harga produk
    const { data: productData, error: productError } = await supabase
        .from("product")
        .select("*")
        .eq("product_id", product_id)
    if (productError) {
        return res.status(404).json({
            status: "error",
            message: productError.message
        });
    }
    let price_product = 0;
    productData.map((result) => {
        price_product = result.price
    });
    // jika cart sudah ada, update quantity dan total harganya
    const { data: cartData, error: cartError } = await supabase
        .from("cart")
        .select("*")
        .eq("user_id", user_id)
        .eq("product_id", product_id)
    if (cartError) {
        return res.status(404).json({
            status: "error",
            message: cartError.message
        })
    }
    if (cartData.length > 0) {
        let update_quantity = quantity;
        let update_total_price = 0;
        cartData.map((result) => {
            update_quantity += result.quantity;
            update_total_price += (price_product * quantity) + result.total_price;
        });
        const { data, error } = await supabase
            .from("cart")
            .update({ quantity: update_quantity, total_price: update_total_price, created_at: new Date().toLocaleString() })
            .eq("user_id", user_id)
            .eq("product_id", product_id)
        if (error) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
        return res.json({
            status: "success",
            message: `cart product id:${product_id} berhasil diupdate`
        });
    }
    // jika belum ada buat keranjang
    let total_price = 0;
    total_price = price_product * quantity;
    const { data, error } = await supabase
        .from("cart")
        .insert([{ cart_id, user_id, product_id, quantity, total_price: total_price, created_at: new Date().toLocaleString() }])
    if (error) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        message: "product berhasil ditambah ke keranjang!"
    });
}

async function getCart(req, res) {
    const { user_id } = req.params;
    if (!user_id) {
        return res.status(404).json({
            status: "failed",
            message: "pastikan semua field telah terisi!"
        });
    }
    const { data, error } = await supabase
        .from("cart")
        .select("*,product(product_id,name,image,price,ratings,category(name))")
        .eq("user_id", user_id)
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        });
    }
    let total_bayar = 0;
    const formattedData = data.map((result) => ({
        ...result,
        user_id: undefined,
        product_id: undefined,
    }));
    formattedData.forEach(result => {
        total_bayar += result.total_price;
    });
    return res.json({
        status: "success",
        data: formattedData,
        total_bayar
    });
}

async function deleteCart(req, res) {
    const { user_id, cart_id } = req.params;
    if (!user_id) {
        return res.status(404).json({
            status: "error",
            message: "Pastikan semua field telah terisi!"
        });
    }

    if (cart_id) {
        const { data: cartData, error: cartError } = await supabase
            .from("cart")
            .select("*")
            .eq("user_id", user_id)
            .eq("cart_id", cart_id)
        if (cartError) {
            return res.status(404).json({
                status: "error",
                message: cartError.message
            });
        }
        if (cartData.length === 0) {
            return res.status(404).json({
                status: "error",
                message: `Cart dengan id ${cart_id} tidak ditemukan. Gagal menghapus!`
            });
        }
        const { data, error } = await supabase
            .from("cart")
            .delete()
            .eq("user_id", user_id)
            .eq("cart_id", cart_id)
        if (error) {
            return res.status(404).json({
                status: "error",
                message: error.message
            });
        }
        return res.json({
            status: "success",
            message: `Cart dengan id ${cart_id} berhasil dihapus!`
        });
    }
    const { data, error } = await supabase
        .from("cart")
        .delete()
        .eq("user_id", user_id)
    if (error) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        message: "Semua daftar keranjang berhasil dihapus!"
    });
}


module.exports = { addCart, getCart, deleteCart }