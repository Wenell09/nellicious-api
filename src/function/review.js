const { supabase } = require('../supabase');
const { v4: uuidv4 } = require('uuid');

async function addReview(req, res) {
    const review_id = uuidv4();
    const { user_id, product_id, rating, description } = req.body;
    if (!review_id || !user_id || !product_id || !rating || !description) {
        return res.status(404).json({
            status: "error",
            message: "Pastikan semua field telah terisi!"
        });
    }
    const { data, error } = await supabase
        .from("review")
        .insert([{ review_id, user_id, product_id, rating, description, created_at: new Date().toLocaleString() }])
    if (error) {
        return res.status(404).json({
            status: "error",
            message: error.message,
        })
    }
    // update rating produk dan total jumlah user yang rating
    const { data: productData, error: productError } = await supabase
        .from("product")
        .select("ratings,total_ratings,number_of_ratings")
        .eq("product_id", product_id)
    if (productError) {
        return res.status(404).json({
            status: "error",
            message: productError.message
        })
    }

    let total_rating = productData[0].total_ratings + rating;
    let averageRatings = Math.round(total_rating / (productData[0].number_of_ratings + 1))

    const { data: productUpdateData, error: productUpdateError } = await supabase
        .from("product")
        .update({ ratings: averageRatings, total_ratings: total_rating, number_of_ratings: (productData[0].number_of_ratings + 1) })
        .eq("product_id", product_id)
    if (productUpdateError) {
        return res.status(404).json({
            status: "error",
            message: productUpdateError.message
        })
    }
    return res.json({
        status: "success",
        message: "review berhasil ditambahkan"
    })
}

async function getReview(req, res) {
    const { product_id } = req.params;
    const { data, error } = await supabase
        .from("review")
        .select("*,user(user_id,username)")
        .eq("product_id", product_id)
    if (error) {
        return res.status(404).json({
            status: "error",
            message: error.message
        })
    }
    const formattedData = data.map((result) => ({
        ...result,
        user_id: undefined
    }));
    return res.json({
        status: "success",
        data: formattedData
    })
}

module.exports = { addReview, getReview }