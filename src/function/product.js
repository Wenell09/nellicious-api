const { supabase } = require('../supabase');
const { v4: uuidv4 } = require('uuid');

async function addProduct(req, res) {
    const product_id = uuidv4();
    const { name, image, price, ratings, total_ratings, number_of_ratings, number_of_favorites, number_of_sales, category_id, description } = req.body;
    if (!product_id || !name || !image || !price || !category_id || !description) {
        return res.status(404).json({
            status: "failed",
            message: "pastikan semua field terisi!"
        });
    }
    const { data, error } = await supabase
        .from("product")
        .insert([{ product_id, name, image, price, ratings, total_ratings, number_of_ratings, number_of_favorites, number_of_sales, category_id, description, created_at: new Date().toLocaleString() }])
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        message: "product baru berhasil ditambah!"
    });
}

async function getAllProduct(req, res) {
    const { data, error } = await supabase
        .from("product")
        .select("product_id,name,image,price,ratings,category(name)")
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        });
    }
    if (data.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: "produk kosong"
        });
    }
    return res.json({
        status: "success",
        data: data
    });
}

async function getProductByCategory(req, res) {
    const { category_id } = req.params;
    const { data, error } = await supabase
        .from("product")
        .select("product_id,name,image,price,ratings,category(name)")
        .eq("category_id", category_id)
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        });
    }
    if (data.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: "produk kosong"
        });
    }
    return res.json({
        status: "success",
        data: data
    });
}

async function getProductById(req, res) {
    const { product_id } = req.params;
    const { data, error } = await supabase
        .from("product")
        .select("*, category(name)")
        .eq("product_id", product_id)
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message
        });
    }
    if (data.length === 0) {
        return res.status(404).json({
            status: "failed",
            message: `product dengan id ${product_id} tidak ditemukan!`
        });
    }
    const formattedData = data.map(result => ({
        ...result,
        category_id: undefined
    }));
    return res.json({
        status: "success",
        data: formattedData
    });
}

async function editProduct(req, res) {
    const { product_id } = req.params;
    const { name, image, price, ratings, total_ratings, number_of_ratings, number_of_favorites, number_of_sales, category_id, description } = req.body;
    if (!product_id) {
        return res.status(404).json({
            status: "failed",
            message: "pastikan semua field terisi!"
        });
    }
    const { data: productData, error: errorProduct } = await supabase
        .from("product")
        .select("*")
        .eq("product_id", product_id)
    if (errorProduct) {
        return res.status(404).json({
            status: "error",
            message: errorProduct.message
        });
    }
    if (productData.length === 0) {
        return res.status(404).json({
            status: "error",
            message: `Product dengan id ${product_id} tidak ditemukan.Gagal update!`
        });
    }
    const { data, error } = await supabase
        .from("product")
        .update({ name, image, price, ratings, total_ratings, number_of_ratings, number_of_favorites, number_of_sales, category_id, description, created_at: new Date().toLocaleString() })
        .eq("product_id", product_id)
    if (error) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        message: `Product dengan id ${product_id} berhasil diupdate!`
    });
}

async function deleteProduct(req, res) {
    const { product_id } = req.params;
    if (!product_id) {
        return res.status(404).json({
            status: "failed",
            message: "pastikan semua field terisi!"
        });
    }
    const { data: productData, error: errorProduct } = await supabase
        .from("product")
        .select("*")
        .eq("product_id", product_id)
    if (errorProduct) {
        return res.status(404).json({
            status: "error",
            message: errorProduct.message
        });
    }
    if (productData.length === 0) {
        return res.status(404).json({
            status: "error",
            message: `Product dengan id ${product_id} tidak ditemukan.Gagal hapus!`
        });
    }
    const { data, error } = await supabase
        .from("product")
        .delete()
        .eq("product_id", product_id)
    if (error) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        message: `Product dengan id ${product_id} berhasil dihapus!`
    });
}

async function searchProduct(req, res) {
    const { name } = req.query;
    const { data, error } = await supabase
        .from("product")
        .select("product_id,name,image,price,ratings,category(name)")
        .ilike("name", `${name}%`);
    if (error) {
        return res.status(404).json({
            status: "failed",
            message: error.message,
        });
    }
    return res.json({
        status: "success",
        data: data,
    });
}

module.exports = { addProduct, getAllProduct, getProductByCategory, getProductById, editProduct, deleteProduct, searchProduct }