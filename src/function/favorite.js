const { supabase } = require('../supabase');
const { v4: uuidv4 } = require('uuid');

async function addFavorite(req, res) {
    const favorite_id = uuidv4();
    const { user_id, product_id } = req.body;
    if (!favorite_id || !user_id || !product_id) {
        return res.status(404).json({
            status: "error",
            message: "pastikan semua field telah terisi!"
        });
    }
    const { data: getData, error: getError } = await supabase
        .from("favorite")
        .select("*")
        .eq("user_id", user_id)
        .eq("product_id", product_id)
    if (getError) {
        return res.status(404).json({
            status: "error",
            message: getError.message
        })
    }
    if (getData.length > 0) {
        return res.status(404).json({
            status: "error",
            message: "product ini sudah di favorite!"
        });
    }
    const { data, error } = await supabase
        .from("favorite")
        .insert([{ favorite_id, user_id, product_id, created_at: new Date().toLocaleString() }])
    if (error) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    const { data: productData, error: productError } = await supabase
        .from("product")
        .select("number_of_favorites")
        .eq("product_id", product_id)
    if (productError) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    const { data: productUpdateData, error: productUpdateError } = await supabase
        .from("product")
        .update({ number_of_favorites: (productData[0].number_of_favorites + 1) })
        .eq("product_id", product_id)
    if (productUpdateError) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        message: "Favorite berhasil ditambah!"
    });
}

async function getFavorite(req, res) {
    const { user_id } = req.params;
    if (!user_id) {
        return res.status(404).json({
            status: "error",
            message: "pastikan semua field telah terisi!"
        });
    }
    const { data, error } = await supabase
        .from("favorite")
        .select("*,product(product_id,name,image,price,ratings,category(name))")
        .eq("user_id", user_id)
    if (error) {
        return res.status(404).json({
            status: "error",
            message: error.message
        })
    }
    const formattedData = data.map((result) => ({
        ...result,
        user_id: undefined,
        product_id: undefined,
    }));
    return res.json({
        status: "success",
        data: formattedData
    });
}

async function deleteFavorite(req, res) {
    const { user_id, product_id } = req.params;
    if (!user_id) {
        return res.status(404).json({
            status: "error",
            message: "pastikan semua field telah terisi!"
        });
    }
    if (!product_id) {
        const { data, error } = await supabase
            .from("favorite")
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
            message: "Semua daftar favorite berhasil dihapus!"
        });
    }
    const { data, error } = await supabase
        .from("favorite")
        .delete()
        .eq("user_id", user_id)
        .eq("product_id", product_id)
    if (error) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    const { data: productData, error: productError } = await supabase
        .from("product")
        .select("number_of_favorites")
        .eq("product_id", product_id)
    if (productError) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    const { data: productUpdateData, error: productUpdateError } = await supabase
        .from("product")
        .update({ number_of_favorites: (productData[0].number_of_favorites - 1) })
        .eq("product_id", product_id)
    if (productUpdateError) {
        return res.status(404).json({
            status: "error",
            message: error.message
        });
    }
    return res.json({
        status: "success",
        message: "Daftar favorite berhasil dihapus!"
    });
}

module.exports = { addFavorite, getFavorite, deleteFavorite }